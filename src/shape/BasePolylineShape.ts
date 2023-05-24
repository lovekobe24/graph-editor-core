import Konva from 'konva';
import AbstractShape from "./AbstractShape";
import AttributeChange from '../command/AttributeChange';
import Command from "../command/Command";
import { DRAWING_MOUSE_DOWN, DRAWING_MOUSE_MOVE, DRAWING_MOUSE_UP, REGULAR_MODE } from '../constants/TemcConstants';
import { PolylineNode } from '../model/PolylineNode';

class BasePolylineShape extends AbstractShape {

    tempLine: any;

    constructor() {
        super();
    }

    createElement(points: any, graphEditor: any) {
        let polyline = new PolylineNode();
        let style = Object.assign({ points }, graphEditor.getConfig().style);
        polyline.setAttributeValues({ ...style, hitStrokeWidth: style.strokeWidth * 2 + 8 });
        return polyline;
    }

    notifyDrawingAction(graphEditor: any, point: any, type: number, btn: number) {
        switch (type) {
            case DRAWING_MOUSE_DOWN:
                if (btn === 0) {
                    if (this.tempLine) {
                        let points = this.tempLine.points();
                        points.push(point.x, point.y);
                        this.tempLine.points(points);
                    } else {
                        this.tempLine = new Konva.Line({
                            points: [point.x, point.y, point.x, point.y],
                            strokeWidth: 2,
                            stroke: '#ff0000'
                        });
                        graphEditor.getDrawingLayer().add(this.tempLine);
                    }
                } else if (btn === 2 && this.tempLine) {
                    let points = JSON.parse(JSON.stringify(this.tempLine.points()));
                    let polyline = this.createElement(points, graphEditor);
                    this.insertShapeElement(graphEditor.getDataModel(), polyline);
                    this.tempLine.destroy();
                    this.tempLine = null;
                 
                }
                break;
            case DRAWING_MOUSE_MOVE:
                if (this.tempLine) {
                    let points = this.tempLine.points();
                    points.pop();
                    points.pop();
                    points.push(point.x, point.y);
                    this.tempLine.points(points);
                }
                break;
            case DRAWING_MOUSE_UP:

                break;
        }
    }
}

export default BasePolylineShape;