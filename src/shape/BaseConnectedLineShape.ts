import Konva from 'konva';
import { DRAWING_MOUSE_DOWN, DRAWING_MOUSE_MOVE, DRAWING_MOUSE_UP } from '../constants/TemcConstants';
import { LineNode } from '../model/LineNode';
import BaseLineShape from './BaseLineShape';
import { ConnectedLineNode } from '../model/ConnectedLineNode';
import AbstractShape from './AbstractShape';

class BaseConnectedLineShape extends AbstractShape {
    createElement(firstPoint: any, point: any, graphEditor: any) {
        throw new Error('Method not implemented.');
    }

    constructor() {
        super();
    }
  
    getOriginPoint(konvaNode:any,point:any){
        let nodeTf=konvaNode.getTransform().invert();
        return nodeTf.point(point);

    }

    

}

export default BaseConnectedLineShape;


