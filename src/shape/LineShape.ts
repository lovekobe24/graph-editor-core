import { LineNode } from './../model/LineNode';
import BaseLineShape from './BaseLineShape';

class LineShape extends BaseLineShape {

    constructor() {
        super();
        this.handleTagName = 'line';
    }

    createElement(firstPoint: any, point: any, graphEditor: any) {
        if (firstPoint.x == point.x && firstPoint.y == point.y) {
            return
        }
        let lineNode: any = new LineNode();
        let defaultStyleConfig = graphEditor.getConfig().style;

        let lineStyle = {
            'x': 0,
            'y': 0,
            'x1': firstPoint.x,
            'y1': firstPoint.y,
            'x2': point.x,
            'y2': point.y
        };
        let style = { ...lineStyle, ...defaultStyleConfig };
        lineNode.setAttributeValues(style);
        return lineNode;


    }

}

export default LineShape;