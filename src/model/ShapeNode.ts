import { Node, NodeAttrs } from './Node';

export abstract class ShapeNodeAttrs extends NodeAttrs {
    stroke = { "value": "#000", "default": "#000", "group": "stroke", "type": "String" };
    strokeWidth = { "value": 1, "default": 1, "group": "stroke", "type": "Number" };
    lineJoin = { "value": "miter", "default": "miter", "group": "stroke", "type": "String", enums: ["miter", "round", "bevel"] };
    lineCap = { "value": "butt", "default": "butt", "group": "stroke", "type": "String", enums: ["butt", "round", "square"] };
    dash = { "value": [], "default": [], "group": "stroke", "type": "Array", enums: [[2, 2], [5, 5], [10, 10]] };
    shadowColor = { "value": "#ccc", "default": "#ccc", "group": "shadow", "type": "String" };
    shadowBlur = { "value": 0, "default": 0, "group": "shadow", "type": "Number" };
    shadowOffsetX = { "value": 0, "default": 0, "group": "shadow", "type": "Number" };
    shadowOffsetY = { "value": 0, "default": 0, "group": "shadow", "type": "Number" };
    shadowOpacity = { "value": 1, "default": 1, "group": "shadow", "type": "Number" };
    hitStrokeWidth = { "value": "auto", "default": "auto", "group": "hidden", "type": "Number" };
    strokeScaleEnabled = { "value": true, "default": true, "group": "hidden", "type": "Boolean" };
    fill = { "value": "", "default": "", "group": "fill", "type": "String" };
    fillGradient = { "value": "", "default": "", "group": "fill", "type": "String", enums: ['', 'linear', 'radial'] };
    fillLinearGradientStartPointX = { "value": 0, "default": 0, "group": "fill", "type": "Number" };
    fillLinearGradientStartPointY = { "value": 0, "default": 0, "group": "fill", "type": "Number" };
    fillLinearGradientEndPointX = { "value": 0, "default": 0, "group": "fill", "type": "Number" };
    fillLinearGradientEndPointY = { "value": 0, "default": 0, "group": "fill", "type": "Number" };
    fillLinearGradientColorStops = { "value": null, "default": null, "group": "fill", "type": "Array", enums: [[0, '#bdc3c7', 1, '#2c3e50'], [0, '#ee9ca7', 1, '#ffdde1'], [0, '#2193b0', 1, '#6dd5ed']] };
    fillRadialGradientStartRadius = { "value": 0, "default": 0, "group": "fill", "type": "Number" };
    fillRadialGradientEndRadius = { "value": 0, "default": 0, "group": "fill", "type": "Number" };
    fillRadialGradientColorStops = { "value": null, "default": null, "group": "fill", "type": "Array", enums: [[0, '#bdc3c7', 1, '#2c3e50'], [0, '#ee9ca7', 1, '#ffdde1'], [0, '#2193b0', 1, '#6dd5ed']] };
}

export abstract class ShapeNode extends Node {

    className = 'ShapeNode';

    updateRefAttrs(attrValues: any) {
        if (this.ref !== null) {
            if (attrValues.hasOwnProperty('fillGradient')) {
                let isRadial = attrValues['fillGradient'] === 'radial';
                let isLinear = attrValues['fillGradient'] === 'linear';
                let radialAttrNames = ['fillRadialGradientStartRadius', 'fillRadialGradientEndRadius', 'fillRadialGradientColorStops'];
                let linearAttrNames = ['fillLinearGradientStartPointX', 'fillLinearGradientStartPointY', 'fillLinearGradientEndPointX', 'fillLinearGradientEndPointY', 'fillLinearGradientColorStops'];
                let obj: any = {}, attributes = this.attributes;
                for (let key of radialAttrNames) {
                    obj[key] = isRadial ? attributes[key].value : attributes[key].default;
                }
                for (let key of linearAttrNames) {
                    obj[key] = isLinear ? attributes[key].value : attributes[key].default;
                }
                Object.assign(attrValues, obj);
            }
            super.updateRefAttrs(attrValues);
        }
    }

}
