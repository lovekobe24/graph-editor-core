// @ts-nocheck
import Konva from "konva";

import EVENT_TYPE from './constants/EventType';
import { COMPARISON, CHANGE_ATTRS_ACTION, EXECUTE_SCRIPT_ACTION, VALUE_UPDATE_EVT_TYPE, MOUSE_CLICK_EVT_TYPE, GRAPH_EDITOR_WARNING, MOUSE_DBL_CLICK_EVT_TYPE, MOUSE_LEAVE_EVT_TYPE, MOUSE_ENTER_EVT_TYPE, SCRIPT, UPDATE_ANIMATION_ACTION, EVENT_TRIGGERS, NORMAL_FIT, COVER_FIT, CONTAIN_FIT, LEFT_ALIGN, RIGHT_ALIGN, CENTER_ALIGN, TOP_ALIGN, BOTTOM_ALIGN } from './constants/TemcConstants';
import { DataModel } from './DataModel';
import { ContainerNode, ContainerNodeAttrs } from './model/ContainerNode';
import { defaultConfig } from "./DefaultConfig";
import { Node } from './model/Node';
import { Utils } from './Utils';
import { GraphManager } from "./GraphManager";
import type { ViewerConfig } from "./types";
import { GroupNode, SymbolNode } from "./index.all";

export default class GraphViewer extends GraphManager {

    eventToRealTimeInfo: any = new Map();
    constructor(config: ViewerConfig) {
        super(config);
        this.config = config;

        this.width = defaultConfig.view.size.width;
        this.height = defaultConfig.view.size.height;
        this.stage = new Konva.Stage({ container: config.container, width: this.width, height: this.height } as Konva.StageConfig);
        this.backgroundRect = new Konva.Rect({ fill: 'none',width:this.width,height:this.height})
        this.backgroundColorLayer.add(this.backgroundRect);
        this.stage.add(this.backgroundColorLayer);
        this.stage.add(this.nodeLayer);
        this.dataModel = new DataModel(this);
        this.addDataModelListeners();
        if (this.config.graph) {
            this.setGraph(this.config.graph)
        }
        this.initZoomEvt();
        this.initStageDrag();

    }
    initZoomEvt() {
        var scaleBy = 1.01;
        this.stage.on('wheel', (e) => {
            // stop default scrolling
            e.evt.preventDefault();

            var oldScale = _this.stage.scaleX();
            var pointer = _this.stage.getPointerPosition();

            var mousePointTo = {
                x: (pointer.x - _this.stage.x()) / oldScale,
                y: (pointer.y - _this.stage.y()) / oldScale,
            };

            // how to scale? Zoom in? Or zoom out?
            let direction = e.evt.deltaY > 0 ? 1 : -1;

            // when we zoom on trackpad, e.evt.ctrlKey is true
            // in that case lets revert direction
            if (e.evt.ctrlKey) {
                direction = -direction;
            }

            var newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

            _this.stage.scale({ x: newScale, y: newScale });

            var newPos = {
                x: pointer.x - mousePointTo.x * newScale,
                y: pointer.y - mousePointTo.y * newScale,
            };
            _this.stage.position(newPos);
        });
    }

    initStageDrag() {
        let _this = this;
        this.stage.on('dragstart', (e: any) => {
            this.dataModel?.getNodes().forEach((node: Node) => {
                let autoPlay = node.getAnimationValue('autoPlay');
                if (autoPlay) {
                    //如果正在播放动画，在移动过程中要将动画暂停
                    if (node.getAnimationObj().obj) {
                        node.destroyAnimation();
                    }
                }
            });

        });
        this.stage.on('dragend', (e: any) => {
            this.dataModel?.getNodes().forEach((node) => {
                node.updateRefAnimation("dragend");
            })

        });

    }


