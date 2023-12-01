// @ts-nocheck
import Konva from "konva";
import type { Stage } from "konva/lib/Stage";
import { DataModel } from "./DataModel";
import EVENT_TYPE from "./constants/EventType";
import { Node } from './model/Node';
import { Utils } from "./Utils";

import TemcEventSource from "./TemcEventSource";
import { REGULAR_MODE, DRAWING_MODE, EDITING_MODE, DRAWING_MOUSE_DOWN, DRAWING_MOUSE_MOVE, DRAWING_MOUSE_CLICK,DRAWING_MOUSE_UP,DRAWING_MOUSE_OUT, DRAWING_MOUSE_DBL_CLICK, DIRECTION_HORIZONTAL, DIRECTION_VERTICAL, DIRECTION_LEFT, DIRECTION_RIGHT, DIRECTION_TOP, DIRECTION_BOTTOM, GRAPH_EDITOR_WARNING, GRAPH_EDITOR_INFO, DRAWING_MODE_SUB_CONNECTED_LINE, ROTATE_BY_CENTER } from './constants/TemcConstants';

import Command from "./command/Command";

import LineShape from "./shape/LineShape";
import PolylineShape from "./shape/PolylineShape";
import OrderChange from "./command/OrderChange";
import AttributeChange from './command/AttributeChange';
import GeometryChange from "./command/GeometryChange";
import NodeChange from "./command/NodeChange";
import EventObject from "./EventObject";

import { EditableShapeNode } from './model/EditableShapeNode';
import ArrowShape from "./shape/ArrowShape";
import PolylineArrowShape from './shape/PolylineArrowShape';
import PenShape from "./shape/PenShape";
import { ContainerNode, ContainerNodeAttrs } from "./model/ContainerNode";
import type { Shape } from "konva/lib/Shape";
import { MAX_SCALE, MIN_SCALE } from './constants/TemcConstants';
import { SnapGrid } from './snapGrid/SnapGrid';
import pako from 'pako'
import { GraphManager } from "./GraphManager";
import { defaultConfig } from "./DefaultConfig";
import { orderDirection, type AlignDirection, type Dimensions, type EditorConfig, type GridConfig, type MoveDirection, type NodeConfig, type OrderDirection, type StyleConfig, Event } from "./types";
import { GroupNode, ImageNode, SymbolNode } from "./index.all";
import ConnectedLineShape from "./shape/BaseConnectedLineShape";
import { ConnectedLineNode } from "./model/ConnectedLineNode";
import StraightConnectedLineShape from "./shape/StraightConnectedLineShape";
import BaseConnectedLineShape from "./shape/BaseConnectedLineShape";
import { BaseConnectedLineNode } from "./model/BaseConnectedLineNode";
import gifuct from './lib/gifuct';


export default class GraphEditor extends GraphManager {
    //网格绘制层
    private gridLayer: Layer = new Konva.Layer({ listening: false, name: '网格层' });
    //辅助层
    private helpLayer: Layer = new Konva.Layer({ name: '辅助层' });
    //绘图层
    private drawingLayer: Layer = new Konva.Layer({ name: '绘图层' });
    //连接点所在层
    private makerLayer: Layer = new Konva.Layer({ name: '连接点' });
    transformer: any;
    private selectionRect: Rect;
    currentMode: string = REGULAR_MODE;
    shapeModules: any[] = [];
    drawingShape: any = null;
    gridConfig: any;
    isSquare: boolean = false;
    operateNodes: any[] = [];
    pasteCount: number = 1;
    copyNodes: any[] = [];
    currentTarget: any;
    private clipboardContent: Node[] = [];
    relatedConnectedLinesMap: any = new Map();
    /**
     * 
     * @param container 画布所在的div容器
     * @param {Object} graphConfig 配置项目
     * @param {Boolean} graphConfig.view.grid.show 是否显示网格
     * @param {Number} graphConfig.view.grid.distance 网格间距
     * @param {String} graphConfig.view.grid.color 网格颜色
     * @param {String} graphConfig.graph 加载的图形字符串
     * @param {Number} graphConfig.view.size.width 默认图形宽度
     * @param {Number} graphConfig.view.size.height 默认图形高度
     * @param {Number} graphConfig.selection.transformer.anchorSize 选择框的锚点尺寸
     * @param {Number} graphConfig.selection.transformer.rotateAnchorOffset 选择框的旋转点和框的距离
     * @param {Number} graphConfig.selection.transformer.anchorStroke 选择框的锚点描边颜色
     * @param {Number} graphConfig.selection.transformer.anchorFill 选择框的锚点填充色
     * @param {Number} graphConfig.selection.transformer.borderStroke 选择框的边框颜色
     * @param {Number} graphConfig.selection.transformer.borderWidth 选择框的边框线宽
     * @param {String} graphConfig.drawing.editAnchor.anchorFill 编辑锚点的填充色
     * @param {String} graphConfig.drawing.editAnchor.anchorStroke 编辑锚点的描边色
     * @param {Number} graphConfig.style.strokeWidth 默认线宽
     * @param {String} graphConfig.style.stroke 默认线色
     * @example
     * var graphEditor=new GraphEditor({
     *     container:document.getElementById('editor'),
     *     drawing: {
     *          snapToGrid: {
     *              enable: true,
     *           }
     *     },
     *     selection: {
     *          keyboard: {
     *              map: {
     *                   moveLeft: ['Shift+ArrowLeft'],
     *                   moveRight: ['Shift+ArrowRight'],
     *                   moveUp: ['Shift+ArrowUp'],
     *                   moveDown: ['Shift+ArrowDown']
     *               }
     *           }
     *     }
     * })
     * 
     */
    constructor(config: EditorConfig) {
        super(config);
        this.container = config.container;
        this.config = Utils.combine(defaultConfig, config);
        let view = this.config?.view;
        this.width = view.size.width;
        this.height = view.size.height;
        this.stage = new Konva.Stage({ container: config.container, width: this.width, height: this.height } as Konva.StageConfig);
        this.stage.add(this.gridLayer);
        this.stage.add(this.nodeLayer);
        this.stage.add(this.helpLayer);
        this.stage.add(this.drawingLayer);
        this.stage.add(this.makerLayer);
        this.dataModel = new DataModel(this);
        this.addDataModelListeners();
        //初始化框选矩形
        this.selectionRect = new Konva.Rect({ fill: this.config.selection.zone.fill, visible: false })
        this.transformer = new Konva.Transformer(this.config.selection.transformer);
        this.snapGrid = new SnapGrid(this);
        // this.transformer.ignoreStroke(true);
        this.helpLayer.add(this.transformer);
        // 添加区域选择框
        this.helpLayer.add(this.selectionRect);
        this.initGrid();
        this.initNodeSelect();
        this.initBoxSelect();
        this.initCursorChange();
        this.initNodeEdit();
        this.initNodeDraw();
        this.initNodeResize();
        this.initNodeMove();

        this.initShapeModule();

        if (Utils.isBrowser()) {
            var container = this.stage.container();
            // make it focusable
            container.tabIndex = 1;
            // // focus it
            // // also stage will be in focus on its click
            container.focus();
            container.addEventListener('keydown', this.onKeyDown.bind(this))
        }
        if (this.config.graph) {
            //加载图形
            this.setGraph(this.config.graph)
        }
    }




    /**
    * 监听鼠标事件，完成选中功能
    */
    private initNodeSelect() {
        this.nodeLayer.on('mousedown', (e: any) => {
            if (this.currentMode === REGULAR_MODE) {
                let target = e.target;
                while (target.parent !== this.nodeLayer) target = target.parent;
                let nodes = this.transformer.nodes();
                let isSelected = nodes.includes(target);
                let metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
                if (metaPressed) {
                    if (isSelected) {
                        nodes = nodes.filter((item: any) => item !== target)
                    } else {
                        nodes = nodes.concat(target);
                    }
                    this.transformer.nodes(nodes);
                    this.dataModel.getSelectionManager().setSelection(nodes.map((item: any) => item.attrs.id), false);
                } else if (!isSelected) {
                    this.transformer.nodes([target]);
                    this.dataModel.getSelectionManager().setSelection([target.attrs.id], false);
                }
            }
        });
    }

    /**
     * 监听鼠标事件，完成框选功能
     */
    private initBoxSelect() {
        let start = null;
        this.stage.on('mousedown', (e: any) => {
            if (this.currentMode === REGULAR_MODE && this.stage === e.target) {
                start = this.getStageScalePoint();
                this.selectionRect.setAttrs({ x: start.x, y: start.y });
                this.selectionRect.visible(true);
            }
        });
        this.stage.on('mousemove', (e: any) => {
            if (this.currentMode === REGULAR_MODE && start !== null) {
                let end = this.getStageScalePoint();
                this.selectionRect.setAttrs({ width: end.x - start.x, height: end.y - start.y });
            }
        });
        this.stage.on('mouseup', (e: any) => {
            if (this.currentMode === REGULAR_MODE && start !== null) {
                let clientRect = this.selectionRect.getClientRect();
                let nodes = this.nodeLayer.getChildren();
                let selectedNodes = nodes.filter((item: Shape) => Konva.Util.haveIntersection(clientRect, item.getClientRect()));
                this.transformer.nodes(selectedNodes);
                let selectedNodeIds = selectedNodes.map((item: Shape) => item.attrs.id);
                this.dataModel.getSelectionManager().setSelection(selectedNodeIds, false);
                start = null;
                this.selectionRect.setAttrs({ width: 0, height: 0 });
                this.selectionRect.visible(false);
            }
        });
    }

