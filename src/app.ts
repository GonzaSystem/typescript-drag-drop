// Validation
interface Validatable {
    value: string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number,
    min?: number;
    max?: number;
}

function validate(input: Validatable[]) {
    for (const prop of input) {
        if (prop.required) {
            if (prop.value.toString().trim().length === 0) { return false; }
        }

        if (prop.minLength && typeof prop.value === 'string') {
            if (prop.value.toString().trim().length < prop.minLength) { return false; }
        }

        if (prop.maxLength && typeof prop.value === 'string') {
            if (prop.value.toString().trim().length < prop.maxLength) { return false; }
        }

        if (prop.min != null && typeof prop.value === 'number') {
            if (prop.value < prop.min) { return false; }
        }

        if (prop.max != null && typeof prop.value === 'number') {
            if (prop.value > prop.max) { return false; }
        }
    }

    return true;
}

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
    templateEl: HTMLTemplateElement; 
    hostEl: HTMLDivElement; 
    formEl: HTMLFormElement;
    titleInputEl: HTMLInputElement;
    descriptionInputEl: HTMLInputElement;
    peopleInputEl: HTMLInputElement;

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

        const validatableTitle: Validatable = {
            value: enteredTitle,
            required: true
        };

        const validatableDescription: Validatable = {
            value: enteredDescription,
            required: true,
            minLength: 5
        };

        const validatablePeople: Validatable = {
            value: +enteredPeople,
            required: true,
            min: 1,
            max: 5
        };

        if (!validate([validatableTitle, validatableDescription, validatablePeople])) {
            return alert('One or more inputs are invalid, please try again');
        }

        return [enteredTitle, enteredDescription, +enteredPeople];
    }

    private clearInputs() {
        this.titleInputEl.value = '';
        this.descriptionInputEl.value = '';
        this.peopleInputEl.value = '';
    }
}

class ProjectList {
    templateEl: HTMLTemplateElement;
    hostEl: HTMLDivElement;
    projectEl: HTMLElement;

    constructor(private type: 'active' | 'finished') {
        this.init();
    }

    init() {
        this.loadDOMElements();
    }

    private loadDOMElements() {
        this.templateEl = <HTMLTemplateElement>document.getElementById('project-list')!;
        this.hostEl = <HTMLDivElement>document.getElementById('app')!;

        // Template rendering
        const importedNode = document.importNode(this.templateEl.content, true);
        this.projectEl = <HTMLElement>importedNode.firstElementChild;
        this.projectEl.id = `${this.type}-projects`;
        this.hostEl.insertAdjacentElement('afterend', this.projectEl);

        this.loadEventListeners();
        this.renderContent();
    }

    private loadEventListeners() {
        this.projectEl.insertAdjacentElement('beforeend', this.templateEl);
    }

    private renderContent() {
        const listId = `${this.type}-projects-list`;
        this.projectEl.querySelector('ul')!.id = listId;
        this.projectEl.querySelector('h2')!.textContent = `${this.type.toUpperCase()} PROJECTS`; 
    }
}

const project = new ProjectInput();

const activeProjectsList = new ProjectList('active');
const finishedProjectsList = new ProjectList('finished');