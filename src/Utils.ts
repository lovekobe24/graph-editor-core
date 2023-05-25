import Konva from "konva";
import type { Node } from "konva/lib/Node";


let onlyOneSelfAnchorNodeSelected = function (selectedNodes: any) {
    let onlyOneLine = false;
    if (selectedNodes.length == 1) {
        let node = selectedNodes[0];
        if (node.getClassName() == 'LineNode' || node.getClassName() == 'LineArrowNode') {
            onlyOneLine = true;
        }
    }
    return onlyOneLine;
}

let generateId = function () {
    let d = new Date().getTime();
    //use high-precision timer if available
    if (window.performance && typeof window.performance.now === "function") {
        d += performance.now();
    }
    let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
};


let deepCopy = function (target: any) {
    if (typeof target === 'object') {
        const result: any = Array.isArray(target) ? [] : {};
        for (const key in target) {
            if (typeof target[key] === 'object') {
                result[key] = deepCopy(target[key]);
            } else {
                result[key] = target[key];
            }
        }
        return result;
    }
    return target;
}

let is = function (o: any, type: string) {
    if (type == "finite") {
        return isFinite(o);
    }
    if (type == "array" &&
        (o instanceof Array || Array.isArray && Array.isArray(o))) {
        return true;
    }
    return type == "null" && o === null ||
        type == typeof o && o !== null ||
        type == "object" && o === Object(o) ||
        Object.prototype.toString.call(o).slice(8, -1).toLowerCase() == type;
}

let getUnionRect = (rectBounds: any) => {
    let minX, minY, maxX, maxY;

    for (let rectBound of rectBounds) {
        let curMaxX = rectBound.x + rectBound.width;
        let curMaxY = rectBound.y + rectBound.height;
        minX = minX ? (rectBound.x < minX ? rectBound.x : minX) : rectBound.x;
        minY = minY ? (rectBound.y < minY ? rectBound.y : minY) : rectBound.y;
        maxX = maxX ? (curMaxX > maxX ? curMaxX : maxX) : curMaxX;
        maxY = maxY ? (curMaxY > maxY ? curMaxY : maxY) : curMaxY;
    }
    return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
        maxX: maxX,
        maxY: maxY
    }
}

// let moveItemInArray=function(arr:any,index:number,tindex:number){  
//     //如果当前元素在拖动目标位置的下方，先将当前元素从数组拿出，数组长度-1，我们直接给数组拖动目标位置的地方新增一个和当前元素值一样的元素，  
//     //我们再把数组之前的那个拖动的元素删除掉，所以要len+1  
//     if(index>tindex){    
//         arr.splice(tindex,0,arr[index]);   
//         arr.splice(index+1,1)  
//     }  else{
//         arr.splice(tindex+1,0,arr[index]);
//         arr.splice(index,1)
//     }
// }

let moveItemInArray = function move(arr: any, from: number, to: number) {
    if (from > arr.length || to > arr.length)
        return
    let temp = arr[from], step = from < to ? 1 : -1, index = from;
    while (index !== to) arr[index] = arr[index += step];
    arr[to] = temp;
}
/**
 * 是否是空的json对象
 * @param obj 
 * @returns 
 */
let isEmptyObject = function (obj: any) {
    for (var key in obj) {
        return false;
    };
    return true;
};
/**
 * 多层次的json对象合并
 */
let assiginObj = function (target:any = {}, sources:any = {}) {
    let obj: any = target;
    if (typeof target != 'object' || typeof sources != 'object') {
        return sources; // 如果其中一个不是对象 就返回sources
    }
    for (let key in sources) {
        // 如果target也存在 那就再次合并
        if (target.hasOwnProperty(key)) {
            obj[key] = assiginObj(target[key], sources[key]);
        } else {
            // 不存在就直接添加
            obj[key] = sources[key];
        }
    }
    return obj;
}

let assignAttr = function () {
    let obj: any = {};
    for (var i = 0; i < arguments.length; i++) {   //arguments为全部的对象集合
        var source = arguments[i];
        for (let key in source) {
            // 如果target也存在 那就再次合并
            if (obj.hasOwnProperty(key)) {
                obj[key] = obj[key].concat(source[key]);
            } else {
                // 不存在就直接添加
                obj[key] = source[key];
            }
        }
    }


    return obj;
}
/**
 * json对象去并集，相同key则目标对象的值覆盖源对象的值,数组和string会覆盖，json会一直遍历当子key的值为数组或string再进行覆盖
 * @param obj1 源json对象
 * @param obj2 目标json对象
 * @returns 新的json对象
 */

let combine = function (obj1: any, obj2: any) {
    let keys1 = Object.keys(obj1), keys2 = Object.keys(obj2);
    let keys = keys1.filter(k => keys2.includes(k));
    let obj: any = {};
    for (let k of keys) {
        let o1 = obj1[k], o2 = obj2[k];
        if (typeof o1 !== typeof o2) continue;
        if (typeof o1 !== 'object' || o1 === null) continue;
        let fatherProto = Object.getPrototypeOf(o1), ancestorProto = fatherProto;
        while (Object.getPrototypeOf(ancestorProto) !== null) ancestorProto = Object.getPrototypeOf(ancestorProto);
        if (fatherProto !== ancestorProto) continue;
        obj[k] = combine(o1, o2);
    }
    return Object.assign({}, obj1, obj2, obj);
}

