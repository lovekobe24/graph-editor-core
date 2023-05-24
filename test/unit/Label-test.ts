import { RectNode } from '../../src/model/RectNode';
import { EllipseNode } from '../../src/model/EllipseNode';
import { GraphEditor } from '../../src/GraphEditor';
import { createEditor } from './test-utils';
import assert from 'assert';
import { CircleNode } from '../../src/model/CircleNode';
import { GroupNode } from '../../src/model/GroupNode';
import { LabelNode } from '../../src/model/LabelNode';
describe('LabelNode', function () {
  let editor = createEditor('LabelNode');
  it('createNode', function () {
    let labelNode = new LabelNode(
      {
        attributes: {
          x: 50,
          y: 50,
          width: 100,
          height: 60,
          strokeWidth: 2,
          stroke: 'red',
          textFill: 'green',
          fontSize: 14,
          text: '标签测试',
          padding: 10
        }
      }
    );
    editor.getDataModel().addNode(labelNode);
    assert.equal(labelNode.getAttributeValue('stroke'), 'red');
  })
})


