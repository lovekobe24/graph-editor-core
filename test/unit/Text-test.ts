import { RectNode } from '../../src/model/RectNode';
import {createEditor} from './test-utils';
import assert from 'assert';
import { PathNode } from '../../src/model/PathNode';
import { PenNode } from '../../src/model/PenNode';
import { PolylineNode } from '../../src/model/PolylineNode';
import { RegularPolygonNode } from '../../src/model/RegularPolygonNode';
import { StarNode } from '../../src/model/StarNode';
import { TextNode } from '../../src/model/TextNode';

describe('TextNode', function () {
  let editor=createEditor('TextNode');
  let textNode;
  it('create text node', function () {
    textNode=new TextNode(
      {
        attributes: {
          x: 50,
          y: 50,
          align:'left',
          padding :10,
          fontFamily : "Arial",
          fontSize : 12, 
          fontStyle : "normal",
          fontVariant : "normal", 
          text: "中文", 
          strokeWidth: 2,
          stroke: 'green',
          draggable:true
        }
      }
     );
     editor.getDataModel()?.addNode(textNode);
     assert.equal(textNode.getAttributeValue('padding'), 10);
     
  })
  it('modify attributes', function () {
    textNode.setAttributeValue('padding',5);
     assert.equal(textNode.getAttributeValue('padding'), 5);
   
  })
})


