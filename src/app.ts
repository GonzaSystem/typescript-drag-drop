class ProjectInput {
    protected templateEl: HTMLTemplateElement; 
    protected hostEl: HTMLDivElement; 
    protected formEl: HTMLFormElement;

    constructor() {
        this.init();
    }

    init() {
        this.loadDOMElements();
    }
    
    private loadDOMElements() {
        this.templateEl = <HTMLTemplateElement> document.getElementById('project-input')!;
        this.hostEl = <HTMLDivElement> document.getElementById('app')!;

        const importedNode = document.importNode(this.templateEl.content, true);
        this.formEl = <HTMLFormElement> importedNode.firstElementChild;
        this.hostEl.insertAdjacentElement('afterbegin', this.formEl);
    }
}

const project = new ProjectInput();