class FileSystem {
    constructor() {
        this.currentPath = '/home/user';
        this.structure = {
            '/': {
                'home': {
                    'user': {}
                }
            }
        };
    }

    getCurrentDirectory() {
        return this.currentPath;
    }

    createDirectory(name) {
        const path = this.currentPath.split('/').filter(p => p);
        let current = this.structure['/'];
        
        for (const dir of path) {
            current = current[dir];
        }

        if (current[name]) {
            return `mkdir: impossible de créer le répertoire '${name}': Le répertoire existe`;
        }

        current[name] = {};
        return '';
    }

    exitNano(terminalContent, beforHTML) {
        terminalContent.innerHTML = beforHTML;
    }

    saveNano(name) {

        const path = this.currentPath.split('/').filter(p => p);
        let current = this.structure['/'];
        
        for (const dir of path) {
            current = current[dir];
        }

        current[name] = new textFile(name, document.getElementById("editorChamp").innerText.replace(/</g, "&lt;").replace(/>/g, "&gt;")); // .replace pour empecher les injection HTML
         
    }

    createFile(name) {

        const terminalContent = document.getElementById('output');

        terminalContent.style.height = "100%"

        const path = this.currentPath.split('/').filter(p => p);
        let current = this.structure['/'];

        for (const dir of path) {
            current = current[dir];
        }

        let content = "";

        if (current[name]) {
            if (current[name] instanceof textFile) {
                content = current[name].catFile()
            } else {
                document.dispatchEvent(new CustomEvent("nanoEvent", { detail: `"${name} est un répertoire"` }));
                return
            }
        }

        const beforHTML = terminalContent.innerHTML
        terminalContent.innerHTML = `<div class="editor"><div class="header">GNU nano 1.0</div><div id="editorChamp" contenteditable="true">${content}</div><div class="footer"><span class="keyboardInfo">^X</span>Exit<span class="keyboardInfo">^S</span>Save</div></div>`.trim();

        const editorChamp = document.getElementById("editorChamp");
        editorChamp.focus();

        let ctrlPress = false;

        this.cleanEventListener = () => {
            document.removeEventListener("keydown", this.detecteAction);
            document.removeEventListener("keyup", this.detectCtrl);
        }

        this.detectCtrl = (e) => {
            if (e.key == "Control") {
                ctrlPress = false
            }
        }

        this.detecteAction = (e) => {
            if (e.key == "Control") {
                ctrlPress = true
            } else if (ctrlPress) {
                if (e.key == "s") {
                    e.preventDefault();
                    this.cleanEventListener();
                    this.saveNano(name);
                    this.exitNano(terminalContent, beforHTML);
                    terminalContent.style.height = ""
                    document.dispatchEvent(new CustomEvent("nanoEvent", { detail: "" })); // La fonction nano dans commands.js return WAIT nanoEvent. le terminal attent un événement nanoEvent
                }

                if (e.key == "x") {
                    e.preventDefault();
                    this.cleanEventListener();
                    this.exitNano(terminalContent, beforHTML);
                    terminalContent.style.height = ""
                    document.dispatchEvent(new CustomEvent("nanoEvent", { detail: "" }));
                }
            }
        }

        document.addEventListener('keydown', this.detecteAction)
        document.addEventListener('keyup', this.detectCtrl)
        
    }

    catFile(name) {
        const path = this.currentPath.split('/').filter(p => p);
        let current = this.structure['/'];

        for (const dir of path) {
            current = current[dir];
        }

        if (current[name]) {
            if (current[name] instanceof textFile) {
                return current[name].catFile()
            } else {
                return `cat : impossible de lire le fichier '${name}': c'est un dossier`
            }
        } else {
            return `cat : impossible de lire le fichier '${name}': Le fichier n'existe pas`;
        }
    }

    listDirectory() {
        const path = this.currentPath.split('/').filter(p => p);
        let current = this.structure['/'];
        
        for (const dir of path) {
            current = current[dir];
        }

        const entries = Object.keys(current);
        if (entries.length === 0) {
            return '';
        }

        entries.sort();
        
        return entries.map(entry => {
            if (!(current[entry] instanceof textFile)) {
                return `<span class="directory">${entry}</span>`;
            }
            return entry;
        }).join('  ');
    }

    changeDirectory(path) {
        if (path === '..') {
            const dirs = this.currentPath.split('/').filter(p => p);
            if (dirs.length > 1) {
                dirs.pop();
                this.currentPath = '/' + dirs.join('/');
            }
            return '';
        }

        if (path === '~' || path === '/home/user') {
            this.currentPath = '/home/user';
            return '';
        }

        let newPath = path.startsWith('/') ? path : `${this.currentPath}/${path}`;
        
        const dirs = newPath.split('/').filter(p => p);
        let current = this.structure['/'];
        
        for (const dir of dirs) {
            if (!current[dir]) {
                return `cd: ${path}: Aucun fichier ou dossier de ce type`;
            }
            current = current[dir];
        }

        this.currentPath = newPath;
        return '';
    }
} 