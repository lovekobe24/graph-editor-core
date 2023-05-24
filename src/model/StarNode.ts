
import Konva from 'konva';
import { ShapeNode, ShapeNodeAttrs } from './ShapeNode';

export class StarNodeAttrs extends ShapeNodeAttrs {
    numPoints = { "value": 0, "default": 0, "group": "geometry", "type": "Int" };
    innerRadius = { "value": 0, "default": 0, "group": "geometry", "type": "Number" };
    outerRadius = { "value": 0, "default": 0, "group": "geometry", "type": "Number" };
}

export class StarNode extends ShapeNode {

    static className = 'StarNode';
    className = 'StarNode';
    attributes = new StarNodeAttrs();

    constructor(opt?: any) {
        super();
        if (opt) this.fromObject(opt);
    }

    createRef() {
        let konvaNode = new Konva.Star();
        konvaNode.id(this.id);
        this.ref = konvaNode;
    }
}
