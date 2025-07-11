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
            case 'calc':
                return this.calc(args.slice(1).join(' '));
            case 'rand':
                return this.rand(args[1], args[2]);
            case 'flipcoin':
                return this.flipcoin();
            default:
                return `Commande '${cmd}' non trouvée. Tapez 'help' pour voir la liste des commandes.`;
        }
    }

    help() {
        return `
Commandes disponibles:
help      - Affiche cette aide
clear     - Efface l'écran
mkdir     - Crée un nouveau répertoire
ls        - Liste le contenu du répertoire
cd        - Change de répertoire
pwd       - Affiche le répertoire courant
calc      - Calcule une expression mathématique
rand      - Génère un nombre aléatoire entre min et max
flipcoin  - Lance une pièce (pile ou face)
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

    calc(expression) {
        if (!expression) {
            return 'calc: expression manquante. Utilisation: calc <expression>\nExemple: calc 2 + 3 * 4';
        }

        try {
            const cleanExpression = expression.replace(/[^0-9+\-*/().\s]/g, '');
            
            if (cleanExpression !== expression) {
                return 'calc: caractères non autorisés détectés. Utilisez seulement les chiffres et les opérateurs +, -, *, /, (, )';
            }

            const result = eval(cleanExpression);
            
            if (isNaN(result) || !isFinite(result)) {
                return 'calc: résultat invalide';
            }

            return `Résultat: ${result}`;
        } catch (error) {
            return 'calc: expression invalide';
        }
    }

    rand(min, max) {
        if (!min && !max) {
            return `Nombre aléatoire: ${Math.floor(Math.random() * 100) + 1}`;
        }

        if (min && !max) {
            const minNum = parseInt(min);
            if (isNaN(minNum)) {
                return 'rand: min doit être un nombre valide';
            }
            const maxNum = minNum + 100;
            return `Nombre aléatoire: ${Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum}`;
        }

        if (min && max) {
            const minNum = parseInt(min);
            const maxNum = parseInt(max);
            
            if (isNaN(minNum) || isNaN(maxNum)) {
                return 'rand: min et max doivent être des nombres valides';
            }
            
            if (minNum >= maxNum) {
                return 'rand: min doit être inférieur à max';
            }
            
            return `Nombre aléatoire: ${Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum}`;
        }

        return 'rand: utilisation: rand [min] [max]\nExemples:\n  rand        (1-100)\n  rand 10     (10-110)\n  rand 1 10   (1-10)';
    }

    flipcoin() {
        const result = Math.random() < 0.5 ? 'Pile' : 'Face';
        return `🪙 ${result}`;
    }
} 