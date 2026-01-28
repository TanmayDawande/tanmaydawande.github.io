const commands = {
    help: {
        desc: "Display this help message",
        execute: () => displayHelp()
    },
    whoami: {
        desc: "Who am i",
        execute: () => displayAbout()
    },
    projects: {
        desc: "View my work",
        execute: () => displayProjects()
    },
    socials: {
        desc: "Contact info",
        execute: () => displaySocials()
    },
    clear: {
        desc: "Clear terminal",
        execute: () => {
            document.getElementById("terminal-output").innerHTML = "";
            saveHistory();
        }
    },
    git: {
        desc: "Open GitHub profile",
        execute: () => {
            println("Opening GitHub profile...", "info");
            window.open("https://github.com/TanmayDawande", "_blank");
        }
    }
};

const projectsData = [
    {
        name: "quizgen-ai",
        desc: "AI-powered quiz generator from PDFs, PPTs or site links.",
        github: "https://github.com/TanmayDawande/quizgenai",
        demo: "https://tanmaydawande.tech/quizgenai"
    }
];

const terminalOutput = document.getElementById("terminal-output");
const commandInput = document.getElementById("command-input");
const inputDisplay = document.getElementById("input-display");
const menuIcon = document.getElementById("menu-icon");
const projectsModal = document.getElementById("projects-modal");
const closeBtn = document.querySelector(".close-btn");
const githubProjectsContainer = document.getElementById("github-projects");
const contactSection = document.getElementById("contact-section");
const tabProjects = document.getElementById("tab-projects");
const tabContact = document.getElementById("tab-contact");

document.addEventListener("click", (e) => {
    if (!projectsModal.contains(e.target) && !menuIcon.contains(e.target)) {
        if (window.getSelection().toString() === "") {
            commandInput.focus();
        }
    }
});

commandInput.addEventListener("input", () => {
    inputDisplay.textContent = commandInput.value;
});

menuIcon.addEventListener("click", () => {
    projectsModal.classList.toggle("hidden");
    if (!projectsModal.classList.contains("hidden")) {
        switchTab('projects');
    }
});

closeBtn.addEventListener("click", () => {
    projectsModal.classList.add("hidden");
});

tabProjects.addEventListener("click", () => switchTab('projects'));
tabContact.addEventListener("click", () => switchTab('contact'));

function switchTab(tab) {
    if (tab === 'projects') {
        tabProjects.classList.add("active");
        tabContact.classList.remove("active");
        githubProjectsContainer.classList.remove("hidden");
        contactSection.classList.add("hidden");
        fetchGitHubProjects();
    } else {
        tabContact.classList.add("active");
        tabProjects.classList.remove("active");
        contactSection.classList.remove("hidden");
        githubProjectsContainer.classList.add("hidden");
    }
}

