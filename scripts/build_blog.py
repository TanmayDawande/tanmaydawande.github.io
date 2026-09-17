#!/usr/bin/env python3
"""
Builds the blog from Markdown source files.

Write a post in posts/<slug>.md with front matter, run this script (or just
push to GitHub, where the Actions workflow runs it for you), and it produces:

  - blog/<slug>.html      one static page per post
  - blog.html             the listing page, regenerated
  - feed.xml              an RSS feed of all posts

Nothing here needs to be run by hand day-to-day. See posts/README.md.
"""

from __future__ import annotations

import datetime as dt
import html
import re
import sys
from pathlib import Path
from xml.sax.saxutils import escape as xml_escape

import frontmatter
import markdown
from pygments.formatters import HtmlFormatter

ROOT = Path(__file__).resolve().parent.parent
POSTS_DIR = ROOT / "posts"
BLOG_DIR = ROOT / "blog"
TEMPLATES_DIR = ROOT / "templates"
SITE_URL = "https://tanmaydawande.tech"
SITE_NAME = "Tanmay Dawande"

MD_EXTENSIONS = ["fenced_code", "codehilite", "tables", "sane_lists", "smarty", "toc"]
MD_EXTENSION_CONFIG = {
    "codehilite": {"css_class": "codehilite", "guess_lang": False},
}

WORDS_PER_MINUTE = 200


class PostError(Exception):
    """Raised when a post's front matter is missing something required."""


def load_template(name: str) -> str:
    return (TEMPLATES_DIR / name).read_text(encoding="utf-8")


def fill(template: str, values: dict[str, str]) -> str:
    out = template
    for key, val in values.items():
        out = out.replace("{{" + key + "}}", val)
    return out


def parse_tags(raw) -> list[str]:
    if raw is None:
        return []
    if isinstance(raw, list):
        return [str(t).strip() for t in raw if str(t).strip()]
    return [t.strip() for t in str(raw).split(",") if t.strip()]


def strip_tags_for_summary(html_body: str, limit: int = 160) -> str:
    text = re.sub(r"<[^>]+>", " ", html_body)
    text = html.unescape(re.sub(r"\s+", " ", text)).strip()
    if len(text) <= limit:
        return text
    return text[:limit].rsplit(" ", 1)[0] + "…"


class Post:
    def __init__(self, path: Path):
        self.path = path
        self.slug = path.stem
        post = frontmatter.load(path)
        meta = post.metadata

        missing = [f for f in ("title", "date") if f not in meta or not meta[f]]
        if missing:
            raise PostError(
                f"posts/{path.name}: missing required front matter field(s): {', '.join(missing)}"
            )

        self.title = str(meta["title"]).strip()

        raw_date = meta["date"]
        if isinstance(raw_date, (dt.date, dt.datetime)):
            self.date = raw_date if isinstance(raw_date, dt.date) and not isinstance(raw_date, dt.datetime) else raw_date.date()
        else:
            try:
                self.date = dt.datetime.strptime(str(raw_date).strip(), "%Y-%m-%d").date()
            except ValueError as exc:
                raise PostError(
                    f"posts/{path.name}: 'date' must look like YYYY-MM-DD, got {raw_date!r}"
                ) from exc

        self.tags = parse_tags(meta.get("tags"))
        self.raw_body = post.content
        self.content_html = markdown.markdown(
            self.raw_body, extensions=MD_EXTENSIONS, extension_configs=MD_EXTENSION_CONFIG
        )

        description = meta.get("description")
        self.description = str(description).strip() if description else strip_tags_for_summary(self.content_html)

        word_count = len(re.sub(r"<[^>]+>", " ", self.content_html).split())
        self.reading_time = max(1, round(word_count / WORDS_PER_MINUTE))

    @property
    def url(self) -> str:
        return f"blog/{self.slug}.html"

    @property
    def date_display(self) -> str:
        return self.date.strftime("%d %b %Y")

    def tags_html_detail(self) -> str:
        if not self.tags:
            return ""
        spans = "".join(f'<span class="post-tag">{html.escape(t)}</span>' for t in self.tags)
        return f'<div class="post-tags">{spans}</div>'

    def tags_meta_html(self) -> str:
        if not self.tags:
            return ""
        return f'<span>{html.escape(", ".join(self.tags))}</span>'

    def card_html(self) -> str:
        return f"""    <a class="project-card post-card" href="{self.url}">
      <div class="card-bar"><span><b>~/</b>{html.escape(self.date.isoformat())}</span><span class="arrow">↗</span></div>
      <div class="card-body">
        <h3>{html.escape(self.title)}</h3>
        <p>{html.escape(self.description)}</p>
        <div class="card-meta">
          <span>{self.reading_time} min read</span>
          {self.tags_meta_html()}
        </div>
      </div>
    </a>"""


