type Listener<T> = (items: T[]) => void;

export class State<T> {
    protected listeners: Listener<T>[] = [];

    addListenerFn(listenerFn: Listener<T>) {
        this.listeners.push(listenerFn);
    }
}