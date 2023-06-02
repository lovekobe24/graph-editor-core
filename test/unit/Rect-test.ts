import { RectNode } from '../../src/model/RectNode';
import { EllipseNode } from '../../src/model/EllipseNode';
import { GraphEditor } from '../../src/GraphEditor';
import {createEditor} from './test-utils';
import assert from 'assert';
describe('RectNode', function () {
  let rectNode;
  let editor=createEditor('RectNode');
  it('add rect node to editor', function () {

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
  it('createNode', function () {
    rectNode=new RectNode(
      {
        attributes: {
          x: 50,
          y: 50,
          width: 100,
          height: 60,
          strokeWidth: 2,
          stroke: 'green',
          draggable:true
        }
      }
     );
     editor.getDataModel()?.addNode(rectNode);
     assert.equal(rectNode?.getAttributeValue('width'), 100);
     
  })
  it('rect rotate', function () {
   
    editor.setAttributeValue('rotation',30);
    editor.setAttributeValue('rotation',90);
  })
})


