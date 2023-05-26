import type { GraphManager } from "../GraphManager";
import Utils from "../Utils";

import type Command from "./Command";

class UndoRedoManager {

    limit: number = 30;
    undos: any = [];
    redos: any = [];
    settings:any;

    constructor(gm:GraphManager,limit: number) {
    
        this.settings=gm.config
        if (limit > 0) this.limit = limit;
        if (Utils.isBrowser()) {
            window.addEventListener('keydown', this.onKeyDown.bind(this))
        }
    }

    canUndo() {
        return this.undos.length > 0;
    }

    undo() {
        if (this.canUndo()) {
            let cmd = this.undos.pop();
            this.redos.push(cmd);
            cmd.undo();
        }
    }

    canRedo() {
        return this.redos.length > 0;
    }

    redo() {
        if (this.canRedo()) {
            let cmd = this.redos.pop();
            this.undos.push(cmd);
            cmd.execute();
        }
    }

    record(cmd: Command) {
        if (this.undos.length === this.limit) this.undos.shift();
        this.undos.push(cmd);
        this.redos = [];
    }

    execute(cmd: Command,toHistory:boolean=true) {
        if(toHistory){
            this.record(cmd);
        }
        cmd.execute();
    }

    private onKeyDown(
        e: Event & {
            key: string
            metaKey: boolean
            ctrlKey: boolean
            shiftKey: boolean
        }
    ) {
     
        if (this.settings?.history?.keyboard?.enabled === false) {
            return
        }

        const isSpecialKey = e.metaKey || e.ctrlKey
        const isShiftKey = e.shiftKey === true
        const key = e.key.toLowerCase()

        isSpecialKey && !isShiftKey && key === 'z' && this.undo()
        isSpecialKey && isShiftKey && key === 'z' && this.redo()
    }

}

export default UndoRedoManager;