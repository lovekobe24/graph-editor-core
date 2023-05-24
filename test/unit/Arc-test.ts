import { RectNode } from '../../src/model/RectNode';
import { EllipseNode } from '../../src/model/EllipseNode';

import { createEditor } from './test-utils';
import assert from 'assert';
import { ArcNode } from '../../src/model/ArcNode';
describe('ArcNode', function () {

  it('createNode', function () {
    let editor = createEditor('ArcNode');
    let arcNode = new ArcNode(
      {
        attributes: {
          x: 50,
          y: 50,
          angle: 50,
          innerRadius: 20,
          outerRadius: 50,
          strokeWidth: 2,
          stroke: 'red',
          draggable:true
        }
      }
    );
    editor.getDataModel().addNode(arcNode);
    assert.equal(arcNode.getAttributeValue('angle'), 50);

  })
  it('add rect node to editor', function () {
    
    // editor.addNode({
    //   className: 'ArcNode',
    //   attributes: {
    //     x: 50,
    //     y: 50,
    //     angle: 50,
    //     innerRadius: 20,
    //     outerRadius: 50,
    //     strokeWidth: 2,
    //     stroke: 'red'
    //   }
    // })
    // assert.equal(editor.getSelection().length, 1);
    // assert.equal(editor.getSelection()[0].attributes.innerRadius, 20);
  })

})


