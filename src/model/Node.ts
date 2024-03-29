import {Utils} from "../Utils";
import EVENT_TYPE from '../constants/EventType';
import EventObject from "../EventObject";
import { EVENT_TRIGGERS, EXECUTE_SCRIPT_ACTION, GRAPH_EDITOR_INFO, GRAPH_EDITOR_WARNING, animationToDefaultPeriod, supportAnimation, supportEventAction, supportEventType } from "../constants/TemcConstants";
import { RESIZE_STYLE } from "../constants/StyleMap";
import { Tween } from "konva/lib/Tween";

export abstract class NodeAttrs {
    visible = { "value": true, "default": true, "group": "hidden", "type": "Boolean" };
    draggable = { "value": false, "default": false, "group": "hidden", "type": "Boolean" };
    opacity = { "value": 1, "default": 1, "group": "fill", "type": "Number", "min": 0, "max": 1 };
    listening = { "value": true, "default": true, "group": "hidden", "type": "Boolean" };
    x = { "value": 0, "default": 0, "group": "geometry", "type": "Number" };
    y = { "value": 0, "default": 0, "group": "geometry", "type": "Number" };
    scaleX = { "value": 1, "default": 1, "group": "hidden", "type": "Number" };
    scaleY = { "value": 1, "default": 1, "group": "hidden", "type": "Number" };
    skewX = { "value": 0, "default": 0, "group": "hidden", "type": "Number" };
    skewY = { "value": 0, "default": 0, "group": "hidden", "type": "Number" };
    rotation = { "value": 0, "default": 0, "group": "geometry", "type": "Int" };
    offsetX = { "value": 0, "default": 0, "group": "hidden", "type": "Number" };
    offsetY = { "value": 0, "default": 0, "group": "hidden", "type": "Number" };
}

export abstract class Node {

    id: string = Utils.generateId();
    tag: string | undefined;
    className: string = 'Node';
    attributes: any = {};
    variables: any = {};
    events: any = [];
    animation: any = {
        'type': 'none',
        'autoPlay': false,
        'period':5
    };
    animationObj: any = {};
    ref: any = null;
    dataModel: any = null;
    static className: any;

    constructor() {
        this.createRef();
    }

    getId() {
        return this.id;
    }

    setId(id: string) {
        this.id = id;
        if (this.ref !== null) this.ref.id(id);
    }

    getTag() {
        return this.tag;
    }

    setTag(tag: string) {
        this.tag = tag;
    }

    getClassName() {
        return this.className;
    }

    setClassName(className: string) {
        this.className = className;
    }

    getAttributes(deepClone: boolean = false) {
        if (deepClone) return JSON.parse(JSON.stringify(this.attributes));
        return this.attributes;
    }

    getAttributeValue(name: string) {
        let attrValue = this.attributes[name]?.value;
        if (typeof attrValue === 'object' && attrValue !== null) return JSON.parse(JSON.stringify(attrValue));
        return attrValue;
    }

    setAttributeValue(name: string, value: any) {
        let attrValue: any = {};
        attrValue[name] = value;
        this.setAttributeValues(attrValue);
    }

    /**
     * 获取节点的属性值
     * @param distinct 是否过滤掉属性值为默认值的属性
     * @returns 属性的json对象
     */
    getAttributeValues(distinct: boolean = false) {
        let attrValues: any = {};
        if (distinct) {
            for (let name in this.attributes) {
                let attrValue = this.attributes[name].value;
                let attrDefault = this.attributes[name].default;
                if (attrValue === attrDefault) continue;
                let type1 = typeof attrValue, type2 = typeof attrDefault;
                if (type1 === 'object' && type2 === 'object' && JSON.stringify(attrValue) === JSON.stringify(attrDefault)) continue;
                if (type1 === 'object' && attrValue !== null) attrValue = JSON.parse(JSON.stringify(attrValue));
                attrValues[name] = attrValue;
            }
        } else {
            let arr = Object.entries(this.attributes)
            for (let [key, attrValue] of arr) {
                if (typeof attrValue === 'object' && attrValue !== null) attrValue = JSON.parse(JSON.stringify(attrValue));
                let resValue: any = attrValue;
                attrValues[key] = resValue.value;
            }
        }
        return attrValues;
    }

    setAttributeValues(attrValues: any) {
      
        let _attrValues: any = {};
        for (let name in attrValues) {
            let attrValue = attrValues[name], attr = this.attributes[name];
        
            if (attr) {
                if (JSON.stringify(attr.value) !== JSON.stringify(attrValue)) {
                    attr.value = attrValue;
                    if(attrValue){
                        _attrValues[name] = Utils.is(attrValue,'string')?attrValue:JSON.parse(JSON.stringify(attrValue));
                    }else{
                        _attrValues[name]=attrValue;
                    }
                   
                }
            } else {
                console.warn(GRAPH_EDITOR_WARNING + this.className + "不支持的属性 " + name);
            }
        }
        if (Object.keys(_attrValues).length !== 0) {
            this.updateRefAttrs(_attrValues);
        }
    }

