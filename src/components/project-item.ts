import { Draggable } from '../models/drag-drop';
import { Component } from './base-component';
import { Project } from '../models/project';
import { Autobind } from '../decorators/autobind';

export class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {
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
