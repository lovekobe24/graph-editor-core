import assert from "assert";
import { createEditor } from "./test-utils";

describe('Animation', function () {
 
    let editor=createEditor('Animation');
    it('add blink rect node to editor', function () {
    
      editor.addNode({
        className: 'RectNode',
        attributes: {
          x: 50,
          y: 50,
          width: 100,
          height: 60,
          strokeWidth: 2,
          fill:'blue',
          stroke: 'red'
        }
      })
      editor.setAnimations({
        'type':'blink',
        'autoPlay':true
      })
      assert.equal(editor.getSelection().length, 1);
      assert.equal(editor.getSelection()[0].animation.type, 'blink');
    })
    it('add rotate rect node to editor', function () {
    
        editor.addNode({
          className: 'RectNode',
          attributes: {
            x: 50,
            y: 100,
            width: 100,
            height: 60,
            strokeWidth: 2,
            fill:'yellow',
            stroke: 'red'
          }
        })
        editor.setAnimations({
          'type':'rotateByCenter',
          'autoPlay':true
        })
        assert.equal(editor.getSelection().length, 1);
        assert.equal(editor.getSelection()[0].animation.type, 'rotateByCenter');
      })
      it('add flow line node to editor', function () {
    
        editor.addNode({
          className: 'LineNode',
          attributes: {
            x1: 10,
            y1: 10,
            x2: 200,
            y2: 10,
            strokeWidth: 2,
            stroke: 'red',
            dash:[5,5]
          }
        })
        editor.setAnimations({
          'type':'flow',
          'autoPlay':true
        })
        assert.equal(editor.getSelection().length, 1);
        assert.equal(editor.getSelection()[0].animation.type, 'flow');
      })
  })