import Change from './Change'
import type { Node } from "../model/Node";
import type { DataModel } from '../DataModel';

class AttributeChange extends Change {

    attrValuesMap: Map<Node, Array<Object>>;
    dataModel: DataModel;

    constructor(attrValuesMap: Map<Node, Array<Object>> = new Map(), dataModel: DataModel) {
        super();
        this.dataModel = dataModel;
        this.attrValuesMap = attrValuesMap;
    }

    private apply(flag: boolean) {
        let map = new Map();
        for (let [node, attrValuesPairs] of this.attrValuesMap) {
            map.set(node, attrValuesPairs[flag ? 1 : 0]);
        }
        this.dataModel.setAttributeValues(map);
    }

    execute() {
        this.apply(true);
    }

    undo() {
        this.apply(false);
    }

}

export default AttributeChange;