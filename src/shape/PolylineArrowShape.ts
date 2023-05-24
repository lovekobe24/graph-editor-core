
import BasePolylineShape from './BasePolylineShape';
import { PolylineArrowNode } from './../model/PolylineArrowNode';

class PolylineArrowShape extends BasePolylineShape {

    constructor() {
        super();
        this.handleTagName = 'polylineArrow';
    }

    createElement(points: any, graphEditor: any) {
        let polyline = new PolylineArrowNode();
        let style = Object.assign({ points, 'fill': graphEditor.getConfig().style.stroke }, graphEditor.getConfig().style);
        polyline.setAttributeValues({ ...style, hitStrokeWidth: style.strokeWidth * 2 + 8 });
        return polyline;
    }

}

export default PolylineArrowShape;