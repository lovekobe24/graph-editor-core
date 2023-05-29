import Utils from "../Utils";
import EVENT_TYPE from '../constants/EventType';
import EventObject from "../EventObject";
import { EXECUTE_SCRIPT_ACTION, GRAPH_EDITOR_INFO, GRAPH_EDITOR_WARNING, animationToDefaultPeriod, supportAnimation, supportEventAction, supportEventType } from "../constants/TemcConstants";

export abstract class NodeAttrs {
    visible = { "value": true, "default": true, "group": "hidden", "type": "Boolean" };
    draggable = { "value": false, "default": false, "group": "hidden", "type": "Boolean" };
    opacity = { "value": 1, "default": 1, "group": "fill", "type": "Number", "min": 0, "max": 1 };
    listening = { "value": true, "default": true, "group": "hidden", "type": "Boolean" };
    x = { "value": 0, "default": 0, "group": "geometry", "type": "Number" };
    y = { "value": 0, "default": 0, "group": "geometry", "type": "Number" };
    width = { "value": "auto", "default": "auto", "group": "geometry", "type": "Number" };
    height = { "value": "auto", "default": "auto", "group": "geometry", "type": "Number" };
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
    animation: any = {};
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
            let arr=Object.entries(this.attributes)
            for (let [key,attrValue] of arr) {
                if (typeof attrValue === 'object' && attrValue !== null) attrValue = JSON.parse(JSON.stringify(attrValue));
                let resValue:any=attrValue;
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
                    _attrValues[name] = attrValue;
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
        }
    }

    setAnimation(name: any, value: any) {
        let animationChange: any = {};
        this.animation[name] = value;
        animationChange[name] = value;
        this.setAnimations(animationChange);
    }

    setAnimations(animation: any) {
        if (animation.type && supportAnimation.indexOf(animation.type) == -1) {
            console.warn(GRAPH_EDITOR_WARNING + "不支持的动画类型")
            return
        }
        this.animation = Utils.combine(this.animation, animation);
        if (this.ref && this.dataModel) {
            this.updateRefAnimation();
        }
    }
    destroyAnimation(){
        let animationObj = this.getAnimationObj();
        if (animationObj.obj) {
            let tween = animationObj.obj;
            if (tween.node) {
                //清除原来的状态
                tween.reset();
                tween.destroy();
            } else {
                //手动设置konva节点到原来的状态
                 this.ref.setAttrs(this.getAttributeValues());
                 tween.stop();
            }
        }
    }
    /**
     * 更新konva节点的动画
     */
    updateRefAnimation(isPreview:boolean=false) {
        console.log("updateRefAnimatin");
        let type = this.animation.type;
        if (type) {
            if (type == 'none') {
            } else {
               
                this.destroyAnimation();
                
                let period = this.animation.period ? this.animation.period : animationToDefaultPeriod[type];
                let tweenResult = Utils.getTweenByType(type, this.ref, period);
                this.setAnimationObj(tweenResult)
                let tween = tweenResult.obj;
                let autoPlay = this.animation.autoPlay;
                if (autoPlay) {
                    if(!isPreview){
                        this.setAttributeValue('draggable',false);
                    }
                    if (tween.node) {
                        tween?.play();
                    } else {
                        tween?.start();
                    }
                }else{
                    if(!isPreview)  {
                        this.setAttributeValue('draggable',true);
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
                    this.dataModel.fireEvent(new EventObject(EVENT_TYPE.NODE_VARIABLE_CHANGE, 'type', 'add', 'variable', variable, 'name', name), null);
                }
            }
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

    getDefaultWhere(): any {
        let whereJson: any = {};
        whereJson['type'] = 'none';
        return whereJson
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
            event['where'] = event.where ? event.where : this.getDefaultWhere();
            this.events.push(event);
        } else {
            console.warn(GRAPH_EDITOR_WARNING + " 需要事件类型和事件动作")
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
        for (let key in event) {
            let val = event[key];
            if (val == EXECUTE_SCRIPT_ACTION) {
                event['value'] = '';
            } else if (val == 'changeProperty') {
                event['value'] = [];
            }
        }
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

    setVariables(variables: any): void {
        this.variables = variables;
    }

    getAnimation(key: string) {
        return this.animation[key];
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

    clone(unique = false) {
        let obj: any = this.toObject();
        if (unique) obj.id = Utils.generateId();
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
            if (this.ref !== null) this.ref.remove();
        }
    }
    destroy() {
        let index = this.getZIndex();
        if (index !== -1) {
            this.dataModel.nodes.splice(index, 1);
            if (this.ref !== null) this.ref.destroy();
            this.destroyAnimation();
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
        if (animation) this.setAnimations(animation);
        if (variables) this.setVariables(variables);
        if (events) this.setEvents(events);
    }

    toObject(isArray: boolean = false,distinct:boolean=true) {
        let id = this.id, tag = this.tag, className = this.getClassName();
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


