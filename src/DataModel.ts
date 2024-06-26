import UndoRedoManager from "./command/UndoRedoManager";
import EVENT_TYPE from "./constants/EventType";

import { SelectionManager } from "./SelectionManager";
import TemcEventSource from "./TemcEventSource";
import Command from "./command/Command";
import GroupChange from './command/GroupChange';
import {Utils} from "./Utils";
import EventObject from "./EventObject";
import { GroupNode } from './model/GroupNode';
import { LineNode } from './model/LineNode';
import { ImageNode } from './model/ImageNode';
import { SymbolNode } from './model/SymbolNode';

import { Node } from './model/Node';
import { GRAPH_EDITOR_WARNING } from "./constants/TemcConstants";
import { ContainerNode } from "./model/ContainerNode";
import type { GraphManager } from "./GraphManager";
import GraphViewer from "./GraphViewer";
import Konva from "konva";

export class DataModel extends TemcEventSource {

    className: string = 'DataModel'
    nodes: any[] = [];
    selectionManager: any;
    undoRedoManager: any;
    //图元的设计使用了自动提取和下放功能，所以不再需要设置variables
   // variables: any;
    isPreview:boolean=false;

    constructor(gm:GraphManager) {
        super();
        this.selectionManager = new SelectionManager(this);
        this.undoRedoManager = new UndoRedoManager(gm,50);
      
        if(gm instanceof GraphViewer){
            this.isPreview=true;
        }
    }

    getUndoRedoManager() {
        return this.undoRedoManager;
    }

    getSelectionManager() {
        return this.selectionManager
    }

    /**
     * 
     * @returns 返回数据模型中所有的节点
     */
    getNodes() {
        return this.nodes;
    }


    /**
     * 添加节点
     * @param nodes 要添加的节点
     */
    addNodes(nodes: any, nodeToIndex: any) {
        let nodeIds = [];
        for (let item of nodes) {
            item.setDataModel(this);
            let index = nodeToIndex ? (nodeToIndex.has(item) ? nodeToIndex.get(item) : -1) : -1;
            this.addNode(item, index);
            nodeIds.push(item.getId());
        }
        this.getSelectionManager().setSelection(nodeIds, true);
        this.fireEvent(new EventObject(EVENT_TYPE.ADD_NODES, 'nodes', Utils.getObjectNodes(nodes)), null);
    }

    addNode(node: Node, index: number = -1) {
        if (index == -1) {
            this.nodes.push(node);
            node.setDataModel(this);
        } else {
            this.nodes.splice(index, 0, node);
        }
       

        this.fireEvent(new EventObject(EVENT_TYPE.ADD_KONVA_NODE, 'node', node.getRef(), 'zIndex', index ? index : -1), null);
        //对于Tween动画来说，必须将konva节点加入到Layer后，才能调用动画
        node.updateRefAnimation('addNode');
        if(node instanceof ImageNode){
            node.updateGifAnimation('addNode');
        }
    }



    /**
     * 删除指定节点数据
     * @param nodes 节点数组
     */
    removeNodes(nodes: any) {
        //移除模型中的节点
        nodes.forEach((element: any) => {
            element.remove();
        });
        this.getSelectionManager().setSelection([], true);
        this.fireEvent(new EventObject(EVENT_TYPE.REMOVE_NODES, 'nodes', Utils.getObjectNodes(nodes)), null);
    }


    getClassName() {
        return 'DataModel';
    }

    getNodeById(nodeId: string) {
        for (let node of this.nodes) {
            if (node.getId() == nodeId) {
                return node;
            }
        }
    }

    fromObject(obj: any) {
        let {images, nodes, format } = obj;
        if (format === 'array') {
            // 还原图片BASE64数据
            for (let content in images) {
                let ids = images[content], image = content;
                (function loop(nodes) {
                    for (let node of nodes) {
                        let id = node[0], className = node[2];
                        if (className === 'ImageNode' && ids.includes(id)) {
                            node[3].image = image;
                        } else if (className === 'GroupNode') {
                            loop(node[7]);
                        }
                    }
                })(nodes);
            }
        } else {
            // 还原图片BASE64数据
            for (let content in images) {
                let ids = images[content], image = content;
                (function loop(nodes) {
                    for (let node of nodes) {
                        let id = node.id, className = node.className;
                        if (className === 'ImageNode' && ids.includes(id)) {
                            node.attributes.image = image;
                        } else if (className === 'GroupNode') {
                            loop(node.members);
                        }
                    }
                })(nodes);
            }
        }
       
        nodes.map((item: any) => {
            let node = Node.create(item);
            this.addNode(node, -1);
        });
    }

