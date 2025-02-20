class Commands {
    constructor(fileSystem) {
        this.fileSystem = fileSystem;
        this.commandHistory = [];
        this.historyIndex = -1;
    }

    execute(command) {
        const args = command.trim().split(' ');
        const cmd = args[0].toLowerCase();

        switch(cmd) {
            case 'help':
                return this.help();
            case 'clear':
                return 'CLEAR';
            case 'mkdir':
                return this.mkdir(args[1]);
            case 'ls':
                return this.ls();
            case 'cd':
                return this.cd(args[1]);
            case 'pwd':
                return this.pwd();
            default:
                return `Commande '${cmd}' non trouvée. Tapez 'help' pour voir la liste des commandes.`;
        }
    }

    help() {
        return `
Commandes disponibles:
help    - Affiche cette aide
clear   - Efface l'écran
mkdir   - Crée un nouveau répertoire
ls      - Liste le contenu du répertoire
cd      - Change de répertoire
pwd     - Affiche le répertoire courant
        `.trim();
    }

    mkdir(dirName) {
        if (!dirName) {
            return 'mkdir: argument manquant';
        }
        return this.fileSystem.createDirectory(dirName);
    }

    ls() {
        return this.fileSystem.listDirectory();
    }

    cd(path) {
        if (!path) {
            return 'cd: argument manquant';
        }
        return this.fileSystem.changeDirectory(path);
    }

    pwd() {
        return this.fileSystem.getCurrentDirectory();
    }
} 