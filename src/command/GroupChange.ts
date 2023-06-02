import type { Node } from '../model/Node';
import { GroupNode } from '../model/GroupNode';
import Change from './Change';
import Konva from 'konva';

class GroupChange extends Change {

    isGroup: boolean = true;
    executed: boolean = false;
    groups: Array<Node> = [];
    groupZIndexs: Array<number> = [];
    members: Array<Node> = [];
    memberZIndexs: Array<number> = [];
    dataModel: any;

    constructor(nodes: Array<Node>, isGroup: boolean, dataModel: any) {
        super();
        this.dataModel = dataModel;
        this.isGroup = isGroup;
        if (isGroup) {
            const group = new GroupNode();
            group.setAttributeValue('draggable', true);
            group.setMembers(nodes.map((item: any) => {
                let node = item.clone(true);
                node.setAttributeValue('draggable', false);
                return node;
            }));
            group.setDataModel(this.dataModel);
            this.groups = [group];
            this.groupZIndexs = [-1];
            this.members = nodes;
            this.memberZIndexs = nodes.map((item: any) => item.getZIndex());
        } else {
            nodes = nodes.filter((item: Node) => item instanceof GroupNode);
            this.groups = nodes;
            this.groupZIndexs = nodes.map((item: any) => item.getZIndex());
            for (let node of nodes) {
                const _nodes = (node as GroupNode).getMembers();
                for (let _node of _nodes) {
                    const _konvaNode = _node.getRef();
                    const parentTransform = _konvaNode.getParent().getTransform();
                    const newLocalTransform = new Konva.Transform();
                    newLocalTransform.multiply(parentTransform.copy())
                                    .multiply(_konvaNode.getTransform());
                    const attrs =newLocalTransform.decompose();
                    const member = _node.clone(true);
                    member.setAttributeValue('scaleX', attrs['scaleX']);
                    member.setAttributeValue('scaleY', attrs['scaleY']);
                    member.setAttributeValue('rotation', attrs['rotation']);
                    member.setAttributeValue('skewX', attrs['skewX']);
                    member.setAttributeValue('skewY', attrs['skewY']);
                    member.setAttributeValue('x', attrs['x']);
                    member.setAttributeValue('y', attrs['y']);
                    member.setAttributeValue('draggable', true);
                    this.members.push(member);
                    this.memberZIndexs.push(-1);
                }
            }
        }
    }

    group() {
        this.members.forEach(item => { item.remove(); });
        this.groups.forEach((item, index) => { this.dataModel.addNode(item, this.groupZIndexs[index]); });
        const groupIds = this.groups.map(item => item.getId());
        this.dataModel.getSelectionManager().setSelection(groupIds, true);
    }

    unGroup() {
        this.groups.forEach(item => { item.remove(); });
        this.members.forEach((item, index) => { this.dataModel.addNode(item, this.memberZIndexs[index]); });
        const memberIds = this.members.map(item => item.getId());
        this.dataModel.getSelectionManager().setSelection(memberIds, true);
    }

    execute() {
        if (this.executed === false) {
            if (this.isGroup) {
                this.group();
            } else {
                this.unGroup();
            }
            this.executed = true;
        }
    }

    undo() {
        if (this.executed === true) {
            if (this.isGroup) {
                this.unGroup();
            } else {
                this.group();
            }
            this.executed = false;
        }
    }

}

export default GroupChange;