    /**
    * 监听鼠标事件，切换鼠标图标
    */
    private initCursorChange() {
        let _this = this;
        this.helpLayer.on('mouseenter', (e: any) => {
            switch (this.currentMode) {
                case REGULAR_MODE:
                    break;
                case DRAWING_MODE:
                    break;
                case EDITING_MODE:
                    this.container.style.cursor = 'pointer';
                    break;
            }

        });

        this.helpLayer.on('mouseleave', (e: any) => {
            switch (this.currentMode) {
                case REGULAR_MODE:
                    break;
                case DRAWING_MODE:
                    break;
                case EDITING_MODE:
                    this.container.style.cursor = 'default';
                    break;
            }

        });
        this.nodeLayer.on('mouseenter', (e: any) => {

            switch (this.currentMode) {
                case REGULAR_MODE:
                    this.container.style.cursor = 'move';
                    break;
                case DRAWING_MODE:

                    break;
                case EDITING_MODE:
                    break;
            }

        });

        this.nodeLayer.on('mouseleave', (e: any) => {
            switch (this.currentMode) {
                case REGULAR_MODE:
                    this.container.style.cursor = 'default';
                    break;
                case DRAWING_MODE:
                    break;
                case EDITING_MODE:
                    break;
            }

        });
        this.stage.on('mouseover', (e: any) => {
            switch (this.currentMode) {
                case DRAWING_MODE:
                    if (this.subMode == DRAWING_MODE_SUB_CONNECTED_LINE) {

                    } else {
                        this.container.style.cursor = 'crosshair';
                    }

                    break;
                case REGULAR_MODE:
                case EDITING_MODE:
                    this.container.style.cursor = 'default';
                    break;
            }


        });
      
    }
    getImportantPoints(target: any) {
        var points = [];
        if (target instanceof Konva.Path) {
            var totalLength = target.getLength();
            var step = totalLength / 5; // 分为5等分，可根据需要调整
            for (var i = 0; i <= 5; i++) {
                var point = target.getPointAtLength(step * i);
                var transform = target.getTransform();
                point = transform.point(point);
                points.push(point);
            }
        } else if (target instanceof Konva.Rect) {
            let rect = target.getClientRect({ relativeTo: this.nodeLayer });
            points = [
                { x: rect.x, y: rect.y },
                { x: rect.x + rect.width, y: rect.y },
                { x: rect.x, y: rect.y + rect.height },
                { x: rect.x + rect.width, y: rect.y + rect.height },
                { x: rect.x + rect.width / 2, y: rect.y },
                { x: rect.x + rect.width / 2, y: rect.y + rect.height },
                { x: rect.x, y: rect.y + rect.height / 2 },
                { x: rect.x + rect.width, y: rect.y + rect.height / 2 },
                { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 },
            ]
        } else if (target instanceof Konva.Circle || target instanceof Konva.Ellipse) {
            let rect = target.getClientRect({ relativeTo: this.nodeLayer });
            points = [
                { x: rect.x + rect.width / 2, y: rect.y },
                { x: rect.x + rect.width / 2, y: rect.y + rect.height },
                { x: rect.x, y: rect.y + rect.height / 2 },
                { x: rect.x + rect.width, y: rect.y + rect.height / 2 },
            ]
        } else if (target instanceof Konva.Star) {
            let star = target;
            // 获取星形的变换矩阵
            const transform = star.getTransform();
            const angleIncrement = (Math.PI * 2) / (star.numPoints() * 2);
            const startAngle = -Math.PI / 2 + angleIncrement;
            for (let i = 0; i < star.numPoints() * 2; i++) {
                const angle = startAngle + angleIncrement * i;
                let radius = star.innerRadius();
                if (i % 2 === 1) {
                    radius = star.outerRadius();
                }
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                let matrixPoint = transform.point({
                    x: x,
                    y: y
                })
                points.push(matrixPoint);
            }
        }
        return points
    }

    /**
     * 监听鼠标事件，进入编辑状态
     */
    private initNodeEdit() {
        let _this = this;
        this.nodeLayer.on('dblclick', (e: any) => {
            if (this.currentMode === REGULAR_MODE) {
                let target = e.target;
                while (target.parent !== this.nodeLayer) target = target.parent;
                if (target instanceof Konva.Text) {
                    this.editText(target, (newText: string) => {
                        let textNode = this.dataModel.getSelectionManager().getSelection()[0];
                        let oldText = textNode.getAttributeValue('text');
                        let attrChange = new AttributeChange(new Map([[textNode, [{ text: oldText }, { text: newText }]]]), this.dataModel);
                        let cmd = new Command([attrChange]);
                        this.dataModel.getUndoRedoManager().execute(cmd);
                    });
                } else if (target instanceof Konva.Image) {
                    this.chooseImage((newImgData: Image) => {
                        let imageNode = this.dataModel.getSelectionManager().getSelection()[0];
                        let oldImgData = imageNode.getAttributeValue('image');
                        let attrChange = new AttributeChange(new Map([[imageNode, [{ image: oldImgData }, { image: newImgData }]]]), this.dataModel);
                        let cmd = new Command([attrChange]);
                        this.dataModel.getUndoRedoManager().execute(cmd);
                        this.currentMode = REGULAR_MODE;
                    });
                } else {
                    let node = this.dataModel.getNodes().find((item: any) => item.getId() === target.attrs.id);
                    if (node instanceof EditableShapeNode) {
                        _this.setMode(EDITING_MODE);
                        node.createRefAnchors(this.config.view.editAnchor);
                        let anchors = node.getRefAnchors();
                        this.drawingLayer.add(...anchors);
                        this.transformer.nodes([]);
                    }
                    this.dataModel.getSelectionManager().setSelection([node.getId()], false);
                }
                
            }
        });
        this.stage.on('click', (e: any) => {
            if (this.currentMode === EDITING_MODE && this.stage === e.target) {
                _this.setMode(REGULAR_MODE);
            }
        });
    }

    /**
     * 监听鼠标事件，完成绘制功能
     */
    private initNodeDraw() {
        let _this = this;
        this.stage.on('mousedown', (e: any) => {
            if (this.currentMode === DRAWING_MODE) {
                this.drawingShape.notifyDrawingAction(this, this.getStageScalePoint(), DRAWING_MOUSE_DOWN, e.evt.button);
            }
        });
        this.stage.on('dblclick', (e: any) => {
            if (this.currentMode === DRAWING_MODE) {
                this.drawingShape.notifyDrawingAction(this, this.getStageScalePoint(), DRAWING_MOUSE_DBL_CLICK, e.evt.button);
            }
        });
        this.stage.on('mousemove', (e: any) => {
          
            if (this.currentMode === DRAWING_MODE) {
                this.setIsSquare(e.evt.shiftKey);
                this.drawingShape.notifyDrawingAction(this, this.getStageScalePoint(), DRAWING_MOUSE_MOVE)
            }
        });
        this.stage.on('mouseup', (e: any) => {
          
            if (this.currentMode === DRAWING_MODE) {
                this.drawingShape.notifyDrawingAction(this, this.getStageScalePoint(), DRAWING_MOUSE_UP, e.evt.button);
            }
        });
        this.stage.on('click', (e: any) => {
            if (this.currentMode === DRAWING_MODE) {
                this.drawingShape.notifyDrawingAction(this, this.getStageScalePoint(), DRAWING_MOUSE_CLICK, e.evt.button);
            }
        });
        this.stage.on('click', (e: any) => {
            if (this.currentMode === DRAWING_MODE) {
                this.drawingShape.notifyDrawingAction(this, this.getStageScalePoint(), DRAWING_MOUSE_CLICK, e.evt.button);
            }
        });
        this.stage?.on('mouseout', (e: any) => {
            if (this.currentMode === DRAWING_MODE) {
                 this.drawingShape.notifyDrawingAction(this, this.getStageScalePoint(), DRAWING_MOUSE_OUT, e.evt.button);
            }
        });


    }
    addEventToNode(konvaNode: any) {
        let _this = this;
        konvaNode.on('mouseenter', (e: any) => {
            switch (this.currentMode) {
                case DRAWING_MODE:
                    _this.currentTarget = e.target;
                    this.container.style.cursor = 'crosshair';
                    let importedPoints = _this.getImportantPoints(e.target);
                    if (importedPoints) {
                        importedPoints.forEach(point => {
                            var pointMark = new Konva.Circle({
                                x: point.x,
                                y: point.y,
                                radius: 4,
                                fill: 'blue',
                                stroke: 'red',

                            });
                            // 添加路径到层
                            this.makerLayer.add(pointMark);
                        });
                    }
                    break;
                case EDITING_MODE:
                    break;
            }
        });
        konvaNode.on('mouseleave', (e: any) => {
            console.log('nodeLayer mouseleave')
            switch (this.currentMode) {
                case DRAWING_MODE:
                    _this.currentTarget = null;
                    _this.makerLayer.destroyChildren();
                    this.container.style.cursor = 'default';
                    break;
            }
        });

    }
    getCurrentTarget() {
        return this.currentTarget;
    }

    /**
     * 监听鼠标事件，节点变换时，同步模型
     */
    private initNodeResize() {
        let _this = this;
        // 设置 Transformer 控件旋转操作时的鼠标样式,未能成功，即使使用了 anchor.off('mouseenter')也只能在第二次生效
        this.transformer.on('mouseenter', function (e) {
            // 处理鼠标进入事件
            _this.transformer.setAttrs({
                anchorStrokeWidth: parseInt(_this.config.selection.transformer.anchorStrokeWidth) + 1, // 锚点边框宽度
            });
        });
        this.transformer.on('mouseleave', function () {
            // 处理鼠标进入事件
            _this.transformer.setAttrs({
                anchorStrokeWidth: _this.config.selection.transformer.anchorStrokeWidth,
            });
        });
        this.transformer.on('transformstart', () => {
            let selectNodes = this.dataModel.getSelectionManager().getSelection();
            //如果resize开始，则停止绘制自动切换到普通模式
            this.setMode(REGULAR_MODE);
            //找到所有的相关连接线
            this.relatedConnectedLinesMap = this.getRelatedConnectedLineMap(selectNodes);
        });
        this.transformer.on('transform', () => {
            this.updateRelatedConnectedLines();

        });
        this.transformer.on('transformend', () => {
            let undoRedoManager = this.dataModel.getUndoRedoManager();
            let selectedNodes = this.dataModel.getSelectionManager().getSelection();
            let relatedConnectedLines = [];
            for (let [node, reasons] of this.relatedConnectedLinesMap) {
                relatedConnectedLines.push(node);
            }
            const mergedNodes = [...selectedNodes, ...relatedConnectedLines];
            let resizeChange = new GeometryChange(mergedNodes, 'resize', this.dataModel);
            let cmd = new Command([resizeChange]);
            undoRedoManager.execute(cmd);
        });
    }
    updateRelatedConnectedLines() {
        for (let [node, reasons] of this.relatedConnectedLinesMap) {
            node.getRef().setAttr('x', 0)
            node.getRef().setAttr('y', 0)
            node.getRef().setAttr('scaleX', 1)
            node.getRef().setAttr('scaleY', 1)
            let from = node.from;
            let to = node.to;
            if (reasons.indexOf('from') != -1) {
                let oldSourcePoint = node.getRef().points();
                let sourceNode = this.stage?.findOne('#' + from.id);
                // let newSourcePoint = sourceNode?.getTransform().point(from.point);
                //考虑到元素在组的情况，所以要获取所有的矩阵变换剔除stage的，因为连接线也在stage上
                let tfWithoutStage = sourceNode.getAbsoluteTransform().copy().multiply(this.stage?.getTransform().copy().invert());
                let newSourcePoint = tfWithoutStage.point(from.point);
                oldSourcePoint[0] = newSourcePoint?.x;
                oldSourcePoint[1] = newSourcePoint?.y;
            }
            if (reasons.indexOf('to') != -1) {
                let oldPoints = node.getRef().points();
                let toNode = this.stage?.findOne('#' + to.id);
                // let newToPoint = toNode?.getTransform().point(to.point);
                let tfWithoutStage = toNode.getAbsoluteTransform().copy().multiply(this.stage?.getTransform().copy().invert());
                let newToPoint = tfWithoutStage.point(to.point);
                oldPoints[2] = newToPoint?.x;
                oldPoints[3] = newToPoint?.y;
            }
        }

        var nodes = this.transformer.nodes();
        this.transformer.nodes(nodes);
        this.nodeLayer.batchDraw();
    }

