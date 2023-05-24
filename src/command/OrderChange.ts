

import EVENT_TYPE from "../constants/EventType";
import { MOVE_STYLE } from "../constants/StyleMap";

import Utils from "../Utils";
import EventObject from "../EventObject";
class OrderChange {
    previousValue: any;
    selectNode: any;
    dataModel: any;
    konvaNode: any;
    newIndex: number;
    oldIndex: number;
    direction: string;
    constructor(selectNode: any,  direction: string, dataModel: any) {

        this.selectNode = selectNode;
        this.dataModel = dataModel;
        this.konvaNode = this.selectNode.getRef();
        this.direction = direction;
        switch (this.direction) {
            case 'up':
                this.konvaNode.moveUp();
                break;
            case 'down':
                this.konvaNode.moveDown();
                break;
            case 'top':
                this.konvaNode.moveToTop();
                break;
            case 'bottom':
                this.konvaNode.moveToBottom();
                break;
        }
        this.newIndex = this.konvaNode.zIndex();
        this.oldIndex = this.dataModel.nodes.indexOf(selectNode);
    }

    execute() {
        Utils.moveItemInArray(this.dataModel.nodes,this.oldIndex,this.newIndex);
        this.selectNode.getRef().zIndex(this.newIndex);
      
    }

    undo() {
        Utils.moveItemInArray(this.dataModel.nodes,this.newIndex,this.oldIndex);
        this.selectNode.getRef().zIndex(this.oldIndex);
    }

}

export default OrderChange;