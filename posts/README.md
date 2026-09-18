# Writing a post

1. Create `posts/YYYY-MM-DD-some-slug.md`. The filename becomes the URL:
   `some-slug.md` → `tanmaydawande.tech/blog/some-slug.html`.
2. Front matter at the top, then Markdown:

   ```
   ---
   title: Post Title
   date: 2026-09-18
   description: One sentence for the card and social preview. Optional — falls
     back to the first ~160 characters of the post if omitted.
   tags: sre, python
   ---

   Body goes here. Standard Markdown: **bold**, _italic_, [links](https://x.com),
   `inline code`, fenced ```code blocks``` with syntax highlighting, lists,
   blockquotes, tables, images.
   ```

   `title` and `date` are required; everything else is optional.
3. Commit and push to `main`. The `build-blog` GitHub Action picks it up,
   regenerates `blog.html`, `blog/<slug>.html`, and `feed.xml`, and commits
   those back. Pages redeploys automatically — live in a minute or two.

## Local preview

```
pip install -r scripts/requirements.txt
python scripts/build_blog.py
```

Then open `blog.html` or `blog/<slug>.html` directly in a browser to check the
result before pushing. The script is idempotent — run it as many times as you
want.

## Notes

- Posts sort newest-first by `date`, not by filename, but a date-prefixed
  filename keeps `posts/` readable in a file browser.
- To unpublish a post, delete its `.md` file and push — the stale generated
  page under `blog/` is removed automatically on the next build.
- Reading time is estimated automatically (200 wpm).
