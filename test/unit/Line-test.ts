import { RectNode } from '../../src/model/RectNode';
import { EllipseNode } from '../../src/model/EllipseNode';
import { GraphEditor } from '../../src/GraphEditor';
import { createEditor } from './test-utils';
import assert from 'assert';
import { CircleNode } from '../../src/model/CircleNode';
import { GroupNode } from '../../src/model/GroupNode';
import { LabelNode } from '../../src/model/LabelNode';
import { LineNode } from '../../src/model/LineNode';
import { LineArrowNode } from '../../src/model/LineArrowNode';
describe('LineNode', function () {
  let editor = createEditor('LineNode');
  it('create line Node', function () {
    let lineNode = new LineNode(
      {
        attributes: {
          x1: 50,
          y1: 50,
          x2: 100,
          y2: 60,
          strokeWidth: 2,
          stroke: 'red',
          draggable: true
        }
      }
    );
    editor.getDataModel().addNode(lineNode);
    assert.equal(lineNode.getAttributeValue('x1'), 50);
  })
  it('create line arrow Node', function () {
    let lineArrowNode = new LineArrowNode(
      {
        attributes: {
          x1: 80,
          y1: 80,
          x2: 100,
          y2: 100,
          strokeWidth: 2,
          stroke: 'red',
          fill:'red',
          draggable: true
        }
      }
    );
    editor.getDataModel().addNode(lineArrowNode);
    assert.equal(lineArrowNode.getAttributeValue('x1'), 80);
  })
  it('create line arrow Node', function () {
    let lineArrowNode = new LineArrowNode(
      {
        attributes: {
          x1: 100,
          y1: 150,
          x2: 150,
          y2: 150,
          strokeWidth: 2,
          stroke: 'red',
          fill:'red',
          pointerAtBeginning:true,
          draggable: true,
          pointerLength:20
        }
      }
    );
    editor.getDataModel().addNode(lineArrowNode);
    assert.equal(lineArrowNode.getAttributeValue('x1'), 100);
  })
})


