// @ts-nocheck
import Konva from "konva";

import EVENT_TYPE from './constants/EventType';
import { COMPARISON, CUSTOM_SCRIPT, EXECUTE_ANIMATION_ACTION, EXECUTE_SCRIPT_ACTION, FN_JS, STOP_ANIMATION_ACTION, MOUSE_MOVE_EVT_TYPE, MOUSE_CLICK_EVT_TYPE, CHANGE_PROPERTY_ACTION, MOUSE_OUT_EVT_TYPE, GRAPH_EDITOR_WARNING } from './constants/TemcConstants';
import { DataModel } from './DataModel';
import { ContainerNode, ContainerNodeAttrs } from './model/ContainerNode';

import { Node } from './model/Node';
import Utils from './Utils';
import { GraphManager } from "./GraphManager";
import type { ViewerConfig } from "./types";


export default class GraphViewer extends GraphManager {
    firstPreview: boolean = true;
    eventToRealTimeInfo: any = new Map();
    constructor(config: ViewerConfig) {
        super(config);
        this.config = config;
        let graph;
        if (this.config.graph) {
            graph = JSON.parse(this.config.graph);
        }
        this.width = graph?.width ?? 1000;
        this.height = graph?.height ?? 800;
        this.stage = new Konva.Stage({ container: config.container, width: this.width, height: this.height } as Konva.StageConfig);
        this.stage.add(this.nodeLayer);
        if (graph) {
            //运行态所有节点不可拖动
            graph.model.nodes.map((item: any) => {
                item.attributes.draggable = false;
            });
        }
        this.dataModel = new DataModel(this);
        this.addDataModelListeners();
        if (graph) this.dataModel.fromObject(graph.model);
        this.stage.setAttr("draggable",true);

    }



    addDataModelListeners() {
        this.dataModel.addListener(EVENT_TYPE.ADD_KONVA_NODE, (sender: any, event: any) => {
            let node = event.getProperty('node');
            let nodeIndex = event.getProperty('zIndex');
            this.nodeLayer.add(node);
            if (nodeIndex != -1) {
                node.zIndex(nodeIndex);
            }
            console.log(node.getParent())
        });
    }

    /**
     * 为stage添加鼠标事件
     * @param events 鼠标事件
     */
    registerMouseEvent(events: any) {
        for (let key in events) {
            this.stage.on(key, (e: any) => {
                let evtObj: any = {};
                evtObj['evt'] = e.evt;
                let target = e.target;
                if (target == this.stage) {
                    events[key].apply(this, [evtObj]);
                } else {
                    while (target.parent !== this.nodeLayer) target = target.parent;
                    if (target) {
                        let id = target.attrs.id;
                        let node = this.getNode(id);
                        evtObj['target'] = node.toObject();
                        evtObj['bound'] = target.getClientRect();
                    }
                    events[key].apply(this, [evtObj]);
                }

            });
        }

    }
    /**
     * 
     * 为所有的节点添加鼠标事件
     * @param events 鼠标事件
     */
    registerNodeMouseEvent(events: any) {
        let nodes = this.dataModel.getNodes();
        nodes.forEach((node) => {
            let konvaNode = node.getRef();
            for (let key in events) {
                konvaNode.on(key, (e: any) => {
                    events[key].apply(this, [e.evt, node, konvaNode.getClientRect()]);
                });
            }

        })
    }



    /**
     * 返回选中节点
     *
     * @remarks
     * 
     * @returns 
     *
     * @beta
   */
    getSelection() {
        return this.dataModel.getSelectionManager().getSelection();
    }



    /**
      * 获取变量的json对象
      * @param node 
      * @returns 
      */
    getVariableJson(variables: any) {
        let variableJson: any = {};
        for (let key in variables) {
            variableJson[key] = variables[key].defaultVal;
        }
        return variableJson;
    }
    /**
     * 根据条件生成函数体
     * @param where 条件
     * @returns 
     */
    getFnByWhere(where: any) {
        let type = where.type;
        let fn;
        switch (type) {
            case CUSTOM_SCRIPT:
                fn = where[FN_JS];
                break;
            case COMPARISON:
                if (where['key'] && where['comparison'] && where['value']) {
                    let compStr = this.getCompStr(where['key'], where['comparison'], where['value']);
                    fn = "return " + compStr
                }

                break;
        }
        return fn;
    }