    updateRefAttrs(attrValues: any) {
        if (this.ref !== null) {
            this.ref.setAttrs(attrValues);
            //如果有动画是正在执行的，则要根据属性的改变重新生成动画,比如修改了位置，则旋转动画要重新生成
            let shouldUpdateAnimation = Utils.getShouldUpdateAnimation(attrValues);
            let autoPlay = this.getAnimationValue('autoPlay');
            let isRotate=this.getAnimationValue('type')=='rotateByCenter';
            if (autoPlay && isRotate && shouldUpdateAnimation) {
                this.updateRefAnimation("updateRefAttrs");
            }
        }
    }

  

    setAnimationValue(name: any, value: any) {
        let animationChange: any = {};
        this.animation[name] = value;
        animationChange[name] = value;
        this.setAnimation(animationChange);
    }

    setAnimation(animation: any) {
        if (animation.type && supportAnimation.indexOf(animation.type) == -1) {
            console.warn(GRAPH_EDITOR_WARNING + "不支持的动画类型")
            return
        }
        this.animation = Utils.combine(this.animation, animation);
        if (this.ref && this.dataModel) {
            this.updateRefAnimation("setAnimation");
        }
    }
    destroyAnimation() {
        let animationObj = this.getAnimationObj();
        if (animationObj.obj) {
            let tween = animationObj.obj;
            if (tween.node) {
                //清除原来的状态
                tween.reset();
                tween.destroy();
            } else {
                tween.stop();
                let updateAttr: any = {};
                let nodeAttrValues = this.getAttributeValues();

                for (let key in nodeAttrValues) {
                    if (RESIZE_STYLE.indexOf(key) != -1) {
                        updateAttr[key] = nodeAttrValues[key];
                    }
                }
                //手动设置konva节点到原来的状态
                this.ref.setAttrs(updateAttr);
            }
        }
       this.animationObj={};
    }
    /**
     * 更新konva节点的动画
     */
    updateRefAnimation(reason: string) {
        let type = this.animation.type;
        if (type) {
            if (type == 'none') {
                this.destroyAnimation();
            } else {
                this.destroyAnimation();
                let period = this.animation.period ? this.animation.period : animationToDefaultPeriod[type];
                let tweenResult = Utils.getTweenByType(type, this.ref, period);
                this.setAnimationObj(tweenResult)
                let tween = tweenResult.obj;
                let autoPlay = this.animation.autoPlay;
                if (autoPlay) {
                    if (tween.node) {
                        tween?.play();
                    } else {
                        tween?.start();
                    }
                }
            }
        }
    }

    /**
     * 添加指定名称的变量对象
     * @param name 名称
     * @param variables 
     * @param oldName 原来的名称
     */
    saveVariable(name: string, variable: any, oldName: string) {
        if (oldName) {
            delete this.variables[oldName];
        }
        if (this.dataModel) {
            if (oldName) {
                this.variables[name] = variable;
                this.dataModel.fireEvent(new EventObject(EVENT_TYPE.NODE_VARIABLE_CHANGE, 'type', 'update', 'variable', variable, 'name', name, 'oldName', oldName), null);
            } else {
                if (this.variables.hasOwnProperty(name)) {
                    console.warn(GRAPH_EDITOR_WARNING + "已经有此变量名称存在，添加变量失败");
                } else {
                    this.variables[name] = variable;

                }
            }
        }
    }

    /**
     * 修改节点的指定变量
     * @param name 变量名称
     * @param variable 变量值
     * @param oldName 要修改的变量名称，如果只修改变量值，则此处可以省略
     */
    updateVariable(name: string, variable: any, oldName?: string) {

        if (oldName) {
            delete this.variables[oldName]
            this.variables[name] = variable;
            this.dataModel.fireEvent(new EventObject(EVENT_TYPE.NODE_VARIABLE_CHANGE, 'type', 'update', 'variable', variable, 'name', name, 'oldName', oldName), null);
        } else {
         
            //如果没有原来的名字
            if (this.variables.hasOwnProperty(name)) {
                this.variables[name] = Utils.combine(this.variables[name], variable);
                this.dataModel.fireEvent(new EventObject(EVENT_TYPE.NODE_VARIABLE_CHANGE, 'type', 'update', 'variable', variable, 'name', name), null);
            } else {
                console.warn(GRAPH_EDITOR_WARNING + "未找到该变量，更新变量失败");
            }

        }
    }

