import { RectNode } from '../../src/model/RectNode';
import { EllipseNode } from '../../src/model/EllipseNode';
import { GraphEditor } from '../../src/GraphEditor';
import {createEditor} from './test-utils';
import assert from 'assert';
import { CircleNode } from '../../src/model/CircleNode';
import { PathNode } from '../../src/model/PathNode';
describe('PathNode', function () {
  let editor=createEditor('PathNode');
  it('createNode', function () {
     let pathNode=new PathNode(
      {
        attributes: {
          x: 0,
          y: 0,
          scaleX:0.2,
          scaleY:0.2,
          data: 'M170.666667 85.333333h682.666666a85.333333 85.333333 0 0 1 85.333334 85.333334v512a85.333333 85.333333 0 0 1-85.333334 85.333333h-170.666666l-170.666667 170.666667-170.666667-170.666667H170.666667a85.333333 85.333333 0 0 1-85.333334-85.333333V170.666667a85.333333 85.333333 0 0 1 85.333334-85.333334m0 85.333334v512h206.08L512 817.92 647.253333 682.666667H853.333333V170.666667H170.666667z',
          strokeWidth: 4,
          stroke: 'green',
          draggable:true
        }
      }
     );
     editor.getDataModel()?.addNode(pathNode);
     assert.equal(pathNode.getAttributeValue('x'), 0);
     
  })
  it('add circle node to editor', function () {
  
  
  })
})


