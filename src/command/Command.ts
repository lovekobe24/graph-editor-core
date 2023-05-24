import type Change from './Change'

class Command {

    changes: Array<Change>;

    constructor(changes: Array<Change> = []) {
        this.changes = changes;
    }

    undo() {
        let len = this.changes.length, i = len - 1;
        while (i > -1) this.changes[i--].undo();
    }

    execute() {
        let len = this.changes.length, i = 0;
        while (i < len) this.changes[i++].execute();
    }

}

export default Command;