    /**
     * 生成运算表达式
     * @param key 变量
     * @param comparison 运算符号
     * @param value 值
     */
    getCompStr(key: string, comparison: string, value: any) {
        let compStr;
        switch (comparison) {
            case "=":
                compStr = "data." + key + "==" + value;
                break;
            case ">":
                compStr = "data." + key + ">" + value;
                break;
            case ">=":
                compStr = "data." + key + ">" + value + " || " + "data." + key + "==" + value;
                break;
            case "<":
                compStr = "data." + key + "<" + value;
                break;
            case "<=":
                compStr = "data." + key + "<" + value + " || " + "data." + key + "==" + value;
                break;
            case "!=":
                compStr = "data." + key + "!=" + value;
                break;
        }
        return compStr;

    }
    /**
    * 启动动画
    * @param tween 动画对象
    */
    executeTween(tween: any) {
        if (tween.node) {
            tween?.play();
        } else {
            if (!tween.isRunning()) {
                tween?.start();
            }
        }
    }
    /**
     * 停止动画
     * @param tween 动画对象
     */
    stopTween(tween: any) {
        if (tween.node) {
            tween?.reset();
        } else {
            if (tween.isRunning()) {
                tween?.stop();
            }
        }
    }
    setGraph(graphContent: any) {
        super.setGraph(graphContent);
        this.dataModel?.getNodes().forEach((node:Node)=>{
            node.setAttributeValue("draggable",false);
        })
    }

    /**
  * 设置节点的属性
  * @param attrValues 
  */
    setAttribute(node: any, attrValues: any) {
        this.setNodesAttributes([node], attrValues, false);
    }
    setNodeAttribute(node: any, proName: string, proValue: any) {
        let jsonObj: any = {};
        jsonObj[proName] = proValue;
        this.setAttribute(node, jsonObj);
    }
    operateNodeByAction(event: any, node: any, isSuccess: boolean, variableJson: any) {
        //如果条件成立，则执行事件
        let action = event.action;
        //如果事件类型是值变化
        switch (action) {
            case 'changeProperty':
                let properties = event.value;
                if (isSuccess) {
                    let jsonObj: any = {};
                    properties.forEach((prop: any) => {
                        jsonObj[prop.name] = prop.val;
                        //如果使用node的方法，则不能正确的为组元素的属性赋值
                        //node.setAttributeValue(prop.name, prop.val);
                    })
                    this.setAttribute(node, jsonObj);
                } else {
                    //从单个事件来讲不能条件不成功就退到初始状态，因为可以前面的事件满足了，已经设置过改属性了，事件中本身可能就有冲突的逻辑，按照事件次序依次执行即可，条件必须涵盖所有取值情况
                    // properties.forEach((prop: any) => {
                    //     let originNode = this.getOriginNode(node);
                    //     node.setAttributeValue(prop.name, originNode.attributes[prop.name].value);
                    // })
                }

                break;
            case EXECUTE_ANIMATION_ACTION:
                let type = node.animation.type;
                if (type) {
                    if (type != 'none') {
                        let tween = node.getAnimationObj().obj;
                        if (isSuccess) {
                            this.executeTween(tween);
                        }

                    }
                }
                break;
            case STOP_ANIMATION_ACTION:
                let tween = node.getAnimationObj().obj;
                if (isSuccess) {
                    this.stopTween(tween)
                }
                break;
            case EXECUTE_SCRIPT_ACTION:
                let val = event['value'];

                //执行脚本需要传递node和data两个参数
                let executeFn = new Function('node', 'data', 'viewer', val);
                executeFn(node, variableJson, this);
                break;
        }

    }

    changeNodeByEventOnce(node: any, variableJson: any, ownVariable: boolean) {
        let _this = this;
        if (ownVariable) {
            variableJson = this.getVariableJson(Utils.deepCopy(node.getVariables()));
        }
        let events = node.getEvents();
        events.forEach((event: any) => {
            //查找条件
            let where = event.where;
            let type = event.type;

            let fnJs = this.getFnByWhere(where);
            if (fnJs) {
                let executeFn = new Function('data', fnJs);
                let isSuccess = executeFn(variableJson);

                _this.eventToRealTimeInfo.set(event, { isSuccess, variableJson });
                if (type == 'valueUpdate') {
                    this.operateNodeByAction(event, node, isSuccess, variableJson);
                }
            } else {
                _this.eventToRealTimeInfo.set(event, { isSuccess: true, variableJson });
                if (type == 'valueUpdate') {
                    this.operateNodeByAction(event, node, true, variableJson);
                }
            }
        })
    }

