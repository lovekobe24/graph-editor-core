
import Konva from 'konva';
import { ShapeNode, ShapeNodeAttrs } from './ShapeNode';

export class WedgeNodeAttrs extends ShapeNodeAttrs {
    angle = { "value": 0, "default": 0, "group": "geometry", "type": "Number" };
    radius = { "value": 0, "default": 0, "group": "geometry", "type": "Number" };
    clockwise = { "value": false, "default": false, "group": "geometry", "type": "Boolean" };
}

export class WedgeNode extends ShapeNode {

    static className = 'WedgeNode';
    className:string='WedgeNode';
    attributes = new WedgeNodeAttrs();

    constructor(opt?: any) {
        super();
        if (opt) this.fromObject(opt);
    }

    createRef() {
        let konvaNode = new Konva.Wedge();
        konvaNode.id(this.id);
        this.ref = konvaNode;
    }

}
