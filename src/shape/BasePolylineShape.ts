import Konva from 'konva';
import AbstractShape from "./AbstractShape";
import AttributeChange from '../command/AttributeChange';
import Command from "../command/Command";
import { DRAWING_MOUSE_DBL_CLICK, DRAWING_MOUSE_CLICK, DRAWING_MOUSE_MOVE, DRAWING_MOUSE_UP, REGULAR_MODE,DRAWING_MOUSE_OUT } from '../constants/TemcConstants';
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
        let isSquare = graphEditor.getIsSquare();
        switch (type) {
            case DRAWING_MOUSE_CLICK:
           
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
                }else{
               
                    if (this.tempLine) {
                 
                        let points = this.tempLine.points();
                        if(points.length==2) return
                        let newPoints = JSON.parse(JSON.stringify(points));
                        let polyline = this.createElement(newPoints, graphEditor);
                        this.insertShapeElement(graphEditor.getDataModel(), polyline);
                        this.tempLine.destroy();
                        this.tempLine = null;
                    }
                }
                break;
            case DRAWING_MOUSE_DBL_CLICK:
                if (this.tempLine) {
                 
                    let points = this.tempLine.points();
                    points.pop();
                    points.pop();
                    points.pop();
                    points.pop();
                    if(points.length==2) return
                    let newPoints = JSON.parse(JSON.stringify(points));
                    let polyline = this.createElement(newPoints, graphEditor);
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
                    let len=points.length;
                    let previousPoint={x:points[len-2],y:points[len-1]};
                    if(isSquare){
                        point = this.reLocateLinePointWhenDrawing(previousPoint, point);
                    }
                    points.push(point.x, point.y);
                    this.tempLine.points(points);
                }
                break;
            case DRAWING_MOUSE_OUT:
                //销毁对象
                if(this.tempLine){
                    this.tempLine.destroy();
                    this.tempLine = null;
                }
              
                break;
            case DRAWING_MOUSE_UP:
                
                break;
        }
    }
    reLocateLinePointWhenDrawing(oldPoint:any,point:any){
      
        //获取斜率
        let k = (point.y - oldPoint.y)
                / (point.x - oldPoint.x);

        // 根据斜率来判断是什么样的直线
        if (k > -0.5 && k < 0.5) {
            console.log("水平直线")
              //水平的直线
            return {x:point.x,y:oldPoint.y};
        } else if (k > 10 || k < -10) {
            console.log("垂直直线")
            //垂直的直线
           return  {x:oldPoint.x, y:point.y};
        } else {
            //生成和坐标轴为45度角的直线
            if (k > 0) {
               return {x:point.x, y:point.x
                        - oldPoint.x
                        + oldPoint.y};
            } else {
                return {x:point.x, y:oldPoint.x
                        + oldPoint.y - point.x};
            }
        }
    
    }
}

export default BasePolylineShape;