import { RectNode } from '../../src/model/RectNode';
import { EllipseNode } from '../../src/model/EllipseNode';
import { GraphEditor } from '../../src/GraphEditor';
import {createEditor} from './test-utils';
import assert from 'assert';
import { PathNode } from '../../src/model/PathNode';
import { PenNode } from '../../src/model/PenNode';
import { PolylineNode } from '../../src/model/PolylineNode';
import { RegularPolygonNode } from '../../src/model/RegularPolygonNode';
describe('RegularPolygon', function () {
  let editor=createEditor('RegularPolygon');
  it('create regularPolygon', function () {
     let regularPolygonNode=new RegularPolygonNode(
      {
        attributes: {
          x: 50,
          y: 50,
          sides:5,
          radius:20,
          strokeWidth: 4,
          stroke: 'green',
          draggable:true
        }
      }
     );
     editor.getDataModel().addNode(regularPolygonNode);
     assert.equal(regularPolygonNode.getAttributeValue('radius'), 20);
     
  })
  it('modify attributes', function () {
    let regularPolygonNode=new RegularPolygonNode(
      {
        attributes: {
          x: 100,
          y: 100,
          sides:5,
          radius:20,
          strokeWidth: 4,
          stroke: 'red',
          draggable:true
        }
      }
     );
     editor.getDataModel().addNode(regularPolygonNode);
     regularPolygonNode.setAttributeValue('sides',6);
     assert.equal(regularPolygonNode.getAttributeValue('radius'), 20);
   
  })
})


