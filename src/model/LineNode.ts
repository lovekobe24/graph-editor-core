
import Konva from 'konva';
import { EditableShapeNode, EditableShapeNodeAttrs } from './EditableShapeNode';
import Command from '../command/Command';
import AttributeChange from '../command/AttributeChange';
import { Utils } from '../Utils';

export class LineNodeAttrs extends EditableShapeNodeAttrs {
    x1 = { "value": null, "default": null, "group": "geometry", "type": "Number" };
    y1 = { "value": null, "default": null, "group": "geometry", "type": "Number" };
    x2 = { "value": null, "default": null, "group": "geometry", "type": "Number" };
    y2 = { "value": null, "default": null, "group": "geometry", "type": "Number" };
}

export class LineNode extends EditableShapeNode {

    static className = 'LineNode';
    className = 'LineNode';
    attributes: any = new LineNodeAttrs();

    constructor(opt?: any) {
        super();
        if (opt) this.fromObject(opt);
    }
    updateRefAttrs(attrValues: any) {
        if (this.ref !== null) {

            let { x1, y1, x2, y2, ...otherAttrValues } = attrValues;
            if (x1 !== undefined || y1 !== undefined || x2 !== undefined || y2 !== undefined) {

                let points = this.ref.points().slice();
                if (x1 !== undefined) points[0] = x1;
                if (y1 !== undefined) points[1] = y1;
                if (x2 !== undefined) points[2] = x2;
                if (y2 !== undefined) points[3] = y2;
                otherAttrValues['points'] = points;
            }
            super.updateRefAttrs(otherAttrValues);
        }
    }

    createRef() {
        let konvaNode = new Konva.Line();
        konvaNode.id(this.id);
        this.ref = konvaNode;
    }

    createRefAnchors(opt?: any) {
        super.createRefAnchors();
        let transformIn = this.ref.getTransform();
        let transformOut = transformIn.copy().invert();
        let strokeWidth = this.attributes['strokeWidth'].value;
        let radius = this.getAnchorRadius(strokeWidth);
        let fillColor = opt ? opt.anchorFill : '#0000ff';
        let anchorStrokeColor = opt ? opt.anchorStroke : '#0000ff';
        let x1 = this.attributes['x1'];
        let y1 = this.attributes['y1'];
        let x2 = this.attributes['x2'];
        let y2 = this.attributes['y2'];

        let pointA = transformIn.point({ x: x1.value, y: y1.value });
        let anchorA = new Konva.Circle({
            x: pointA.x,
            y: pointA.y,
            radius: radius,
            hitStrokeWidth: radius + 8,
            stroke: anchorStrokeColor,
            fill: fillColor,
            draggable: true
        });

        let oldX1: any, oldY1: any;
        anchorA.on('dragstart', (e: any) => {
            e.cancelBubble = true;
            oldX1 = x1.value;
            oldY1 = y1.value;
        });
        anchorA.on('dragmove', () => {
            let point = transformOut.point({ x: anchorA.x(), y: anchorA.y() });
            x1.value = point.x;
            y1.value = point.y;
            this.ref.points([x1.value, y1.value, x2.value, y2.value]);
        });
        anchorA.on('dragend', (e: any) => {
            e.cancelBubble = true;
            let undoRedoManager = this.dataModel.getUndoRedoManager();
            let map = new Map([[this, [{ x1: oldX1, y1: oldY1 }, { x1: x1.value, y1: y1.value }]]]);
            let attributeChange = new AttributeChange(map, this.dataModel);
            let cmd = new Command([attributeChange]);
            undoRedoManager.record(cmd);
        });

        let pointB = transformIn.point({ x: x2.value, y: y2.value });
        let anchorB = new Konva.Circle({
            x: pointB.x,
            y: pointB.y,
            radius: radius,
            stroke: anchorStrokeColor,
            hitStrokeWidth: radius + 8,
            fill: fillColor,
            draggable: true
        });

        let oldX2: any, oldY2: any;
        anchorB.on('dragstart', (e: any) => {
            e.cancelBubble = true;
            oldX2 = x2.value;
            oldY2 = y2.value;
        });
        anchorB.on('dragmove', () => {
            let point = transformOut.point({ x: anchorB.x(), y: anchorB.y() });
            x2.value = point.x;
            y2.value = point.y;
            this.ref.points([x1.value, y1.value, x2.value, y2.value]);
        });
        anchorB.on('dragend', (e: any) => {
            e.cancelBubble = true;
            let undoRedoManager = this.dataModel.getUndoRedoManager();
            let map = new Map([[this, [{ x2: oldX2, y2: oldY2 }, { x2: x2.value, y2: y2.value }]]]);
            let attributeChange = new AttributeChange(map, this.dataModel);
            let cmd = new Command([attributeChange]);
            undoRedoManager.record(cmd);
        });

        this.refAnchors = [anchorA, anchorB];

    }

    updateRefAnchors(attrValues: any) {
        if (this.refAnchors !== null) {
            let { x1, y1, x2, y2 } = attrValues;
            if (x1 !== undefined || y1 !== undefined || x2 !== undefined || y2 !== undefined) {
                let transformIn = this.ref.getTransform();
                if (x1 !== undefined || y1 !== undefined) {
                    if (x1 === undefined) x1 = this.attributes['x1'].value;
                    if (y1 === undefined) y1 = this.attributes['y1'].value;
                    let anchorA = this.refAnchors[0];
                    let pointA = transformIn.point({ x: x1, y: y1 });
                    anchorA.setAttrs({ x: pointA.x, y: pointA.y });
                }
                if (x2 !== undefined || y2 !== undefined) {
                    if (x2 === undefined) x2 = this.attributes['x2'].value;
                    if (y2 === undefined) y2 = this.attributes['y2'].value;
                    let anchorB = this.refAnchors[1];
                    let pointB = transformIn.point({ x: x2, y: y2 });
                    anchorB.setAttrs({ x: pointB.x, y: pointB.y });
                }
            }
        }
    }

}
