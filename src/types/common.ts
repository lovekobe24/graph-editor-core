import { NodeAttrs } from "../model/Node"


export type Nullable<T> = T | null

export interface UnknownObject {
  [key: string]: boolean | number | string | object | null | undefined
}
export type AlignDirection = 'left'| 'right'| 'top' | 'bottom' | 'horizontal' | 'vertical'
export type MoveDirection = 'left'| 'right'| 'up' | 'down'
export type OrderDirection = 'top'| 'bottom'| 'up' | 'down'
export const orderDirection = ["top", "bottom", "up", "down"];
export type EventType = 'click' | 'valuechange'| 'mousemove' | 'mouseout' | 'dblclick'
export type EventAction = 'changeAttributes' | 'updateAnimation' | 'executeScript'
export type EventWhenType = 'script'|'operation'
export declare interface Dimensions {
  width: number
  height: number
}

export declare interface Point {
  x: number
  y: number
}

export declare interface NodeConfig {
  className: string
  attributes: NodeAttrs
  animation:any
  variables:any
}

export declare interface GEvent {
   type?:EventType,
   action?:EventAction,
   attributes?:any,
   animation?:boolean,
   script?:string,
   triggers?:[{
     type?:EventWhenType,
     operation?:{
      source?: any,
      operator?: string,
      target?: any,
     }
     script?:string
   }]
}
