import { RectNode } from '../../src/model/RectNode';
import { EllipseNode } from '../../src/model/EllipseNode';
import { GraphEditor } from '../../src/GraphEditor';
import {createEditor} from './test-utils';
import assert from 'assert';
describe('RectNode', function () {
 
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
     assert.equal(rectNode.getAttributeValue('width'), 100);
     
  })
  it('add rect node to editor', function () {
    let editor=createEditor('RectNode');
    editor.addNode({
      className: 'RectNode',
      attributes: {
        x: 50,
        y: 50,
        width: 100,
        height: 60,
        strokeWidth: 2,
        stroke: 'red'
      }
    })
    assert.equal(editor.getSelection().length, 1);
    assert.equal(editor.getSelection()[0].attributes.width, 100);
  })
})