    /**
     * 为节点添加变量
     * @param name 变量名称
     * @param variable 变量值
     */
    addVariable(name: string, variable: any) {
        if (this.variables.hasOwnProperty(name)) {
            console.warn(GRAPH_EDITOR_WARNING + "已经有此变量名称存在，添加变量失败");
        } else {
            let emptyVariable = {};
            this.variables[name] = variable ? variable : emptyVariable;
            this.dataModel.fireEvent(new EventObject(EVENT_TYPE.NODE_VARIABLE_CHANGE, 'type', 'add', 'variable', variable, 'name', name), null);
        }

    }



    /*
       删除指定名称的变量对象
    */
    deleteVariable(name: string) {
        if (!this.variables.hasOwnProperty(name)) {
            console.warn(GRAPH_EDITOR_WARNING + "删除变量失败，未找到名称为" + name + "的变量");
            return
        }
        delete this.variables[name];
        if (this.dataModel) {
            this.dataModel.fireEvent(new EventObject(EVENT_TYPE.NODE_VARIABLE_CHANGE, 'type', 'delete', 'node', this, 'name', name), null);
        }
    }

    /*
    获取节点的事件
    */
    getEvents() {
        return this.events;
    }


    /**
     * 为节点添加事件
     * @param event 事件对象
     * @returns 
     */
    addEvent(event: any) {
        if (event.type && event.action) {
            if (supportEventType.indexOf(event.type) == -1) {
                console.warn(GRAPH_EDITOR_WARNING + " 不支持的事件类型")
                return
            }
            if (supportEventAction.indexOf(event.action) == -1) {
                console.warn(GRAPH_EDITOR_WARNING + " 不支持的事件动作")
                return
            }
            event[EVENT_TRIGGERS] = event[EVENT_TRIGGERS] ? event[EVENT_TRIGGERS] : [];
            this.events.push(event);
        } else {
            console.warn(GRAPH_EDITOR_WARNING + " 需要事件类型和事件动作")
        }

    }

    addEventTrigger(eventIndex:number,trigger:any){
        if (eventIndex > this.events.length - 1) {
            console.warn(GRAPH_EDITOR_WARNING + "事件索引越界");
        } else {
            let event=this.events[eventIndex];
            if(event.hasOwnProperty(EVENT_TRIGGERS)){
                event[EVENT_TRIGGERS].push(trigger);
            }else{
                event[EVENT_TRIGGERS]=[trigger];
            }
        }
    }

    updateEventTrigger(eventIndex:number,triggerIndex:number,trigger:any){
        if (eventIndex > this.events.length - 1) {
            console.warn(GRAPH_EDITOR_WARNING + "事件索引越界");
        } else {
            let event=this.events[eventIndex];
            if(event.hasOwnProperty(EVENT_TRIGGERS)){
                let triggers=event[EVENT_TRIGGERS];
                if(triggerIndex>triggers.length-1){
                    console.warn(GRAPH_EDITOR_WARNING + "条件索引越界");
                }else{
                    let oldTrigger=triggers[triggerIndex];
                    triggers[triggerIndex]=Utils.combine(oldTrigger, trigger);
                }
            }else{
                console.warn(GRAPH_EDITOR_WARNING + "事件下不存在triggers");
            }
        }
    }
    deleteEventTrigger(eventIndex:number,triggerIndex:number){
        if (eventIndex > this.events.length - 1) {
            console.warn(GRAPH_EDITOR_WARNING + "事件索引越界");
        } else {
            let event=this.events[eventIndex];
            if(event.hasOwnProperty(EVENT_TRIGGERS)){
                event[EVENT_TRIGGERS].splice(triggerIndex, 1);
            }else{
                console.warn(GRAPH_EDITOR_WARNING + "事件下不存在triggers");
            }
        }
    }

    /**
     * 删除事件
     * @param eventIndex 事件索引
     */
    deleteEvent(eventIndex: number) {
        if (eventIndex > this.events.length - 1) {
            console.warn(GRAPH_EDITOR_WARNING + "要删除的事件索引越界");
        } else {
            this.events.splice(eventIndex, 1);
        }
    }

    /**
    * 更新节点的事件
    * @param event {Object}
    * @param evtIndex 事件的索引
    */
    updateEvent(event: any, evtIndex: number) {
        this.events[evtIndex] = Utils.combine(this.events[evtIndex], event);
    }

