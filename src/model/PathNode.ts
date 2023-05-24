
import Konva from 'konva';
import { ShapeNode, ShapeNodeAttrs } from './ShapeNode';

export class PathNodeAttrs extends ShapeNodeAttrs {
    data = { "value": "", "default": "", "group": "hidden", "type": "String" };
}

export class PathNode extends ShapeNode {

    static className = 'PathNode';
    className = 'PathNode';
    attributes = new PathNodeAttrs();

    constructor(opt?: any) {
        super();
        if (opt) this.fromObject(opt);
    }

    createRef() {
        let konvaNode = new Konva.Path();
        konvaNode.id(this.id);
        this.ref = konvaNode;
    }

}
