// Drag & Drop Interfaces
interface Draggable {
    dragStartHandler(event: DragEvent): void;
    dragEndHandler(event: DragEvent): void;
}

interface DragTarget {
    dragOverHandler(event: DragEvent): void;
    dropHandler(event: DragEvent): void;
    dragLeaveHandler(event: DragEvent): void;
}

// Project type
enum ProjectStatus { Active, Finished };

interface Project {
    id: string, 
    title: string, 
    description: string, 
    people: number, 
    status: ProjectStatus
};

type Listener<T> = (items: T[]) => void;

class State<T> {
    protected listeners: Listener<T>[] = [];

    addListenerFn(listenerFn: Listener<T>) {
        this.listeners.push(listenerFn);
    }
}

// Project State Management
class ProjectState extends State<Project>{
    private projects: Project[] = [];
    private static instance: ProjectState;

    private constructor() {
        super();
    }

    static getInstance() {
        if (this.instance) {
            return this.instance;
        }
        this.instance = new ProjectState;

        return this.instance;
    }

    addProject(title: string, description: string, numOfPeople: number): void {
        const project: Project = {
            id: Math.random().toString(),
            title: title,
            description: description,
            people: numOfPeople,
            status: ProjectStatus.Active
        };

        this.projects.push(project);
        this.updateListeners();
    }

    moveProject(projectId: string, newStatus: ProjectStatus) {
        const project = this.projects.find(prj => prj.id === projectId);

        if (project && project.status !== newStatus) {
            project.status = newStatus;
            this.updateListeners();
        }
    }

    private updateListeners() {
        for (const listenerFn of this.listeners) {
            listenerFn(this.projects.slice());
        }
    }
}

const projectState = ProjectState.getInstance();
// Validation
interface Validatable {
    value: string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number,
    min?: number;
    max?: number;
}

function validate(input: Validatable[]): boolean {
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

// Components base class
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
    templateEl: HTMLTemplateElement; 
    hostEl: T; 
    mainEl: U;

    constructor(templateId: string, hostElementId: string, insertAtStart: boolean, newElementId?: string) {
        this.templateEl = <HTMLTemplateElement>document.getElementById(templateId)!;
        this.hostEl = <T>document.getElementById(hostElementId)!;
        this.init(newElementId, insertAtStart);
    }

    private init(newElementId: string | undefined, insertAtStart: boolean): void {
        this.loadDOMElements(newElementId, insertAtStart);
    }

    private loadDOMElements(newElementId: string | undefined, insertAtStart: boolean): void {
        // Template rendering
        const importedNode = document.importNode(this.templateEl.content, true);
        this.mainEl = <U>importedNode.firstElementChild;

        if (newElementId) {
            this.mainEl.id = newElementId;
        }

        this.hostEl.insertAdjacentElement(
            insertAtStart ? 'afterbegin' : 'beforeend', 
            this.mainEl
        );
    }

    abstract configure(): void;
    abstract renderContent(): void;
}

class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
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

class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
    assignedProjects: Project[];

    constructor(private type: 'active' | 'finished') {
        const tempId = 'project-list';
        const hostId = 'app';
        const insertAtStart = false;
        const newElId = `${type}-projects`;
        super(tempId, hostId, insertAtStart, newElId);
        this.configure();
    }

    @Autobind
    dragOverHandler(event: DragEvent): void {
        if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') { // Is the data attached to our drag event in this format?
            event.preventDefault();
            this.mainEl.querySelector('ul')!.classList.add('droppable');
        }
    }

    @Autobind
    dragLeaveHandler(_event: DragEvent): void {
        this.mainEl.querySelector('ul')!.classList.remove('droppable');
    }

    @Autobind
    dropHandler(event: DragEvent): void {
       const prjId = event.dataTransfer!.getData('text/plain');
       projectState.moveProject(prjId, this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished);
    }

    configure(): void {
        this.mainEl.addEventListener('dragover', this.dragOverHandler);
        this.mainEl.addEventListener('dragleave', this.dragLeaveHandler);
        this.mainEl.addEventListener('drop', this.dropHandler);

        projectState.addListenerFn((projects: Project[]) => {
            const relevantProjects = projects.filter(project => {
                if (this.type === 'active') {
                    return project.status === ProjectStatus.Active;
                }
                return project.status === ProjectStatus.Finished;
            });

            this.assignedProjects = relevantProjects;
            this.renderProjects();
        });
        this.renderContent();
    }

    renderContent(): void {
        const listId = `${this.type}-projects-list`;
        this.mainEl.querySelector('ul')!.id = listId;
        this.mainEl.querySelector('h2')!.textContent = `${this.type.toUpperCase()} PROJECTS`; 
    }

    private renderProjects(): void {
        const listEl = document.getElementById(`${this.type}-projects-list`)!;
        listEl.innerHTML = '';

        for (const prjItem of this.assignedProjects) {
            new ProjectItem(this.mainEl.querySelector('ul')!.id, prjItem);
        }
    }
}

class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {
    private project: Project;

    get persons() {
        if (this.project.people === 1) {
            return `1 person`;
        }

        return `${this.project.people} persons`;
    }

    constructor(hostId: string, project: Project) {
        const templateId = 'single-project';
        const insertAtStart = false;
        super(templateId, hostId, insertAtStart, project.id);

        this.project = project;

        this.configure();
        this.renderContent();
    }

    @Autobind
    dragStartHandler(event: DragEvent): void {
        event.dataTransfer!.setData('text/plain', this.project.id);
        event.dataTransfer!.effectAllowed = 'move';
    }

    dragEndHandler(_event: DragEvent): void {}

    configure() {
        this.mainEl.addEventListener('dragstart', this.dragStartHandler);
        this.mainEl.addEventListener('dragend', this.dragEndHandler);
    }

    renderContent(): void {
        this.mainEl.querySelector('h2')!.textContent = this.project.title;
        this.mainEl.querySelector('h3')!.textContent = `${this.persons} assigned`;
        this.mainEl.querySelector('p')!.textContent = this.project.description;
    }
}

const project = new ProjectInput();

const activeProjectsList = new ProjectList('active');
const finishedProjectsList = new ProjectList('finished');