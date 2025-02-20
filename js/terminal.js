class Terminal {
    constructor() {
        this.outputElement = document.getElementById('output');
        this.fileSystem = new FileSystem();
        this.commands = new Commands(this.fileSystem);
        
        this.setupEventListeners();
        this.displayPrompt();
        
        // Ajouter la gestion du color picker
        this.setupColorPicker();
    }

    setupEventListeners() {
        this.outputElement.addEventListener('keydown', (e) => {
            if (e.target.id === 'command-input' && e.key === 'Enter') {
                e.preventDefault();
                const command = e.target.value;
                this.executeCommand(command);
                e.target.value = '';
            }
        });
    }

    executeCommand(command) {
        const oldPrompt = this.outputElement.querySelector('.command-line:not(.executed)');
        if (oldPrompt) {
            oldPrompt.classList.add('executed');
        }

        const commandLine = document.createElement('div');
        commandLine.className = 'output-line command-output';
        commandLine.innerHTML = `<span class="prompt">user@ubuntu:~$</span> ${command}`;
        this.outputElement.appendChild(commandLine);
        
        const output = this.commands.execute(command);
        
        if (output === 'CLEAR') {
            this.clearOutput();
        } else if (output) {
            this.appendOutput(output);
        }
        
        this.displayPrompt();
    }

    getPrompt() {
        return `user@ubuntu:~$ `;
    }

    displayPrompt() {
        const promptElement = document.createElement('div');
        promptElement.className = 'command-line';
        promptElement.innerHTML = `
            <span class="prompt">${this.getPrompt()}</span>
            <input type="text" id="command-input" autofocus>
        `;
        
        const oldPrompt = this.outputElement.querySelector('.command-line:not(.executed)');
        if (oldPrompt) {
            oldPrompt.remove();
        }
        
        this.outputElement.appendChild(promptElement);
        
        const newInput = promptElement.querySelector('input');
        newInput.focus();
        
        this.inputElement = newInput;
    }

    appendOutput(text) {
        const outputElement = document.createElement('div');
        outputElement.className = 'output-line';
        outputElement.innerHTML = text;
        this.outputElement.appendChild(outputElement);
        this.scrollToBottom();
    }

    clearOutput() {
        this.outputElement.innerHTML = '';
        this.displayPrompt();
    }

    scrollToBottom() {
        this.outputElement.scrollTop = this.outputElement.scrollHeight;
    }

    adjustColor(color, amount) {
        const hex = color.replace('#', '');
        const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
        const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
        const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
        
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    setupColorPicker() {
        const colorPicker = document.getElementById('bg-color-picker');
        const colorPickerContainer = document.querySelector('.color-picker-container');
        const colorPickerIcon = document.querySelector('.color-picker-icon');
        const terminal = document.querySelector('.terminal');

        colorPickerIcon.addEventListener('click', () => {
            colorPickerContainer.classList.toggle('active');
            if (colorPickerContainer.classList.contains('active')) {
                colorPicker.click();
            }
        });

        colorPicker.addEventListener('input', (e) => {
            const color = e.target.value;
            document.body.style.backgroundColor = color;
            terminal.style.backgroundColor = color;
        });

        document.addEventListener('click', (e) => {
            if (!colorPickerContainer.contains(e.target)) {
                colorPickerContainer.classList.remove('active');
            }
        });
        
        // Initialiser les couleurs avec la même valeur
        document.body.style.backgroundColor = colorPicker.value;
        terminal.style.backgroundColor = colorPicker.value;
    }
} 