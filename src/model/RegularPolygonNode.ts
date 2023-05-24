
import Konva from 'konva';
import { ShapeNode, ShapeNodeAttrs } from './ShapeNode';

export class RegularPolygonNodeAttrs extends ShapeNodeAttrs {
    sides = { "value": 0, "default": 0, "group": "geometry", "type": "Number" };
    radius = { "value": 0, "default": 0, "group": "geometry", "type": "Number" };
}

export class RegularPolygonNode extends ShapeNode {

    static className = 'RegularPolygonNode';
    className = 'RegularPolygonNode';
    attributes = new RegularPolygonNodeAttrs();

    constructor(opt?: any) {
        super();
        if (opt) this.fromObject(opt);
    }

    createRef() {
        let konvaNode = new Konva.RegularPolygon();
        konvaNode.id(this.id);
        this.ref = konvaNode;
    }

}
