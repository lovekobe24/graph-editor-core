import { RectNode } from '../../src/model/RectNode';
import { EllipseNode } from '../../src/model/EllipseNode';
import { GraphEditor } from '../../src/GraphEditor';
import {createEditor} from './test-utils';
import assert from 'assert';
import { PathNode } from '../../src/model/PathNode';
import { PenNode } from '../../src/model/PenNode';
describe('PenNode', function () {
  let editor=createEditor('PenNode');
  it('createNode', function () {
     let penNode=new PenNode(
      {
        attributes: {
          x: 0,
          y: 0,
          points: [23, 20, 23, 160, 70, 93, 150, 109, 290, 139, 270, 93],
          strokeWidth: 4,
          stroke: 'green',
          draggable:true
        }
      }
     );
     editor.getDataModel().addNode(penNode);
     assert.equal(penNode.getAttributeValue('x'), 0);
     
  })
  it('create pen node by drawing', function () {
       editor.drawShape('pen');
   
  })
})


