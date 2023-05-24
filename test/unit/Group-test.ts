import { RectNode } from '../../src/model/RectNode';
import { EllipseNode } from '../../src/model/EllipseNode';
import { GraphEditor } from '../../src/GraphEditor';
import {createEditor} from './test-utils';
import assert from 'assert';
import { CircleNode } from '../../src/model/CircleNode';
import { GroupNode } from '../../src/model/GroupNode';
describe('GroupNode', function () {
  let editor=createEditor('GroupNode');
  it('createNode', function () {
    let rectNode=new RectNode(
      {
        attributes: {
          x: 50,
          y: 50,
          width: 100,
          height: 60,
          strokeWidth: 2,
          stroke: 'red'
        }
      }
     );
     let ellipseNode=new EllipseNode(
      {
        attributes: {
          x: 50,
          y: 50,
          radiusX: 50,
          radiusY: 60,
          strokeWidth: 2,
          stroke: 'red'
        }
      }
     );
     let groupNode=new GroupNode(
      {
        attributes: {
          x: 50,
          y: 50,
          draggable:true
        }
      }
     );
     groupNode.setMembers([rectNode,ellipseNode]);
     editor.getDataModel().addNode(groupNode);
     assert.equal(groupNode.getAttributeValue('x'), 50);
     
  })
  
})


