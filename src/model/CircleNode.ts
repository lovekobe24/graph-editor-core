
import Konva from 'konva';
import { ShapeNode, ShapeNodeAttrs } from './ShapeNode';

export class CircleNodeAttrs extends ShapeNodeAttrs {
    radius = { "value": 0, "default": 0, "group": "geometry", "type": "Number" };
}

export class CircleNode extends ShapeNode {

    static className = 'CircleNode';
    className = 'CircleNode';
    attributes = new CircleNodeAttrs();

    constructor(opt?: any) {
        super();
        if (opt) this.fromObject(opt);
    }

    createRef() {
        let konvaNode = new Konva.Circle();
        konvaNode.id(this.id);
        this.ref = konvaNode;
    }

}
