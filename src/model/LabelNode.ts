
import Konva from 'konva';
import { ShapeNode, ShapeNodeAttrs } from './ShapeNode';

export class LabelNodeAttrs extends ShapeNodeAttrs {
    textFill = { "value": "", "default": "", "group": "fill", "type": "String" };
    fontFamily = { "value": "Arial", "default": "Arial", "group": "font", "type": "String", enums: ["宋体", "Arial", "Calibri"] };
    fontSize = { "value": 12, "default": 12, "group": "font", "type": "Number" };
    fontStyle = { "value": "normal", "default": "normal", "group": "font", "type": "String", enums: ["normal", "bold", "italic", "bold italic"] };
    fontVariant = { "value": "normal", "default": "normal", "group": "font", "type": "String", enums: ["normal", "small-caps"] };
    textDecoration = { "value": "", "default": "", "group": "font", "type": "String", enums: ["", "underline", "line-through", "underline line-through"] };
    text = { "value": "", "default": "", "group": "text", "type": "String" };
    pointerDirection = { "value": "", "default": "", "group": "other", "type": "String", enums: ["up", "down", "left", "right"] };
    pointerWidth = { "value": 0, "default": 0, "group": "other", "type": "Number" };
    pointerHeight = { "value": 0, "default": 0, "group": "other", "type": "Number" };
    cornerRadius = { "value": 0, "default": 0, "group": "other", "type": "Number" };
    padding = { "value": 0, "default": 0, "group": "geometry", "type": "Number" };
}


export class LabelNode extends ShapeNode {

    static className = 'LabelNode';
    className = 'LabelNode';
    attributes = new LabelNodeAttrs();
    textAttributes = ['text', 'fontFamily', 'fontSize', 'padding', 'textFill', 'textDecoration', 'fontStyle'];
    labelAttributes = ['x', 'y', 'rotation', 'scaleX', 'scaleY', 'skewX', 'skewY', 'draggable'];

    constructor(opt?: any) {
        super();
        if (opt) this.fromObject(opt);
    }

    updateRefAttrs(attrValues: any) {
        if (this.ref !== null) {
            for (let name in attrValues) {
                let attrValue = attrValues[name];
                if (this.labelAttributes.includes(name)) {
                    this.ref.setAttr(name, attrValue);
                } else if (this.textAttributes.includes(name)) {
                    this.ref.getText().setAttr(name === 'textFill' ? 'fill' : name, attrValue);
                } else {
                    this.ref.getTag().setAttr(name, attrValue);
                }
            }
        }
    }

    createRef() {
        let konvaNode = new Konva.Label();
        konvaNode.add(new Konva.Tag({}));
        konvaNode.add(new Konva.Text({}));
        konvaNode.id(this.id);
        this.ref = konvaNode;
    }

}

