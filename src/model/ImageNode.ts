import Konva from 'konva';
import { ShapeNode, ShapeNodeAttrs } from './ShapeNode';

export class ImageNodeAttrs extends ShapeNodeAttrs {
    image = { "value": null, "default": null, "group": "geometry", "type": "Image" };
    crop = { "value": null, "default": null, "group": "geometry", "type": "Object" };
}

export class ImageNode extends ShapeNode {

    static className = 'ImageNode';
    className = 'ImageNode';
    attributes = new ImageNodeAttrs();

    constructor(opt?: any) {
        super();
        if (opt) this.fromObject(opt);
    }

    updateRefAttrs(attrValues: any) {
        if (this.ref !== null) {
            this.ref.setAttrs(attrValues);
        }
    }

    createRef() {
        let konvaNode = new Konva.Image({ image: undefined });
        konvaNode.id(this.id);
        this.ref = konvaNode;
    }

}
