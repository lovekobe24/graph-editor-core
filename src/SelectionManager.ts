import type { DataModel } from "./DataModel";
import EVENT_TYPE from './constants/EventType';
import EventObject from './EventObject';
import { Util } from "konva/lib/Util";
import {Utils} from "./Utils";

export class SelectionManager {

    selectedNodes: any;
    dataModel: any;

    constructor(dataModel: DataModel) {
        this.selectedNodes = [];
        this.dataModel = dataModel;
    }

    /**
     * 根据节点的id，设置选中的数据模型中选中的节点
     * @param nodeIds 
     * @param fireEvent 
     */
    setSelection(nodeIds: any, notifyStage: boolean) {
        this.selectedNodes = this.dataModel.getNodes().filter((item: any) => {
            return nodeIds.includes(item.id)
        })
       
        this.dataModel.fireEvent(new EventObject(EVENT_TYPE.SELECT_CHANGE, 'nodes',Utils.getObjectNodes(this.selectedNodes)), null);
        if (notifyStage) {
            //改变stage中选中的节点元素
            this.dataModel.fireEvent(new EventObject(EVENT_TYPE.SELECTION_KONVA_NODE_CHANGE, 'nodes', this.selectedNodes), null);
        }
    }

    clearSelection() {
        this.selectedNodes = [];
    }

    getSelection() {
        return this.selectedNodes;
    }

}