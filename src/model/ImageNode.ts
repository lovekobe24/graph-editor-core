import Konva from 'konva';
import { ShapeNode, ShapeNodeAttrs } from './ShapeNode';
import { Utils } from '../Utils';
import gifuct from '../lib/gifuct';
import { GRAPH_EDITOR_WARNING } from '../constants/TemcConstants';
import { GifuctLib } from '../lib/GifuctLib';


export class ImageNodeAttrs extends ShapeNodeAttrs {
    image = { "value": undefined, "default": undefined, "group": "geometry", "type": "Image" };
    crop = { "value": null, "default": null, "group": "geometry", "type": "Object" };
    width = { "value": "auto", "default": "auto", "group": "geometry", "type": "Number" };
    height = { "value": "auto", "default": "auto", "group": "geometry", "type": "Number" };
    name = { "value": "", "default": "", "group": "", "type": "String" };
   
}

export class ImageNode extends ShapeNode {
   

    static className = 'ImageNode';
    className = 'ImageNode';
    attributes = new ImageNodeAttrs();

    constructor(opt?: any) {
        super();
        if (opt) this.fromObject(opt);
    }
    setAttributeValues(attrValues: any) {
       
        let _this = this;
        super.setAttributeValues(attrValues);
        let { image } = attrValues;
        if (image && image != "undefined") {
            if (!(image.startsWith('data'))) {
                fetch(image)
                    .then(response => response.blob())
                    .then(blob => {
                        const reader = new FileReader()
                        reader.readAsDataURL(blob)
                        reader.onloadend = () => {
                            const base64data = reader.result?.toString();
                            if (base64data) {
                                _this.setAttributeValue('image', base64data);
                            }
                        }
                    })
            }        }
    }
   


    updateRefAttrs(attrValues: any) {
        if (this.ref !== null) {
            this.ref.setAttrs(attrValues);
            let { image } = attrValues;
            if (image && image != "undefined") {
                if (image.startsWith('data:image/gif')) {
                    if(this.ref.getParent()){
                        let gifuctLib=new GifuctLib();
                        let name=this.getAttributeValue('name');
                        gifuctLib.load(image, this.ref.getParent(), (c: any) => {
                            c.setAttribute('id', name);
                            this.ref.setAttr('image', c);
                        })
                        let imageObj = new Image();
                        imageObj.src = image;
                        this.ref.setAttr('image', imageObj);
                    }else{
                       // console.warn(GRAPH_EDITOR_WARNING+"节点未加入到Layer，不能渲染gif")
                    }
                  
                } else {
                    let imageObj = new Image();
                    imageObj.src = image;
                    this.ref.setAttr('image', imageObj);
                }
              

            }
            //如果有动画是正在执行的，则要根据属性的改变重新生成动画,比如修改了位置，则旋转动画要重新生成
            let shouldUpdateAnimation = Utils.getShouldUpdateAnimation(attrValues);
            let autoPlay = this.getAnimationValue('autoPlay');
            let isRotate = this.getAnimationValue('type') == 'rotateByCenter';
            if (autoPlay && isRotate && shouldUpdateAnimation) {
                this.updateRefAnimation("updateRefAttrs");
            }
        }
    }
    updateGifAnimation(reason: string) {
        let image=this.getAttributeValue('image');
        let name=this.getAttributeValue('name');
        if (image.startsWith('data:image/gif')) {
            if(this.ref.getParent()){
                let gifuctLib=new GifuctLib();
                gifuctLib.load(image, this.ref.getParent(), (c: any) => {
                    c.setAttribute('id', name);
                    this.ref.setAttr('image', c);
                })
                let imageObj = new Image();
                imageObj.src = image;
                this.ref.setAttr('image', imageObj);
            }else{
                console.warn(GRAPH_EDITOR_WARNING+"节点未加入到Layer，不能渲染gif")
            }
          
        }
    }

    createRef() {
        let konvaNode = new Konva.Image({image:undefined});
        konvaNode.id(this.id);
        this.ref = konvaNode;
    }

}
