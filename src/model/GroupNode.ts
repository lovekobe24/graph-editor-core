import { ContainerNode, ContainerNodeAttrs } from './ContainerNode';

export class GroupNodeAttrs extends ContainerNodeAttrs { }

export class GroupNode extends ContainerNode {

    static className = 'GroupNode';
    className = 'GroupNode';
    attributes = new GroupNodeAttrs();

    constructor(opt?: any) {
        super();
        if (opt) this.fromObject(opt);
    }

}
