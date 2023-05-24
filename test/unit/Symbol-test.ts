import { RectNode } from '../../src/model/RectNode';
import { EllipseNode } from '../../src/model/EllipseNode';
import { GraphEditor } from '../../src/GraphEditor';
import {createEditor} from './test-utils';
import assert from 'assert';
import { PathNode } from '../../src/model/PathNode';
import { PenNode } from '../../src/model/PenNode';
import { PolylineNode } from '../../src/model/PolylineNode';
import { RegularPolygonNode } from '../../src/model/RegularPolygonNode';
import { SymbolNode } from '../../src/model/SymbolNode';


describe('SymbolNode', function () {
  let editor=createEditor('SymbolNode');
  let symbolNode;
  it('create symbol node', function () {
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
    symbolNode=new SymbolNode(
      {
        attributes: {
          x: 50,
          y: 50,
          draggable:true
        }
      }
     );
     symbolNode.setMembers([rectNode,ellipseNode]);
     symbolNode.setSymbolName('breaker');
     editor.getDataModel().addNode(symbolNode);
     assert.equal(symbolNode.getSymbolName(), 'breaker');
     
  })
  it('modify attributes', function () {
   
   
  })
})


