import Konva from "konva";
import { DRAWING_MOUSE_DOWN, DRAWING_MOUSE_MOVE, DRAWING_MOUSE_OUT, DRAWING_MOUSE_UP, REGULAR_MODE } from "../constants/TemcConstants";
import { PenNode } from "../model/PenNode";
import AbstractShape from "./AbstractShape";

class PenShape extends AbstractShape {

    firstPoint: any;
    tempLine: any;

    constructor() {
        super();
        this.handleTagName = 'pen';
    }

    notifyDrawingAction(graphEditor: any, point: any, type: number, btn: number) {
        switch (type) {
            case DRAWING_MOUSE_DOWN:
                if (btn === 0) {
                    this.firstPoint = point;
                    this.tempLine = new Konva.Line({
                        x: 0,
                        y: 0,
                        points: [this.firstPoint.x, this.firstPoint.y],
                        strokeWidth: 2,
                        stroke: '#ff0000'
                    })
                    graphEditor.getHelpLayer().add(this.tempLine);
                } else {
                    if (this.firstPoint) {
                        let node = this.createElement(this.tempLine.points(), graphEditor);
                        this.tempLine.destroy();
                        if (node) {
                            this.insertShapeElement(graphEditor.getDataModel(), node);
                        }

                    }
                    if (this.tempLine) {
                        this.tempLine.destroy();
                        this.tempLine = null;
                    }
                    this.firstPoint = null;
                }

                break;
            case DRAWING_MOUSE_MOVE:
                if (this.firstPoint && this.tempLine) {
                    let points = this.tempLine.points();
                    points.push(point.x);
                    points.push(point.y);
                    this.tempLine.setAttrs({
                        points: points,
                    })
                }
                break;
            case DRAWING_MOUSE_UP:

                if (this.firstPoint && this.tempLine) {
                    let node = this.createElement(this.tempLine.points(), graphEditor);
                    this.tempLine.destroy();
                    if (node) {
                        this.insertShapeElement(graphEditor.getDataModel(), node);
                    }
                }
                if (this.tempLine) {
                    this.tempLine.destroy();
                    this.tempLine = null;
                }
                this.firstPoint = null;
                break;
            case DRAWING_MOUSE_OUT:
                //销毁对象
                if(this.tempLine){
                    this.tempLine.destroy();
                    this.tempLine = null;
                }
              
                break;
        }
    }

    createElement(points: any, graphEditor: any) {
        if (points.length == 2)
            return
        let polyline = new PenNode();
        let style = Object.assign({ points }, graphEditor.getConfig().style);
        polyline.setAttributeValues({ ...style });
        return polyline;
    }

}

export default PenShape;