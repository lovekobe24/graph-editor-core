import Konva from 'konva';
import { Node, NodeAttrs } from './Node';
import Utils from '../Utils';

export class ContainerNodeAttrs extends NodeAttrs { }

export abstract class ContainerNode extends Node {

    className = 'ContainerNode';
    members: Array<Node> = [];

    getMembers() {
        return this.members;
    }

    setMembers(nodes: Array<Node>) {
        this.members = nodes;
        this.ref.destroyChildren();
        this.ref.add(...nodes.map(node => node.getRef()));
    }

    getMemberAttributes(unionMode: boolean = false) {
        let memberAttrs: any = {}, members = this.members;
        for (let i = 0, len = members.length; i < len; i++) {
            let member = members[i], attrs = member instanceof ContainerNode ? member.getMemberAttributes(unionMode) : member.getAttributes(true);
            if (i === 0) {
                memberAttrs = attrs;
            } else if (unionMode) {
                Object.assign(memberAttrs, attrs);
            } else {
                let loop = false;
                for (let name in memberAttrs) {
                    loop = true;
                    if (!attrs.hasOwnProperty(name)) {
                        delete memberAttrs[name];
                    }
                }
                if (!loop) break;
            }
        }
        return memberAttrs;
    }

    setMemberAttributeValues(attrValues: any) {
        this.members.forEach(member => {
            if (member instanceof ContainerNode) {
                member.setMemberAttributeValues(attrValues);
            } else {
                member.setAttributeValues(attrValues);
            }
        });
    }

    fromObject(obj: any) {
        super.fromObject(obj);
        let members;
        if (obj instanceof Array) {
            members = obj[7];
        } else {
            ({ members } = obj);
        }
        if (members) this.setMembers(members.map((item: any) => Node.create(item)));
    }

    toObject(isArray: boolean = false) {
        let obj: any = super.toObject(isArray);
        let members = this.getMembers().map((item: any) => item.toObject(isArray));
        if (isArray) {
            obj.push(members);
        } else {
            obj.members = members;
        }
        return obj;
    }

    createRef() {
        let konvaNode = new Konva.Group();
        konvaNode.id(this.id);
        this.ref = konvaNode;
    }
    updateRefAttrs(attrValues: any) {
        super.updateRefAttrs(attrValues);
        (function loop(nodes) {
            for (let node of nodes) {
                if (node instanceof ContainerNode) {
                    loop(node.getMembers());
                } else {
                    //如果有动画是正在执行的，则要重新生成动画
                    let shouldUpdateAnimation = Utils.getShouldUpdateAnimation(attrValues);
                    let autoPlay = node.getAnimationValue('autoPlay');
                    if (autoPlay && shouldUpdateAnimation) {
                      node.updateRefAnimation("updateRefAttrs");
                    }
                }
            }
        })(this.getMembers());
    }

}
