import { RectNode } from '../../src/model/RectNode';
import { EllipseNode } from '../../src/model/EllipseNode';

import {createEditor} from './test-utils';
import assert from 'assert';
import { CircleNode } from '../../src/model/CircleNode';
describe('CircleNode', function () {
 
  it('createNode', function () {
     let circleNode=new CircleNode(
      {
        attributes: {
          x: 50,
          y: 50,
          radius: 50,
          strokeWidth: 2,
          stroke: 'red'
        }
      }
     );
     assert.equal(circleNode.getAttributeValue('radius'), 50);
     
  })
  it('add circle node to editor', function () {
    let editor=createEditor('CircleNode');
    editor.addNode({
      className: 'CircleNode',
      attributes: {
        x: 50,
        y: 50,
        radius: 50,
        stroke: 'red'
      }
    })
    assert.equal(editor.getSelection().length, 1);
  })
})


