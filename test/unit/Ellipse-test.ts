import { RectNode } from '../../src/model/RectNode';
import { EllipseNode } from '../../src/model/EllipseNode';

import {createEditor} from './test-utils';
import assert from 'assert';
describe('EllipseNode', function () {
 
  it('createNode', function () {
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
     assert.equal(ellipseNode.getAttributeValue('radiusX'), 50);
     
  })
  it('add ellipse node to editor', function () {
    let editor=createEditor('EllipseNode');
    editor.addNode({
      className: 'EllipseNode',
      attributes: {
        x: 50,
        y: 50,
        width: 50,
        height: 60,
        strokeWidth: 2,
        stroke: 'red'
      }
    })
    assert.equal(editor.getSelection().length, 1);
    assert.equal(editor.getSelection()[0].className, 'EllipseNode');
  })
})


