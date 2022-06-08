import { Component } from './base-component.js';
import { projectState } from '../state/project-state.js';
import { Validatable } from '../models/validation.js';
import { validate } from '../util/validation.js';
import { Autobind } from '../decorators/autobind.js';

export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
    titleInputEl: HTMLInputElement;
    descriptionInputEl: HTMLInputElement;
    peopleInputEl: HTMLInputElement;

    constructor() {
        const tempId = 'project-input';
        const hostId = 'app';
        const insertAtStart = true;
        const newElId = `user-input`;

        super(tempId, hostId, insertAtStart, newElId);
        this.configure();
    }
    
    configure(): void {
        // Grabbing the inputs
        this.titleInputEl = <HTMLInputElement> this.hostEl.querySelector('#title')!;
        this.descriptionInputEl = <HTMLInputElement> this.hostEl.querySelector('#description')!;
        this.peopleInputEl = <HTMLInputElement> this.hostEl.querySelector('#people')!;
        
        this.loadEventListeners();
    }

    renderContent() {}
    
    private loadEventListeners(): void {
        this.hostEl.addEventListener('submit', this.submitHandler);
    }

    @Autobind
    private submitHandler(event: Event): void {
        event.preventDefault();
        const userInput = this.gatherUserInput();

        if (Array.isArray(userInput)) {
            const [title, desc, people] = userInput;
            projectState.addProject(title, desc, people);
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

    private clearInputs(): void {
        this.titleInputEl.value = '';
        this.descriptionInputEl.value = '';
        this.peopleInputEl.value = '';
    }
}