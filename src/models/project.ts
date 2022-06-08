export interface Project {
    id: string, 
    title: string, 
    description: string, 
    people: number, 
    status: ProjectStatus
};

export enum ProjectStatus { Active, Finished };