import type { Stage } from "konva/lib/Stage";
import { GRAPH_EDITOR_WARNING, MAX_SCALE, MIN_SCALE,LEFT_ALIGN,TOP_ALIGN,NORMAL_FIT } from "./constants/TemcConstants";
import type { DataModel } from "./DataModel";
import { Utils } from "./Utils";
import Konva from "konva";
import type { Node } from './model/Node';
import type { Layer } from "konva/lib/Layer";
import { ContainerNode, ContainerNodeAttrs } from "./model/ContainerNode";
import AttributeChange from "./command/AttributeChange";
import Command from "./command/Command";
import GeometryChange from "./command/GeometryChange";
import type { Config } from './types'


import { SymbolNode } from './model/SymbolNode';
import { RectNode } from './model/RectNode';
import { EllipseNode } from './model/EllipseNode';
import { CircleNode } from './model/CircleNode';
import { ImageNode } from './model/ImageNode';
import { StarNode } from "./model/StarNode";
import { RegularPolygonNode } from './model/RegularPolygonNode';
import { ArcNode } from "./model/ArcNode";
import { PathNode } from "./model/PathNode";
import { TextNode } from "./model/TextNode";
import { RingNode } from './model/RingNode';
import { WedgeNode } from './model/WedgeNode';
import { LabelNode } from "./model/LabelNode";
import { GroupNode } from "./model/GroupNode";
import { LineArrowNode } from "./model/LineArrowNode";
import { LineNode } from "./model/LineNode";
import { PenNode } from "./model/PenNode";
import { PolylineNode } from "./model/PolylineNode";
import { PolylineArrowNode } from "./model/PolylineArrowNode";

/*
 * JavaScript Framework v@@version
 * Licensed under the MIT
 * Date: @@date
 */
export abstract class GraphManager {
    container: HTMLDivElement | null;
    config: Config = {};
    nodeLayer: Layer = new Konva.Layer();
     //背景绘制层
    backgroundColorLayer: Layer = new Konva.Layer({ listening: false, name: '背景层' });
    backgroundRect:any;
    dataModel: DataModel | undefined;
    stage: Stage | undefined;
    width: number | undefined;
    height: number | undefined;
    /**
    * The settings
    */
    name: string = '';
    //画布是否锁定
    locked:boolean=true;
    //水平对齐
    hAlign:String=LEFT_ALIGN;
    //垂直对齐
    vAlign:String=TOP_ALIGN;
     //显示方式设置
    fit:string=NORMAL_FIT;
   
    constructor(config: Config) {
        if (Utils.isBrowser() && !config.container) {
            throw new Error(GRAPH_EDITOR_WARNING + 'It needs to have a container element')
        }
    }

    /**
     * 修改视图的显示比例
     * @param scale 显示比例
    */
    setScale(scale: number) {
        if (scale > MAX_SCALE) {
            scale = MAX_SCALE
        }
        if (scale < MIN_SCALE) {
            scale = MIN_SCALE
        }
        if (this.stage) {
            this.stage.scaleX(scale);
            this.stage.scaleY(scale);
            if (this.width) {
                this.stage.setAttr('width', this.width * scale);
            }
            if (this.height) {
                this.stage.setAttr('height', this.height * scale);
            }
        }
        this.dataModel?.getNodes().forEach((node: any) => {
            node.updateRefAnimation("scaleChange");
        });
    }

    /**
     * 获取当前画布的显示比例
     */
    getScale() {
        return this.stage?.getAttr('scaleX');
    }

    /**
     * 根据节点id获取节点
     * @param nodeId 节点id
    */
    getNode(nodeId: string) {
        return this.dataModel ? this.dataModel.getNodeById(nodeId) : null;
    }


    setSize(width: number, height: number) {
        this.width = width;
        this.height = height;
        let scale = this.stage?.getAttr('scaleX');
        this.stage?.setAttr('width', width * scale);
        this.stage?.setAttr('height', height * scale);
        //修改背景矩形
        this.backgroundRect.setAttr('width', width * scale);
        this.backgroundRect.setAttr('height', height * scale);
    }

    /**
     * 获取画布的宽度和高度
     */
    getSize(){
        return {width:this.width,height:this.height}
    }
    
    /**
     * 加载指定的图形
     * @param graphContent 图形信息的字符串
    */
    setGraph(graphContent: any) {
        if (this.stage?.getChildren().length == 0)
            return
        //清空原来的数据
        this.clear();
        let graphJson = JSON.parse(graphContent);
        this.setSize(graphJson.width, graphJson.height);
        let bgColor = graphJson.backgroundColor;
        if (bgColor) {
            this.setBackgroundColor(bgColor);
        }
        if (graphJson.name) {
            this.name = graphJson.name;
        }
        if(graphJson.hAlign){
            this.hAlign=graphJson.hAlign;
        }
        if(graphJson.vAlign){
            this.vAlign=graphJson.vAlign;
        }
        if(graphJson.fit){
            this.fit=graphJson.fit;
        }
        if(graphJson.locked!=undefined){
            this.locked=graphJson.locked;
        }
        
        this.dataModel?.fromObject(graphJson.model);
    }
    fitView(width: number, height: number) {
        if (this.width && this.height) {
            let scaleX = width / this.width;
            let scaleY = height / this.height;
            this.stage?.scaleX(scaleX);
            this.stage?.scaleY(scaleY);
            this.stage?.setAttr('width', width);
            this.stage?.setAttr('height', height);
            this.dataModel?.getNodes().forEach((node: any) => {
                node.updateRefAnimation("scaleChange");
            });
        }

    }

    

   
 

 

