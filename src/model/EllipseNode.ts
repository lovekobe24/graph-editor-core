
import Konva from 'konva';
import { ShapeNode, ShapeNodeAttrs } from './ShapeNode';

export class EllipseNodeAttrs extends ShapeNodeAttrs {
    radiusX = { "value": 0, "default": 0, "group": "geometry", "type": "Number" };
    radiusY = { "value": 0, "default": 0, "group": "geometry", "type": "Number" };
}

export class EllipseNode extends ShapeNode {

    static className = 'EllipseNode';
    className = 'EllipseNode';
    attributes = new EllipseNodeAttrs();

    constructor(opt?: any) {
        super();
        if (opt) this.fromObject(opt);
    }

    createRef() {
        let konvaNode = new Konva.Ellipse();
        konvaNode.id(this.id);
        this.ref = konvaNode;
    }

}
