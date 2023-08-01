import Konva from 'konva';
import AbstractShape from "./AbstractShape";
import { DRAWING_MOUSE_DOWN, DRAWING_MOUSE_MOVE, DRAWING_MOUSE_UP, REGULAR_MODE } from '../constants/TemcConstants';

abstract class BaseLineShape extends AbstractShape {

    firstPoint: any;
    tempLine: any;

    constructor() {
        super();
    }

    notifyDrawingAction(graphEditor: any, point: any, type: number) {
        let isSquare = graphEditor.getIsSquare();
        switch (type) {
            case DRAWING_MOUSE_DOWN:
                this.firstPoint = point;
                this.tempLine = new Konva.Line({
                    x: 0,
                    y: 0,
                    points: [this.firstPoint.x, this.firstPoint.y],
                    strokeWidth: 2,
                    stroke: '#ff0000'
                })
                graphEditor.getDrawingLayer().add(this.tempLine);
                let line = new Konva.Line({
                    x: 100,
                    y: 50,
                    points: [73, 70],
                    stroke: 'red',
                    tension: 1
                });
                graphEditor.getDrawingLayer().add(line);
                break;
            case DRAWING_MOUSE_MOVE:
                if (this.firstPoint) {
                    if (isSquare) {
                        point = this.relocationPoint(this.firstPoint, point);
                    }
                    this.tempLine.setAttrs({
                        points: [this.firstPoint.x, this.firstPoint.y, point.x, point.y],
                    })
                }
                break;
            case DRAWING_MOUSE_UP:
                if (this.firstPoint) {
                    if (isSquare) {
                        point = this.relocationPoint(this.firstPoint, point);
                    }
                    let node = this.createElement(this.firstPoint, point, graphEditor);
                    this.tempLine.destroy();
                    if(node){
                        this.insertShapeElement(graphEditor.getDataModel(), node);
                    }
                   
                }
                if (this.tempLine) {
                    this.tempLine.destroy();
                }
                break;
        }

    }

    abstract createElement(firstPoint: any, point: any, graphEditor: any):any;

    relocationPoint(firstPoint: any, currentPoint: any) {
        let returnPoint = currentPoint;
        //获取斜率
        let k = (currentPoint.y - firstPoint.y) / (currentPoint.x - firstPoint.x);
        // 根据斜率来判断是什么样的直线
        if (k > -0.5 && k < 0.5) {
            //水平的直线
            returnPoint.x = currentPoint.x;
            returnPoint.y = firstPoint.y;
        } else if (k > 10 || k < -10) {
            //垂直的直线
            returnPoint.x = firstPoint.x;
            returnPoint.y = currentPoint.y;
        } else {
            //生成和坐标轴为45度角的直线
            if (k > 0) {
                returnPoint.x = currentPoint.x;
                returnPoint.y = currentPoint.x - firstPoint.x + firstPoint.y;
            } else {
                returnPoint.x = currentPoint.x;
                returnPoint.y = firstPoint.x + firstPoint.y - currentPoint.x;
            }
        }
        return returnPoint;
    }

}

export default BaseLineShape;