let projectsLoaded = false;
async function fetchGitHubProjects() {
    if (projectsLoaded) return;
    
    try {
        const response = await fetch("https://api.github.com/users/TanmayDawande/repos?sort=updated");
        const repos = await response.json();
        
        githubProjectsContainer.innerHTML = ""; 
        
        const excludedRepos = ["tanmaydawande.github.io", "TanmayDawande"];

        repos.sort((a, b) => {
            if (a.name === "quizgenai") return -1;
            if (b.name === "quizgenai") return 1;
            return 0;
        });

        repos.forEach(repo => {
            if (repo.fork) return; 
            if (excludedRepos.includes(repo.name)) return; 
            
            const div = document.createElement("div");
            div.className = "repo-item";

            if (repo.name === "quizgenai") {
                div.innerHTML = `
                    <div class="repo-name">${repo.name}</div>
                    <div class="repo-desc">${repo.description || "No description provided."}</div>
                    <div class="repo-meta">
                        <span>★ ${repo.stargazers_count}</span>
                        <span>${repo.language || "Plain Text"}</span>
                    </div>
                    <div class="try-box" style="display:none; margin-top:10px; border-top:1px dashed #333; padding-top:5px;">
                        <div style="margin-bottom: 5px;">
                            <span style="color:var(--terminal-green); margin-right:5px;">>></span>
                            <a href="${repo.html_url}" target="_blank" style="font-weight:bold;">VIEW REPO?</a>
                        </div>
                        <div>
                            <span style="color:var(--terminal-green); margin-right:5px;">>></span>
                            <a href="https://tanmaydawande.tech/quizgenai" target="_blank" style="font-weight:bold;">TRY IT?</a>
                        </div>
                    </div>
                `;
                
                div.addEventListener("click", (e) => {
                    if (e.target.tagName === 'A') return;
                    const box = div.querySelector(".try-box");
                    box.style.display = box.style.display === "none" ? "block" : "none";
                });
            } else {
                div.innerHTML = `
                    <div class="repo-name">${repo.name}</div>
                    <div class="repo-desc">${repo.description || "No description provided."}</div>
                    <div class="repo-meta">
                        <span>★ ${repo.stargazers_count}</span>
                        <span>${repo.language || "Plain Text"}</span>
                    </div>
                    <div class="repo-box" style="display:none; margin-top:10px; border-top:1px dashed #333; padding-top:5px;">
                        <span style="color:var(--terminal-green); margin-right:5px;">>></span>
                        <a href="${repo.html_url}" target="_blank" style="font-weight:bold;">VIEW REPO?</a>
                    </div>
                `;
                div.addEventListener("click", (e) => {
                    if (e.target.tagName === 'A') return;
                    const box = div.querySelector(".repo-box");
                    box.style.display = box.style.display === "none" ? "block" : "none";
                });
            }
            githubProjectsContainer.appendChild(div);
        });
        projectsLoaded = true;
    } catch (error) {
        githubProjectsContainer.innerHTML = `<div class="error">FAILED TO FETCH DATA. CHECK NETWORK.</div>`;
    }
}

window.onload = async () => {
    const inputLine = document.querySelector(".input-line");

    const navEntry = performance.getEntriesByType("navigation")[0];
    if (navEntry && navEntry.type === 'reload') {
        sessionStorage.removeItem("terminalHistory");
    }

    const savedHistory = sessionStorage.getItem("terminalHistory");
    
    if (savedHistory) {
        terminalOutput.innerHTML = savedHistory;
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
        inputLine.style.display = "flex";
    } else {
        inputLine.style.display = "none"; 
        await typeLine("INITIALIZING SYSTEM...", "command-echo");
        await delay(200);
        await typeLine("LOADING ASSETS...", "command-echo");
        await delay(200);
        await typeLine("CONNECTING TO SERVER...", "command-echo");
        await delay(300);
        await typeLine("ACCESS GRANTED.", "success");
        await delay(300);
        terminalOutput.innerHTML = ""; 
        
        const header = [
            "████████╗ █████╗ ███╗   ██╗███╗   ███╗ █████╗ ██╗   ██╗",
            "╚══██╔══╝██╔══██╗████╗  ██║████╗ ████║██╔══██╗╚██╗ ██╔╝",
            "   ██║   ███████║██╔██╗ ██║██╔████╔██║███████║ ╚████╔╝ ",
            "   ██║   ██╔══██║██║╚██╗██║██║╚██╔╝██║██╔══██║  ╚██╔╝  ",
            "   ██║   ██║  ██║██║ ╚████║██║ ╚═╝ ██║██║  ██║   ██║   ",
            "   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝     ╚═╝╚═╝  ╚═╝   ╚═╝   "
        ];
        
        const headerPre = document.createElement("pre");
        headerPre.style.fontSize = "10px";
        headerPre.style.lineHeight = "1.1";
        headerPre.style.margin = "0 0 20px 0";
        headerPre.style.fontFamily = "monospace";
        headerPre.style.whiteSpace = "pre";
        headerPre.className = "info";
        headerPre.textContent = header.join("\n");
        terminalOutput.appendChild(headerPre);

        println("Welcome to Tanmay Dawande's Portfolio", "success");
        println("Type 'help' to view all available commands.\n", "");
        saveHistory();

        inputLine.style.display = "flex"; 
        commandInput.focus();
    }
};

commandInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        const input = commandInput.value.trim();
        if (input) {
            println(`visitor@tanmay:~$ ${input}`, "line");
            handleCommand(input);
        }
        commandInput.value = "";
        inputDisplay.textContent = ""; 
    }
});