    /**
    * 清空画布内容
   */
    clear() {
        this.dataModel?.clear();
    }
    /**
   * 销毁画布
   */
    destroy() {
        this.dataModel?.destroy();
        delete this.dataModel;
        this.stage?.destroy();

    }

    /**
  * 获取画布上所有的节点
  */
    getNodes() {
        let nodes: any = [];
        this.dataModel?.getNodes().forEach((element: any) => {
            nodes.push(element.toObject());
        });
        return nodes;
    }
    getSetNodesAttributesChange(nodes: Array<Node>, attrValues: any, toHistory: boolean = true) {
        let undoRedoManager = this.dataModel?.getUndoRedoManager();
        let rotationAngle: any = null;
        if (attrValues.hasOwnProperty('rotation')) {
            rotationAngle = attrValues['rotation'];
            delete attrValues['rotation'];
        }
        // 将预设属性值分成 [全部预设属性值]、[容器节点预设属性值]、[成员节点预设属性值] 三类
        let containerAttrKeys = Object.keys(new ContainerNodeAttrs());
        let nextAllAttrValues: any = attrValues, nextContainerAttrValues: any = {}, nextMemberAttrValues: any = {};
        for (let name in nextAllAttrValues) {
            let attrValue = nextAllAttrValues[name];
            if (containerAttrKeys.includes(name)) {
                nextContainerAttrValues[name] = attrValue;
            } else {
                nextMemberAttrValues[name] = attrValue;
            }
        }
        let attrValuesMap = new Map();
        for (let node of nodes) {
            // 1. 针对顶级节点中的容器节点，缓存[容器节点预设属性值]、[容器节点复归属性值]
            if (node instanceof ContainerNode) {
                let prevContainerAttrValues: any = {};
                if (toHistory) {
                    for (let name in nextContainerAttrValues) {
                        prevContainerAttrValues[name] = node.getAttributeValue(name);
                    }
                }
                attrValuesMap.set(node, [prevContainerAttrValues, nextContainerAttrValues]);
                // 2. 递归全部节点中的非容器成员节点，缓存[成员节点预设属性值]、[成员节点复归属性值]
                (function loop(nodes) {
                    for (let node of nodes) {
                        if (node instanceof ContainerNode) {
                            loop(node.getMembers());
                        } else {
                            let prevMemberAttrValues: any = {};
                            if (toHistory) {
                                for (let name in nextMemberAttrValues) {
                                    prevMemberAttrValues[name] = node.getAttributeValue(name);
                                }
                            }
                            attrValuesMap.set(node, [prevMemberAttrValues, nextMemberAttrValues]);
                        }
                    }
                })(node.getMembers());
            }
            // 3. 针对顶级节点中的非容器节点，缓存[全部预设属性值]、[全部复归属性值]
            else {
                let prevAllAttrValues: any = {};
                if (toHistory) {
                    for (let name in nextAllAttrValues) {
                        prevAllAttrValues[name] = node.getAttributeValue(name);
                    }
                }

                attrValuesMap.set(node, [prevAllAttrValues, nextAllAttrValues]);
            }
        }
        if (this.dataModel) {
            if (rotationAngle != null) {
                let attrChange = new AttributeChange(attrValuesMap, this.dataModel);
                if (attrValues.hasOwnProperty('x') || attrValues.hasOwnProperty('y')) {
                    //最为复杂的情况x,y,rotation同时修改
                    undoRedoManager.execute(new Command([attrChange]), false);
                }
                //如果是手动修改rotation，则需要改变x,y
                nodes.forEach((node) => {
                    let attrs = node.getRef().getClientRect();
                    attrs.rotation = 0;
                    let diff = rotationAngle - node.getRef().getAttr('rotation');
                    let rad = Utils.getRad(diff);
                    const shape = Utils.rotateAroundCenter(attrs, rad);
                    Utils.fitNodesInto(node.getRef(), attrs, shape);
                })

                let rotateChange = new GeometryChange(nodes, 'rotate', this.dataModel, false);
                return [attrChange, rotateChange]


            } else {
                //没有旋转，则直接修改属性
                let attrChange = new AttributeChange(attrValuesMap, this.dataModel);
                return [attrChange];
            }

        }

    }
    setNodesAttributes(nodes: Array<Node>, attrValues: any, toHistory: boolean = true) {
        let undoRedoManager = this.dataModel?.getUndoRedoManager();
        let changeArray = this.getSetNodesAttributesChange(nodes, attrValues, toHistory);
        let cmd = new Command(changeArray);
        undoRedoManager.execute(cmd, toHistory);
    }
     /**
    * 设置背景色
    * @param color 背景色
    * @example
    * editor.setBackgroundColor('red');
    */
     setBackgroundColor(color: string) {
        if (this.backgroundRect) {
            this.backgroundRect.setAttr('fill',color);
        } else {
            console.warn(GRAPH_EDITOR_WARNING + "未能设置背景色");
        }
    }
     /**
     * 
     * @returns 获取背景色
     */
    getBackgroundColor() {
        return this.backgroundRect.getAttr('fill');
     }
}