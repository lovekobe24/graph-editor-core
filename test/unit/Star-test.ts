import { RectNode } from '../../src/model/RectNode';
import { EllipseNode } from '../../src/model/EllipseNode';
import { GraphEditor } from '../../src/GraphEditor';
import {createEditor} from './test-utils';
import assert from 'assert';
import { PathNode } from '../../src/model/PathNode';
import { PenNode } from '../../src/model/PenNode';
import { PolylineNode } from '../../src/model/PolylineNode';
import { RegularPolygonNode } from '../../src/model/RegularPolygonNode';
import { StarNode } from '../../src/model/StarNode';

describe('StarNode', function () {
  let editor=createEditor('StarNode');
  let starNode;
  it('create star node', function () {
    starNode=new StarNode(
      {
        attributes: {
          x: 50,
          y: 50,
          numPoints:6,
          innerRadius:20,
          outerRadius:50,
          strokeWidth: 4,
          stroke: 'green',
          draggable:true
        }
      }
     );
     editor.getDataModel().addNode(starNode);
     assert.equal(starNode.getAttributeValue('numPoints'), 6);
     
  })
  it('modify attributes', function () {
    starNode.setAttributeValue('numPoints',10);
     assert.equal(starNode.getAttributeValue('numPoints'), 10);
   
  })
})