    /**
     * 监听鼠标事件，节点平移后，同步模型
     */
    private initNodeMove() {
        let _this = this;
        this.transformer.on('dragstart', (e: any) => {
            let selectNodes = this.dataModel.getSelectionManager().getSelection();
            (function loop(nodes) {
                for (let node of nodes) {
                    node.getRef().stopDrag();
                    let autoPlay = node.getAnimationValue('autoPlay');
                    let type = node.getAnimationValue('type');
                    if (autoPlay && type == ROTATE_BY_CENTER) {
                        //如果正在播放动画，在移动过程中要将动画暂停,否则会引起坐标的混乱
                        if (node.getAnimationObj().obj) {
                            node.destroyAnimation();
                        }
                    }
                    if (node instanceof GroupNode) {
                        loop(node.getMembers());
                    }
                    node.getRef().startDrag();
                }
            })(selectNodes);
            //找到所有的相关连接线
            this.relatedConnectedLinesMap = this.getRelatedConnectedLineMap(selectNodes);

        });
        // 监听Transformer的拖动事件
        this.transformer.on('dragmove', (e) => {
            this.updateRelatedConnectedLines();

        });

        this.transformer.on('dragend', (e: any) => {

            let selectNodes = this.dataModel.getSelectionManager().getSelection();
            let undoRedoManager = this.dataModel.getUndoRedoManager();
            //需要看是否有连接线

            let relatedConnectedLines = [];
            for (let [node, reasons] of this.relatedConnectedLinesMap) {
                relatedConnectedLines.push(node);
            }

            const mergedNodes = [...selectNodes, ...relatedConnectedLines];
            let moveChange = new GeometryChange(mergedNodes, 'move', this.dataModel);
            let cmd = new Command([moveChange]);
            undoRedoManager.execute(cmd);
        });
    }
    getRelatedConnectedLineMap(selectNodes: any) {
        let connectedLineNodesMap = new Map();
        let selectNodesIds = [];
        (function loop(nodes) {
            for (let node of nodes) {
                selectNodesIds.push(node.getId());
                if (node instanceof ContainerNode) {
                    loop(node.getMembers());
                }

            }
        })(selectNodes);

        (function loop(nodes) {
            for (let node of nodes) {
                if (node instanceof BaseConnectedLineNode) {
                    let from = node.from;
                    let to = node.to;
                    if (selectNodesIds.indexOf(from.id) != -1) {
                        if (connectedLineNodesMap.has(node)) {
                            connectedLineNodesMap.get(node).push('from');
                        } else {
                            connectedLineNodesMap.set(node, ['from']);
                        }
                    }
                    if (selectNodesIds.indexOf(to.id) != -1) {
                        if (connectedLineNodesMap.has(node)) {
                            connectedLineNodesMap.get(node).push('to');
                        } else {
                            connectedLineNodesMap.set(node, ['to']);
                        }
                    }
                }
                if (node instanceof GroupNode) {
                    loop(node.getMembers());
                }

            }
        })(this.dataModel?.getNodes());
        return connectedLineNodesMap;

    }

    /**
     * 注册右键菜单事件，完成自定义菜单功能
     */
    registerContextMenu(callbackFn) {
        let _this = this;
        this.stage.on('contextmenu', (e: any) => {
            if(_this.getMode()==REGULAR_MODE){
                e.evt.preventDefault();
                callbackFn(e.evt);
            }
        });
    }
    /**
     * 
     * @returns 获取功能函数map
     */
    getFnMap() {
        let _this = this;
        let fnMap = new Map();
        fnMap.set('undo', () => {
            _this.undo()
        });
        fnMap.set('redo', () => {
            _this.redo()
        });
        //层序函数
        fnMap.set('orderTop', () => {
            _this.order('top')
        });
        fnMap.set('orderBottom', () => {
            _this.order('bottom')
        });
        fnMap.set('orderUp', () => {
            _this.order('up')
        });
        fnMap.set('orderDown', () => {
            _this.order('down')
        });
        //对齐函数
        fnMap.set('alignLeft', () => {
            _this.align('left')
        });
        fnMap.set('alignRight', () => {
            _this.align('right')
        });
        fnMap.set('alignTop', () => {
            _this.align('top')
        });
        fnMap.set('alignBottom', () => {
            _this.align('bottom')
        });
        fnMap.set('alignVertical', () => {
            _this.align(DIRECTION_VERTICAL)
        });
        fnMap.set('alignHorizontal', () => {
            _this.align(DIRECTION_HORIZONTAL)
        });


        //剪切板函数
        fnMap.set('copy', () => {
            _this.copy()
        });
        fnMap.set('cut', () => {
            _this.cut()
        });
        fnMap.set('paste', () => {
            _this.paste()
        });

        fnMap.set('delete', () => {
            _this.deleteNodes()
        });
        fnMap.set('group', () => {
            _this.group()
        });
        fnMap.set('unGroup', () => {
            _this.unGroup()
        });
        return fnMap;
    }
    /**
     * 
     * @returns 获取功能状态map
     */
    getFnState() {
        let _this = this;
        let undoRedoManager = this.dataModel?.undoRedoManager;
        let fnMap = new Map();
        let selectionCount = this.getSelection().length;
        fnMap.set('undo', undoRedoManager.canUndo() ? true : false);
        fnMap.set('redo', undoRedoManager.canRedo() ? true : false);
        fnMap.set('orderTop', _this.getSelection().length == 1 ? true : false);
        fnMap.set('orderBottom', _this.getSelection().length == 1 ? true : false);
        fnMap.set('orderUp', _this.getSelection().length == 1 ? true : false);
        fnMap.set('orderDown', _this.getSelection().length == 1 ? true : false);
        fnMap.set('alignLeft', _this.getSelection().length > 1 ? true : false);
        fnMap.set('alignRight', _this.getSelection().length > 1 ? true : false);
        fnMap.set('alignTop', _this.getSelection().length > 1 ? true : false);
        fnMap.set('alignBottom', _this.getSelection().length > 1 ? true : false);
        fnMap.set('alignVertical', _this.getSelection().length > 2 ? true : false);
        fnMap.set('alignHorizontal', _this.getSelection().length > 2 ? true : false);
        fnMap.set('copy', _this.getSelection().length > 0 ? true : false);
        fnMap.set('cut', _this.getSelection().length > 0 ? true : false);
        fnMap.set('paste', _this.copyNodes.length > 0 ? true : false);
        fnMap.set('delete', _this.getSelection().length > 0 ? true : false);
        fnMap.set('group', _this.getSelection().length > 1 ? true : false);
        fnMap.set('unGroup', _this.canUnGroup() ? true : false);
        fnMap.set('constructSymbol', selectionCount > 0 && this.withoutSymbolNode() ? true : false);
        fnMap.set('deconstructSymbol', this.canDeconstructSymbol() ? true : false);
        return fnMap;
    }

    withoutSymbolNode() {
        let withoutSymbolNode=true;
        let selections=this.dataModel?.getSelectionManager().getSelection();
        (function loop(nodes) {
            for (let node of nodes) {
                if(node instanceof GroupNode){
                    loop(node.getMembers());
                }else{
                    if(node instanceof SymbolNode){
                        withoutSymbolNode=false
                    }
                }
               
            }
        })(selections);
        return withoutSymbolNode;
    }
    private canDeconstructSymbol() {
        let selectionCount = this.getSelection().length;
        if (selectionCount == 1) {
            let selection = this.dataModel?.getSelectionManager().getSelection()[0];
            return selectionCount === 1 && (selection instanceof SymbolNode);
        }
    }

