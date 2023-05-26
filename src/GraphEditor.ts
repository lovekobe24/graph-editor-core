// @ts-nocheck
import Konva from "konva";
import type { Stage } from "konva/lib/Stage";
import { DataModel } from "./DataModel";
import EVENT_TYPE from "./constants/EventType";
import { Node } from './model/Node';
import Utils from "./Utils";
import TemcEventSource from "./TemcEventSource";
import { REGULAR_MODE, DRAWING_MODE, EDITING_MODE, DRAWING_MOUSE_DOWN, DRAWING_MOUSE_MOVE, DRAWING_MOUSE_UP, DIRECTION_HORIZONTAL, DIRECTION_VERTICAL, DIRECTION_LEFT, DIRECTION_RIGHT, DIRECTION_TOP, DIRECTION_BOTTOM, GRAPH_EDITOR_WARNING, GRAPH_EDITOR_INFO } from './constants/TemcConstants';

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
import type { EditorConfig, GridConfig, NodeConfig, StyleConfig } from "./types";

export default class GraphEditor extends GraphManager {
    private gridLayer: Layer = new Konva.Layer({ listening: false });
    private helpLayer: Layer = new Konva.Layer();
    private drawingLayer: Layer = new Konva.Layer();
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
     * })
     * 
     */
    constructor(config: EditorConfig) {
        super(config);
        this.container = config.container;
        this.config = Utils.combine(defaultConfig, config);

        let view = this.config?.view;
        let graph;
        if (this.config.graph) {
            graph = JSON.parse(this.config.graph);
        }
        if (config.container) config.container.style.backgroundColor = graph?.backgroundColor ?? '#ffffff';
        this.width = graph?.width ?? view?.size?.width;
        this.height = graph?.height ?? view?.size?.height;
        this.stage = new Konva.Stage({ container: config.container, width: this.width, height: this.height } as Konva.StageConfig);
        this.stage.add(this.gridLayer);
        this.stage.add(this.nodeLayer);
        this.stage.add(this.helpLayer);
        this.stage.add(this.drawingLayer);
        this.dataModel = new DataModel(this);
        this.addDataModelListeners();
        if (graph) this.dataModel.fromObject(graph.model);
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
        this.initContextMenu();
        this.initShapeModule();

        if (Utils.isBrowser()) {
            window.addEventListener('keydown', this.onKeyDown.bind(this))
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
                    this.container.style.cursor = 'crosshair';
                    break;
                case REGULAR_MODE:
                case EDITING_MODE:
                    this.container.style.cursor = 'default';
                    break;
            }


        });
    }

    /**
     * 监听鼠标事件，进入编辑状态
     */
    private initNodeEdit() {
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
                        this.currentMode = REGULAR_MODE;
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
                        node.createRefAnchors(this.config.view.editAnchor);
                        let anchors = node.getRefAnchors();
                        this.helpLayer.add(...anchors);
                        this.currentMode = EDITING_MODE;
                        this.transformer.nodes([]);
                    }
                    this.dataModel.getSelectionManager().setSelection([node.getId()], false);
                }
                this.currentMode = EDITING_MODE;
            }
        });
        this.stage.on('click', (e: any) => {
            if (this.currentMode === EDITING_MODE && this.stage === e.target) {
                this.currentMode = REGULAR_MODE;
                let nodes = this.dataModel.getNodes().filter((item: any) => item instanceof EditableShapeNode && item.getRefAnchors() !== null);
                for (let node of nodes) {
                    node.destroyRefAnchors();
                }
            }
        });
    }

    /**
     * 监听鼠标事件，完成绘制功能
     */
    private initNodeDraw() {
        this.stage.on('mousedown', (e: any) => {
            if (this.currentMode === DRAWING_MODE) {
                this.drawingShape.notifyDrawingAction(this, this.getStageScalePoint(), DRAWING_MOUSE_DOWN, e.evt.button);
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
    }

    /**
     * 监听鼠标事件，节点变换时，同步模型
     */
    private initNodeResize() {
        this.transformer.on('transformstart', () => {
            //如果resize开始，则停止绘制自动切换到普通模式
            this.setMode(REGULAR_MODE);
        });
        this.transformer.on('transformend', () => {
            let undoRedoManager = this.dataModel.getUndoRedoManager();
            let selectedNodes = this.dataModel.getSelectionManager().getSelection();
            let resizeChange = new GeometryChange(selectedNodes, 'resize', this.dataModel);
            let cmd = new Command([resizeChange]);
            undoRedoManager.execute(cmd);
        });
    }

    /**
     * 监听鼠标事件，节点平移后，同步模型
     */
    private initNodeMove() {
        this.transformer.on('dragend', (e: any) => {
            let selectNodes = this.dataModel.getSelectionManager().getSelection();
            let undoRedoManager = this.dataModel.getUndoRedoManager();
            let moveChange = new GeometryChange(selectNodes, 'move', this.dataModel);
            let cmd = new Command([moveChange]);
            undoRedoManager.execute(cmd);
        });
    }

    /**
     * 监听鼠标事件，完成自定义菜单功能
     */
    private initContextMenu() {
        this.stage.on('contextmenu', (e: any) => { e.evt.preventDefault(); });
    }

    /**
     * 为画布添加快捷键的监听
     */
    onKeyDown(e: Event & {
        key: string
        ctrlKey: boolean
    }) {
        const isCtrlKey = e.ctrlKey;
        const keyboard = this.config.selection?.keyboard
        if (keyboard?.enabled === false) {
            return
        }
        const nodes = this.transformer.nodes();
        const movingSpaces = keyboard?.movingSpaces ?? 5
        function getRealKey() {
            return isCtrlKey ? ('Control+' + e.key) : e.key
        }
        let realKey = getRealKey(e.key);

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

        if (keyboard?.map?.selectAll?.includes(realKey)) {
            this.selectAll()
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

        e.preventDefault();
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
     * 监听节点属性的变化
     * @param callback 
     */
    onModelChanged(callback: any) {
        this.dataModel.onModelChanged(callback);
    }

    /**
     * 复制操作
     * @param nodes 需要复制的节点id数组，如为空，则为当前画布选中节点
     */
    copy(nodeIds?: any) {
        let operateNodes = this.getOperateNodes(nodeIds);
        this.pasteCount = 1;
        this.copyNodes = operateNodes;
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
        this.copyNodes.forEach((item: any) => {
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
     * @param direction 方向,取值为'up','down','left','right'
     * @param step 调整距离
     */
    move(direction: string, step?: number = 1, nodeIds?: Array<string>) {
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
     * @param gridConfig 网格的配置
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
     * 为画布监听模型的变化，如节点的添加或删除
     */
    private addDataModelListeners() {
        let _this = this;
        this.dataModel.addListener(EVENT_TYPE.ADD_KONVA_NODE, (sender: any, event: any) => {
            let node = event.getProperty('node');
            let nodeIndex = event.getProperty('zIndex');
            this.nodeLayer.add(node);
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
        this.chooseImage((imgObj) => {
            this.addNode({
                className: 'ImageNode',
                attributes: {
                    image: imgObj,
                    x: 50,
                    y: 50,
                    width: 200,
                    height: 200,
                    strokeWidth: 0
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
                    callback(reader.result);
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
        var distance = 0;
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
    * @param direction 对齐的方向,枚举值：left,right,top,bottom,horizontal,vertical
    * @param nodeIds 要对齐的节点id数组，如果为空，则默认对齐选中元素
    */
    align(direction: any, nodeIds?: any) {
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
    order(direction: any, nodeId: string) {
        let undoRedoManager = this.dataModel.getUndoRedoManager();
        let selectNodes = this.getOperateNode(nodeId);
        if (selectNodes.length == 1) {
            let orderChange = new OrderChange(selectNodes[0], direction, this.getDataModel());
            let cmd = new Command([orderChange]);
            undoRedoManager.execute(cmd);
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
            this.currentMode = DRAWING_MODE;
        }

    }

    /**
     * 停止绘制模式
     */
    stopDrawing() {
        //停止绘制模式
        this.setMode(REGULAR_MODE);
        //如果有绘制到一半的东西，需要删除
        this.drawingLayer.destroyChildren();

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
    getSize() {
        return {
            width: this.stage.attrs.width,
            height: this.stage.attrs.height
        }
    }

    /**
     * 将当前画布的JSON对象
     * @returns 序列前的JavaScript对象
     */
    toObject(isArray: boolean = false) {

        let graphObj = {
            width: this.width,
            height: this.height,
            backgroundColor: this.stage.container().style.backgroundColor,
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
     * 设置变量
     * @param name 变量名称
     * @param variable 变量对象
     * @param toModel 是否为整个数据模型设置变量，为true，则变量绑定到整个模型，为false则将变量绑定到当前选中节点
     * @param oldVariableName 旧的变量名称，如果存在，则更新变量，否则添加变量
     * @example
     * var variable =
     * {
     *    defaultVal:'变量默认值',//必填
     *    type:'integer'//可选
     * };
     * graphEditor.saveVariable('变量1',variable,false)
     */
    saveVariable(name: string, variable: any, toModel: boolean = false, oldVariableName?: string, nodeId?: string) {
        if (toModel) {
            this.dataModel.saveVariable(name, variable, oldVariableName);
        } else {
            let operateNode = this.getOperateNode(nodeId);
            if (operateNode) {
                operateNode.saveVariable(name, variable, oldVariableName);
            } else {
                console.log(GRAPH_EDITOR_WARNING + '未找到设置变量的节点');
            }
        }
    }

    /**
     * 删除指定名称的变量
     * @param name 变量名称
     * @param toModel 是否是删除模型上的变量
     * @param nodeId 需要操作的节点
     */
    deleteVariable(name: string, toModel: boolean, nodeId: string) {
        if (toModel) {
            this.dataModel.deleteVariable(name);
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
     * @param attrValues Object对象
     * @example
     *  graphEditor.setAttributes({
     *  'fill':'red'
     *   },ids);
     * 
     */
    setAttributes(attrValues: any, nodeIds?: any) {
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
     *  graphEditor.setAttributes('fill','orange',ids);
     */
    setAttribute(key: string, val: any, nodeIds?: any) {
        let attr = {};
        attr[key] = val;
        this.setAttributes(attr, nodeIds);
    }


    /**
     * 成组
     * @param nodeIds 需要成组的节点，如果为空，则取当前画布上被选中的节点
     */
    group(nodeIds?: any) {
        let selectedNodes = this.getOperateNodes(nodeIds);
        if (selectedNodes.length > 1) {
            this.dataModel.group(selectedNodes);
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
    deleteNodes(nodeIds: any) {
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

    /**
    * 设置动画属性
    * @param animation  动画对象
    * @param {string} animation.type 动画类型，枚举值：'blink','rotateByCenter','flow'
    * @param {Boolean} animation.autoPlay 是否自动播放
    * @param {Number} animation.period 动画周期，时间s
    * @param nodeId  操作节点id
    * @example
    * graphEditor.setAnimation({'type'：'blink','autoPlay':true},nodeId);
    */
    setAnimations(animation: any, nodeId?: string) {
        let operateNode = this.getOperateNode(nodeId);
        if (operateNode) {
            this.dataModel.setAnimations(operateNode, animation);
        }


    }

    /**
     * 设置动画属性
     * @param name  属性名称
     * @param value 属性值
     * @param nodeId  操作节点id
     * @example
     * graphEditor.setAnimation('type','blink');
     */
    setAnimation(name: any, value: any, nodeId: string) {
        let animation: any = {};
        animation[name] = value;
        this.setAnimations(animation, nodeId);
    }

    private setIsSquare(square: boolean) {
        this.isSquare = square;
    }

    private getIsSquare() {
        return this.isSquare;
    }

    /**
     * 获取画布上所有的节点
     */
    getNodes() {
        let nodes: any = [];
        this.dataModel.getNodes().forEach((element: any) => {
            nodes.push(element.toObject());
        });
        return nodes;
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
    setStyleConfig(styleConfig:StyleConfig){
        this.config.style = Utils.combine(this.config.style, styleConfig);
    }

     /**
     * 修改默认网格配置
     * @param gridConfig 要修改的网格样式
     * @example
     * graphEditor.setGridConfig({
     *   'color':'yellow'
     *  })
     */
    setGridConfig(gridConfig:GridConfig){
        this.config.view.grid = Utils.combine(this.config.view.grid, gridConfig);
        this.initGrid();
    }

    /**
     * 设置背景色
     * @param color 背景色
     */
    setBackgroundColor(color: string) {
        this.stage.container().style.backgroundColor = color;
    }

    /**
     * 使画布获取焦点
     */
    focusCanvas() {
        this.stage.container().focus();
    }



    /**
     * 获取节点的所有属性
     * @param id 节点id
     * @returns 属性的JSON数组，含有属性中所有的信息
     */
    getAttributes(id: string) {
        let node = this.getNode(id);
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
        let node = this.getNode(nodeId);
        if (node) {
            return node.getAttributeValue(attrName)
        }
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
    deleteEvent(eventIndex: number, nodeId: string) {
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
     *     'valueUpdate': '值变化',
     *     'mousemove': '鼠标悬停',
     *     'mouseout': '鼠标移出'
     * @param {string} event.action 事件动作，枚举值  
     * 'changeProperty': '更改属性',
     * 'executeAnimation': '执行动画',
     * 'stopAnimation': '暂停动画',
     *  'executeScript': '执行JavaScript' 
     * @param {any} event.value 值，和事件动作有关 
     * @param {string} event.where.type 条件类型，枚举值：'customScript': '脚本','comparison': '关系运算符','none': '无'
     * @param {string} event.where.fnjs 条件函数
     * @param nodeId 操作的节点id
     * @example
     *  graphEditor.addEvent({
     *   type:'valueUpdate',
     *  action:'changeProperty',
     *  value:[{
     *    'fill':'green'
     *   }],
     *  where:{
     *    type:'comparison',
     *   value: 1,
     *    key: "变量2",
     *   comparison: "="
     * }
     *  },nodeId)
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


}
