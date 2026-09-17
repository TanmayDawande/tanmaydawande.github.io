const githubUsername = "TanmayDawande";
const reposEndpoint = `https://api.github.com/users/${githubUsername}/repos?sort=pushed&per_page=100`;

const fallbackProjects = [
  {
    name: "babel-tcp",
    title: "Babel TCP",
    description: "A lightweight TCP client/server that relays and translates messages across a network.",
    language: "Python",
    stars: 0,
    url: `https://github.com/${githubUsername}/babel-tcp`,
  },
];

const escapeHtml = (value) => String(value ?? "").replace(/[&<>'"]/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "'": "&#39;",
  '"': "&quot;",
}[character]));

function formatTitle(name) {
  return name
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function renderProjects(projectList, isLive = false) {
  const grid = document.querySelector("#project-grid");
  if (!grid) return;

  const projectCount = document.querySelector("#project-count");
  if (projectCount) {
    projectCount.textContent = `${projectList.length} repositories · ${isLive ? "live from GitHub" : "sorted by hand"}`;
  }

  const visibleProjects = grid.dataset.limit ? projectList.slice(0, Number(grid.dataset.limit)) : projectList;

  grid.innerHTML = visibleProjects.map((project) => `
    <a class="project-card" href="${project.url || `https://github.com/${githubUsername}/${encodeURIComponent(project.name)}`}" target="_blank" rel="noopener noreferrer">
      <div class="card-bar"><span><b>~/</b>${escapeHtml(project.name)}</span><span class="arrow">↗</span></div>
      <div class="card-body">
        <h3>${escapeHtml(project.title || formatTitle(project.name))}</h3>
        <p>${escapeHtml(project.description || "No description provided.")}</p>
        <div class="card-meta">
          ${project.language ? `<span><i class="language-dot"></i>${escapeHtml(project.language)}</span>` : ""}
          ${project.stars ? `<span>☆ ${project.stars}</span>` : ""}
          ${project.homepage ? `<span class="live-tag">live</span>` : ""}
        </div>
      </div>
    </a>
  `).join("");
}

async function fetchGitHubProjects() {
  try {
    const response = await fetch(reposEndpoint, {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
    const repos = await response.json();

    const excludedRepos = new Set([
      githubUsername.toLowerCase(),
      `${githubUsername.toLowerCase()}.github.io`,
    ]);

    const liveProjects = repos
      .filter((repo) => !repo.fork && !excludedRepos.has(repo.name.toLowerCase()))
      .map((repo) => ({
        name: repo.name,
        title: formatTitle(repo.name),
        description: repo.description,
        language: repo.language,
        stars: repo.stargazers_count,
        homepage: repo.homepage,
        url: repo.html_url,
      }));

    if (liveProjects.length > 0) {
      renderProjects(liveProjects, true);
    }
  } catch (error) {
    console.warn("Could not fetch projects from GitHub, using fallback:", error);
  }
}

document.querySelectorAll("#year").forEach((element) => {
  element.textContent = new Date().getFullYear();
});

// Render fallback immediately for fast load, then update with live GitHub repos
renderProjects(fallbackProjects, false);
fetchGitHubProjects();