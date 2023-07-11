import { RectNode } from '../../src/model/RectNode';
import { EllipseNode } from '../../src/model/EllipseNode';
import { GraphEditor } from '../../src/GraphEditor';
import { createEditor } from './test-utils';
import assert from 'assert';
import { PathNode } from '../../src/model/PathNode';
import { PenNode } from '../../src/model/PenNode';
import { PolylineNode } from '../../src/model/PolylineNode';
import { RegularPolygonNode } from '../../src/model/RegularPolygonNode';
import { StarNode } from '../../src/model/StarNode';
import { TextNode } from '../../src/model/TextNode';
import { WedgeNode } from '../../src/model/WedgeNode';

describe('DataModel', function () {
  let editor = createEditor('DataModel');
  let wedgeNode;
  let rectNode;
  it('create wedge node', function () {
    wedgeNode = new WedgeNode(
      {
        attributes: {
          x: 50,
          y: 50,
          angle: 100,
          radius: 15,
          clockwise: false,
          strokeWidth: 2,
          stroke: 'green',
          draggable: true
        }
      }
    );
    rectNode = new RectNode(
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
    editor?.getDataModel()?.addNode(wedgeNode);
    editor?.getDataModel()?.addNode(rectNode);
    assert.equal(wedgeNode.getAttributeValue('radius'), 15);

  })
  it('getNodes', function () {
    let nodes = editor?.getDataModel()?.getNodes();
    assert.equal(nodes?.length, 2);

  })
  it('getNodeById', function () {
    let nodes = editor?.getDataModel()?.getNodes();
    assert.equal(nodes?.length, 2);

  })
  it('toObject', function () {
    let obj = editor?.getDataModel()?.toObject();
    console.log(JSON.stringify(obj));
    assert.equal(obj?.nodes.length, 2);
  })
  it('onSelectionChanged', function () {
    editor?.getDataModel()?.onSelectionChanged(function (sender, event) {
      console.log("onSelectionChange", event);
    });
  })
  it('onModelChanged', function () {
    editor?.getDataModel()?.onModelChanged(function (sender, event) {
      console.log("onModelChanged", event);
    });
  })
  it('group', function () {
    editor?.getDataModel()?.group([wedgeNode, rectNode]);
    let nodes = editor?.getDataModel()?.getNodes();
    assert.equal(nodes?.length, 1);
  })
  it('unGroup', function () {
    let nodes = editor?.getDataModel()?.getNodes();
    if (nodes?.length) {
      editor?.getDataModel()?.unGroup([nodes[0]]);
    }

    assert.equal(nodes?.length, 2);
  })
  it('saveVariable', function () {
    editor?.getDataModel()?.saveVariable('state', {
      defaultVal: 1
    });
    assert.equal(editor?.getDataModel()?.getVariable('state').defaultVal, 1);
  })
  it('getVariables', function () {
    assert.equal(editor?.getDataModel()?.getVariables().hasOwnProperty('state'), true);
  })
  it('setVariables', function () {
    editor?.getDataModel()?.setVariables({
      'temperature': {
        defaultVal: 1
      }
    });
    assert.equal(editor?.getDataModel()?.getVariables().hasOwnProperty('temperature'), true);
  })
  it('deleteVariable', function () {
    editor?.getDataModel()?.deleteVariable('temperature');
    assert.equal(editor?.getDataModel()?.getVariables().hasOwnProperty('temperature'), false);
  })
  it('setAttributeValues', function () {
    let attrMap = new Map();
    attrMap.set(rectNode, { 'fill': 'yellow' });
    editor?.getDataModel()?.setAttributeValues(attrMap);
    assert.equal(rectNode.getAttributeValue('fill'), 'yellow');
  })
  it('addEvent', function () {
    editor?.getDataModel()?.addEvent(rectNode, {
      type: 'valueUpdate',
      action: 'changeProperty',
      value: [],
      where: {
        type: 'none'
      }
    });
    assert.equal(rectNode.getEvents()[0].type, 'valueUpdate');
  })
  it('updateEvent', function () {
    editor?.getDataModel()?.updateEvent(rectNode, {
      value: [
        {
          name: 'fill',
          val: 'red'
        }
      ],
    }, 0);
    assert.equal(rectNode.getEvents()[0].value.length, 2);
  })
  it('deleteEvent', function () {
    editor?.getDataModel()?.deleteEvent(rectNode, 0);
    assert.equal(rectNode.getEvents().length, 0);
  })
  it('setNodeTag', function () {
    editor?.getDataModel()?.setNodeTag(rectNode, "矩形");
    assert.equal(rectNode.getTag(), "矩形");
  })
})


