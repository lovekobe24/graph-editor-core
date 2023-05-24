
import Konva from 'konva';
import { ShapeNode, ShapeNodeAttrs } from './ShapeNode';
import Command from "../command/Command";
import AttributeChange from '../command/AttributeChange';

export class TextNodeAttrs extends ShapeNodeAttrs {
    align = { "value": "left", "default": "left", "group": "geometry", "type": "String", enums: ["left", "center", "right"] };
    verticalAlign = { "value": "top", "default": "top", "group": "geometry", "type": "String", enums: ["top", "middle", "bottom"] };
    padding = { "value": 0, "default": 0, "group": "geometry", "type": "Number" };
    lineHeight = { "value": 1, "default": 1, "group": "geometry", "type": "Number" };
    wrap = { "value": "word", "default": "word", "group": "geometry", "type": "String", enums: ["word", "char", "none"] };
    ellipsis = { "value": false, "default": false, "group": "geometry", "type": "Boolean" };
    fontFamily = { "value": "Arial", "default": "Arial", "group": "font", "type": "String", enums: ["宋体", "Arial", "Calibri"] };
    fontSize = { "value": 12, "default": 12, "group": "font", "type": "Number" };
    fontStyle = { "value": "normal", "default": "normal", "group": "font", "type": "String", enums: ["normal", "bold", "italic", "bold italic"] };
    fontVariant = { "value": "normal", "default": "normal", "group": "font", "type": "String", enums: ["normal", "small-caps"] };
    textDecoration = { "value": "", "default": "", "group": "font", "type": "String", enums: ["", "underline", "line-through", "underline line-through"] };
    text = { "value": "", "default": "", "group": "text", "type": "String" };
}

export class TextNode extends ShapeNode {

    static className = 'TextNode';
    className = 'TextNode';
    attributes = new TextNodeAttrs();

    constructor(opt?: any) {
        super();
        if (opt) this.fromObject(opt);
    }

    createRef() {
        let konvaNode = new Konva.Text();
        konvaNode.id(this.id);
        this.ref = konvaNode;
    }

}