    /**
     * 添加对数据模型的监听事件
     */
    addDataModelListeners() {
        this.dataModel.addListener(EVENT_TYPE.ADD_KONVA_NODE, (sender: any, event: any) => {
            let node = event.getProperty('node');
            let nodeIndex = event.getProperty('zIndex');
            this.nodeLayer.add(node);
            if (nodeIndex != -1) {
                node.zIndex(nodeIndex);
            }
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
    private getVariableJson(variables: any) {
        let variableJson: any = {};
        for (let key in variables) {
            variableJson[key] = variables[key].defaultVal;
        }
        return variableJson;
    }
    private isEffective(obj) {
        return Utils.is(obj, 'number') || Utils.is(obj, 'string') || Utils.is(obj, 'boolean')
    }
    /**
     * 根据条件生成函数体
     * @param trigger 条件
     * @returns 
     */
    private getFnByWhen(trigger: any) {
        let _this = this;
        let type = trigger.type;
        let fn;
        switch (type) {
            case SCRIPT:
                fn = trigger[SCRIPT];
                break;
            case COMPARISON:
                let operation = trigger[COMPARISON]
                if (operation['source'] && operation['operator'] && _this.isEffective(operation['target'])) {
                    let compStr = this.getCompStr(operation['source'], operation['operator'], operation['target']);
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
    private getCompStr(key: string, comparison: string, value: any) {
        let compStr;
        if(Utils.is(value,'string')){
            value="'"+value+"'"
        }
        switch (comparison) {
            case "=":
                compStr = key + "==" + value;
                break;
            case ">":
                compStr = key + ">" + value;
                break;
            case ">=":
                compStr = key + ">" + value + " || " + key + "==" + value;
                break;
            case "<":
                compStr = key + "<" + value;
                break;
            case "<=":
                compStr = key + "<" + value + " || " + key + "==" + value;
                break;
            case "!=":
                compStr = key + "!=" + value;
                break;
        }
        return compStr;

    }
    /**
    * 启动动画
    * @param tween 动画对象
    */
    private executeTween(tween: any) {
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
    private stopTween(tween: any) {
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
        this.dataModel?.getNodes().forEach((node: Node) => {
            node.setAttributeValue("draggable", false);
            //这句不能要，不然会造成事件不响应了
            //node.setAttributeValue("listening", false);
        })
      
        //如果被锁定，则stage不能拖拽
        if (this.locked) {
            this.stage.setAttr("draggable", false);
        } else {
            this.stage.setAttr("draggable", true);
        }
        this.fitCanvas();
        this.alignCanvas();
        this.parseMouseEventNode();
        this.refreshGraph();
    }

    /**
  * 设置节点的属性
  * @param attrValues 
  */
    private setAttribute(node: any, attrValues: any) {
        this.setNodesAttributes([node], attrValues, false);
    }
    private setNodeAttribute(node: any, proName: string, proValue: any) {
        let jsonObj: any = {};
        jsonObj[proName] = proValue;
        this.setAttribute(node, jsonObj);
    }
    private operateNodeByAction(event: any, node: any, isSuccess: boolean, variableJson: any) {
        //如果条件成立，则执行事件
        let action = event.action;
        //如果事件类型是值变化
        switch (action) {
            case CHANGE_ATTRS_ACTION:
                let properties = event.attributes;
                if (properties) {
                    if (isSuccess) {
                        this.setAttribute(node, properties);
                    } else {
                        //从单个事件来讲不能条件不成功就退到初始状态，因为可以前面的事件满足了，已经设置过改属性了，事件中本身可能就有冲突的逻辑，按照事件次序依次执行即可，条件必须涵盖所有取值情况
                        // properties.forEach((prop: any) => {
                        //     let originNode = this.getOriginNode(node);
                        //     node.setAttributeValue(prop.name, originNode.attributes[prop.name].value);
                        // })
                    }
                } else {
                    console.warn(GRAPH_EDITOR_WARNING + "changeAttributes动作未找到对应的attributes")
                }


                break;
            case UPDATE_ANIMATION_ACTION:
                let isExecute = event.animation;
                if (isExecute) {
                    let type = node.animation.type;
                    if (type) {
                        if (type != 'none') {
                            let tween = node.getAnimationObj().obj;
                            if (isSuccess && tween) {
                                this.executeTween(tween);
                            }

                        }
                    }
                } else {
                    let tween = node.getAnimationObj().obj;
                    if (isSuccess && tween) {
                        this.stopTween(tween)
                    }
                }
                break;

            case EXECUTE_SCRIPT_ACTION:
                let val = event['script'];
                //执行脚本需要传递node和data两个参数
                let keys = Object.keys(variableJson);
                let values = Object.values(variableJson);
                let executeFn = new Function('viewer', 'node', ...keys, val);
                executeFn(this, node, ...values);
                break;
        }

    }

    private changeNodeByEventOnce(node: any, variableJson: any, ownVariable: boolean) {

        let _this = this;
        //是不是可以不用
        // if (ownVariable) {
        //     variableJson = this.getVariableJson(Utils.deepCopy(node.getVariables()));
        // }
        let events = node.getEvents();
        events.forEach((event: any) => {
            //查找条件
            let triggers = event[EVENT_TRIGGERS];
            let type = event.type;
            if (triggers.length > 0) {
                let isPass = true;
                triggers.forEach(trigger => {
                    let fnJs = this.getFnByWhen(trigger);
                    let isSuccess;
                    if (fnJs) {
                        let keys = Object.keys(variableJson);
                        let values = Object.values(variableJson);
                        let executeFn = new Function('viewer', 'node', ...keys, fnJs);
                        isSuccess = executeFn(this, node, ...values);
                        if (typeof isSuccess != 'boolean') {
                            isSuccess = false;
                        }
                    } else {
                        isSuccess = false;
                    }
                    isPass = isPass && isSuccess
                });
                if (isPass) {
                    _this.eventToRealTimeInfo.set(event, { isSuccess: isPass, variableJson });
                    if (type == VALUE_UPDATE_EVT_TYPE) {
                        this.operateNodeByAction(event, node, isPass, variableJson);
                    }
                }
            } else {
                //无条件
                _this.eventToRealTimeInfo.set(event, { isSuccess: true, variableJson });
                if (type == VALUE_UPDATE_EVT_TYPE) {
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
    private changeNodeByEvent(node: any, variableJson: any, ownVariable: boolean) {
        let _this = this;
        let clName = node.getClassName();
        //先要执行元素上本身的事件，然后到递归子元素，响应子元素事件,如果没有这个操作，则ContainerNode的事件不会响应
        this.changeNodeByEventOnce(node, variableJson, ownVariable);
        if (node instanceof GroupNode) {
            let groupMembers = node.getMembers() ? node.getMembers() : [];
            groupMembers.forEach((element: any) => {
                let id = element.getId();
                //使用自身的变量
                variableJson = _this.realTimeVariableJson.hasOwnProperty(id) ? _this.realTimeVariableJson[id] : this.getVariableJson(Utils.deepCopy(element.getVariables()));
                this.changeNodeByEvent(element, variableJson, true);
            });
        } else if (node instanceof SymbolNode) {
            //如果节点类型为Symbol，则此时要获取一下SymbolNode的变量作为参数
            if (_this.realTimeVariableJson.hasOwnProperty(node.getId())) {
                variableJson = _this.realTimeVariableJson[node.getId()];
            } else {
                variableJson = this.getVariableJson(Utils.deepCopy(node.getVariables()));
            }

            //variableJson = this.getVariableJson(Utils.deepCopy(node.getVariables()));
            let symbolMembers = node.getMembers() ? node.getMembers() : [];
            symbolMembers.forEach((element: any) => {
                //使用图元的变量，无论是图元中的任何元素（基础图形或组）都以图元变量为准，自己的变量将不生效
                this.changeNodeByEvent(element, variableJson, false);
            });
        }
    }



    /**
     * 刷新图形
     * @param realTimeVariableJson 传入的变量值JSON对象，如没有，则运行态变量取值为defaultValue的值
     * @example
     * viewer.refreshGraph({
     *    nodeId:{
     *       state1:4,
     *       state2:5
     *    },
     *    nodeId:{
     *       temperature:36,
     *       humidity:0.3
     *    }
     * })
     */
    refreshGraph(realTimeVariableJson?: any) {

        this.realTimeVariableJson = realTimeVariableJson ? realTimeVariableJson : {};
        if (this.dataModel) {
            this.dataModel.nodes.forEach((node: any) => {
                let variableJson = {};
                if (this.realTimeVariableJson.hasOwnProperty(node.getId())) {
                    variableJson = this.realTimeVariableJson[node.getId()];
                } else {
                    variableJson = this.getVariableJson(Utils.deepCopy(node.getVariables()));
                }
                this.changeNodeByEvent(node, variableJson, true);
            })
        }

    }
    private isMouseEvent(type: string) {
        if (type == MOUSE_CLICK_EVT_TYPE || type == MOUSE_ENTER_EVT_TYPE || type == MOUSE_LEAVE_EVT_TYPE || type == MOUSE_DBL_CLICK_EVT_TYPE) {
            return true;
        } else {
            return false;
        }
    }
    private bindEventToNode(node: any) {

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
    private bindMouseEventToNode(node: any) {
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
    private parseMouseEventNode() {
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
    fitCanvas() {
        let fit=this.fit;
        let containerWidth = parseInt(this.config.container?.style.width.split('px')[0]);
        let containerHeight = parseInt(this.config.container?.style.height.split('px')[0]);
      
        let scaleX = containerWidth / this.width;
        let scaleY = containerHeight / this.height;
      
        switch (fit) {
            case COVER_FIT:
                if (scaleX > scaleY) {
                    this.stage?.scaleX(scaleX);
                    this.stage?.scaleY(scaleX);
                    this.stage?.setAttr('width', this.width * scaleX);
                    this.stage?.setAttr('height', this.height * scaleX);
                } else {
                    this.stage?.scaleX(scaleY);
                    this.stage?.scaleY(scaleY);
                    this.stage?.setAttr('width', this.width * scaleY);
                    this.stage?.setAttr('height', this.height * scaleY);
                }
                break;
            case CONTAIN_FIT:
                if (scaleX > scaleY) {
                    this.stage?.scaleX(scaleY);
                    this.stage?.scaleY(scaleY);
                    this.stage?.setAttr('width', this.width * scaleY);
                    this.stage?.setAttr('height', this.height * scaleY);
                } else {
                    this.stage?.scaleX(scaleX);
                    this.stage?.scaleY(scaleX);
                    this.stage?.setAttr('width', this.width * scaleX);
                    this.stage?.setAttr('height', this.height * scaleX);
                }

                break;
        }
    }

    alignCanvas() {
        let hAlign = this.hAlign;
        let vAlign = this.vAlign;
        let contentContainer = this.stage!.container().querySelector('.konvajs-content');
        let containerWidth = parseInt(this.config.container?.style.width.split('px')[0]);
        let containerHeight = parseInt(this.config.container?.style.height.split('px')[0]);
        let stageWidth =  this.stage?.getAttr('width');
        let stageHeight =  this.stage?.getAttr('height');
        switch (hAlign) {
            case LEFT_ALIGN:
                break;
            case RIGHT_ALIGN:
                let xPos=containerWidth - stageWidth;
                contentContainer.style.left=xPos+"px";
                break;
            case CENTER_ALIGN:
                if (containerWidth > stageWidth) {
                    contentContainer.style.left=(containerWidth - stageWidth) / 2+"px";
                }
                break;
        }
        switch(vAlign){
            case BOTTOM_ALIGN:
                let yPos=containerHeight - stageHeight;
                contentContainer.style.top=yPos+"px";
                break;
            case CENTER_ALIGN:
                if(containerHeight>stageHeight){
                    contentContainer.style.top=(containerHeight - stageHeight) / 2+"px";
                }
                break;
        }
    }
}
