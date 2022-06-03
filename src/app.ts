// Autobind decorator
function Autobind(_target: any, _methodName: string, descriptor: PropertyDescriptor): PropertyDescriptor {
    const originalMethod = descriptor.value;
    const adjDescriptor: PropertyDescriptor = {
        configurable: true,
        enumerable: false,
        get() {
            return originalMethod.bind(this);
        }
    };
    return adjDescriptor;
}


class ProjectInput {
    protected templateEl: HTMLTemplateElement; 
    protected hostEl: HTMLDivElement; 
    protected formEl: HTMLFormElement;
    protected titleInputEl: HTMLInputElement;
    protected descriptionInputEl: HTMLInputElement;
    protected peopleInputEl: HTMLInputElement;

    constructor() {
        this.init();
    }

    init() {
        this.loadDOMElements();
    }
    
    private loadDOMElements() {
        this.templateEl = <HTMLTemplateElement>document.getElementById('project-input')!;
        this.hostEl = <HTMLDivElement>document.getElementById('app')!;

        // Form rendering
        const importedNode = document.importNode(this.templateEl.content, true);
        this.formEl = <HTMLFormElement>importedNode.firstElementChild;
        this.formEl.id = 'user-input';
        this.hostEl.insertAdjacentElement('afterbegin', this.formEl);

        // Grabbing the inputs
        this.titleInputEl = <HTMLInputElement>this.formEl.querySelector('#title')!;
        this.descriptionInputEl = <HTMLInputElement>this.formEl.querySelector('#description')!;
        this.peopleInputEl = <HTMLInputElement>this.formEl.querySelector('#people')!;
        
        this.loadEventListeners();
    }
    
    private loadEventListeners() {
        this.formEl.addEventListener('submit', this.submitHandler);
    }

    @Autobind
    private submitHandler(event: Event) {
        event.preventDefault();
        const userInput = this.gatherUserInput();

        if (Array.isArray(userInput)) {
            const [title, desc, people] = userInput;
            console.log(title, desc, people);
        }

        this.clearInputs();
    }

    private gatherUserInput(): [string, string, number] | void {
        const enteredTitle = this.titleInputEl.value;
        const enteredDescription = this.descriptionInputEl.value;
        const enteredPeople = this.peopleInputEl.value;

        if (enteredTitle.trim().length === 0 ||
            enteredDescription.trim().length === 0 ||
            enteredPeople.trim().length === 0
        ) {
            return alert('Invalid input, please try again');
        }

        return [enteredTitle, enteredDescription, +enteredPeople];
    }

    private clearInputs() {
        this.titleInputEl.value = '';
        this.descriptionInputEl.value = '';
        this.peopleInputEl.value = '';
    }
}

const project = new ProjectInput();