
import Konva from 'konva';
import { ShapeNode, ShapeNodeAttrs } from './ShapeNode';

export class ArcNodeAttrs extends ShapeNodeAttrs {
    angle = { "value": 0, "default": 0, "group": "geometry", "type": "Number" };
    innerRadius = { "value": 0, "default": 0, "group": "geometry", "type": "Number" };
    outerRadius = { "value": 0, "default": 0, "group": "geometry", "type": "Number" };
    clockwise = { "value": false, "default": false, "group": "geometry", "type": "Boolean" };
}

export class ArcNode extends ShapeNode {

    static className = 'ArcNode';
    className:string='ArcNode';
    attributes = new ArcNodeAttrs();

    constructor(opt?: any) {
        super();
      
        if (opt) this.fromObject(opt);
    }

    createRef() {
        let konvaNode = new Konva.Arc();
        konvaNode.id(this.id);
        this.ref = konvaNode;
    }

}