    savePropertyInEvent(property: any, propertyIndex: number = -1, evtIndex: number) {
        if (propertyIndex == -1) {
            let isArray = Array.isArray(this.events[evtIndex]['value']);
            if (isArray) {
                this.events[evtIndex]['value'].push(property);
            } else {
                console.warn("事件的值不是数组，无法添加属性")
            }
        } else {
            let val = this.events[evtIndex]['value'];
            val[propertyIndex] = property;
        }
    }

    deletePropertyInEvent(propertyIndex: number = -1, evtIndex: number) {
        if (propertyIndex != -1 && evtIndex != -1) {
            let pros = this.events[evtIndex]['value'];
            pros.splice(propertyIndex, 1);
        } else {
            console.error("未找到事件或属性索引")
        }
    }

    /*
      为节点设置事件
    */
    setEvents(events: any) {
        this.events = events;
    }

    getVariables(): any {
        return this.variables;
    }

    getVariable(name:string):any{
        if(this.variables.hasOwnProperty(name)){
            return this.variables[name]
        }else{
            console.warn(GRAPH_EDITOR_WARNING + '未找到名称为'+name+'的变量');
        }
       
    }

    setVariables(variables: any): void {
        if(variables){
            this.variables = variables
        }else{
             this.variables={};
        }
    }

    getAnimation() {
        return this.animation;
    }
    getAnimationValue(key: string) {
        if (key) {
            return this.animation[key];
        } else {
            console.warn(GRAPH_EDITOR_WARNING + "getAnimationValue方法，需要一个key");
        }

    }

    getAnimationObj(): any {
        return this.animationObj;
    }

    setAnimationObj(value: any) {
        this.animationObj = value;
    }

    abstract createRef(): void;

    getRef() {
        return this.ref;
    }

    setRef(ref: any) {
        this.ref = ref;
    }

    setDataModel(dataModel: any) {
        this.dataModel = dataModel;
    }

    getDataModel() {
        return this.dataModel;
    }

    /**
     * 克隆节点
     * @param unique 如果为true，则会创建新的id给新节点
     * @returns 节点副本
     */
    clone(unique = false) {
        let obj: any = this.toObject(false,true,unique);
        return Node.create(obj);
    }

    getZIndex() {
        if (!this.dataModel) return -1;
        return this.dataModel.nodes.findIndex((node: any) => node === this);
    }

    remove() {
        let index = this.getZIndex();
        if (index !== -1) {
            this.dataModel.nodes.splice(index, 1);
            if (this.ref) this.destroyAnimation()
            if (this.ref !== null) this.ref.remove();

        }
    }
    /**
     * 销毁节点
     */
    destroy() {
        let index = this.getZIndex();
        if (index !== -1) {
            this.dataModel.nodes.splice(index, 1);
            this.destroyAnimation();
            if (this.ref !== null) this.ref.destroy();
        }
    }

    fromObject(obj: any) {
      

        let id, tag, attributes, animation, variables, events;
        if (obj instanceof Array) {
            [id, tag, , attributes, animation, variables, events] = obj;
        } else {
            ({ id, tag, attributes, animation, variables, events } = obj);
        }
        if (id) this.setId(id);
        if (tag) this.setTag(tag);
        if (attributes) this.setAttributeValues(attributes);
        if (animation) this.setAnimation(animation);
        if (variables) this.setVariables(variables);
        if (events) this.setEvents(events);
    }

    /**
     * 将节点转成JSON对象
     * @param isArray 是否去掉key，转成数组，节省空间
     * @param distinct 是否过滤掉属性值为默认值的属性
     * @param unique 是否id唯一，如果为true，则会重新生成id
     * @returns 
     */
    toObject(isArray: boolean = false, distinct: boolean = true,unique:boolean=false) {
        let id = unique?Utils.generateId():this.id, tag = this.tag, className = this.getClassName();
        let attributes = this.getAttributeValues(distinct);
        let animation = JSON.parse(JSON.stringify(this.animation));
        let variables = JSON.parse(JSON.stringify(this.variables));
        let events = JSON.parse(JSON.stringify(this.events));
        if (isArray) {
            return [id, tag, className, attributes, animation, variables, events];
        } else {
            return { id, tag, className, attributes, animation, variables, events };
        }
    }

    fromJSON(json: string) {
        this.fromObject(JSON.parse(json));
    }

    toJSON(isArray: boolean = false) {
        return JSON.stringify(this.toObject(isArray));
    }

    static _classes: any = {};

    static register() {
        this._classes[this.className] = this;

    }


    static create(json: any) {
        

        if (typeof json === 'string') json = JSON.parse(json);
        let className = json instanceof Array ? json[2] : json.className;

        let _class = this._classes[className];
        if (_class) {
            return new _class(json);
        } else {
            return null;
        }
    }

}


