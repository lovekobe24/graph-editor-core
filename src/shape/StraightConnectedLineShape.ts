import Konva from 'konva';
import { DRAWING_MOUSE_DOWN, DRAWING_MOUSE_MOVE, DRAWING_MOUSE_UP } from '../constants/TemcConstants';
import { LineNode } from '../model/LineNode';
import BaseLineShape from './BaseLineShape';

import AbstractShape from './AbstractShape';
import BaseConnectedLineShape from './BaseConnectedLineShape';
import { StraightConnectedLineNode } from '../model/StraightConnectedLineNode';

class StraightConnectedLineShape extends BaseConnectedLineShape {
    firstPoint: any;
    tempLine: any;
    createElement(firstPoint: any, point: any, graphEditor: any) {
        throw new Error('Method not implemented.');
    }

    constructor() {
        super();
        this.handleTagName = 'straightConnectedLine';
    }
    notifyDrawingAction(graphEditor: any, point: any, type: number) {
   
        let isSquare = graphEditor.getIsSquare();
        switch (type) {
            case DRAWING_MOUSE_DOWN:
                console.log('StraightConnectedLineShape notifyDrawingAction mousedonw')
                if(graphEditor.currentTarget!=null){
                    console.log(graphEditor.currentTarget)
                    this.firstPoint = point;
                    let fromPoint=this.getOriginPoint(graphEditor.currentTarget,point,graphEditor.stage.getAbsoluteTransform().copy());
                    let sourceId=graphEditor.currentTarget.attrs.id;
                    console.log(sourceId);
                    this.tempLine = new Konva.Line({
                        x: 0,
                        y: 0,
                        points: [this.firstPoint.x, this.firstPoint.y],
                        strokeWidth: 2,
                        stroke: '#ff0000',
                        
                    })
                    this.tempLine.from={
                        id:sourceId,
                        point:fromPoint
                    }
                    graphEditor.getDrawingLayer().add(this.tempLine);
                    let line = new Konva.Line({
                        x: 100,
                        y: 50,
                        points: [73, 70],
                        stroke: 'red',
                        tension: 1
                    });
                    graphEditor.getDrawingLayer().add(line);
                }
               
                break;
            case DRAWING_MOUSE_MOVE:
              
              
                if (this.firstPoint && this.tempLine) {
                    this.tempLine.setAttrs({
                        points: [this.firstPoint.x, this.firstPoint.y, point.x, point.y],
                    })
                }
                break;
            case DRAWING_MOUSE_UP:
                if (this.firstPoint && graphEditor.currentTarget) {
                    let toPoint=this.getOriginPoint(graphEditor.currentTarget,point,graphEditor.stage.getAbsoluteTransform().copy());
                    let disTargetId=graphEditor.currentTarget.attrs.id;
                    let node = this.createElementWithTarget(this.firstPoint, point, graphEditor,this.tempLine.from,{
                        id:disTargetId,
                        point:toPoint
                    });
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
    

    createElementWithTarget(firstPoint: any, point: any, graphEditor: any,fromInfo:any,toInfo:any) {
        if (firstPoint.x == point.x && firstPoint.y == point.y) {
            return
        }
        let lineNode: any = new StraightConnectedLineNode();
        let defaultStyleConfig = graphEditor.getConfig().style;

        let lineStyle = {
            'x': 0,
            'y': 0,
            'points': [firstPoint.x,firstPoint.y,point.x,point.y],
            'draggable':false
           
        };
        let style = {...defaultStyleConfig,...lineStyle};
        console.log(style);
        lineNode.setFrom(fromInfo);
        lineNode.setTo(toInfo);
        lineNode.setAttributeValues(style);
       
        return lineNode;


    }

  
}

export default StraightConnectedLineShape;


