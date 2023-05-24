import Konva from "konva";
import { ShapeNode, ShapeNodeAttrs } from './ShapeNode';

export class PenNodeAttrs extends ShapeNodeAttrs {
    points = { "value": [], "default": [], "group": "geometry", "type": "Array" };
    tension = { "value": 0, "default": 0, "group": "geometry", "type": "Number", "min": 0, "max": 1 };
    closed = { "value": false, "default": false, "group": "geometry", "type": "Boolean" };
    bezier = { "value": false, "default": false, "group": "geometry", "type": "Boolean" };
}

export class PenNode extends ShapeNode {

    static className = 'PenNode';
    className = 'PenNode';
    attributes = new PenNodeAttrs();

    constructor(opt?: any) {
        super();
        if (opt) this.fromObject(opt);
    }

    createRef() {
        let konvaNode = new Konva.Line();
        konvaNode.id(this.id);
        this.ref = konvaNode;
    }

}
