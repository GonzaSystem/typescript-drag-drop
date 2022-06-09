import { Component } from "./base-component";
import { DragTarget } from "../models/drag-drop";
import { Project, ProjectStatus } from "../models/project";
import { Autobind } from "../decorators/autobind";
import { projectState } from "../state/project-state";
import { ProjectItem } from "./project-item";

export class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
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