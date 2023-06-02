import UndoRedoManager from "./command/UndoRedoManager";
import EVENT_TYPE from "./constants/EventType";

import { SelectionManager } from "./SelectionManager";
import TemcEventSource from "./TemcEventSource";
import Command from "./command/Command";
import GroupChange from './command/GroupChange';
import Utils from "./Utils";
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

export class DataModel extends TemcEventSource {

    className: string = 'DataModel'
    nodes: any[] = [];
    selectionManager: any;
    undoRedoManager: any;
    variables: any;
    isPreview:boolean=false;

    constructor(gm:GraphManager) {
        super();
        this.selectionManager = new SelectionManager(this);
        this.undoRedoManager = new UndoRedoManager(gm,50);
        this.variables = {};
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
        node.updateRefAnimation(this.isPreview);
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
                        imageAttr.image = null;
                        if (images.hasOwnProperty(content)) {
                            images[content].push(id);
                        } else {
                            images[content] = [id];
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
            format: isArray ? 'array' : 'object',
            variables: this.variables
        };
    }

    toJSON(isArray: boolean = false) {
        return JSON.stringify(this.toObject(isArray));
    }

    onSelectionChanged(callback: any) {
        this.addListener(EVENT_TYPE.SELECT_CHANGE, callback);
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



    /*
       设置整个模型的变量对象（可用于图元）,注意在设置模型的变量时，无需关联业务数据
       {
           name ： {
               defaultVal:'变量默认值'
           }
       }
   */
    saveVariable(name: string, variable: any, oldName?: string) {
        if (oldName) {
            delete this.variables[oldName]
        }
        if (oldName) {
            this.variables[name] = variable;
            this.fireEvent(new EventObject(EVENT_TYPE.MODEL_VARIABLE_CHANGE, 'type', 'update', 'variable', variable, 'name', name, 'oldName', oldName), null);
        } else {
            if (this.variables.hasOwnProperty(name)) {
                console.warn(GRAPH_EDITOR_WARNING + "已经有此变量名称存在，添加变量失败");
            } else {
                this.variables[name] = variable;
                this.fireEvent(new EventObject(EVENT_TYPE.MODEL_VARIABLE_CHANGE, 'type', 'add', 'variable', variable, 'name', name), null);
            }
        }
    }
    /**
     * 查找指定变量
     * @param name 变量名称
     * @returns 指定变量名称的变量
     */
    getVariable(name:string) {
        if (this.variables.hasOwnProperty(name)) {
            return this.variables[name] 
        } else {
            console.warn(GRAPH_EDITOR_WARNING + "已经有此变量名称存在，添加变量失败");
        }
    }

    getVariables() {
        return this.variables;
    }

    setVariables(obj: any) {
        this.variables = obj
    }

    deleteVariable(name: string) {
        delete this.variables[name];
        this.fireEvent(new EventObject(EVENT_TYPE.MODEL_VARIABLE_CHANGE, 'type', 'delete', 'name', name), null);
    }

    setAttributeValues(attrValuesMap: any) {
        let map = new Map();
        for (let [node, attrValues] of attrValuesMap) {
            node.setAttributeValues(attrValues);
            map.set(node.toObject(), JSON.parse(JSON.stringify(attrValues)));
        }
        this.fireEvent(new EventObject(EVENT_TYPE.NODE_ATTRIBUTE_CHANGE, 'nodes', map), null);
    }

    /*
    为节点添加事件
    */
    addEvent(node: any, event: any) {
        node.addEvent(event);
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
    setAnimations(node: any, animation: any) {
        node.setAnimations(animation);
        //通知外部style的变化
        this.fireEvent(new EventObject(EVENT_TYPE.NODE_ANIMATION_CHANGE, 'node', this, 'animation', animation), null);
    }
}
