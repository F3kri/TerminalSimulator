class textFile { // Crée un élément file modifiable
    constructor(name, content="") {
        this.content = content
        this.name = name
    }

    catFile() {
        return this.content
    }

    updateFile(content) {
        this.content = content;
        return "";
    }
}