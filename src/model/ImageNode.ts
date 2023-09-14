import Konva from 'konva';
import { ShapeNode, ShapeNodeAttrs } from './ShapeNode';
import { Utils } from '../Utils';

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
            let {image} = attrValues;
            if(image){
                let imageObj=new Image();
                imageObj.src=image;
                this.ref.setAttr('image',imageObj);
            }
             //如果有动画是正在执行的，则要根据属性的改变重新生成动画,比如修改了位置，则旋转动画要重新生成
             let shouldUpdateAnimation = Utils.getShouldUpdateAnimation(attrValues);
             let autoPlay = this.getAnimationValue('autoPlay');
             let isRotate=this.getAnimationValue('type')=='rotateByCenter';
             if (autoPlay && isRotate && shouldUpdateAnimation) {
                 this.updateRefAnimation("updateRefAttrs");
             }
        }
    }

    createRef() {
        let konvaNode = new Konva.Image({ image: undefined });
        konvaNode.id(this.id);
        this.ref = konvaNode;
    }

}