function handleCommand(input) {
    const args = input.split(" ");
    const cmd = args[0].toLowerCase();
    
    if (commands[cmd]) {
        commands[cmd].execute(args.slice(1));
    } else {
        println(`Command not found: ${cmd}. Type 'help'.`, "error");
    }
    
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

function displayHelp() {
    println("AVAILABLE COMMANDS:", "info");
    let content = "<div style=\"display:table; width:100%;\">";
    for (const [key, cmd] of Object.entries(commands)) {
        content += `<div style="display:table-row;">
            <span style="display:table-cell; width:100px; color:var(--terminal-green); padding-right:20px;">${key}</span>
            <span style="display:table-cell;">${cmd.desc}</span>
        </div>`;
    }
    content += "</div>";
    println(content, "");
}

function displayAbout() {
    println("----------------------------------------", "command-echo");
    println("USER: Tanmay Dawande", "info");
    println("STUDY: Vellore Institute of Technology, Vellore", "info");
    println("BRANCH: CSE CORE", "info");
    println("");
    typeLine("");
    println("----------------------------------------", "command-echo");
}

function displayProjects() {
    println("LOADING PROJECTS...", "command-echo");
    
    projectsData.forEach(p => {
        let links = `<a href="${p.github}" target="_blank">[GitHub]</a>`;
        if (p.demo) links += ` <a href="${p.demo}" target="_blank">[Live Demo]</a>`;
        
        const card = `
        <div class="project-card">
            <div class="project-title">${p.name}</div>
            <div class="project-tech">${p.tech}</div>
            <div class="project-desc">${p.desc}</div>
            <div class="project-links">${links}</div>
        </div>
        `;
        println(card, "");
    });
}

function displaySocials() {
    const socials = [
        { name: "GitHub", url: "https://github.com/TanmayDawande" },
        { name: "LinkedIn", url: "https://www.linkedin.com/in/tanmay-dawande-601378376/" }, 
        { name: "X", url: "https://x.com/tanme_7" },
        { name: "Email", url: "mailto:tdawande007@gmail.com" }
    ];
    
    println("CONNECT:", "info");
    socials.forEach(s => {
        println(`- <a href="${s.url}" target="_blank">${s.name}</a>`);
    });
}

function saveHistory() {
    sessionStorage.setItem("terminalHistory", terminalOutput.innerHTML);
}

function println(text, className = "") {
    const div = document.createElement("div");
    if (className) div.className = className;
    div.className += " line";
    div.innerHTML = text;
    terminalOutput.appendChild(div);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
    saveHistory();
}

async function typeLine(text, className = "") {
    const div = document.createElement("div");
    if (className) div.className = className;
    div.className += " line";
    terminalOutput.appendChild(div);
    
    for (let i = 0; i < text.length; i++) {
        div.textContent += text.charAt(i);
        await delay(20); 
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }
    saveHistory();
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

(function() {
    const preTag = document.getElementById("donut-bg");
    if (!preTag) return;
    
    let A = 1, B = 1;

    const renderDonut = () => {
        A += 0.07;
        B += 0.03;
        
        let b = [], z = [];
        let cA = Math.cos(A), sA = Math.sin(A),
            cB = Math.cos(B), sB = Math.sin(B);
            
        for(let k = 0; k < 1760; k++) {
            b[k] = k % 80 == 79 ? "\n" : " ";
            z[k] = 0;
        }
        
        for(let j = 0; j < 6.28; j += 0.07) {
            let ct = Math.cos(j), st = Math.sin(j);
            for(let i = 0; i < 6.28; i += 0.02) {
                let sp = Math.sin(i), cp = Math.cos(i),
                    h = ct + 2,
                    D = 1 / (sp * h * sA + st * cA + 5),
                    t = sp * h * cA - st * sA;
                
                let x = 0 | (40 + 30 * D * (cp * h * cB - t * sB)),
                    y = 0 | (12 + 15 * D * (cp * h * sB + t * cB)),
                    o = x + 80 * y,
                    N = 0 | (8 * ((st * sA - sp * ct * cA) * cB - sp * ct * sA - st * cA - cp * ct * sB));
                
                if(y < 22 && y >= 0 && x >= 0 && x < 79 && D > z[o]) {
                    z[o] = D;
                    b[o] = ".,-~:;=!*#$@"[N > 0 ? N : 0];
                }
            }
        }
        preTag.innerHTML = b.join("");
    };

    setInterval(renderDonut, 50);
})();
