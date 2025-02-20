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
            return `mkdir: impossible de créer le répertoire '${name}': Le fichier existe`;
        }

        current[name] = {};
        return '';
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
            if (typeof current[entry] === 'object') {
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