import EventObject from "./EventObject";

export default class TemcEventSource {
    eventListeners: any;
    eventSource: any;

    constructor() {

    }

    addListener(name: string, func: any) {
        if (this.eventListeners == null) {
            this.eventListeners = [];
        }
        this.eventListeners.push(name);
        this.eventListeners.push(func);
    }

    getEventSource() {
        return this.eventSource;
    }

    fireEvent(evt: any, sender: any) {
        if (this.eventListeners != null) {
            if (evt == null) {
                evt = new EventObject('unknown');
            }
            if (sender == null) {
                sender = this.getEventSource();
            }
            if (sender == null) {
                sender = this;
            }
            let args = [sender, evt];
            for (let i = 0; i < this.eventListeners.length; i += 2) {
                let listen = this.eventListeners[i];

                if (listen == null || listen == evt.getName()) {
                    this.eventListeners[i + 1].apply(this, args);
                }
            }
        }
    };

}