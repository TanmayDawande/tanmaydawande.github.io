const projects = [
  { name: "babel-tcp", title: "Babel TCP", description: "A lightweight TCP client/server that relays and translates messages across a network.", language: "Python", stars: 0 },
];

function renderProjects() {
  const grid = document.querySelector("#project-grid");
  if (!grid) return;

  const projectCount = document.querySelector("#project-count");
  if (projectCount) projectCount.textContent = `${projects.length} repositories · sorted by hand`;
  const visibleProjects = grid.dataset.limit ? projects.slice(0, Number(grid.dataset.limit)) : projects;
  grid.innerHTML = visibleProjects.map((project) => `
    <a class="project-card" href="https://github.com/TanmayDawande/${encodeURIComponent(project.name)}" target="_blank" rel="noopener noreferrer">
      <div class="card-bar"><span><b>~/</b>${project.name}</span><span class="arrow">↗</span></div>
      <div class="card-body">
        <h3>${project.title}</h3>
        <p>${project.description}</p>
        <div class="card-meta">
          ${project.language ? `<span><i class="language-dot"></i>${project.language}</span>` : ""}
          ${project.stars ? `<span>☆ ${project.stars}</span>` : ""}
          ${project.homepage ? "<span class=\"live-tag\">live</span>" : ""}
        </div>
      </div>
    </a>
  `).join("");
}

document.querySelectorAll("#year").forEach((element) => { element.textContent = new Date().getFullYear(); });
renderProjects();