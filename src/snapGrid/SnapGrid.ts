import Konva from 'konva'


import type {
  GuideLine,
  LineStops,
  NodeEdgeBound,
  Orientation,
  Nullable,
  EditorConfig
} from '../types'
import GraphEditor from '../GraphEditor'


export class SnapGrid {

  private editor: GraphEditor


  private lines: Konva.Line[] = []


  private GUIDELINE_OFFSET = 5


  private options?: Nullable<Konva.LineConfig> = {}
  private active = false
  stage: any

  /**
   * 构造函数
   * @param editor GraphEditor对象
   */
  constructor(editor: GraphEditor) {
    let config = editor.config as EditorConfig;
    const options = config.drawing?.snapToGrid

    this.editor = editor
    this.options = options
    if (options?.enable) {
      this.active = options.enable;
    }
    if (this.active && this.editor) {
      this.stage = this.editor.stage;
      this.registerEvents()
    }
  }


  /**
   * Creates list of line stops to find guide lines
   *
   * @param node the dragging node
   * @returns the list of line stops
   */
  private getLineGuideStops(node: Konva.Shape): LineStops {
    var vertical = [0, this.stage.width() / 2, this.stage.width()];
    var horizontal = [0, this.stage.height() / 2, this.stage.height()];

    this.editor.getDataModel()?.getNodes().forEach((shape: any) => {
      if (shape.getRef() === node) {
        return
      }

      const box = shape.getRef().getClientRect()

      vertical.push([box.x, box.x + box.width, box.x + box.width / 2]);
      horizontal.push([box.y, box.y + box.height, box.y + box.height / 2]);
    })

    return {
      vertical: vertical.flat(),
      horizontal: horizontal.flat(),
    };
  }

  // what points of the object will trigger to snapping?
  // it can be just center of the object
  // but we will enable all edges and center
  private getObjectSnappingEdges(node: any) {
    var box = node.getClientRect();
    var absPos = node.absolutePosition();

    return {
      vertical: [
        {
          guide: Math.round(box.x),
          offset: Math.round(absPos.x - box.x),
          snap: 'start',
        },
        {
          guide: Math.round(box.x + box.width / 2),
          offset: Math.round(absPos.x - box.x - box.width / 2),
          snap: 'center',
        },
        {
          guide: Math.round(box.x + box.width),
          offset: Math.round(absPos.x - box.x - box.width),
          snap: 'end',
        },
      ],
      horizontal: [
        {
          guide: Math.round(box.y),
          offset: Math.round(absPos.y - box.y),
          snap: 'start',
        },
        {
          guide: Math.round(box.y + box.height / 2),
          offset: Math.round(absPos.y - box.y - box.height / 2),
          snap: 'center',
        },
        {
          guide: Math.round(box.y + box.height),
          offset: Math.round(absPos.y - box.y - box.height),
          snap: 'end',
        },
      ],
    };
  }

  /**
   * Creates the guide lines based on the given line stops and edge bounds
   *
   * @param lineStops the line stops
   * @param nodeEdgeBounds the node edge bounds
   * @returns the list of guide lines
   */
  private getGuides(lineGuideStops:any, itemBounds:any):GuideLine[] {
    var resultV:any= [];
    var resultH:any = [];

    lineGuideStops.vertical.forEach((lineGuide:number) => {
      itemBounds.vertical.forEach((itemBound:any) => {
        var diff = Math.abs(lineGuide - itemBound.guide);
        // if the distance between guild line and object snap point is close we can consider this for snapping
        if (diff < this.GUIDELINE_OFFSET) {
          resultV.push({
            lineGuide: lineGuide,
            diff: diff,
            snap: itemBound.snap,
            offset: itemBound.offset,
          });
        }
      });
    });

    lineGuideStops.horizontal.forEach((lineGuide:number) => {
      itemBounds.horizontal.forEach((itemBound:any) => {
        var diff = Math.abs(lineGuide - itemBound.guide);
        if (diff < this.GUIDELINE_OFFSET) {
          resultH.push({
            lineGuide: lineGuide,
            diff: diff,
            snap: itemBound.snap,
            offset: itemBound.offset,
          });
        }
      });
    });

    var guides:GuideLine[] = [];

    // find closest snap
    var minV = resultV.sort((a:any, b:any) => a.diff - b.diff)[0];
    var minH = resultH.sort((a:any, b:any) => a.diff - b.diff)[0];
    if (minV) {
      guides.push({
        stop: minV.lineGuide,
        offset: minV.offset,
        orientation: 'vertical',
        snap: minV.snap,
      });
    }
    if (minH) {
      guides.push({
        stop: minH.lineGuide,
        offset: minH.offset,
        orientation: 'horizontal',
        snap: minH.snap,
      });
    }
    return guides;
  }

  /**
   * Draws the guide lines
   *
   * @param guideLines the list of guide lines
   */
  private drawGuides(guideLines: GuideLine[]) {
    if (!guideLines.length) {
      return
    }

    guideLines.forEach(guideLine => {
      const options: Konva.LineConfig = {
        stroke: '#000',
        strokeWidth: 1,
        dash: [2, 6],
        ...this.options
      }

      if (guideLine.orientation === 'vertical') {
        options.points = [0, 0, 0, this.stage.height()]
      } else if (guideLine.orientation === 'horizontal') {
        options.points = [0, 0, this.stage.width(), 0]
      }

      const line = new Konva.Line(options)

      if (guideLine.orientation === 'vertical') {
        line.absolutePosition({
          x: guideLine.stop,
          y: 0
        })
      } else if (guideLine.orientation === 'horizontal') {
        line.absolutePosition({
          x: 0,
          y: guideLine.stop
        })
      }

      this.editor.getHelpLayer().add(line)
      this.lines.push(line)
    })
  }

  /**
   * Sets the node's absolute position to the nearest snap line
   *
   * @param node The node of dragging shape
   * @param guideLines The list of guide lines
   */
  private setNodePosition(node: Konva.Shape, guideLines: GuideLine[]) {
    guideLines.forEach(({ orientation, stop: stop, offset }) => {
      const position = node.absolutePosition()

      if (orientation === 'vertical') {
        position.x = stop + offset
      } else if (orientation === 'horizontal') {
        position.y = stop + offset
      }

      node.absolutePosition(position)
    })
  }


  /**
   * 选中框的移动事件
   * @param event 事件
   */
  private onDragMove(event: Konva.KonvaEventObject<Konva.Transformer>) {
    const transformer = event.target as unknown as Konva.Transformer;
    const node = transformer.nodes().length == 1 ? (transformer.nodes()[0] as Konva.Shape) : event.target as Konva.Shape
    this.destroy()
    // find possible snapping lines
    var lineGuideStops = this.getLineGuideStops(node);
    // find snapping points of current object
    var itemBounds = this.getObjectSnappingEdges(node);

    // now find where can we snap current object
    var guides = this.getGuides(lineGuideStops, itemBounds);

    // do nothing of no snapping
    if (!guides.length) {
      return;
    }

    this.drawGuides(guides);
    this.setNodePosition(node, guides)
  }

  /**
  * 移动结束后
  */
  private onDragEnd() {
    this.destroy()
  }

  /**
   * 销毁
   */
  private destroy() {
    if (this.lines.length > 0) {
      this.lines.forEach(line => line.destroy())
      this.lines = []
    }
  }

  /**
   * 注册事件
   */
  private registerEvents() {
    this.editor.transformer.on('dragmove', this.onDragMove.bind(this))
    this.editor.transformer.on('dragend', this.onDragEnd.bind(this))
  }
}
