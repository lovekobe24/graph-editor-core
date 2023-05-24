import Utils from '../Utils';
import { ShapeNode, ShapeNodeAttrs } from './ShapeNode';

export abstract class EditableShapeNodeAttrs extends ShapeNodeAttrs { }

export abstract class EditableShapeNode extends ShapeNode {

    className = 'EditableShapeNode';
    refAnchors: any = null;

    getRefAnchors() {
        return this.refAnchors;
    }

    createRefAnchors() {
        if (this.refAnchors === null) {
            this.ref.draggable(false);
        }
    }

    abstract updateRefAnchors(attrValues: any): void;

    destroyRefAnchors() {
        if (this.refAnchors !== null) {
            this.ref.draggable(true);
            let anchors = this.refAnchors;
            for (let anchor of anchors) anchor.destroy();
            this.refAnchors = null;
        }
    }

    setAttributeValues(attrValues: any) {
        super.setAttributeValues(attrValues);
        this.updateRefAnchors(attrValues);
    }

    remove() {
        let index = this.getZIndex();
        if (index !== -1) {
            this.dataModel.nodes.splice(index, 1);
            if (this.ref !== null) this.ref.remove();
            this.destroyRefAnchors();
        }
    }
    destroy(){
        let index = this.getZIndex();
        if (index !== -1) {
            this.dataModel.nodes.splice(index, 1);
            if (this.ref !== null) this.ref.destroy();
            this.destroyRefAnchors();
        }
    }
    getAnchorRadius(strokeWidth:number){
        if(strokeWidth<3){
            return 4;
        }else{
            return strokeWidth;
        }
    }

}
