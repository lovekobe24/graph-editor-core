import type { EditorConfig } from "./types";

export const defaultConfig:EditorConfig = {
    view: {
        grid: {
            show: true,
            distance: 50,
            color: '#cccccc'
        },
        size: {
            width: 1000,
            height: 800
        }
    },
    drawing: {
        snapToGrid: {
            enable: false,
            strokeWidth: 2,
            stroke: '#067BEF',
            dash: [3, 6]
        },
        editAnchor: {
            anchorFill: 'white',
            anchorStroke: 'rgb(0, 161, 255)'
        },
        connectable:false
    },
    selection: {
        transformer: {
            anchorSize: 8,
            rotateAnchorOffset: 30,
            anchorStroke: 'rgb(0, 161, 255)',
            anchorStrokeWidth:1,
            anchorFill: 'white',
            borderStroke: 'rgb(0, 161, 255)',
            borderWidth: 5
        },
        zone: {
            fill: 'rgba(105, 105, 105, 0.7)',
            stroke: '#dbdbdb'
        },
        keyboard: {
            enabled: true,
            movingSpaces: 1,
            map: {
                delete: ['Delete'],
                moveLeft: ['Control+ArrowLeft'],
                moveRight: ['Control+ArrowRight'],
                moveUp: ['Control+ArrowUp'],
                moveDown: ['Control+ArrowDown'],
                moveLeftSlow: ['Control+Shift+ArrowLeft'],
                moveRightSlow: ['Control+Shift+ArrowRight'],
                moveUpSlow: ['Control+Shift+ArrowUp'],
                moveDownSlow: ['Control+Shift+ArrowDown'],
                selectAll: ['Control+a'],
                deselect: ['Control+d'],
                inverseSelect: ['Control+i'],
                copy:['Control+c'],
                paste:['Control+v'],
                group:['Control+g'],
                undo:['Control+z'],
                redo:['Control+y'],
                toSelectMode:['v']
            }
        }
    },
    style: {
        strokeWidth: 2,
        stroke: '#ff0000',
        draggable: true,
        strokeScaleEnabled: false,
        hitStrokeWidth:6
    },
    history:{
       keyboard:{
          enabled:true
        }
    }
}