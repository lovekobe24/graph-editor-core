import { RectNode } from '../../src/model/RectNode';
import { EllipseNode } from '../../src/model/EllipseNode';
import { GraphEditor } from '../../src/GraphEditor';
import { createEditor } from './test-utils';
import assert from 'assert';
import { PathNode } from '../../src/model/PathNode';
import { PenNode } from '../../src/model/PenNode';
import { PolylineNode } from '../../src/model/PolylineNode';
import { RegularPolygonNode } from '../../src/model/RegularPolygonNode';
import { StarNode } from '../../src/model/StarNode';
import { TextNode } from '../../src/model/TextNode';
import { WedgeNode } from '../../src/model/WedgeNode';

describe('WedgeNode', function () {
  let editor = createEditor('WedgeNode');
  let wedgeNode;
  it('create text node', function () {
    wedgeNode = new WedgeNode(
      {
        attributes: {
          x: 50,
          y: 50,
          angle: 30,
          radius: 15,
          clockwise: false,
          strokeWidth: 2,
          stroke: 'green',
          draggable: true
        }
      }
    );
    editor.getDataModel().addNode(wedgeNode);
    assert.equal(wedgeNode.getAttributeValue('radius'), 15);

  })
  it('modify attributes', function () {
    wedgeNode.setAttributeValue('radius', 20);
    assert.equal(wedgeNode.getAttributeValue('radius'), 20);

  })
})


