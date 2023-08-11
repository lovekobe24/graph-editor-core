
import Konva from 'konva';
import { EditableShapeNode, EditableShapeNodeAttrs } from './EditableShapeNode';
import Command from '../command/Command';
import AttributeChange from '../command/AttributeChange';
import { Utils } from '../Utils';
import { BaseConnectedLineNode, BaseConnectedLineNodeAttrs } from './BaseConnectedLineNode';

export class StraightConnectedLineNodeAttrs extends BaseConnectedLineNodeAttrs {
   
}

export class StraightConnectedLineNode extends BaseConnectedLineNode {

    static className = 'StraightConnectedLineNode';
    className = 'StraightConnectedLineNode';
    attributes: any = new StraightConnectedLineNodeAttrs();
   
    constructor(opt?: any) {
        super();
        if (opt) this.fromObject(opt);
    }
 
   
   

 


}
