class TerminalSimulator {
    constructor() {
        this.currentDirectory = 'C:\\Users\\User';
        this.commandHistory = [];
        this.historyIndex = -1;
        
        this.output = document.getElementById('output');
        this.input = document.getElementById('command-input');
        
        this.terminalType = 'windows';
        this.terminalConfig = {
            windows: {
                prompt: 'C:\\Users\\user>',
                pathSeparator: '\\',
                rootPath: 'C:',
                commands: ['dir', 'cd', 'cls', 'help']
            },
            linux: {
                prompt: 'user@localhost:~$ ',
                pathSeparator: '/',
                rootPath: '/',
                commands: ['ls', 'cd', 'clear', 'help']
            },
            macos: {
                prompt: 'user@MacBook-Pro ~ % ',
                pathSeparator: '/',
                rootPath: '/Users/user',
                commands: ['ls', 'cd', 'clear', 'help']
            }
        };
        
        this.currentInput = '';
        
        this.inputDisplay = document.createElement('span');
        this.inputDisplay.className = 'input-display';
        document.querySelector('.command-line').appendChild(this.inputDisplay);
        
        this.setupEventListeners();
        this.setupTerminalTypeButtons();
        
        this.handleCls();
    }

    setupEventListeners() {
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.executeCommand(this.input.value);
                this.input.value = '';
                this.currentInput = '';
                this.updateInputDisplay();
            } else if (e.key === 'Backspace') {
                this.currentInput = this.currentInput.slice(0, -1);
                this.updateInputDisplay();
            } else if (e.key.length === 1) {
                this.currentInput += e.key;
                this.updateInputDisplay();
            } else if (e.key === 'l' && e.ctrlKey) {
                e.preventDefault();
                if (this.terminalType !== 'windows') {
                    this.handleCls();
                }
            }
        });

        document.querySelector('.terminal-body').addEventListener('click', () => {
            this.input.focus();
        });
    }

    setupTerminalTypeButtons() {
        const buttons = document.querySelectorAll('.terminal-type-button');
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                buttons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                this.changeTerminalType(button.dataset.type);
            });
        });
    }

    changeTerminalType(type) {
        this.terminalType = type;
        const terminalWindow = document.querySelector('.terminal-window');
        terminalWindow.classList.remove('windows', 'linux', 'macos');
        terminalWindow.classList.add(type);
        const promptElement = document.querySelector('.prompt');
        promptElement.textContent = this.terminalConfig[type].prompt;
        const titleElement = document.querySelector('.title');
        titleElement.textContent = this.getTerminalTitle(type);
        this.updateWindowControls(type);
        this.handleCls();
    }

    updateWindowControls(type) {
        const closeButton = document.querySelector('.close');
        const minimizeButton = document.querySelector('.minimize');
        const maximizeButton = document.querySelector('.maximize');

        if (type === 'macos') {
            closeButton.innerHTML = '';
            minimizeButton.innerHTML = '';
            maximizeButton.innerHTML = '';
            closeButton.style.backgroundColor = '#ff5f56';
            minimizeButton.style.backgroundColor = '#ffbd2e';
            maximizeButton.style.backgroundColor = '#27c93f';
        } else {
            closeButton.innerHTML = '×';
            minimizeButton.innerHTML = '─';
            maximizeButton.innerHTML = '□';
            closeButton.style.backgroundColor = '';
            minimizeButton.style.backgroundColor = '';
            maximizeButton.style.backgroundColor = '';
        }
    }

    getTerminalTitle(type) {
        switch(type) {
            case 'windows':
                return 'Command Prompt';
            case 'linux':
                return 'Terminal';
            case 'macos':
                return 'Terminal — bash';
            default:
                return 'Terminal';
        }
    }

    executeCommand(command) {
        if (!command.trim()) return;
        
        this.commandHistory.push(command);
        this.historyIndex = this.commandHistory.length;
        
        this.appendOutput(`${this.terminalConfig[this.terminalType].prompt}${command}\n`);
        
        const [cmd, ...args] = command.trim().toLowerCase().split(' ');
        
        switch(this.terminalType) {
            case 'windows':
                this.executeWindowsCommand(cmd, args);
                break;
            case 'linux':
            case 'macos':
                this.executeUnixCommand(cmd, args);
                break;
        }
    }

    executeWindowsCommand(cmd, args) {
        switch(cmd) {
            case 'dir':
                this.handleDir();
                break;
            case 'cls':
            case 'clear':
                this.handleCls();
                break;
            default:
                this.appendOutput(`'${cmd}' n'est pas reconnu en tant que commande interne\nou externe, un programme exécutable ou un fichier de commandes.\n\n`);
        }
    }

    executeUnixCommand(cmd, args) {
        switch(cmd) {
            case 'ls':
                this.handleLs();
                break;
            case 'clear':
            case 'reset':
            case 'ctrl+l':
                this.handleCls();
                break;
            default:
                if (this.terminalType === 'linux') {
                    this.appendOutput(`bash: ${cmd}: command not found\n`);
                } else {
                    this.appendOutput(`zsh: command not found: ${cmd}\n`);
                }
        }
    }

    handleLs() {
        const output = this.terminalType === 'macos' ? 
            `Desktop    Documents    Downloads    Library    Movies    Music    Pictures    Public\n` :
            `Desktop  Documents  Downloads  Music  Pictures  Public  Templates  Videos\n`;
        this.appendOutput(output);
    }

    appendOutput(text) {
        this.output.textContent += text;
        this.output.scrollTop = this.output.scrollHeight;
    }

    handleDir() {
        const simulatedOutput = `
 Volume dans le lecteur C n'a pas de nom.
 Le numéro de série du volume est XXXX-XXXX

 Répertoire de ${this.currentDirectory}

14/03/2024  10:00    <DIR>          .
14/03/2024  10:00    <DIR>          ..
14/03/2024  10:00    <DIR>          Documents
14/03/2024  10:00    <DIR>          Downloads
14/03/2024  10:00    <DIR>          Desktop
               0 fichier(s)              0 octets
               5 Rép(s)  100,000,000,000 octets libres\n`;
        
        this.appendOutput(simulatedOutput);
    }

    handleCls() {
        this.output.textContent = '';
        if (this.terminalType === 'linux') {
            this.appendOutput(`Ubuntu 22.04.3 LTS\nWelcome to Ubuntu!\n\n`);
        } else if (this.terminalType === 'macos') {
            const now = new Date();
            this.appendOutput(`Last login: ${now.toLocaleString()} on ttys000\n\n`);
        } else {
            this.appendOutput(`Microsoft Windows [Version 10.0.19045.4046]
(c) Microsoft Corporation. Tous droits réservés.

`);
        }
    }

    updateInputDisplay() {
        this.inputDisplay.textContent = this.currentInput;
    }
}

const terminal = new TerminalSimulator(); 