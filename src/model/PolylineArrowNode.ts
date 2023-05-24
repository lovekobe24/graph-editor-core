
import Konva from 'konva';
import { PolylineNode, PolylineNodeAttrs } from './PolylineNode';

export class PolylineArrowNodeAttrs extends PolylineNodeAttrs {
    pointerLength = { "value": 20, "default": 20, "group": "geometry", "type": "Number" };
    pointerWidth = { "value": 20, "default": 20, "group": "geometry", "type": "Number" };
    pointerAtBeginning = { "value": false, "default": false, "group": "geometry", "type": "Boolean" };
    pointerAtEnding = { "value": true, "default": true, "group": "geometry", "type": "Boolean" };
}

export class PolylineArrowNode extends PolylineNode {

    static className = 'PolylineArrowNode'
    className = 'PolylineArrowNode'
    attributes = new PolylineArrowNodeAttrs();

    constructor(opt?: any) {
        super();
        if (opt) this.fromObject(opt);
    }

    createRef() {
        let konvaNode = new Konva.Arrow();
        konvaNode.id(this.id);
        this.ref = konvaNode;
    }

}

