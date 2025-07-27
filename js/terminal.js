class Terminal {
    constructor() {
        this.outputElement = document.getElementById('output');
        this.fileSystem = new FileSystem();
        this.commands = new Commands(this.fileSystem);

        this.indexBashHistory = 0 // Index pour remonter l'historique des commandes
        
        this.setupEventListeners();
        this.displayPrompt();
        
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

            else if (e.target.id === 'command-input' && e.key === 'ArrowUp') {
                this.indexBashHistory += 1;
                const result = this.commands.getCommandHistory(this.indexBashHistory)
                
                if (result) {
                    e.target.value = result;
                    e.target.focus();
                    requestAnimationFrame(() => {
                        e.target.focus();
                        e.target.setSelectionRange(e.target.value.length, e.target.value.length);
                    });
                }
            }

            else if (e.target.id === 'command-input' && e.key === 'ArrowDown') {
                this.indexBashHistory -= 1;

                if (this.indexBashHistory <= 0) {
                    this.indexBashHistory = 0;
                    e.target.value = "";
                    return
                }

                const result = this.commands.getCommandHistory(this.indexBashHistory)
                
                if (result) {
                    e.target.value = result;
                }
            }
        });

        const header = document.getElementsByClassName('terminal-header')[0];
        const terminal = document.getElementsByClassName('terminal')[0];

        let isDragging = false;
        let offsetX = 0;
        let offsetY = 0;

        header.addEventListener('mousedown', (e) => {
            isDragging = true;
            
            // Calcule la position du clic à l’intérieur de l’élément
            offsetX = e.clientX - terminal.offsetLeft;
            offsetY = e.clientY - terminal.offsetTop;

        });

        document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            // Applique le décalage : déplacement naturel
            terminal.style.left = (e.clientX - offsetX) + 'px';
            terminal.style.top = (e.clientY - offsetY) + 'px';
        }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });

    }

    updateTitle(title="Ubuntu") {
        const rootTitle = document.getElementsByClassName("terminal-title")[0];
        rootTitle.innerText = `Terminal ~ ${title}`;
        document.title = `Terminal ~ ${title}`;
    }

    executeCommand(command) {
        this.updateTitle(command.trim().split(' ')[0]);
        this.indexBashHistory = 0
        const oldPrompt = this.outputElement.querySelector('.command-line:not(.executed)');
        if (oldPrompt) {
            oldPrompt.classList.add('executed');
        }

        const commandLine = document.createElement('div');
        commandLine.className = 'output-line command-output';
        commandLine.innerHTML = `<span class="prompt">${this.getPrompt()}</span>${command}`;
        this.outputElement.appendChild(commandLine);
        
        const output = this.commands.execute(command);

        const end = () => { // Affiche un nouveau prompt et rénitialise le titre
            this.displayPrompt();
            this.updateTitle();
        }
        
        if (output === 'CLEAR') {
            this.clearOutput();
            end();
        } else if (output.startsWith('WAIT')) { // Permet de demander d'attendre que EventListener en position 1 soit résolut en retournant e.detail 
            
            const eventName = output.trim().split(' ')[1]

            this.waitResponse = (e) => {
                document.removeEventListener(eventName, this.waitResponse);
                this.appendOutput(e.detail);
                end();
            }

            document.addEventListener(eventName, this.waitResponse)

        } else if (output) {
            this.appendOutput(output);
            end();

        } else {
            end();
        }
        
    }

    getPrompt() {
        return `user@ubuntu<span style="color:white;">:<span class="directory">${this.fileSystem.getCurrentDirectory()}</span>$</span> `;
    }

    displayPrompt() {
        const promptElement = document.createElement('div');
        promptElement.className = 'command-line';
        promptElement.innerHTML = `
            <span class="prompt">${this.getPrompt()}</span><input type="text" id="command-input" autofocus>
        `.trim();
        
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
        console.log(text)
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
        
        document.body.style.backgroundColor = colorPicker.value;
        terminal.style.backgroundColor = colorPicker.value;
    }
} 