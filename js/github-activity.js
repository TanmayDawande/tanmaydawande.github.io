const githubUsername = "TanmayDawande";
const activityEndpoint = `https://api.github.com/users/${githubUsername}/events/public?per_page=100`;
const cacheKey = "gh-activity-cache-v1";

const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "'": "&#39;",
  '"': "&quot;",
}[character]));

function formatDate(date) {
  return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
    Math.round((new Date(date) - Date.now()) / 86400000), "day",
  );
}

function eventItem(event) {
  const payload = event.payload || {};
  const repo = event.repo.name.split("/").pop();
  const repoUrl = `https://github.com/${event.repo.name}`;
  let type = "EVENT";
  let title = "updated the repository";
  let number = "";
  let url = repoUrl;

  if (event.type === "PullRequestEvent") {
    type = "PR";
    title = payload.pull_request?.title || "updated a pull request";
    number = payload.number ? `#${payload.number}` : "";
    url = payload.pull_request?.html_url || repoUrl;
  } else if (event.type === "IssuesEvent") {
    type = "ISSUE";
    title = payload.issue?.title || "updated an issue";
    number = payload.issue?.number ? `#${payload.issue.number}` : "";
    url = payload.issue?.html_url || repoUrl;
  } else if (event.type === "PushEvent") {
    type = "PUSH";
    const count = payload.commits?.length || 0;
    title = `pushed ${count} commit${count === 1 ? "" : "s"}`;
    url = `${repoUrl}/commits/${payload.ref?.replace("refs/heads/", "") || ""}`;
  } else if (event.type === "CreateEvent") {
    type = "CREATE";
    title = `created ${payload.ref_type || "a branch"}`;
  } else if (event.type === "ReleaseEvent") {
    type = "RELEASE";
    title = payload.release?.name || payload.release?.tag_name || "published a release";
    url = payload.release?.html_url || repoUrl;
  } else if (event.type === "ForkEvent") {
    type = "FORK";
    title = "forked the repository";
    url = payload.forkee?.html_url || repoUrl;
  } else if (event.type === "WatchEvent") {
    type = "STAR";
    title = "starred the repository";
  } else if (event.type === "DeleteEvent") {
    type = "DELETE";
    title = `deleted ${payload.ref_type || "a branch"}`;
  }
  return { repo, repoUrl, type, title, number, url, date: event.created_at };
}

function renderActivity(events, statusText) {
  const list = document.querySelector("#activity-list");
  const status = document.querySelector("#activity-status");
  const groups = new Map();
  events.map(eventItem).forEach((item) => {
    if (!groups.has(item.repo)) groups.set(item.repo, { url: item.repoUrl, items: [] });
    const group = groups.get(item.repo);
    if (group.items.length < 8) group.items.push(item);
  });
  if (!groups.size) {
    list.innerHTML = '<p class="empty-activity">No public activity found recently.</p>';
    status.textContent = statusText || "no recent public events";
    return;
  }
  list.innerHTML = [...groups].map(([repo, group]) => `
    <section class="activity-group">
      <a class="activity-repo" href="${group.url}" target="_blank" rel="noopener noreferrer">${escapeHtml(githubUsername.toLowerCase())}/${escapeHtml(repo)}</a>
      ${group.items.map((item) => `
        <a class="activity-item" href="${item.url}" target="_blank" rel="noopener noreferrer">
          <span class="activity-marker">${item.type === "PR" ? "✓" : "○"}</span>
          <span class="activity-title">${escapeHtml(item.title)}</span>
          <span class="activity-badge">${item.type}</span>
          <span class="activity-number">${escapeHtml(item.number || formatDate(item.date))}</span>
        </a>
      `).join("")}
    </section>
  `).join("");
  status.textContent = statusText || `${events.length} recent public events · live from GitHub`;
}

function readCache() {
  try {
    const raw = localStorage.getItem(cacheKey);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeCache(events) {
  try {
    localStorage.setItem(cacheKey, JSON.stringify({ events, fetchedAt: Date.now() }));
  } catch {
    // private browsing or quota exceeded — cache is a nice-to-have, fail silently
  }
}

let isLoading = false;

async function loadActivity() {
  if (isLoading) return;
  isLoading = true;

  const list = document.querySelector("#activity-list");
  const status = document.querySelector("#activity-status");
  const refreshButton = document.querySelector("#refresh-activity");
  if (refreshButton) refreshButton.disabled = true;

  const cache = readCache();
  if (cache?.events?.length) {
    renderActivity(cache.events, `showing cached activity from ${formatDate(cache.fetchedAt)} · refreshing…`);
  } else {
    list.innerHTML = '<p class="empty-activity">loading GitHub activity...</p>';
  }

  try {
    const response = await fetch(activityEndpoint, { headers: { Accept: "application/vnd.github+json" } });

    if (!response.ok) {
      if (response.status === 403 && response.headers.get("x-ratelimit-remaining") === "0") {
        const resetHeader = response.headers.get("x-ratelimit-reset");
        const resetTime = resetHeader
          ? new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(new Date(Number(resetHeader) * 1000))
          : null;
        throw new Error(resetTime ? `rate-limited until ${resetTime}` : "rate-limited");
      }
      throw new Error(`GitHub returned ${response.status}`);
    }

    const events = await response.json();
    writeCache(events);
    renderActivity(events);
  } catch (error) {
    if (cache?.events?.length) {
      renderActivity(cache.events, `showing cached activity from ${formatDate(cache.fetchedAt)} · live refresh failed`);
    } else {
      status.textContent = `could not fetch GitHub activity${error.message ? ` (${error.message})` : ""}`;
      list.innerHTML = '<p class="empty-activity">GitHub is rate-limiting this page or the network is unavailable. Try refresh in a little while.</p>';
    }
  } finally {
    isLoading = false;
    if (refreshButton) refreshButton.disabled = false;
  }
}

document.querySelector("#refresh-activity")?.addEventListener("click", loadActivity);
if (document.querySelector("#activity-list")) loadActivity();