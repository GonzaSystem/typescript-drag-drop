// Components base class
export abstract class Component<T extends HTMLElement, U extends HTMLElement> {
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