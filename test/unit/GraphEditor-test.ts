import { RectNode } from '../../src/model/RectNode';
import { EllipseNode } from '../../src/model/EllipseNode';

import { createEditor } from './test-utils';
import assert from 'assert';
import { PathNode } from '../../src/model/PathNode';
import { PenNode } from '../../src/model/PenNode';
import { PolylineNode } from '../../src/model/PolylineNode';
import { RegularPolygonNode } from '../../src/model/RegularPolygonNode';
import { StarNode } from '../../src/model/StarNode';
import { TextNode } from '../../src/model/TextNode';
import { WedgeNode } from '../../src/model/WedgeNode';

describe('GraphEditor', function () {
  let editor = createEditor('GraphEditor');
  let wedgeNode;
  let rectNode;
  it('add node', function () {
    editor.addNode({
      className: 'RectNode',
      attributes: {
        x: 100,
        y: 20,
        width: 200,
        height: 60,
        strokeWidth: 2,
        fill: 'gray',
        stroke: 'red'
      }
    })
    editor.addNode({
      className: 'EllipseNode',
      attributes: {
        x: 100,
        y: 30,
        radiusX: 50,
        radiusY: 25,
        strokeWidth: 4,
        fill: 'gray',
        stroke: 'green'
      }
    })
    assert.equal(editor.getNodes().length, 2);

  })
  it('copy add paste', function () {
    editor.copy();
    editor.paste();
    assert.equal(editor.getNodes().length, 3);

  })
  it('move', function () {
    let ids= editor.getNodes().map(item =>item.id);
    editor.move('down',30,ids[0]);
    assert.equal(editor.getAttributeValue('y',ids[0]), 50);
  })
  it('setAttributes', function () {
    editor.setAttributes({
      'fill':'red'
    });
    assert.equal(editor.getSelection()[0].attributes.fill, 'red');
  })

  it('undo', function () {
    editor.undo();
    assert.equal(editor.getSelection()[0].attributes.fill, 'gray');
  })
  it('redo', function () {
    editor.redo();
    assert.equal(editor.getSelection()[0].attributes.fill, 'red');
  })
  it('align', function () {
    let allNodes:Array<any>= editor.getNodes();
    let ids= allNodes.map(item =>item.id);
    editor.align('left',ids);
  })

  it('saveVariable', function () {
    let allNodes:Array<any>= editor.getNodes();
    let ids= allNodes.map(item =>item.id);
    editor.saveVariable('变量1',{
      type:'integer',
      defaultVal:0
    },false,'',ids[0]);
    editor.saveVariable('变量3',{
      type:'integer',
      defaultVal:0
    },false,'',ids[0]);
     //修改变量
     editor.saveVariable('变量2',{
      type:'integer',
      defaultVal:0
    },false,'变量1',ids[0]);
    assert.equal(editor?.getDataModel()?.getNodeById(ids[0]).getVariables().hasOwnProperty('变量3'), true);
  })
  it('deleteVariable', function () {
    let ids= editor.getNodes().map(item =>item.id);
    editor.deleteVariable('变量3',false,ids[0]);
    assert.equal(editor?.getDataModel()?.getNodeById(ids[0]).getVariables().hasOwnProperty('变量3'), false);
  })
  it('onModelChanged', function () {
    editor.onModelChanged(function (sender, event) {
      console.log("onModelChanged", event);
    });
  })
  it('group', function () {
    let ids= editor.getNodes().map(item =>item.id);
    editor.group(ids);
    let nodes = editor.getNodes();
    assert.equal(nodes.length, 1);
  })
  it('unGroup', function () {
    editor.unGroup();
    assert.equal(editor.getNodes().length, 3);
  })
  it('setAttributeValues', function () {
    let ids= editor.getNodes().map(item =>item.id);
    editor.setAttributes({ 'fill': 'yellow' },ids[0]);
    assert.equal(editor.getAttributeValue('fill',ids[0]), 'yellow');
  })
  it('addEvent', function () {
    let ids= editor.getNodes().map(item =>item.id);
    editor.addEvent({
      type: 'valueUpdate',
      action: 'changeProperty',
      value: [],
      where: {
        type: 'none'
      }
    },ids[0]);
    assert.equal(editor.getNodes()[0].events[0].action, 'changeProperty');
  })
  it('updateEvent', function () {
    let ids= editor.getNodes().map(item =>item.id);
    editor.updateEvent({
      value: [
        {'fill':'red'},
        {'fill':'black'}
      ],
    },0,ids[0]);
    assert.equal(editor.getNodes()[0].events[0].value.length, 2);
  })
  it('deleteEvent', function () {
    let ids= editor.getNodes().map(item =>item.id);
    editor.deleteEvent(0,ids[0]);
    assert.equal(editor.getNodes()[0].events.length, 0);
  })
  it('toJSON', function () {
    let jsonStr=editor.toJSON();
    console.log(jsonStr);
  })
  it('setAnimations', function () {
    let ids= editor.getNodes().map(item =>item.id);
    console.log(ids);
    editor.setAnimations({
      type:'blink',
      autoPlay:true
    },ids[0]);
    assert.equal(editor.getNodes()[0].animation.type, "blink");
  })
})