    toObject(isArray: boolean = false) {
        let nodes = this.nodes.map(item => item.toObject(isArray));
        let images: any = {};
        if (isArray) {
            // 针对数组格式
            (function loop(nodes) {
                for (let node of nodes) {
                    let id = node[0], className = node[2];
                    if (className === 'ImageNode') {
                        let imageAttr = node[3], content = imageAttr.image;
                        imageAttr.image = null;
                        if (images.hasOwnProperty(content)) {
                            images[content].push(id);
                        } else {
                            images[content] = [id];
                        }
                    } else if (className === 'GroupNode') {
                        loop(node[7]);
                    }
                }
            })(nodes);
        } else {
            // 针对对象格式
            (function loop(nodes) {
                for (let node of nodes) {
                    let id = node.id, className = node.className;
                    if (className === 'ImageNode') {
                        let imageAttr = node.attributes;
                        let content = imageAttr.image;
                        if(content){
                            imageAttr.image = null;
                            if (images.hasOwnProperty(content)) {
                                images[content].push(id);
                            } else {
                                images[content] = [id];
                            }
                        }
                      
                    } else if (className === 'GroupNode') {
                        loop(node.members);
                    }
                }
            })(nodes);
        }
        return {
            nodes,
            images,
            format: isArray ? 'array' : 'object'
        };
    }

    toJSON(isArray: boolean = false) {
        return JSON.stringify(this.toObject(isArray));
    }

    onSelectionChanged(callback: any) {
        this.addListener(EVENT_TYPE.SELECT_CHANGE, callback);
    }
    onFnStateChanged(callback:any){
        this.addListener(EVENT_TYPE.FN_STATE_CHANGE, callback);
    }

    onModelChanged(callback: any) {
        this.addListener(EVENT_TYPE.NODE_ATTRIBUTE_CHANGE, callback);
        this.addListener(EVENT_TYPE.NODE_EVENTS_CHANGE, callback);
        this.addListener(EVENT_TYPE.NODE_VARIABLE_CHANGE, callback);
        this.addListener(EVENT_TYPE.NODE_ANIMATION_CHANGE, callback);
        this.addListener(EVENT_TYPE.MODEL_VARIABLE_CHANGE, callback);
        this.addListener(EVENT_TYPE.NODE_PROPERTY_CHANGE, callback);
        this.addListener(EVENT_TYPE.ADD_NODES, callback);
        this.addListener(EVENT_TYPE.REMOVE_NODES, callback);

    }


    group(nodes: Array<Node>) {
        let groupChange = new GroupChange(nodes, true, this);
        let cmd = new Command([groupChange]);
        this.undoRedoManager.execute(cmd);
       
    }

    unGroup(nodes: Array<Node>) {
        let groupChange = new GroupChange(nodes, false, this);
        let cmd = new Command([groupChange]);
        this.undoRedoManager.execute(cmd);
    }

    clear() {
        for (let i = this.nodes.length - 1; i >= 0; i--) {
            let node = this.nodes[i];
            node.destroy();
        }
        this.selectionManager.setSelection([], true)
    }
    /**
     * 销毁所有节点
     */
    destroy(){
        for (let i = this.nodes.length - 1; i >= 0; i--) {
            let node = this.nodes[i];
            node.destroy();
        }
    }

    setAttributeValues(attrValuesMap: any,canvasAction: boolean=false) {
        let map = new Map();
        for (let [node, attrValues] of attrValuesMap) {
            node.setAttributeValues(attrValues);
            map.set(node.toObject(), JSON.parse(JSON.stringify(attrValues)));
        }
        this.fireEvent(new EventObject(EVENT_TYPE.NODE_ATTRIBUTE_CHANGE, 'nodes', map,'canvasAction',canvasAction), null);
    }