    /**
     * 当前是否可以解组
     */
    private canUnGroup() {
        if (this.getSelection().length == 1) {
            let selected = this.getSelection()[0];
            if (selected.className == "GroupNode") {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    /**
     * 为画布添加快捷键的监听
     */
    onKeyDown(e: Event & {
        key: string
        ctrlKey: boolean
    }) {
        e.preventDefault();
        e.stopPropagation();
        const isCtrlKey = e.ctrlKey;
        const isShiftKey = e.shiftKey;
        const keyboard = this.config.selection?.keyboard
        if (keyboard?.enabled === false) {
            return
        }
        const nodes = this.transformer.nodes();
        const movingSpaces = keyboard?.movingSpaces ?? 2
        function getRealKey() {
            let realKey = e.key;
            if(isCtrlKey && isShiftKey){
                realKey = 'Control+Shift+' + realKey
            }else{
                if (isCtrlKey) {
                    realKey = 'Control+' + realKey
                }
                if (isShiftKey) {
                    realKey = 'Shift+' + realKey
                }
            }
           
            return realKey
        }
        let realKey = getRealKey(e.key);
        if (keyboard?.map?.selectAll?.includes(realKey)) {
            this.selectAll()
        }
        if (keyboard?.map?.toSelectMode?.includes(realKey)) {
            this.setMode(REGULAR_MODE);
        }
       
        if (this.transformer.getAttr('visible') === false || nodes.length === 0) {
            return
        }

        if (keyboard?.map?.delete?.includes(realKey)) {
            this.deleteNodes();

        }

        if (keyboard?.map?.moveLeft?.includes(realKey)) {
            this.move('left', movingSpaces);
        }

        if (keyboard?.map?.moveRight?.includes(realKey)) {
            this.move('right', movingSpaces);
        }

        if (keyboard?.map?.moveUp?.includes(realKey)) {
            this.move('up', movingSpaces);
        }

        if (keyboard?.map?.moveDown?.includes(realKey)) {
            this.move('down', movingSpaces);
        }
        if (keyboard?.map?.moveLeftSlow?.includes(realKey)) {
            this.move('left', movingSpaces/2);
        }

        if (keyboard?.map?.moveRightSlow?.includes(realKey)) {
            this.move('right', movingSpaces/2);
        }

        if (keyboard?.map?.moveUpSlow?.includes(realKey)) {
            this.move('up', movingSpaces/2);
        }

        if (keyboard?.map?.moveDownSlow?.includes(realKey)) {
            this.move('down', movingSpaces/2);
        }

       
        if (keyboard?.map?.deselect?.includes(realKey)) {
            this.deselect()
        }
        if (keyboard?.map?.copy?.includes(realKey)) {
            this.copy()
        }
        if (keyboard?.map?.paste?.includes(realKey)) {
            this.paste()
        }
        if (keyboard?.map?.inverseSelect?.includes(realKey)) {
            this.inverseSelect()
        }
        if (keyboard?.map?.group?.includes(realKey)) {
            this.group()
        }
        if (keyboard?.map?.undo?.includes(realKey)) {
            this.undo()
        }
        if (keyboard?.map?.redo?.includes(realKey)) {
            this.redo()
        }
    }

    deselect() {
        this.dataModel.getSelectionManager().setSelection([], true);
    }

    /**
     * 初始化用于绘制形状的类
     */
    private initShapeModule() {
        this.shapeModules.push(new LineShape());
        this.shapeModules.push(new ArrowShape());
        this.shapeModules.push(new ConnectedLineShape());
        this.shapeModules.push(new StraightConnectedLineShape());

        this.shapeModules.push(new PolylineShape());
        this.shapeModules.push(new PolylineArrowShape());
        this.shapeModules.push(new PenShape())
    }

    private getShapeModule(shapeName: string) {
        return this.shapeModules.find(item => item.handleTagName === shapeName);
    }

    /**
     * 监听选中节点的变化
     * @param callback 
     */
    onSelectionChanged(callback: any) {
        this.dataModel.onSelectionChanged(callback);
    }

    /**
     * 监听功能可用状态
     * @param callback 
     */
    onFnStateChanged(callback: any) {
        this.dataModel.onFnStateChanged(callback);
    }


    /**
     * 监听模型变换
     * @param callback 模型变化的回调函数
     */
    onModelChanged(callback: any) {
        this.dataModel.onModelChanged(callback);
    }

    /**
     * 监听节点属性变化
     * @param callback 回调函数
     */
    onNodeAttributeChange(callback: any) {
        this.dataModel.addListener(EVENT_TYPE.NODE_ATTRIBUTE_CHANGE, callback);
    }

    /**
     * 监听节点的事件变化
     * @param callback 回调函数
     */
    onNodeEventsChange(callback: any) {
        this.dataModel.addListener(EVENT_TYPE.NODE_EVENTS_CHANGE, callback);
    }

    /**
     * 监听节点的变量的变化
     * @param callback 回调函数
     */
    onNodeVariableChange(callback: any) {
        this.dataModel.addListener(EVENT_TYPE.NODE_VARIABLE_CHANGE, callback);
    }

    onNodeAnimationChange(callback: any) {
        this.dataModel.addListener(EVENT_TYPE.NODE_ANIMATION_CHANGE, callback);
    }

    /**
     * 复制操作
     * @param nodeIds 需要复制的节点id数组，如为空，则为当前画布选中节点
     */
    copy(nodeIds?: any) {
        this.clearClipboard()
        let operateNodes = this.getOperateNodes(nodeIds);
        if (operateNodes.length == 0) {
            console.warn(GRAPH_EDITOR_WARNING + "未找到要操作的节点,不能执行copy操作")
        } else {
            this.pasteCount = 1;
            this.copyNodes = operateNodes;
            this.copyNodes.forEach((item: any) => {
                let cloneNode = item.clone();
                this.clipboardContent.push(cloneNode);
            })
        }
    }
    /**
     * 清空剪切板
     */
    private clearClipboard() {
        this.clipboardContent = [];
    }
    /**
     * 剪切
     * @param nodeIds 需要复制的节点id数组，如为空，则为当前画布选中节点
     */
    cut(nodeIds?: any) {
        this.copy(nodeIds);
        this.deleteNodes(nodeIds);

    }

    private getOperateNodes(nodeIds: any) {
        return nodeIds ? this.dataModel.getNodes().filter((item) => nodeIds.indexOf(item.id) != -1) : this.dataModel.getSelectionManager().getSelection();
    }

    /**
     * 粘贴操作
    */
    paste() {
        this.pasteCount = this.pasteCount + 1;
        let pasteNodes: any = [];
        this.clipboardContent.forEach((item: any) => {
            let cloneNode = item.clone(true);
            cloneNode.setAttributeValues({
                x: parseInt(item.getAttributeValue('x')) + 10 * this.pasteCount,
                y: parseInt(item.getAttributeValue('y')) + 10 * this.pasteCount
            })
            pasteNodes.push(cloneNode);
        })
        let nodeChange = new NodeChange(pasteNodes, 'add', this.dataModel);
        let cmd = new Command([nodeChange]);
        this.dataModel.undoRedoManager.execute(cmd);
    }

    /**
    * 撤销操作
    */
    undo() {
        this.dataModel.getUndoRedoManager().undo();
    }

    /**
     * 重做操作
     */
    redo() {
        this.dataModel.getUndoRedoManager().redo();
    }

    /**
     * 微调功能
     * @param direction 移动的方向
     * @param step 调整距离
     */
    move(direction: MoveDirection, step?: number = 1, nodeIds?: Array<string>) {
        let undoRedoManager = this.dataModel.getUndoRedoManager();
        let selectNodes;
        if (nodeIds) {
            selectNodes = this.dataModel.nodes.filter(item => nodeIds.indexOf(item.id) != -1)
        } else {
            selectNodes = this.dataModel.getSelectionManager().getSelection();
        }

        for (let item of selectNodes) {
            let shapeNode = item.getRef();
            let transform = shapeNode.getTransform();
            let newTransform = new Konva.Transform();
            let translateFactor: any;
            switch (direction) {
                case 'up':
                    translateFactor = { x: 0, y: -step };
                    break;
                case 'down':
                    translateFactor = { x: 0, y: step };
                    break;
                case 'left':
                    translateFactor = { x: -step, y: 0 };
                    break;
                case 'right':
                    translateFactor = { x: step, y: 0 };
                    break;
            }
            const stageTransform = this.stage.getAbsoluteTransform().copy();
            stageTransform.invert();
            translateFactor = stageTransform.point(translateFactor);

            newTransform.translate(translateFactor.x, translateFactor.y);
            let cloneOldTransform = transform.copy();
            newTransform.multiply(cloneOldTransform);
            let newTransformDeCompose = newTransform.decompose();
            shapeNode.setAttrs(newTransformDeCompose);
        }
        let resizeChange = new GeometryChange(selectNodes, 'move', this.dataModel);
        let cmd = new Command([resizeChange]);
        undoRedoManager.execute(cmd);
    }

    /**
     * 根据网格的配置，初始化网格
     */
    private initGrid() {
        let { view: { grid: gridConfig } } = this.config;
        this.gridLayer.destroyChildren();
        let show = gridConfig.show;
        let distance = parseInt(gridConfig.distance);
        let canvasWidth = this.stage.attrs.width;
        let canvasHeight = this.stage.attrs.height;
        for (let i = 0; i < canvasWidth; i = i + distance) {
            var gridLine = new Konva.Line({
                points: [i, 0, i, canvasHeight],
                stroke: gridConfig.color,
                strokeWidth: 1
            });
            this.gridLayer.add(gridLine)
        }
        for (let i = 0; i < canvasHeight; i = i + distance) {
            var gridLine = new Konva.Line({
                points: [0, i, canvasWidth, i],
                stroke: gridConfig.color,
                strokeWidth: 1
            });
            this.gridLayer.add(gridLine)
        }
        this.gridLayer.visible(show);
    }

    /**
     * 添加节点
     * @param opt 要添加节点的json数据
     * @example
     * editor.addNode({
     *    className：'RectNode'
     *    attributes:{
     *       x:100,
     *       y:200,
     *       opacity:0.5,
     *       width:200,
     *       height:60
     *    }
     * })
     */
    // addNode(opt: NodeConfig) {
    //     console.log("addNode...............",opt);
    //     let defaultStyleConfig = this.config.style;
    //     let wholeStyle = { ...defaultStyleConfig, ...opt.attributes };
    //     opt.attributes = wholeStyle;
    //     let imageInfo;
    //     if(opt.attributes['image']){
    //         imageInfo=opt.attributes['image'];
    //         delete opt.attributes['image']
    //     }
    //     let node = Node.create(opt);
    //     if (node) {
    //         if(node instanceof ImageNode){
    //              if(imageInfo){
    //                 node.setAttributeValue('image',undefined);
    //                 let nodeChange = new NodeChange([node], 'add', this.dataModel);
    //                 let attrChanges=this.getSetNodesAttributesChange([node], {'image':imageInfo}, this.dataModel)
    //                 let cmd = new Command([nodeChange,...attrChanges]);
    //                 this.dataModel.undoRedoManager.execute(cmd); 
    //              }else{
    //                 let nodeChange = new NodeChange([node], 'add', this.dataModel);
    //                 let cmd = new Command([nodeChange]);
    //                 this.dataModel.undoRedoManager.execute(cmd); 
    //              }
    //         }else{
    //             let nodeChange = new NodeChange([node], 'add', this.dataModel);
    //             let cmd = new Command([nodeChange]);
    //             this.dataModel.undoRedoManager.execute(cmd);
    //         }

    //     } else {
    //         console.warn(GRAPH_EDITOR_WARNING + "未找到对应的形状");
    //     }

    // }
    addNode(opt: NodeConfig) {
        let defaultStyleConfig = this.config.style;
        let wholeStyle = { ...defaultStyleConfig, ...opt.attributes };
        opt.attributes = wholeStyle;
        let node = Node.create(opt);
        if (node) {
            let nodeChange = new NodeChange([node], 'add', this.dataModel);
            let cmd = new Command([nodeChange]);
            this.dataModel.undoRedoManager.execute(cmd);
        } else {
            console.warn(GRAPH_EDITOR_WARNING + "未找到对应的形状");
        }

    }

    /**
     * 实例化图元到数据模型
     * @param opt 图元的json信息
     */
    addSymbolNode(opt: NodeConfig) {
        console.log("addSymbolNode",opt);
        let node = Node.create(opt);
        let cloneNode = node.clone(true);
        if (cloneNode) {
            let nodeChange = new NodeChange([cloneNode], 'add', this.dataModel);
            let cmd = new Command([nodeChange]);
            this.dataModel.undoRedoManager.execute(cmd);
        } else {
            console.warn(GRAPH_EDITOR_WARNING + "未找到对应的图元");
        }


    }


    /**
     * 根据鼠标的位置，将节点加入到模型
     * @param e 鼠标事件
     * @param node 添加的节点
     * @example
     * editor.dropShape(event,{
     *   className：'RectNode'
     *    attributes:{
     *      opacity:0.5,
     *      width:200,
     *      height:60
     *    }
     * })
     */
    dropShape(e: DragEvent, node: NodeConfig) {
        e.preventDefault();
        //将屏幕坐标转为文档坐标
        this.stage.setPointersPositions(e);
        let dropPos = this.getStageScalePoint();
        let offsetX = Utils.toDecimal(dropPos.x);
        let offsetY = Utils.toDecimal(dropPos.y);
        if (node) {
            if (node.attributes) {
                node.attributes.x = offsetX;
                node.attributes.y = offsetY;
            } else {
                node.attributes = {
                    x: offsetX,
                    y: offsetY
                }
            }
            this.addNode(node);
        }
    }
    /**
     * 获取文档坐标
     * @param e 鼠标事件
     */
    getPointerPosition(e:MouseEvent){
        this.stage.setPointersPositions(e);
        let dropPos = this.getStageScalePoint();
        return dropPos;
    }

    /**
     * 根据鼠标的位置，实例化图元加入到模型
     * @param e 拖拽事件
     * @param node symbol的json数据
     */
    dropSymbol(e: DragEvent, node: NodeConfig) {
        e.preventDefault();
        //将屏幕坐标转为文档坐标
        this.stage.setPointersPositions(e);
        let dropPos = this.getStageScalePoint();
        let offsetX = Utils.toDecimal(dropPos.x);
        let offsetY = Utils.toDecimal(dropPos.y);
        if (node) {
            if (node.attributes) {
                node.attributes.x = node.attributes.x ? offsetX + node.attributes.x : offsetX;
                node.attributes.y = node.attributes.y ? offsetY + node.attributes.y : offsetY;
            } else {
                node.attributes = {
                    x: offsetX,
                    y: offsetY
                }
            }

            this.addSymbolNode(node);
        }
    }

    /**
     * 为画布监听模型的变化，如节点的添加或删除
     */
    private addDataModelListeners() {
        let _this = this;
        this.dataModel.addListener(EVENT_TYPE.ADD_KONVA_NODE, (sender: any, event: any) => {
            let node = event.getProperty('node');
            let nodeIndex = event.getProperty('zIndex');
            this.nodeLayer.add(node);
            const connectable = this.config.drawing?.connectable
            if (connectable) {
                this.addEventToNode(node);
            }

            if (nodeIndex != -1) {
                node.zIndex(nodeIndex);
            }
        });
        this.dataModel.addListener(EVENT_TYPE.SELECTION_KONVA_NODE_CHANGE, (sender: any, event: any) => {
            let nodes = event.getProperty('nodes');
            let konvaNodes = [];
            for (let node of nodes) {
                let nodeId = node.getId();
                let konvaNode = this.stage.findOne('#' + nodeId);
                if (konvaNode) {
                    konvaNodes.push(konvaNode);
                }
            }
            this.transformer.nodes(konvaNodes);
        });
    }



    private editText(textNode: Konva.Text, callback: Function) {
        let stage = textNode.visible(false).getStage();
        let container = stage!.container().querySelector('.konvajs-content');
        if (container === null || !(container instanceof HTMLDivElement)) return;
        container.style.overflow = 'clip';
        let editor = container.appendChild(document.createElement('div'));
        editor.contentEditable = 'true';
        editor.style.position = 'absolute';
        editor.style.zIndex = '999';
        editor.style.left = '0px';
        editor.style.top = '0px';
        editor.style.margin = '0px';
        editor.style.padding = textNode.padding() + 'px';
        editor.style.border = 'none';
        editor.style.background = 'transparent';
        editor.style.color = textNode.fill() || '#000';
        editor.style.cursor = 'text';
        editor.style.outline = 'none';
        editor.style.fontFamily = textNode.fontFamily();
        editor.style.fontVariant = textNode.fontVariant();
        let fontSize = textNode.fontSize();
        editor.style.fontSize = fontSize + 'px';
        editor.style.lineHeight = fontSize * textNode.lineHeight() + 'px';
        let fontStyle = textNode.fontStyle();
        if (fontStyle.includes('bold')) editor.style.fontWeight = 'bold';
        if (fontStyle.includes('italic')) editor.style.fontStyle = 'italic';
        editor.style.textDecoration = textNode.textDecoration();
        editor.style.transformOrigin = 'top left';
        editor.style.transform = 'matrix(' + textNode.getAbsoluteTransform().m.join(',') + ')';
        editor.innerText = textNode.text();
        editor.addEventListener('keydown', function (event) {
            event.stopPropagation();
        });
        editor.addEventListener('keyup', function (event) {
            event.stopPropagation();
        });
        editor.addEventListener('mousedown', function (event) {
            event.stopPropagation();
        });
        editor.addEventListener('mousemove', function (event) {
            event.stopPropagation();
        });
        editor.addEventListener('mouseup', function (event) {
            event.stopPropagation();
        });
        editor.addEventListener('input', () => {
            textNode.width(editor.offsetWidth);
            textNode.height(editor.offsetHeight);
        });
        editor.addEventListener('blur', () => {
            textNode.visible(true);
            textNode.text(editor.innerText);
            textNode.width('auto');
            textNode.height('auto');
            callback(editor.innerText);
            editor.remove();
            if (container instanceof HTMLDivElement) {
                container.style.overflow = 'none';
            }
        });
        editor.focus();
        let range = document.createRange();
        let lastChar = editor.lastChild;
        if (lastChar !== null) {
            range.setStartAfter(lastChar);
            range.setEndAfter(lastChar);
        }
        let sel = document.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
    }

    /**
     * 插入图片
     * @example
     * editor.insertImage()
     */
    public insertImage() {
        let _this = this;
        this.chooseImage((imgObj,name) => {
            this.addNode({
                className: 'ImageNode',
                attributes: {
                    image: imgObj,
                    name:name,
                    x: 50,
                    y: 50,
                    width: 200,
                    height: 200,

                }
            });
        })
    }

    private chooseImage(callback: Function) {
        let input = document.createElement('input');
        input.style.display = 'none';
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.addEventListener('change', () => {
            let file = input.files?.[0];
            if (file && file.type.match('image.*')) {
                let reader = new FileReader();
                reader.addEventListener("load", () => {
                    console.log(file);
                    callback(reader.result,file?.name.split(".")[0]);
                });
                reader.readAsDataURL(file);
            } else {
                console.log("file error");
            }
            input.remove();
        });
        document.body.appendChild(input).click();
    }

    /**
     * 将当前鼠标上的点转为画布上的点
     * @returns 画布上的点
     */
    private getStageScalePoint() {
        let point: any = this.stage.getPointerPosition();
        let transform = this.stage.getAbsoluteTransform().copy().invert();
        return transform.point(point);
    }

    /**
     * 获取数据模型
     * @returns 数据模型
     */
    getDataModel() {
        return this.dataModel;
    }

    /**
     * 获取节点id和需要移动距离的映射表
     * @param idToBoundRect 节点和外围矩形的映射表
     * @param style 取值'x'或'y'，x表示水平方向，y表垂直方向
     * @returns 
     */
    private getNodeIdToDistanceXorY(idToBoundRect: any, style: string) {
        let nodeIdToDis = new Map();
        let nodeIdToXorY = new Map();
        idToBoundRect.forEach(function (value: any, key: any) {
            nodeIdToXorY.set(key, value[style])
        });
        let nodeIdToXorYArray = Array.from(nodeIdToXorY);
        nodeIdToXorYArray = nodeIdToXorYArray.sort(function (a: any, b: any) {
            return a[1] - b[1];
        });
        let allXorYs = nodeIdToXorYArray.map(item => item[1]);
        var len = allXorYs.length;
        var wholeWidthOrHeight = allXorYs[len - 1] - allXorYs[0];
        var lastElementId = nodeIdToXorYArray[len - 1][0];
        idToBoundRect.forEach(function (value: any, key: any) {
            if (key != lastElementId) {
                if (style == 'x') {
                    wholeWidthOrHeight = wholeWidthOrHeight - (value.width);
                } else {
                    wholeWidthOrHeight = wholeWidthOrHeight - (value.height);
                }

            }
        });
        var eachDis = wholeWidthOrHeight / (len - 1);
        for (let i = 0; i < allXorYs.length; i++) {
            var id = nodeIdToXorYArray[i][0];
            var distanceXorY = 0;
            if (i == 0) {
                nodeIdToDis.set(id, 0.00);
            } else {
                for (let j = 0; j < i; j++) {
                    var bbox = idToBoundRect.get(nodeIdToXorYArray[j][0]);
                    if (style == 'x') {
                        distanceXorY = distanceXorY + (bbox.width);
                    } else {
                        distanceXorY = distanceXorY + (bbox.height);
                    }
                }
                distanceXorY = i * eachDis + distanceXorY;
                nodeIdToDis.set(id, distanceXorY);
            }
        }
        return nodeIdToDis;
    }

    /**
    * 对齐操作
    * @param direction 对齐的方向
    * @param nodeIds 要对齐的节点id数组，如果为空，则默认对齐选中元素
    */
    align(direction: AlignDirection, nodeIds?: any) {
        let undoRedoManager = this.dataModel.getUndoRedoManager();
        let selectNodes = this.getOperateNodes(nodeIds);
        let idToBoundRect = new Map();
        let rectBounds = [];
        for (let item of selectNodes) {
            let shapeNode = this.stage.findOne('#' + item.getId());
            let rectBound = shapeNode.getClientRect();
            rectBounds.push(rectBound);
            idToBoundRect.set(item.getId(), rectBound);
        }
        let unionRect = Utils.getUnionRect(rectBounds);
        let initDistanceX = unionRect.x;
        let initDistanceY = unionRect.y;
        let nodeIdToDistance: any;
        if (direction == DIRECTION_HORIZONTAL) {
            nodeIdToDistance = this.getNodeIdToDistanceXorY(idToBoundRect, 'x');
        } else if (direction == DIRECTION_VERTICAL) {
            nodeIdToDistance = this.getNodeIdToDistanceXorY(idToBoundRect, 'y');
        }
        for (let item of selectNodes) {
            let id = item.getId();
            let bbox = idToBoundRect.get(id);
            let shapeNode = this.stage.findOne('#' + item.getId());
            let transform = shapeNode.getTransform();
            let newTransform = new Konva.Transform();
            let translateFactor: any;
            switch (direction) {
                case DIRECTION_LEFT:
                    translateFactor = { x: unionRect.x - bbox.x, y: 0 };
                    break;
                case DIRECTION_RIGHT:
                    translateFactor = { x: unionRect.maxX - (bbox.x + bbox.width), y: 0 };
                    break;
                case DIRECTION_TOP:
                    translateFactor = { x: 0, y: unionRect.y - bbox.y };
                    break;
                case DIRECTION_BOTTOM:
                    translateFactor = { x: 0, y: unionRect.maxY - (bbox.y + bbox.height) };
                    break;
                case DIRECTION_HORIZONTAL:
                    let distance = nodeIdToDistance.get(id);
                    let addValue = (parseFloat(initDistanceX) + parseFloat(distance) - bbox.x);
                    translateFactor = { x: addValue, y: 0 };
                    break;
                case DIRECTION_VERTICAL:
                    let distanceY = nodeIdToDistance.get(id);
                    let addValueY = (parseFloat(initDistanceY) + parseFloat(distanceY) - bbox.y);
                    translateFactor = { x: 0, y: addValueY };
                    break;
            }
            const stageTransform = this.stage.getAbsoluteTransform().copy();
            stageTransform.invert();
            translateFactor = stageTransform.point(translateFactor);
            newTransform.translate(translateFactor.x, translateFactor.y);
            let cloneOldTransform = transform.copy();
            newTransform.multiply(cloneOldTransform);
            let newTransformDeCompose = newTransform.decompose();
            shapeNode.setAttrs(newTransformDeCompose);
        }
        let resizeChange = new GeometryChange(selectNodes, 'resize', this.dataModel);
        let cmd = new Command([resizeChange]);
        undoRedoManager.execute(cmd);
    }

    /**
     * 调整层序
     * @param direction 调整层序的方向,枚举值：
     *    'up' :上移一层
     *    'down':下移一层
     *    'top':顶层
     *    'bottom'：底层
     */
    order(direction: OrderDirection, nodeId?: string) {
        let undoRedoManager = this.dataModel.getUndoRedoManager();
        let selectNode = this.getOperateNode(nodeId);
        if (selectNode) {
            if (orderDirection.includes(direction)) {
                let orderChange = new OrderChange(selectNode, direction, this.getDataModel());
                let cmd = new Command([orderChange]);
                undoRedoManager.execute(cmd);
            } else {
                console.warn(GRAPH_EDITOR_WARNING + "不识别的层序设置")
            }

        } else {
            console.warn(GRAPH_EDITOR_WARNING + "未找到要调整层序的节点")
        }
    }



    /**
     * 绘制形状
     * @param shapeName 枚举值：
     *  line:直线
     *  polyline：折线
     *  pen：画笔
     *  lineArrow：箭头
     *  polylineArrow: 折线箭头
     *  
     */
    drawShape(shapeName: string) {
        let shape = this.getShapeModule(shapeName);
        if (shape) {
            this.drawingShape = shape;
            this.setMode(DRAWING_MODE);
            if (shape instanceof BaseConnectedLineShape) {
                this.setSubMode(DRAWING_MODE_SUB_CONNECTED_LINE);
            }

        }

    }

    /**
     * 停止绘制模式
     */
    stopDrawing() {
        //停止绘制模式
        this.setMode(REGULAR_MODE);
    }


    getHelpLayer() {
        return this.helpLayer;
    }
    getDrawingLayer() {
        return this.drawingLayer;
    }

    /**
     * 设置模式
     * @param mode 
     */
    private setMode(mode: string) {
        this.currentMode = mode;
        //如果有绘制到一半的东西，需要删除
        this.drawingLayer.destroyChildren();
        switch(mode){
            case REGULAR_MODE:
                this.nodeLayer.listening(true);
                this.container.style.cursor = 'default';
                break;
            case EDITING_MODE:
            case DRAWING_MODE:
                this.nodeLayer.listening(false)
                break;
        }
    }

    private getMode(){
        return this.currentMode;
    }

    private setSubMode(subMode: string) {
        this.subMode = subMode;
    }



    /**
     * 设置画布的宽度和高度
     * @param width 画布宽度
     * @param height 画布高度
     */
    setSize(width: number, height: number) {
        this.width = width;
        this.height = height;
        let scale = this.stage.getAttr('scaleX');
        this.stage.setAttr('width', width * scale);
        this.stage.setAttr('height', height * scale);
        this.gridLayer.destroyChildren();
        this.initGrid();
    }

    /**
     * 获取当前画布的宽度和高度
     * @returns 宽度和高度
     */
    getSize(): Dimensions {
        return {
            width: this.stage.attrs.width,
            height: this.stage.attrs.height
        }
    }

    /**
     * 将当前图形转成JSON对象
     * @isArray 为true,则以数组的方式对JSON对象进行压缩
     * @returns 当前图形的JSON对象
     */
    private toObject(isArray: boolean = false) {
        let graphObj = {
            width: this.width,
            height: this.height,
            backgroundColor: this.getBackgroundColor(),
            name: this.name,
            model: this.dataModel.toObject(isArray),
        };
        return graphObj;
    }

    /**
     * 将当前画布的信息序列化
     * @returns 序列后的JSON字符串
     */
    toJSON(isArray: boolean = false) {

        return JSON.stringify(this.toObject(isArray));
    }



    /**
     * 将当前画布内容转成Image对象
     * @param callbackFn 转换完成后的回调函数
     * @example
     * graphEditor.toImage((img: any) => {
     * })
     */
    toImage(callbackFn: any) {
        this.nodeLayer.toImage({
            callback(img: any) {
                callbackFn.apply(this, [img]);
            }
        });
    }


    /**
     * 设置图的名称
     * @param name 名称
     */
    setName(name: string) {
        this.name = name;
    }

    /**
     * 获取图的名称
     */
    getName() {
        return this.name;
    }

    /**
     * 添加变量
     * @param name 变量名称
     * @param variable 变量对象
     * @param toModel 是否为整个数据模型设置变量，为true，则变量绑定到整个模型，为false则将变量绑定到当前选中节点
     * @example
     * var variable =
     * {
     *    defaultVal:'变量默认值',//必填
     *    type:'integer'//可选
     * };
     * graphEditor.addVariable('变量1',variable)
     */
    addVariable(name: string, variable: any, nodeId?: string, toModel: boolean = false) {
        if (toModel) {
            //this.dataModel.addVariable(name, variable);
        } else {
            if (name.trim() == "") {
                console.warn(GRAPH_EDITOR_WARNING + '变量名称不能为空');
            } else {
                if (variable.type) {
                    let operateNode = this.getOperateNode(nodeId);
                    if (operateNode) {
                        operateNode.addVariable(name, variable);
                    } else {
                        console.warn(GRAPH_EDITOR_WARNING + '未找到设置变量的节点');
                    }
                } else {
                    console.warn(GRAPH_EDITOR_WARNING + '变量类型不能为空');
                }

            }

        }
    }
    /**
     * 更新变量
     * @param name 新的变量名称
     * @param variable 变量值
     * @param oldVariableName 原来的变量名称
     * @param nodeId 需要更新变量的节点
       @param toModel 是否为整个数据模型设置变量，为true，则变量绑定到整个模型，为false则将变量绑定到当前选中节点
     * @example
     *  graphEditor.updateVariable('变量2', {
     *      type: 'string',
     *      defaultVal: 6
     *   }, '变量3');
     * 
     */
    updateVariable(name: string, variable: any, oldVariableName?: string, nodeId?: string, toModel: boolean = false) {
        if (toModel) {
            // this.dataModel.updateVariable(name, variable, oldVariableName);
        } else {
            let operateNode = this.getOperateNode(nodeId);
            if (operateNode) {
                operateNode.updateVariable(name, variable, oldVariableName);
            } else {
                console.log(GRAPH_EDITOR_WARNING + '未找到设置变量的节点');
            }
        }
    }

    /**
     * 获取节点所有的变量
     * @param nodeId 
     */
    getVariables(nodeId?: string) {
        let operateNode = this.getOperateNode(nodeId);
        if (operateNode) {
            return JSON.parse(JSON.stringify(operateNode.getVariables()));
        } else {
            console.log(GRAPH_EDITOR_WARNING + '未找到要获取变量的节点');
        }
    }

    /**
     * 获取节点指定的变量
     * @param name 变量名称
     * @param nodeId 节点的id
     */
    getVariable(name: string, nodeId?: string) {
        let operateNode = this.getOperateNode(nodeId);
        if (operateNode) {
            if (operateNode.getVariable(name)) {
                return JSON.parse(JSON.stringify(operateNode.getVariable(name)));
            }
        } else {
            console.log(GRAPH_EDITOR_WARNING + '未找到要获取变量的节点');
        }
    }

    /**
     * 删除指定名称的变量
     * @param name 变量名称
     * @param toModel 是否是删除模型上的变量
     * @param nodeId 需要操作的节点
     */
    deleteVariable(name: string, nodeId?: string, toModel?: boolean = false) {
        if (toModel) {
            // this.dataModel.deleteVariable(name);
        } else {
            let operateNode = this.getOperateNode(nodeId);
            if (operateNode) {
                operateNode.deleteVariable(name);
            } else {
                console.log(GRAPH_EDITOR_WARNING + '未找到删除变量的节点');
            }
        }
    }



    /**
     * 设置节点的属性
     * @param attrValues JSON对象
     * @example
     *  graphEditor.setAttributeValues({
     *  'fill':'red'
     *   },ids);
     * 
     */
    setAttributeValues(attrValues: any, nodeIds?: any) {
        let selectNodes = this.getOperateNodes(nodeIds);
        if (selectNodes) {
            this.setNodesAttributes(selectNodes, attrValues, true);
        } else {
            console.warn(GRAPH_EDITOR_WARNING + "未找到要操作的节点")
        }

    }
    /**
     * 设置节点的属性
     * @param key 属性名称
     * @param val 属性值
     * @param nodeIds 操作节点id数组，如果为空，则默认为画布选中元素
     *  @example
     *  graphEditor.setAttributeValue('fill','orange',ids);
     */
    setAttributeValue(key: string, val: any, nodeIds?: any) {
        let attr = {};
        attr[key] = val;
        this.setAttributeValues(attr, nodeIds);
    }


    /**
     * 成组
     * @param nodeIds 需要成组的节点，如果为空，则取当前画布上被选中的节点
     */
    group(nodeIds?: any) {
        let selectedNodes = this.getOperateNodes(nodeIds);
        if (selectedNodes.length > 1) {
            this.dataModel.group(selectedNodes);
            return this.getSelection()[0]
        }
    }

    /**
     * 解组
     */
    unGroup(nodeIds?: any) {
        let selectedNodes = this.getOperateNodes(nodeIds);
        if (selectedNodes.length > 0) {
            this.dataModel.unGroup(selectedNodes);
        } else {
            console.log(GRAPH_EDITOR_WARNING + '未找到需要解组的节点');
        }
    }

    /**
     * 获取当前选中节点
     * @returns 当前选中节点
     */
    getSelection() {
        let nodes: any = [];
        this.dataModel.getSelectionManager().getSelection().forEach((element: any) => {
            nodes.push(element.toObject());
        });
        return nodes;
    }

    /**
     * 删除节点
     * @param nodeIds 需要删除的节点id数组，如果为空，则删除当前选中节点
     */
    deleteNodes(nodeIds?: any) {
        let operateNodes = this.getOperateNodes(nodeIds);
        let nodeChange = new NodeChange(operateNodes, 'delete', this.dataModel);
        let cmd = new Command([nodeChange]);
        this.dataModel.getUndoRedoManager().execute(cmd);
    }





    /**
     * 获取当前配置
     * @returns 当前配置
     */
    getConfig() {
        return JSON.parse(JSON.stringify(this.config));
    }

    private setIsSquare(square: boolean) {
        this.isSquare = square;
    }

    private getIsSquare() {
        return this.isSquare;
    }



    /**
     * 选中画布上所有节点
     */
    selectAll() {
     
        let allNodes = this.dataModel.getNodes();
        let allIds: any = [];
        allNodes.forEach((item: any) => {
            allIds.push(item.getId())
        })
        this.dataModel.getSelectionManager().setSelection(allIds, true);
    }

    /**
     * 反选
     */
    inverseSelect() {
        const allSelectedIds = this.dataModel?.getSelectionManager().getSelection().map(item => item.getId());
        let allIds: any = [];
        this.dataModel.getNodes().forEach((item: any) => {
            if (!allSelectedIds.includes(item.getId())) {
                allIds.push(item.getId())
            }
        })
        this.dataModel.getSelectionManager().setSelection(allIds, true);
    }

    /**
     * 修改默认样式配置
     * @param styleConfig 要修改的样式
     * @example
     * graphEditor.setStyleConfig({
     *   'stroke':'yellow'
     *  })
     */
    setStyleConfig(styleConfig: StyleConfig) {
        this.config.style = Utils.combine(this.config.style, styleConfig);
    }
    getStyleConfig() {
        return JSON.parse(JSON.stringify(this.config.style));
    }

    /**
    * 修改默认网格配置
    * @param gridConfig 要修改的网格样式
    * @example
    * graphEditor.setGridConfig({
    *   'color':'yellow'
    *  })
    */
    setGridConfig(gridConfig: GridConfig) {
        this.config.view.grid = Utils.combine(this.config.view.grid, gridConfig);
        this.initGrid();
    }
    getGridConfig() {
        return JSON.parse(JSON.stringify(this.config.view.grid))
    }





    /**
     * 获取节点的所有属性
     * @param ids 节点id
     * @returns 属性的JSON数组，含有属性中所有的信息
     * @example 
     * editor.getAttributes(id);
     */
    getAttributes(id?: string) {
        let node = this.getOperateNode(id);
        if (node) {
            if (node instanceof ContainerNode) {
                let memberAttrs = node.getMemberAttributes(true);
                for (let key in memberAttrs) {
                    let val = memberAttrs[key];
                    if (val.group == 'geometry') {
                        delete memberAttrs[key];
                    }
                }
                return Object.assign(memberAttrs, node.getAttributes(true));
            } else {
                return node.getAttributes();
            }
        } else {
            console.warn(GRAPH_EDITOR_WARNING + "未找到操作的节点")
        }
    }

    /**
     * 
     * @param ids 操作节点的id数组
     * @returns 操作节点的属性的交集
     */
    getNodesAttributes(ids?: any) {
        let nodes = this.getOperateNodes(ids);
        // 创建空对象来存储交集
        const intersection = {};
        //选择第一个对象作为基准
        const baseObject = nodes.length > 0 ? this.getAttributes(nodes[0].id) : {};
        // 遍历基准对象的属性
        for (let key in baseObject) {
            let isCommon = true;
            // 检查其他对象是否具有相同的属性
            for (let i = 1; i < nodes.length; i++) {
                let attrs = this.getAttributes(nodes[i].id);
                if (!attrs.hasOwnProperty(key)) {
                    isCommon = false;
                    break;
                }
            }
            // 如果所有对象都有相同的属性，则将其添加到交集对象中
            if (isCommon) {
                intersection[key] = baseObject[key];
            }
        }

        return intersection;
    }

    /**
     * 
     * @param attrName 属性名称
     * @param nodeId 节点id，未指定的情况下，则为当前选中节点
     * @returns 节点的指定属性
     * @example
     * editor.getAttributeValue('fill')
     */
    getAttributeValue(attrName: string, nodeId?: string) {
        let node = this.getOperateNode(nodeId);
        if (node) {
            return node.getAttributeValue(attrName)
        }
    }

    /**
     * 获取节点的所有动画属性
     * @param nodeId 节点id，未指定的情况下，则为当前选中节点
     * @returns 节点的所有动画属性
     * @example
     * editor.getAnimation();
     */
    getAnimation(nodeId?: string) {
        let node = this.getOperateNode(nodeId);
        if (node) {
            return JSON.parse(JSON.stringify(node.getAnimation()))
        }
    }

    /**
     * 获取节点的指定动画属性值
     * @param key 动画属性名称
     * @param nodeId  节点id，未指定的情况下，则为当前选中节点
     * @returns 节点的指定动画属性值
     * @example
     * editor.getAnimationValue('autoPlay');
     * editor.getAnimationValue('type');
     */
    getAnimationValue(key: string, nodeId?: string) {
        let node = this.getOperateNode(nodeId);
        if (node) {
            return node.getAnimationValue(key);
        }
    }

    /**
   * 设置动画属性
   * @param animation  动画对象
   * @param {string} animation.type 动画类型，枚举值：'blink','rotateByCenter','flow'
   * @param {Boolean} animation.autoPlay 是否自动播放
   * @param {Number} animation.period 动画周期，时间s
   * @param nodeId  操作节点id
   * @example
   * graphEditor.setAnimation({
   *   'type'：'blink',
   *   'autoPlay':true,
   *   'period':10   //动画周期，单位秒
   * },nodeId);
   */
    setAnimation(animation: any, nodeId?: string) {
        let operateNode = this.getOperateNode(nodeId);
        if (operateNode) {
            this.dataModel.setAnimation(operateNode, animation);
        }
    }

    /**
     * 设置动画属性值
     * @param name  属性名称
     * @param value 属性值
     * @param nodeId  操作节点id
     * @example
     * graphEditor.setAnimationValue('type','blink');
     */
    setAnimationValue(name: any, value: any, nodeId: string) {
        let animation: any = {};
        animation[name] = value;
        this.setAnimation(animation, nodeId);
    }

    private getOperateNode(nodeId: string) {
        if (nodeId) {
            return this.getNode(nodeId);
        } else {
            let selectNodes = this.dataModel.getSelectionManager().getSelection();
            if (selectNodes.length == 1) {
                return selectNodes[0];
            }
        }
    }

    /**
    * 删除事件
    * @param eventIndex 事件索引
    * @param nodeId 操作节点
    */
    deleteEvent(eventIndex: number, nodeId?: string) {
        let operateNode = this.getOperateNode(nodeId);
        if (operateNode) {
            this.dataModel.deleteEvent(operateNode, eventIndex);
        } else {
            console.warn(GRAPH_EDITOR_WARNING + '没有操作的节点')
        }
    }

    /**
     * 更新图中节点的图元
     * @param symbol 目标图元对象
     * @param nodeIds 需要更新的节点，如果为空，则默认更新所有的匹配图元
     */
    updateSymbol(symbol: any, ignoreVariable: boolean = false, nodeIds: any) {
        let operateNodes = nodeIds ? this.dataModel.getNodes().filter((item: any) => {
            return nodeIds.includes(item.id)
        }) : this.dataModel.getNodes();
        operateNodes.forEach(item => {
            if (item.symbolName && item.symbolName == symbol.name) {
                if (!ignoreVariable) {
                    //如果忽略变量，则不修改当前实例的变量配置，否则实例将被图元的变量代替
                    if (symbol.variables) item.setVariables(JSON.parse(JSON.stringify(symbol.variables)));
                }
                if (symbol.nodes) item.setMembers(
                    symbol.nodes.map((item: any) => {
                        let nodeObj = Node.create(item);
                        nodeObj.setAttributeValue('draggable', false);
                        return nodeObj;
                    })
                );
            }
        })
    }

    /**
     * 为节点添加事件
     * @param event 
     * @param {string} event.type 事件类型，枚举值
     *     'click': '单击',
     *      'dblclick': '双击',
     *     'valuechange': '值变化',
     *     'mouseenter': '鼠标移入',
     *     'mouseleave': '鼠标移出'
     * @param {string} event.action 事件动作，枚举值  
     * 'changeAttributes': '更改属性',
     * 'updateAnimation': '修改动画',
     * 'executeScript': '执行JavaScript' 
     * @param {any} event.attributes 值，valuechange的值
     * @param {any} event.animation  updateAnimation的值
     * @param {any} event.script  executeScript的值
     * @param {string} trigger.type 条件类型，枚举值：'script': '脚本','operation': '关系运算符'
     * @param {string} trigger.operation 关系运算符的值
     * @param {string} trigger.script 条件类型为script时的取值
     * @param nodeId 操作的节点id
     * @example
     *  graphEditor.addEvent({
     *   type:'valuechange',
     *   action:'changeAttributes',
     *   attributes:{
     *    'fill' :'green'
     *    },
     *   triggers:[{
     *      type:'operation',
     *        operation: {
     *           target: 3,
     *           source: "state",
     *           operator: "="
     *       }
     *   }]
     *  },nodeId)
     *  graphEditor.addEvent({
     *     type:'valuechange',
     *     action:'executeScript',
     *     script: 'console.log("world")',
     *     triggers:[{
     *        script:'return state==1',
     *        type:'script'
     *     }]
     *  })  
     */
    addEvent(event: any, nodeId?: string) {

        let operateNode = this.getOperateNode(nodeId);
        if (operateNode) {
            this.dataModel.addEvent(operateNode, event);
        } else {
            console.warn(GRAPH_EDITOR_WARNING + "未找到添加事件的节点")
        }
    }
    /**
     * 为事件添加条件
     * @param eventIndex 事件的索引
     * @example
     *  graphEditor.addEventTrigger(0,{
     *    type: 'operation',
     *    target: 3,
     *   source: "state",
     *    operation: "="
     *   },)
     */
    addEventTrigger(eventIndex: number, trigger: any, nodeId?: string) {
        let operateNode = this.getOperateNode(nodeId);
        if (operateNode) {
            this.dataModel.addEventTrigger(operateNode, eventIndex, trigger);
        } else {
            console.warn(GRAPH_EDITOR_WARNING + "未找到添加事件的节点")
        }
    }

    /**
     * 更新事件条件
     * @param eventIndex 事件索引
     * @param triggerIndex 条件索引
     * @param trigger 修改的条件
     * @param nodeId 操作节点id
     */
    updateEventTrigger(eventIndex: number, triggerIndex: number, trigger: any, nodeId?: string) {

        let operateNode = this.getOperateNode(nodeId);
        if (operateNode) {
            this.dataModel.updateEventTrigger(operateNode, eventIndex, triggerIndex, trigger);
        } else {
            console.warn(GRAPH_EDITOR_WARNING + "未找到添加事件的节点")
        }
    }

    /**
     * 删除事件中的条件
     * @param eventIndex 事件索引
     * @param triggerIndex 条件索引
     * @param nodeId 操作节点id
     */
    deleteEventTrigger(eventIndex: number, triggerIndex: number, nodeId?: string) {
        let operateNode = this.getOperateNode(nodeId);
        if (operateNode) {
            this.dataModel.deleteEventTrigger(operateNode, eventIndex, triggerIndex);
        } else {
            console.warn(GRAPH_EDITOR_WARNING + "未找到添加事件的节点")
        }
    }

    /**
     * 返回节点的所有事件
     * @param nodeId 节点id，未指定的情况下，则为当前选中节点
     */
    getEvents(nodeId?: string) {
        let operateNode = this.getOperateNode(nodeId);
        if (operateNode) {
            return JSON.parse(JSON.stringify(operateNode.getEvents()));
        } else {
            console.warn(GRAPH_EDITOR_WARNING + "未找到添加事件的节点")
        }

    }

    /**
     * 更新节点事件
     * @param event 事件对象
     * @param evtIndex 事件索引
     * @param nodeId 要操作节点
     */
    updateEvent(event: any, evtIndex: number, nodeId?: string) {
        let node = this.getOperateNode(nodeId);
        this.dataModel.updateEvent(node, event, evtIndex);
    }

    /**
     * 添加或保存在事件中的属性
     * @param property 
     * @param propertyIndex 属性的索引，默认为-1，表示新增
     * @param evtIndex 事件索引
     * @param nodeId 操作节点
     * @example
     * graphEditor.savePropertyInEvent({'stroke':'green'}, -1, 0, selectNodes[0].id)
     * 
     */
    savePropertyInEvent(property: any, propertyIndex: number = -1, evtIndex: number, nodeId: string) {
        let node = this.getOperateNode(nodeId);
        if (node) {
            this.dataModel.savePropertyInEvent(node, property, propertyIndex, evtIndex);
        }

    }
    /**
     * 删除在事件中的属性
     * @param propertyIndex 属性索引
     * @param evtIndex 事件索引
     * @param nodeId 操作节点
     */
    deletePropertyInEvent(propertyIndex: number = -1, evtIndex: number, nodeId: string) {
        let operateNode = this.getOperateNode(nodeId);
        if (operateNode) {
            this.dataModel.deletePropertyInEvent(operateNode, propertyIndex, evtIndex);
        }
    }
    setTag(tag: string, nodeId: any) {
        let operateNode = this.getOperateNode(nodeId);
        if (operateNode) {
            this.dataModel.setNodeTag(operateNode, tag);
        }
    }
    checkId(): boolean {
        return this.dataModel.checkId();
    }
    /**
     * 对当前选中元素提取变量
     */
    extractVariables() {
        let selectedNodes = this.getOperateNodes();
        if (selectedNodes.length > 0) {
            //遍历提取子元素的variable
            let symbolVariables = {};
            (function loop(nodes) {
                for (let node of nodes) {
                    let nodeVariables = node.getVariables();
                    for (let key in nodeVariables) {
                        if (!symbolVariables.hasOwnProperty(key)) {
                            symbolVariables[key] = nodeVariables[key];
                        }
                    }
                    if (node instanceof SymbolNode) {
                        loop(node.getMembers());
                    } else if (node instanceof GroupNode) {
                        loop(node.getMembers());
                    }
                }
            })(selectedNodes);
            return symbolVariables;
        }
    }
    /**
     * 组成图元
     * @param symbolName 图元名称
     */
    constructSymbol(symbolName: string) {

        if (!symbolName) throw new Error("名称不能为空");
        if (this.withoutSymbolNode) {
            let selectedNodes = this.getOperateNodes();

            if (selectedNodes.length > 0) {
                let symbolNode = new SymbolNode(
                    {
                        attributes: {
                            draggable: true
                        }
                    }
                );
                symbolNode.setMembers(selectedNodes.map((item: any) => {
                    let node = item.clone(true);
                    node.setAttributeValue('draggable', false);
                    return node;
                }));
                symbolNode.setSymbolName(symbolName);
                this.dataModel.removeNodes(selectedNodes);
                let bounds = symbolNode.getRef().getClientRect({ skipTransform: true });
                let cloneSymbolNode = symbolNode.clone(true);
                cloneSymbolNode.setAttributeValues({
                    x: -bounds.x,
                    y: -bounds.y
                })
                //遍历提取子元素的variable
                let symbolVariables = {};
                (function loop(node, path) {
                    let nodeIndex = 'node_' + path.join('_');
                    let nodeVariables = node.getVariables();
                    for (let key in nodeVariables) {
                        if (!symbolVariables.hasOwnProperty(key)) {
                            let jsonContent = nodeVariables[key];
                            jsonContent['from'] = [nodeIndex]
                            symbolVariables[key] = nodeVariables[key];
                        } else {
                            //如果已经提取过这个变量了
                            let jsonContent = symbolVariables[key];
                            jsonContent['from'].push(nodeIndex)
                        }
                    }
                    node.setVariables(null);
                    if (node instanceof SymbolNode || node instanceof GroupNode) {
                        node.getMembers().forEach((member, index) => {
                            const childPath = path.concat(index); // 将当前节点索引添加到路径中
                            loop(member, childPath);
                        })
                    }

                })(cloneSymbolNode, []);
                cloneSymbolNode.setVariables(symbolVariables);
                let variableWithoutFrom = {};
                for (let key in symbolVariables) {
                    let symbolContent = JSON.parse(JSON.stringify(symbolVariables[key]));
                    delete symbolContent.from;
                    variableWithoutFrom[key] = symbolContent;
                }
                symbolNode.setVariables(variableWithoutFrom);
                this.dataModel.addNode(symbolNode);
                return cloneSymbolNode.toObject();
            } else {
                console.warn(GRAPH_EDITOR_WARNING + "未选择任何形状，不能组成图元")
            }
        } else {
            console.warn(GRAPH_EDITOR_WARNING + "图元中不能存在图元")
        }


    }

    /**
     * 暂时不使用此方法
     * @param symbolJson 
     * @param variable 
     */
    addSymbolVariable(symbolJson: any, variableName: any, variable: any) {
        if (symbolJson.variables) {
            symbolJson.variables[variableName] = variable
        } else {
            var addObj = {};
            addObj[variableName] = variable;
            symbolJson.variables = addObj
        }
        return symbolJson;

    }
    /**
     * 编辑图元，对当前选中的图元进行编辑
     */
    deconstructSymbol() {
        let selectedNode = this.getOperateNode();
        if (selectedNode instanceof SymbolNode) {
            let variables = selectedNode.getVariables();
            let nodeToVariableMap = new Map();
            for (let key in variables) {
                let from = variables[key]['from'];
                from?.forEach((nodeIndex) => {
                    if (nodeToVariableMap.has(nodeIndex)) {
                        nodeToVariableMap.get(nodeIndex).push(key);
                    } else {
                        nodeToVariableMap.set(nodeIndex, [key])
                    }
                })
            }
            //将变量都塞回到原来的节点
            (function loop(node: Node, path: Array) {
                let nodeIndex = 'node_' + path.join('_');
                if (nodeToVariableMap.has(nodeIndex)) {
                    let keys = nodeToVariableMap.get(nodeIndex);
                    let addedVariables = {};
                    for (let variableName of keys) {
                        addedVariables[variableName] = {
                            'defaultVal': variables[variableName].defaultVal,
                            'type': variables[variableName].type
                        }
                    }
                    node.setVariables(addedVariables);
                }
                if (node instanceof SymbolNode || node instanceof GroupNode) {
                    node.getMembers().forEach((member, index) => {
                        const childPath = path.concat(index); // 将当前节点索引添加到路径中
                        loop(member, childPath);
                    })
                }

            })(selectedNode, []);
            this.unGroup();
        } else {
            console.warn(GRAPH_EDITOR_WARNING + "未选择图元")
        }
    }
}
