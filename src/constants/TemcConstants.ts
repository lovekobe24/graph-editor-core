
export const CUSTOM_SCRIPT = 'customScript';
export const COMPARISON = 'comparison';
export const FN_JS = 'fnjs';

export const ROTATE_BY_CENTER = 'rotateByCenter';
export const BLINK = 'blink';
export const FLOW = 'flow';
export const NONE = 'none';

export const TRANSFORM = 'transform';
//事件行为
export const EXECUTE_ANIMATION_ACTION = 'executeAnimation';
export const STOP_ANIMATION_ACTION = "stopAnimation";
export const CHANGE_PROPERTY_ACTION = 'changeProperty';
export const EXECUTE_SCRIPT_ACTION = 'executeScript';

export const MOUSE_LEAVE_EVT_TYPE = 'mouseleave';
export const MOUSE_ENTER_EVT_TYPE = 'mouseenter';
export const MOUSE_CLICK_EVT_TYPE = 'click';
export const MOUSE_DBL_CLICK_EVT_TYPE = 'dblclick';
export const VALUE_UPDATE_EVT_TYPE = 'valueUpdate';


export const DIRECTION_LEFT = 'left';
export const DIRECTION_RIGHT = 'right';
export const DIRECTION_TOP = 'top';
export const DIRECTION_BOTTOM = 'bottom';
export const DIRECTION_HORIZONTAL = 'horizontal';
export const DIRECTION_VERTICAL = 'vertical';

export const REGULAR_MODE = 'regularMode';
export const DRAWING_MODE = 'drawingMode';
export const EDITING_MODE = 'editingMode';

export const DRAWING_MOUSE_DOWN = 0;
export const DRAWING_MOUSE_MOVE = 1;
export const DRAWING_MOUSE_UP = 2;
export const DRAWING_MOUSE_DBL_CLICK = 3;

export const MAX_SCALE = 10;
export const MIN_SCALE = 0.1;

export const GRAPH_EDITOR_WARNING = "GraphEditor warning ";
export const GRAPH_EDITOR_INFO = "GraphEditor info ";


const supportAnimation = [BLINK, ROTATE_BY_CENTER, FLOW,NONE];
const supportEventType = [MOUSE_CLICK_EVT_TYPE, MOUSE_LEAVE_EVT_TYPE, MOUSE_ENTER_EVT_TYPE,MOUSE_DBL_CLICK_EVT_TYPE, VALUE_UPDATE_EVT_TYPE];
const supportEventAction = [EXECUTE_ANIMATION_ACTION, STOP_ANIMATION_ACTION, CHANGE_PROPERTY_ACTION, EXECUTE_SCRIPT_ACTION];
const animationToDefaultPeriod: any = {
    'blink': 1,
    'rotateByCenter': 6,
    'flow': 4
}

export {
    supportAnimation,
    supportEventType,
    supportEventAction,
    animationToDefaultPeriod
}