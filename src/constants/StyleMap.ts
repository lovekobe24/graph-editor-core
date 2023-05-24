const RESIZE_STYLE = ['x', 'y', 'scaleX', 'scaleY', 'skewX', 'skewY', 'rotation', 'points'];
const MOVE_STYLE: any = ['x', 'y'];
const STYLE_DEFAULT_VAL: any = { 'scaleX': 1, 'scaleY': 1, 'skewX': 0, 'skewY': 0, 'rotation': 0 };
const ACTION_TO_STYLE_MAP: any = {
    'move': MOVE_STYLE,
    'resize': RESIZE_STYLE,
    'rotate': ['x', 'y', 'rotation'],
    'lineResize': ['x1', 'x2', 'y1', 'y2']
};

export { RESIZE_STYLE, MOVE_STYLE, STYLE_DEFAULT_VAL, ACTION_TO_STYLE_MAP };