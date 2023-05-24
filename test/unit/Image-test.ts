import { RectNode } from '../../src/model/RectNode';
import { EllipseNode } from '../../src/model/EllipseNode';
import { GraphEditor } from '../../src/GraphEditor';
import { createEditor } from './test-utils';
import assert from 'assert';
import { ImageNode } from '../../src/model/ImageNode';
describe('Image', function () {

 
  it('add image node to editor', function () {
    let editor = createEditor('Image');
    let image=new Image();
    image.src="https://i.postimg.cc/HnFSw-Nf0/image.png"
    let imageNode=new ImageNode({
      attributes: {
        image: image,
        x: 50,
        y: 50,
        width: 100,
        height: 60,
        strokeWidth: 2
      }
    })
    editor.getDataModel().addNode(imageNode);
    assert.equal(imageNode.getAttributeValue('width'),100);
  })
})


