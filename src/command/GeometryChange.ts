import { ACTION_TO_STYLE_MAP } from "../constants/StyleMap";
import type { DataModel } from "../DataModel";
import type { Node } from '../model/Node';
import Change from "./Change";

class GeometryChange extends Change {

    attrValuesMap: Map<Node, Array<Object>>;
    dataModel: DataModel;

    constructor(nodes: Array<Node>, action: string, dataModel: any) {
        super();
        let map = new Map(), actionAttrKeys = ACTION_TO_STYLE_MAP[action];
        for (let node of nodes) {
            let konvaNode = node.getRef();
            let prevAllAttrs = node.getAttributeValues(), nextAllAttrs = konvaNode.attrs;
            let prevAttrs: any = {}, nextAttrs: any = {};
            for (let key of actionAttrKeys) {
                if(prevAllAttrs.hasOwnProperty(key)) prevAttrs[key] = prevAllAttrs[key];
                let nextAttrValue=nextAllAttrs.hasOwnProperty(key)?nextAllAttrs[key]: konvaNode.getAttr(key);
                if(nextAttrValue) nextAttrs[key] = nextAttrValue;
            }
            map.set(node, [prevAttrs, nextAttrs]);
        }
        this.attrValuesMap = map;
        this.dataModel = dataModel;
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

export default GeometryChange;