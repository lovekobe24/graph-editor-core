let EVENT_TYPE = {
    ADD_KONVA_NODE:'addKonvaNode',
    ADD_NODES:'addNodes',
    ADD_KONVA_NODES:'addKonvaNodes',

    REMOVE_NODE: 'removeNode',
    REMOVE_NODES: 'removeNodes',
    WRAP_NODES_INTO_GROUP: 'wrapNodesIntoGroup',
    UNWRAP_NODES_FROM_GROUP: 'unwrapNodesFromGroup',
    SELECT_CHANGE: 'selectionChange',
    PROPERTY_CHANGE:'propertyChange',
    SELECTION_KONVA_NODE_CHANGE:'selectionKonvaNodeChange',
    NODE_ATTRIBUTE_CHANGE: 'nodeAttributeChange',
    NODE_EVENTS_CHANGE:'nodeEventsChange',
    NODE_PROPERTY_CHANGE:'nodePropertyChange',
    //节点的变量发生改变
    NODE_VARIABLE_CHANGE:'nodeVariableChange',
    MODEL_VARIABLE_CHANGE:'modelVariableChange',
    NODE_ANIMATION_CHANGE:'nodeAnimationChange',
    BACKGROUND_COLOR_CHANGE:'bgColorChange',
    ZINDEX_CHANGE:'zIndexChange'
};

export default EVENT_TYPE;