import Konva from "konva";



import { Node } from "./model/Node"
import { SymbolNode } from "./model/SymbolNode";

export const Utils = {
    generateId() {
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
    },
    deepCopy(target: any) {
        if (typeof target === 'object') {
            const result: any = Array.isArray(target) ? [] : {};
            for (const key in target) {
                if (typeof target[key] === 'object') {
                    result[key] = Utils.deepCopy(target[key]);
                } else {
                    result[key] = target[key];
                }
            }
            return result;
        }
        return target;
    },
    is (o: any, type: string) {
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
    },
    getUnionRect(rectBounds: any) {
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
    },
   
    moveItemInArray(arr: any, from: number, to: number) {
        if (from > arr.length || to > arr.length)
            return
        let temp = arr[from], step = from < to ? 1 : -1, index = from;
        while (index !== to) arr[index] = arr[index += step];
        arr[to] = temp;
    },
    isEmptyObject(obj: any) {
        for (var key in obj) {
            return false;
        };
        return true;
    },
    assiginObj(target: any = {}, sources: any = {}) {
        let obj: any = target;
        if (typeof target != 'object' || typeof sources != 'object') {
            return sources; // 如果其中一个不是对象 就返回sources
        }
        for (let key in sources) {
            // 如果target也存在 那就再次合并
            if (target.hasOwnProperty(key)) {
                obj[key] = Utils.assiginObj(target[key], sources[key]);
            } else {
                // 不存在就直接添加
                obj[key] = sources[key];
            }
        }
        return obj;
    },
    combine(obj1: any, obj2: any) {
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
            obj[k] = Utils.combine(o1, o2);
        }
        return Object.assign({}, obj1, obj2, obj);
    },
    assignAttr() {
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
    },
    rotatePoint(point: any, rad: number){
        let x = point.x;
        let y = point.y;
        const rcos = Math.cos(rad);
        const rsin = Math.sin(rad);
        return { x: x * rcos - y * rsin, y: y * rcos + x * rsin };
    },
    getRad(degree: any)  {
        return degree * (Math.PI / 180);
    },
    fitNodesInto(node: Konva.Node, oldAttrs: any, newAttrs: any):void {

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
        // console.log(parentTransform.m);
        // console.log('roateTransform',parentTransform.getTranslation());
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
    },
    
    getTweenByType(type: string, konvaNode: any, period: number = 5){
        period = period * 1000;
        let tween: any;
    
        switch (type) {
            case 'blink':
                //使用Tween方法，则konva必须是已经添加到layer上的情况下
                tween = new Konva.Tween({
                    node: konvaNode,
                    easing: Konva.Easings.EaseInOut,
                    duration: period / 1000,
                    opacity: 0.3,
                    yoyo: true,             //是否进行循环播放的设置
                });
                break;
            case 'rotateByCenter':
                var attrs = konvaNode.getClientRect();
                attrs.rotation = 0;
                //旋转的图形成组后，如果组元素旋转，则旋转偏离中心
                // if(konvaNode instanceof Konva.Group){
                //     tween = new Konva.Animation(function (frame: any) {
                //         // 6s转一圈
                //         var angle = 360 * (frame.timeDiff / period);
                //        let oldAngle=konvaNode.getAttr('rotation');
                //         konvaNode.setAttr('rotation',90);
                //     });
                // }else{
                tween = new Konva.Animation(function (frame: any) {
                    // 6s转一圈
                    var angle = 360 * (frame.timeDiff / period);
                    let rad = Utils.getRad(angle);
                    let shape = Utils.rotateAroundCenter(attrs, rad);
                    Utils.fitNodesInto(konvaNode, attrs, shape);
                });
                //}
    
                break;
            case 'flow':
                let offset = 10;
                tween = new Konva.Animation(function (frame: any) {
                    var step = 60 * (frame.timeDiff / period);
                    konvaNode.dashOffset(
                        (function march(step) {
                            offset = offset + step;
                            if (offset > 1000) {
                                offset = 0;
                            }
                            return -offset
                        })(step)
                    )
    
                });
                break;
    
        }
        return { obj: tween };
    },
    toDecimal(x: any) {
        var f = parseFloat(x);
        if (isNaN(f)) {
            return;
        }
        f = Math.round(x * 100) / 100;
        return f;
    },
    warn(info: string){
        console.warn(info);
    },
    getCenter (shape: any){
        return {
            x: shape.x +
                (shape.width / 2) * Math.cos(shape.rotation) +
                (shape.height / 2) * Math.sin(-shape.rotation),
            y: shape.y +
                (shape.height / 2) * Math.cos(shape.rotation) +
                (shape.width / 2) * Math.sin(shape.rotation),
        };
    },
    rotateAroundPoint (shape: any, angleRad: number, point: any) {
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
    },
    
    rotateAroundCenter(shape: any, rotation: number) {
        const center = Utils.getCenter(shape);
        return Utils.rotateAroundPoint(shape, rotation, center);
    }
    ,
    getObjectNodes (nodes: any) {
        let nodeObjs: any = [];
        nodes.forEach((element: any) => {
            nodeObjs.push(element.toObject(false, false));
        });
        return nodeObjs;
    },
    isBrowser(){
        return typeof window !== 'undefined' && typeof window.document !== 'undefined'
    },
   
    getShouldUpdateAnimation(attrValues: any){
        return attrValues.hasOwnProperty('x') || attrValues.hasOwnProperty('x') ||
            attrValues.hasOwnProperty('width') || attrValues.hasOwnProperty('height') ||
            attrValues.hasOwnProperty('scaleX') || attrValues.hasOwnProperty('scaleY')
    
    },
    convertSymbolToImage(symbol: any, callbackFn: any) {
        let symbolNode = new SymbolNode(symbol);
        symbolNode.getRef().toImage({
            callback(img: any) {
                callbackFn.apply(this, [img]);
            }
        });
    }
  };
