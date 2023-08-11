import Konva from 'konva';
import { DRAWING_MOUSE_DOWN, DRAWING_MOUSE_MOVE, DRAWING_MOUSE_UP } from '../constants/TemcConstants';
import { LineNode } from '../model/LineNode';
import BaseLineShape from './BaseLineShape';
import AbstractShape from './AbstractShape';

class BaseConnectedLineShape extends AbstractShape {
    createElement(firstPoint: any, point: any, graphEditor: any) {
        throw new Error('Method not implemented.');
    }

    constructor() {
        super();
    }
  
    getOriginPoint(konvaNode:any,point:any,stageTf:Konva.Transform){
        console.log(konvaNode.getAbsoluteTransform());
        let tfWithoutStage=konvaNode.getAbsoluteTransform().copy().multiply(stageTf.invert());
      
        console.log(tfWithoutStage);
        let nodeTf=tfWithoutStage.invert();
        return nodeTf.point(point);

    }

    

}

export default BaseConnectedLineShape;