    /*
    为节点添加事件
    */
    addEvent(node: any, event: any) {
        node.addEvent(event);
        this.fireEvent(new EventObject(EVENT_TYPE.NODE_EVENTS_CHANGE, 'node', this, 'events', JSON.parse(JSON.stringify(node.getEvents()))), null);
    }

    /**
     * 
     * @param operateNode 操作的节点
     * @param eventIndex 事件的索引
     */
    addEventTrigger(node:any, eventIndex:number,trigger:any){
        node.addEventTrigger(eventIndex,trigger);
        this.fireEvent(new EventObject(EVENT_TYPE.NODE_EVENTS_CHANGE, 'node', this, 'events', JSON.parse(JSON.stringify(node.getEvents()))), null);
    }

    updateEventTrigger(node:any, eventIndex:number,triggerIndex:number,trigger:any){
        node.updateEventTrigger(eventIndex,triggerIndex,trigger);
        this.fireEvent(new EventObject(EVENT_TYPE.NODE_EVENTS_CHANGE, 'node', this, 'events', JSON.parse(JSON.stringify(node.getEvents()))), null);
    }

    /**
     * 
     * @param eventIndex 事件索引
     * @param triggerIndex 条件索引
     */
    deleteEventTrigger(node:any,eventIndex:number,triggerIndex:any){
        node.deleteEventTrigger(eventIndex,triggerIndex);
        this.fireEvent(new EventObject(EVENT_TYPE.NODE_EVENTS_CHANGE, 'node', this, 'events', JSON.parse(JSON.stringify(node.getEvents()))), null);
    }

    deleteEvent(node: any, eventIndex: any) {
        node.deleteEvent(eventIndex);
        this.fireEvent(new EventObject(EVENT_TYPE.NODE_EVENTS_CHANGE, 'node', this, 'events', JSON.parse(JSON.stringify(node.getEvents()))), null);
    }

    deletePropertyInEvent(node: any, propertyIndex: number = -1, evtIndex: number) {
        node.deletePropertyInEvent(propertyIndex, evtIndex);
        this.fireEvent(new EventObject(EVENT_TYPE.NODE_EVENTS_CHANGE, 'node', this, 'events', JSON.parse(JSON.stringify(node.getEvents()))), null);
    }

    updateEvent(node: any, event: any, evtIndex: number) {
        node.updateEvent(event, evtIndex);
        this.fireEvent(new EventObject(EVENT_TYPE.NODE_EVENTS_CHANGE, 'node', this, 'events', JSON.parse(JSON.stringify(node.getEvents()))), null);

    }
    savePropertyInEvent(node: any, property: any, propertyIndex: number = -1, evtIndex: number) {

        node.savePropertyInEvent(property, propertyIndex, evtIndex);
        this.fireEvent(new EventObject(EVENT_TYPE.NODE_EVENTS_CHANGE, 'node', this, 'events', JSON.parse(JSON.stringify(node.getEvents()))), null);
    }
    setNodeTag(node: any, tag: string) {
        node.setTag(tag);
        this.fireEvent(new EventObject(EVENT_TYPE.NODE_PROPERTY_CHANGE, 'node', this, 'tag', tag), null);
    }
    setAnimation(node: any, animation: any) {
        node.setAnimation(animation);
        //通知外部style的变化
        this.fireEvent(new EventObject(EVENT_TYPE.NODE_ANIMATION_CHANGE, 'node', this, 'animation', animation), null);
    }
    /**
     * 检查是否有重复id
     */
    checkId(){
        let existRepeatId=false;
        let alreadyId:string[]=[];
        (function loop(nodes) {
            for (let node of nodes) {
              
                let curId=node.id;
                if(alreadyId.indexOf(curId)==-1){
                    alreadyId.push(curId);
                }else{
                    existRepeatId=true;
                    console.warn(GRAPH_EDITOR_WARNING+"存在重复id"+curId);
                }
                if (node instanceof ContainerNode) {
                    loop(node.getMembers());
                }
            }
        })(this.nodes);
      return existRepeatId;
      
    }
}
