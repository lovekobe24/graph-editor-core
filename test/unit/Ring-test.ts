import { RectNode } from '../../src/model/RectNode';
import { EllipseNode } from '../../src/model/EllipseNode';
import { GraphEditor } from '../../src/GraphEditor';
import {createEditor} from './test-utils';
import assert from 'assert';
import { PathNode } from '../../src/model/PathNode';
import { PenNode } from '../../src/model/PenNode';
import { PolylineNode } from '../../src/model/PolylineNode';
import { RegularPolygonNode } from '../../src/model/RegularPolygonNode';
import { RingNode } from '../../src/model/RingNode';
describe('RingNode', function () {
  let editor=createEditor('RingNode');
  let ringNode;
  it('create ring node', function () {
      ringNode=new RingNode(
      {
        attributes: {
          x: 50,
          y: 50,
          innerRadius:20,
          outerRadius:50,
          strokeWidth: 4,
          stroke: 'green',
          draggable:true
        }
      }
     );
     editor.getDataModel().addNode(ringNode);
     assert.equal(ringNode.getAttributeValue('innerRadius'), 20);
     
  })
  it('modify attributes', function () {
     ringNode.setAttributeValue('innerRadius',10);
     assert.equal(ringNode.getAttributeValue('innerRadius'), 10);
   
  })
})


