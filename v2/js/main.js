// Fichier principal JavaScript
const terminal = document.getElementById("terminal");
let history = [];
let historyIndex = -1;
let currentPath = "C:\\Users\\User";

// Structure de répertoires fictive
const fileSystem = {
    "C:": {
        "Users": {
            "User": {
                "Dossier1": {},
                "Dossier2": {},
                "fichier.txt": ""
            }
        }
    }
};

// Fonction pour vérifier si un chemin existe
function pathExists(path) {
    const parts = path.split("\\");
    let current = fileSystem;
    for (let part of parts) {
        if (current[part] === undefined) {
            return false;
        }
        current = current[part];
    }
    return true;
}

// Fonction pour normaliser un chemin
function normalizePath(path) {
    const parts = path.split("\\");
    const stack = [];
    for (let part of parts) {
        if (part === "..") {
            if (stack.length > 0) {
                stack.pop();
            }
        } else if (part !== "." && part !== "") {
            stack.push(part);
        }
    }
    return stack.join("\\");
}

// Fonction pour obtenir le répertoire courant
function getCurrentDirectory() {
    const parts = currentPath.split("\\");
    let current = fileSystem;
    for (let part of parts) {
        current = current[part];
    }
    return current;
}

// Ajoute une ligne de texte au terminal
function appendLine(text = "", isInput = false) {
    const line = document.createElement("div");
    line.textContent = isInput ? `${currentPath}> ${text}` : text;
    terminal.appendChild(line);
    terminal.scrollTop = terminal.scrollHeight;
    if (!isInput) {
        terminal.appendChild(document.createElement("div")); // Ajoute une ligne vide après chaque réponse
    }
}

// Crée un nouveau prompt pour l'entrée utilisateur
function createPrompt() {
    const inputLine = document.createElement("div");
    inputLine.className = "input-line";
    inputLine.innerHTML = `<span>${currentPath}&gt; </span><input type="text" id="input" autofocus>`;
    terminal.appendChild(inputLine);
    document.getElementById("input").focus();
}

// Liste des commandes disponibles
const commands = {
    help: `Pour plus d'informations sur une commande spécifique, entrez HELP suivi de la commande.
DIR            Affiche la liste des répertoires et fichiers.
CD             Change le répertoire courant.
ECHO           Affiche un message à l'écran.
CLS            Efface l'écran du terminal.
EXIT           Ferme le terminal.
MKDIR          Crée un nouveau dossier.
TOUCH          Crée un nouveau fichier.
CAT            Affiche le contenu d'un fichier.
WRITE          Écrit du texte dans un fichier.
RM             Supprime un fichier ou un dossier.`,
    dir: () => {
        const currentDir = getCurrentDirectory();
        return "\n" + Object.keys(currentDir).join("\n");
    },
    cd: (args) => {
        if (args.length === 0) {
            return "Syntaxe incorrecte. Utilisation : cd <chemin>";
        }
        const newPath = args.join(" ");
        let fullPath;
        if (newPath === "..") {
            const parts = currentPath.split("\\");
            if (parts.length > 1) {
                parts.pop();
                fullPath = parts.join("\\");
            } else {
                return "Vous êtes déjà à la racine.";
            }
        } else {
            fullPath = normalizePath(`${currentPath}\\${newPath}`);
        }
        if (pathExists(fullPath)) {
            currentPath = fullPath;
        } else {
            return `Le répertoire spécifié n'existe pas : ${fullPath}`;
        }
        return `Répertoire courant : ${currentPath}`;
    },
    echo: (args) => args.join(" "),
    cls: () => { terminal.innerHTML = ""; return ""; },
    exit: () => { window.close(); return "Session terminée."; },
    mkdir: (args) => {
        if (args.length === 0) {
            return "Syntaxe incorrecte. Utilisation : mkdir <nom_du_dossier>";
        }
        const dirName = args.join(" ");
        const currentDir = getCurrentDirectory();
        if (currentDir[dirName]) {
            return `Le dossier "${dirName}" existe déjà.`;
        }
        currentDir[dirName] = {};
        return `Dossier "${dirName}" créé.`;
    },
    touch: (args) => {
        if (args.length === 0) {
            return "Syntaxe incorrecte. Utilisation : touch <nom_du_fichier>";
        }
        const fileName = args.join(" ");
        const currentDir = getCurrentDirectory();
        if (currentDir[fileName] !== undefined) {
            return `Le fichier "${fileName}" existe déjà.`;
        }
        currentDir[fileName] = "";
        return `Fichier "${fileName}" créé.`;
    },
    cat: (args) => {
        if (args.length === 0) {
            return "Syntaxe incorrecte. Utilisation : cat <nom_du_fichier>";
        }
        const fileName = args.join(" ");
        const currentDir = getCurrentDirectory();
        if (currentDir[fileName] === undefined) {
            return `Le fichier "${fileName}" n'existe pas.`;
        }
        return currentDir[fileName];
    },
    write: (args) => {
        if (args.length < 2) {
            return "Syntaxe incorrecte. Utilisation : write <nom_du_fichier> <texte>";
        }
        const fileName = args[0];
        const text = args.slice(1).join(" ");
        const currentDir = getCurrentDirectory();
        if (currentDir[fileName] === undefined) {
            return `Le fichier "${fileName}" n'existe pas.`;
        }
        currentDir[fileName] += `\n${text}`;
        return `Texte ajouté au fichier "${fileName}".`;
    },
    rm: (args) => {
        if (args.length === 0) {
            return "Syntaxe incorrecte. Utilisation : rm <nom_du_fichier_ou_dossier>";
        }
        const name = args.join(" ");
        const currentDir = getCurrentDirectory();
        if (currentDir[name] === undefined) {
            return `Le fichier ou dossier "${name}" n'existe pas.`;
        }
        delete currentDir[name];
        return `Fichier ou dossier "${name}" supprimé.`;
    }
};

// Gestion des événements clavier
document.addEventListener("keydown", function(event) {
    const input = document.getElementById("input");
    if (!input) return;

    if (event.key === "Enter") {
        const command = input.value.trim();
        history.push(command);
        historyIndex = history.length;

        appendLine(command, true);
        input.parentElement.remove();

        let response = "Commande inconnue. Tapez 'help' pour une liste de commandes.";
        const parts = command.split(" ");
        const cmd = parts[0].toLowerCase();
        if (commands[cmd]) {
            response = typeof commands[cmd] === "function" ? commands[cmd](parts.slice(1)) : commands[cmd];
        }

        if (response) {
            appendLine(response);
        }

        createPrompt();
    } else if (event.key === "ArrowUp") {
        if (historyIndex > 0) {
            historyIndex--;
            input.value = history[historyIndex];
        }
    } else if (event.key === "ArrowDown") {
        if (historyIndex < history.length - 1) {
            historyIndex++;
            input.value = history[historyIndex];
        } else {
            input.value = "";
        }
    }
});

// Initialisation du terminal
document.addEventListener('DOMContentLoaded', () => {
    createPrompt();
}); 