def load_posts() -> list[Post]:
    posts = []
    for path in sorted(POSTS_DIR.glob("*.md")):
        if path.name.upper() == "README.MD":
            continue
        posts.append(Post(path))
    posts.sort(key=lambda p: p.date, reverse=True)
    return posts


def write_post_pages(posts: list[Post]) -> None:
    template = load_template("post.html")
    BLOG_DIR.mkdir(exist_ok=True)

    # remove stale generated pages for posts that no longer exist
    current_slugs = {p.slug + ".html" for p in posts}
    for existing in BLOG_DIR.glob("*.html"):
        if existing.name not in current_slugs:
            existing.unlink()

    for post in posts:
        page = fill(
            template,
            {
                "TITLE": html.escape(post.title),
                "DESCRIPTION": html.escape(post.description),
                "SLUG": post.slug,
                "DATE_DISPLAY": post.date_display,
                "READING_TIME": str(post.reading_time),
                "TAGS_HTML": post.tags_html_detail(),
                "CONTENT": post.content_html,
            },
        )
        (BLOG_DIR / f"{post.slug}.html").write_text(page, encoding="utf-8")


def write_index(posts: list[Post]) -> None:
    template = load_template("blog_list.html")
    if posts:
        count_label = "post" if len(posts) == 1 else "posts"
        body = (
            f'<p class="meta">{len(posts)} {count_label} · sorted by date</p>\n'
            f'    <div class="project-grid blog-grid">\n'
            + "\n".join(p.card_html() for p in posts)
            + "\n    </div>"
        )
    else:
        body = (
            '<div class="empty-state">\n'
            '      <p class="meta">// no posts yet</p>\n'
            "      <h1>Nothing here - yet.</h1>\n"
            "      <p>Coming soon!</p>\n"
            "    </div>"
        )
    page = fill(template, {"BODY": body})
    (ROOT / "blog.html").write_text(page, encoding="utf-8")


def write_feed(posts: list[Post]) -> None:
    now = dt.datetime.now(dt.timezone.utc).strftime("%a, %d %b %Y %H:%M:%S %z")
    items = []
    for post in posts:
        pub_date = dt.datetime.combine(post.date, dt.time(12, 0), tzinfo=dt.timezone.utc)
        items.append(
            f"""    <item>
      <title>{xml_escape(post.title)}</title>
      <link>{SITE_URL}/{post.url}</link>
      <guid>{SITE_URL}/{post.url}</guid>
      <pubDate>{pub_date.strftime('%a, %d %b %Y %H:%M:%S %z')}</pubDate>
      <description>{xml_escape(post.description)}</description>
    </item>"""
        )
    feed = f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>{SITE_NAME} - Blog</title>
    <link>{SITE_URL}/blog.html</link>
    <description>Notes, write-ups, and things {SITE_NAME} is figuring out.</description>
    <lastBuildDate>{now}</lastBuildDate>
{chr(10).join(items)}
  </channel>
</rss>
"""
    (ROOT / "feed.xml").write_text(feed, encoding="utf-8")


def write_code_css() -> None:
    css_dir = ROOT / "css"
    css_dir.mkdir(exist_ok=True)
    style_defs = HtmlFormatter(style="native").get_style_defs(".codehilite")
    (css_dir / "code.css").write_text(
        "/* Auto-generated by scripts/build_blog.py — syntax highlighting for code blocks. */\n"
        f"{style_defs}\n",
        encoding="utf-8",
    )


def main() -> int:
    if not POSTS_DIR.exists():
        print(f"No posts/ directory at {POSTS_DIR}", file=sys.stderr)
        return 1

    try:
        posts = load_posts()
    except PostError as exc:
        print(f"Build failed: {exc}", file=sys.stderr)
        return 1

    write_post_pages(posts)
    write_index(posts)
    write_feed(posts)
    write_code_css()

    print(f"Built {len(posts)} post(s):")
    for post in posts:
        print(f"  - {post.date.isoformat()}  {post.title}  -> {post.url}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
