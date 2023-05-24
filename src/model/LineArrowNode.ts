
import Konva from 'konva';
import { LineNode, LineNodeAttrs } from './LineNode';

export class LineArrowNodeAttrs extends LineNodeAttrs {
    pointerLength = { "value": 20, "default": 20, "group": "geometry", "type": "Number" };
    pointerWidth = { "value": 20, "default": 20, "group": "geometry", "type": "Number" };
    pointerAtBeginning = { "value": false, "default": false, "group": "geometry", "type": "Boolean" };
    pointerAtEnding = { "value": true, "default": true, "group": "geometry", "type": "Boolean" };
}

export class LineArrowNode extends LineNode {

    static className = 'LineArrowNode';
    className = 'LineArrowNode';
    attributes = new LineArrowNodeAttrs();

    constructor(opt?: any) {
        super();
        if (opt) this.fromObject(opt);
    }

    createRef() {
        let konvaNode = new Konva.Arrow();
        konvaNode.id(this.id);
        this.ref = konvaNode;
    }
}