const rotatePoint = (point: any, rad: number) => {
    let x = point.x;
    let y = point.y;
    const rcos = Math.cos(rad);
    const rsin = Math.sin(rad);
    return { x: x * rcos - y * rsin, y: y * rcos + x * rsin };
};
/**
 * 角度转弧度
 * @param degree 角度值
 * @returns 
 */
const getRad = (degree: any) => {
    return degree * (Math.PI / 180);
}



const fitNodesInto = (node:Node, oldAttrs:any, newAttrs:any) => {

    const baseSize = 10000000;
    const oldTr = new Konva.Transform();
    oldTr.translate(oldAttrs.x, oldAttrs.y);
    oldTr.rotate(oldAttrs.rotation);
    oldTr.scale(oldAttrs.width / baseSize, oldAttrs.height / baseSize);
    const newTr = new Konva.Transform();
    newTr.translate(newAttrs.x, newAttrs.y);
    newTr.rotate(newAttrs.rotation);
    newTr.scale(newAttrs.width / baseSize, newAttrs.height / baseSize);
    // now lets think we had [old transform] and n ow we have [new transform]
    // Now, the questions is: how can we transform "parent" to go from [old transform] into [new transform]
    // in equation it will be:
    // [delta transform] * [old transform] = [new transform]
    // that means that
    // [delta transform] = [new transform] * [old transform inverted]
    const delta = newTr.multiply(oldTr.invert());

    const parentTransform = node.getParent().getAbsoluteTransform();
    const localTransform = node.getTransform().copy();
    // skip offset:
    localTransform.translate(node.offsetX(), node.offsetY());
    const newLocalTransform = new Konva.Transform();
    newLocalTransform
        .multiply(parentTransform.copy().invert())
        .multiply(delta)
        .multiply(parentTransform)
        .multiply(localTransform);
    const attrs = newLocalTransform.decompose();
    node.setAttrs(attrs);
}

const rotateAroundPoint = (shape:any, angleRad:number, point:any) => {
    const x = point.x +
        (shape.x - point.x) * Math.cos(angleRad) -
        (shape.y - point.y) * Math.sin(angleRad);
    const y = point.y +
        (shape.x - point.x) * Math.sin(angleRad) +
        (shape.y - point.y) * Math.cos(angleRad);
    return Object.assign(Object.assign({}, shape), {
        rotation: shape.rotation + angleRad, x,
        y
    });
}

const getCenter = (shape:any) => {
    return {
        x: shape.x +
            (shape.width / 2) * Math.cos(shape.rotation) +
            (shape.height / 2) * Math.sin(-shape.rotation),
        y: shape.y +
            (shape.height / 2) * Math.cos(shape.rotation) +
            (shape.width / 2) * Math.sin(shape.rotation),
    };
}

/**
 * 
 * @param shape 形状
 * @param rotation 角度
 * @returns 形状的中心点
 */
const rotateAroundCenter = (shape:any, rotation:number) => {
    const center = getCenter(shape);
    return rotateAroundPoint(shape, rotation, center);
}



const getTweenByType = (type: string, konvaNode: any,period:number=5) => {
    period=period*1000;
    let tween: any;
    
    switch (type) {
        case 'blink':
            //使用Tween方法，则konva必须是已经添加到layer上的情况下
            tween = new Konva.Tween({
                node: konvaNode,
                easing: Konva.Easings.EaseInOut,
                duration: period/1000,
                opacity: 0.3,
                yoyo: true,             //是否进行循环播放的设置
            });
            break;
        case 'rotateByCenter':
            var attrs = konvaNode.getClientRect();
            attrs.rotation = 0;
            tween = new Konva.Animation(function (frame: any) {
                // 6s转一圈
                var angle = 360 * (frame.timeDiff / period);
                let rad = getRad(angle);
                let shape = rotateAroundCenter(attrs, rad);
                fitNodesInto(konvaNode, attrs, shape);
            });
            break;
        case 'flow':
            tween = new Konva.Animation(function (frame: any) {
                var step = 60 * (frame.timeDiff / period);
                konvaNode.dashOffset(-((step+10)>1000?0:step+10));
            });
            break;

    }
    return { obj: tween};
}

/**
 * 
 * @param x 浮点数
 * @returns 
 */
const toDecimal = (x: any) => {
    var f = parseFloat(x);
    if (isNaN(f)) {
        return;
    }
    f = Math.round(x * 100) / 100;
    return f;
}
const warn = (info: string) => {
    console.warn(info);
}

const getObjectNodes = (nodes: any) => {
    let nodeObjs: any = [];
    nodes.forEach((element: any) => {
        nodeObjs.push(element.toObject(false,true));
    });
    return nodeObjs;
}
const isBrowser=()=> {
    return typeof window !== 'undefined' && typeof window.document !== 'undefined'
}

export default {

    generateId,
    deepCopy,
    is,
    getUnionRect,
    onlyOneSelfAnchorNodeSelected,
    moveItemInArray,
    isEmptyObject,
    assiginObj,
    combine,
    assignAttr,
    rotatePoint,
    getRad,
    getTweenByType,
    toDecimal,
    warn,
    rotateAroundCenter,
    getObjectNodes,
    isBrowser,
    fitNodesInto
};
