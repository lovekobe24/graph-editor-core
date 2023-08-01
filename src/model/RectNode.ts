
import Konva from 'konva';
import { ShapeNode, ShapeNodeAttrs } from './ShapeNode';

export class RectNodeAttrs extends ShapeNodeAttrs {
}

export class RectNode extends ShapeNode {
    static className: string='RectNode';
    attributes = new RectNodeAttrs();
    className:string='RectNode';
    constructor(opt?: any) {
        super();
        if (opt) this.fromObject(opt);
    }

    createRef() {
        let konvaNode = new Konva.Rect();
        konvaNode.id(this.id);
        this.ref = konvaNode;
    }
}



