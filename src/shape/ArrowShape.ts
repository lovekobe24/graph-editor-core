
import BaseLineShape from './BaseLineShape';
import { LineArrowNode } from './../model/LineArrowNode';

class ArrowShape extends BaseLineShape {

    constructor() {
        super();
        this.handleTagName = 'lineArrow';
    }

    createElement(firstPoint: any, point: any, graphEditor: any) {
        let lineArrowNode: any = new LineArrowNode();
        let defaultStyleConfig = graphEditor.getConfig().style;
        let lineStyle = {
            'x': 0,
            'y': 0,
            'x1': firstPoint.x,
            'y1': firstPoint.y,
            'x2': point.x,
            'y2': point.y,
            'fill': defaultStyleConfig.stroke
        };
        let style = { ...lineStyle, ...defaultStyleConfig };
        lineArrowNode.setAttributeValues(style);
        return lineArrowNode;
    }

}

export default ArrowShape;