    /**
     * 
     * @param node 节点
     * @param variableJson 节点变化依据的变量数据
     * @param ownVariable 是否使用自身的变量，对于组元素，子孙节点使用自身的变量，对于图元元素，子孙节点使用图元的变量
     */
    changeNodeByEvent(node: any, variableJson: any, ownVariable: boolean) {
        let _this = this;
        let clName = node.getClassName();
        //先要执行元素上本身的事件，然后到递归子元素，响应子元素事件,如果没有这个操作，则ContainerNode的事件不会响应
        this.changeNodeByEventOnce(node, variableJson, ownVariable);
        if (clName == 'GroupNode') {
            let groupMembers = node.getMembers() ? node.getMembers() : [];
            groupMembers.forEach((element: any) => {
                //使用自身的变量
                this.changeNodeByEvent(element, variableJson, true);
            });
        } else if (clName == 'SymbolNode') {
            //如果节点类型为Symbol，则此时要获取一下SymbolNode的变量作为参数
            variableJson = this.getVariableJson(Utils.deepCopy(node.getVariables()));
            let symbolMembers = node.getMembers() ? node.getMembers() : [];
            symbolMembers.forEach((element: any) => {
                //使用图元的变量，无论是图元中的任何元素（基础图形或组）都以图元变量为准，自己的变量将不生效
                this.changeNodeByEvent(element, variableJson, false);
            });
        }
    }


    /**
     * 预览
     * @remarks
     * 
     * @returns 
     *
     * @beta
     */
    refreshGraph() {
        if (this.dataModel) {
            if (this.firstPreview) {
                this.parseMouseEventNode();
                this.firstPreview = false;
            }
            this.dataModel.nodes.forEach((node: any) => {
                let variableJson = this.getVariableJson(Utils.deepCopy(node.getVariables()));
                this.changeNodeByEvent(node, variableJson, true);
            })
        }

    }
    isMouseEvent(type: string) {
        if (type == MOUSE_CLICK_EVT_TYPE || type == MOUSE_MOVE_EVT_TYPE || type == MOUSE_OUT_EVT_TYPE) {
            return true;
        } else {
            return false;
        }
    }
    bindEventToNode(node: any) {
        let _this = this;
        let events = node.getEvents();
        events.forEach((event: any) => {
            //查找条件
            let type = event.type;
            let isMouseEvt = _this.isMouseEvent(type);
            if (isMouseEvt) {
                node.getRef().on(type, function () {
                    if (_this.eventToRealTimeInfo.has(event)) {
                        if (_this.eventToRealTimeInfo.get(event).isSuccess == true) {
                            _this.operateNodeByAction(event, node, true, _this.eventToRealTimeInfo.get(event).variableJson);
                        }
                    }
                });
            }
        })
    }
    /**
     * 绑定事件到具体的节点上
     * @param node 需要绑定事件的节点
     */
    bindMouseEventToNode(node: any) {
        this.bindEventToNode(node);
        if (node instanceof ContainerNode) {
            let members = node.getMembers();
            if (members && members.length > 0) {
                members.forEach((child: any) => {
                    this.bindMouseEventToNode(child);
                })
            } else {
                this.bindEventToNode(node);
            }

        }
    }
    /**
     * 解析模型中的鼠标事件绑定
     */
    parseMouseEventNode() {
        let _this = this;
        this.dataModel.nodes.forEach((node: any) => {
            _this.bindMouseEventToNode(node);
        })

    }


    /**
     * 获取模型中所有变量的附加信息
     */
    getAdditionalInfo() {
        let additionalInfo = [];
        let nodes = this.dataModel.getNodes();
        for (let node of nodes) {
            (function loop(node) {
                let variables = node.getVariables();
                for (let key in variables) {
                    let businessTag = variables[key].businessTag;
                    additionalInfo.push({ businessTag: businessTag, type: variables[key].type });
                }
                //如果节点是组合节点，则需要递归所有子孙节点，取出对应的业务数据标签
                if (node instanceof ContainerNode) {
                    let members = node.getMembers();
                    for (let member of members) {
                        loop(member);
                    }
                }
            })(node);
        }
        return additionalInfo;
    }



}
