import Konva from 'konva';
import AbstractShape from "./AbstractShape";
import { DRAWING_MOUSE_DOWN, DRAWING_MOUSE_MOVE, DRAWING_MOUSE_UP, REGULAR_MODE } from './../constants/TemcConstants';
import { PolylineNode } from './../model/PolylineNode';
import BasePolylineShape from './BasePolylineShape';

class PolylineShape extends BasePolylineShape {

    constructor() {
        super();
        this.handleTagName = 'polyline';
    }

    createElement(points: any, graphEditor: any) {
        let polyline = new PolylineNode();
        let style = Object.assign({ points }, graphEditor.getConfig().style);
        polyline.setAttributeValues({ ...style, hitStrokeWidth: style.strokeWidth * 2 + 8 });
        return polyline;
    }
}

export default PolylineShape;