
import Konva from 'konva';
import { EditableShapeNode, EditableShapeNodeAttrs } from './EditableShapeNode';
import Command from '../command/Command';
import AttributeChange from '../command/AttributeChange';

export class PolylineNodeAttrs extends EditableShapeNodeAttrs {
    points = { "value": [], "default": [], "group": "geometry", "type": "Array" };
    tension = { "value": 0, "default": 0, "group": "geometry", "type": "Number", "min": 0, "max": 1 };
    closed = { "value": false, "default": false, "group": "geometry", "type": "Boolean" };
    bezier = { "value": false, "default": false, "group": "geometry", "type": "Boolean" };
}

export class PolylineNode extends EditableShapeNode {

    static className = 'PolylineNode';
    className = 'PolylineNode';
    attributes = new PolylineNodeAttrs();

    constructor(opt?: any) {
        super();
        if (opt) this.fromObject(opt);
    }

    createRef() {
        let konvaNode = new Konva.Line();
        konvaNode.id(this.id);
        this.ref = konvaNode;
    }

    createRefAnchors(opt?:any) {
        super.createRefAnchors();
        if (this.refAnchors === null) {
            let anchors: Array<Konva.Circle> = [];
            let transformIn = this.ref.getTransform();
            let transformOut = transformIn.copy().invert();
            let strokeWidth = this.attributes['strokeWidth'].value;
            let radius=this.getAnchorRadius(strokeWidth);
            let fillColor=opt?opt.anchorFill:'#0000ff';
            let anchorStrokeColor=opt?opt.anchorStroke:'#0000ff';
            let coords = this.attributes['points'].value as Array<number>;
            for (let i = 1, len = coords.length; i < len; i += 2) {
                let point = transformIn.point({ x: coords[i - 1], y: coords[i] });
                let anchor = new Konva.Circle({
                    x: point.x,
                    y: point.y,
                    radius: radius,
                    hitStrokeWidth: strokeWidth * 2 + 8,
                    stroke:anchorStrokeColor,
                    fill: fillColor,
                    draggable: true,
                    shapeType: 'anchor'
                });
                let oldCoords: any;
                anchor.on('dragstart', (e: any) => {
                    e.cancelBubble = true;
                    oldCoords = coords.slice();
                });
                anchor.on('dragmove', () => {
                    let point = transformOut.point({ x: anchor.x(), y: anchor.y() });
                    coords[i - 1] = point.x;
                    coords[i] = point.y;
                    this.ref.points(coords);
                });
                anchor.on('dragend', (e: any) => {
                    e.cancelBubble = true;
                    let newCoords: any = coords.slice();
                    let undoRedoManager = this.dataModel.getUndoRedoManager();
                    let map = new Map([[this, [{ points: oldCoords }, { points: newCoords }]]]);
                    let attributeChange = new AttributeChange(map, this.dataModel);
                    let cmd = new Command([attributeChange]);
                    undoRedoManager.record(cmd);
                });
                anchors.push(anchor);
            }
            this.refAnchors = anchors;
        }
    }

    updateRefAnchors(attrValues: any) {
        if (this.refAnchors !== null) {
            if (attrValues.hasOwnProperty('points')) {
                let transformIn = this.ref.getTransform();
                let coords = attrValues['points'] as Array<number>;
                let anchors = this.refAnchors;
                for (let i = 0, len = anchors.length; i < len; i++) {
                    let point = transformIn.point({ x: coords[i * 2], y: coords[i * 2 + 1] });
                    anchors[i].setAttrs({ x: point.x, y: point.y });
                }
            }
        }
    }

}
