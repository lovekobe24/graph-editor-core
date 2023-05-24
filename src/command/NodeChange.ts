import type { DataModel } from "../DataModel";

class NodeChange {
    operateNodes: any;
    action: string;
    dataModel: DataModel;
    nodeToIndex: any;

    constructor(nodes: any, action: string, dataModel: DataModel) {
        this.operateNodes = nodes;
        this.action = action;
        this.dataModel = dataModel;
        this.nodeToIndex = new Map();
        this.operateNodes.forEach((item: any) => {
            this.nodeToIndex.set(item, item.getZIndex());
        });
    }

    execute() {
        switch (this.action) {
            case 'add': this.dataModel.addNodes(this.operateNodes,this.nodeToIndex); break;
            case 'delete': this.dataModel.removeNodes(this.operateNodes); break;
        }
    }

    undo() {
        switch (this.action) {
            case 'add': this.dataModel.removeNodes(this.operateNodes); break;
            case 'delete': this.dataModel.addNodes(this.operateNodes,this.nodeToIndex); break;
        }
    }
}

export default NodeChange;