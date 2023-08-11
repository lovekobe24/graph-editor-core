
import Konva from 'konva';
import { ShapeNode, ShapeNodeAttrs } from './ShapeNode';
import { EditableShapeNode, EditableShapeNodeAttrs } from './EditableShapeNode';

export class BaseConnectedLineNodeAttrs extends EditableShapeNodeAttrs {
    points = { "value": [], "default": [], "group": "geometry", "type": "Array" };
}

export class BaseConnectedLineNode extends EditableShapeNode {
    from: any;
    to: any;

    setFrom(from: string) {
        this.from = from;
    }
    setTo(to: string) {
        this.to = to;
    }
    updateRefAnchors(attrValues: any): void {
       
    }
    createRef(): void {
        let konvaNode = new Konva.Line();
        konvaNode.id(this.id);
        this.ref = konvaNode;
    }


    attributes = new BaseConnectedLineNodeAttrs();

    constructor(opt?: any) {
        super();
        if (opt) this.fromObject(opt);
    }

    /**
* 将节点转成JSON对象
* @param isArray 是否去掉key，转成数组，节省空间
* @param distinct 是否过滤掉属性值为默认值的属性
* @param unique 是否id唯一，如果为true，则会重新生成id
* @returns 
*/
    toObject(isArray: boolean = false, distinct: boolean = true, unique: boolean = false) {
        let obj: any = super.toObject(isArray, distinct, unique);

        obj.from = this.from;
        obj.to = this.to;
        return obj;
    }

    fromObject(obj: any) {
        super.fromObject(obj);
        this.setFrom(obj.from);
        this.setTo(obj.to);
    }

}
