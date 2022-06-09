import { Project, ProjectStatus } from "../models/project";
import { State } from "./state";

// Project State Management
export class ProjectState extends State<Project> {
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

export const projectState = ProjectState.getInstance();