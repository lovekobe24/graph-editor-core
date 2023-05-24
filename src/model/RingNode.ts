
import Konva from 'konva';
import { ShapeNode, ShapeNodeAttrs } from './ShapeNode';

export class RingNodeAttrs extends ShapeNodeAttrs {
    innerRadius = { "value": 0, "default": 0, "group": "geometry", "type": "Number" };
    outerRadius = { "value": 0, "default": 0, "group": "geometry", "type": "Number" };
}

export class RingNode extends ShapeNode {

    static className = 'RingNode';
    className = 'RingNode';
    attributes = new RingNodeAttrs();

    constructor(opt?: any) {
        super();
        if (opt) this.fromObject(opt);
    }

    createRef() {
        let konvaNode = new Konva.Ring();
        konvaNode.id(this.id);
        this.ref = konvaNode;
    }

}
