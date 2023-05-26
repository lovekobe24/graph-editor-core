import type { Stage } from "konva/lib/Stage";
import { GRAPH_EDITOR_WARNING, MAX_SCALE, MIN_SCALE } from "./constants/TemcConstants";
import type { DataModel } from "./DataModel";
import Utils from "./Utils";
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

export abstract class GraphManager {
    container: HTMLDivElement | null;
    config: Config = {};
    nodeLayer: Layer = new Konva.Layer();
    dataModel: DataModel | undefined;
    stage: Stage | undefined;
    width: number | undefined;
    height: number | undefined;
    /**
    * The settings
    */
    name: string = '';
    constructor(config: Config) {
        if (Utils.isBrowser() && !config.container) {
            throw new Error(GRAPH_EDITOR_WARNING + 'It needs to have a container element')
        }
        this.registerNodeClass();
    }

    registerNodeClass() {

        RectNode.register();
        EllipseNode.register();
        ArcNode.register();
        CircleNode.register();
        GroupNode.register();
        ImageNode.register();
        LabelNode.register();
        LineArrowNode.register();
        LineNode.register();
        PathNode.register();
        PenNode.register();
        PolylineArrowNode.register();
        PolylineNode.register()
        RegularPolygonNode.register();
        RingNode.register();
        StarNode.register();
        SymbolNode.register();
        TextNode.register();
        WedgeNode.register();
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
    }

    /**
     * 根据节点id获取节点
     * @param nodeId 节点id
    */
    getNode(nodeId: string) {
        return this.dataModel ? this.dataModel.getNodeById(nodeId) : null;
    }
    /**
  * 清空画布内容
 */
    private clear() {
        this.dataModel?.clear();
    }

    setSize(width: number, height: number) {
        this.width = width;
        this.height = height;
        let scale = this.stage?.getAttr('scaleX');
        this.stage?.setAttr('width', width * scale);
        this.stage?.setAttr('height', height * scale);
    }
    /**
  * 加载指定的图形
  * @param graphContent 图形信息的字符串
  */
    setGraph(graphContent: any) {
        //清空原来的数据
        this.clear();
        let graphJson = JSON.parse(graphContent);
        this.setSize(graphJson.width, graphJson.height);
        let bgColor = graphJson.backgroundColor;
        if (bgColor) {
            let container = this.stage?.container();
            if (container) {
                container.style.backgroundColor = bgColor;
            }
        }
        if (graphJson.name) {
            this.name = graphJson.name;
        }
        this.dataModel?.fromObject(graphJson.model);
        this.dataModel?.setVariables(graphJson.variables);
    }

    /**
   * 销毁画布
   */
    destroy() {
        this.stage?.destroy();
        delete this.dataModel;
    }
    setNodesAttributes(nodes: Array<Node>, attrValues: any, toHistory: boolean = true) {
        let undoRedoManager = this.dataModel?.getUndoRedoManager();
        if (attrValues.hasOwnProperty('rotation')) {
            //如果是手动修改rotation，则需要改变x,y
            nodes.forEach((node) => {
                let attrs = node.getRef().getClientRect();
                let rad = Utils.getRad(attrValues['rotation']);
                attrs.rotation = 0;
                const shape = Utils.rotateAroundCenter(attrs, rad);
                Utils.fitNodesInto(node.getRef(), attrs, shape);
            })

            let moveChange = new GeometryChange(nodes, 'rotate', this.dataModel);
            let cmd = new Command([moveChange]);
            undoRedoManager.execute(cmd, toHistory);


        } else {
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
                let attrChange = new AttributeChange(attrValuesMap, this.dataModel);
                let cmd = new Command([attrChange]);
                undoRedoManager.execute(cmd, toHistory);
            }

        }
    }

}