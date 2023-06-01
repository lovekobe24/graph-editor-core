import { NodeAttrs } from "../model/Node"


export type Nullable<T> = T | null

export interface UnknownObject {
  [key: string]: boolean | number | string | object | null | undefined
}
export type AlignDirection = 'left'| 'right'| 'top' | 'bottom' | 'horizontal' | 'vertical'
export type MoveDirection = 'left'| 'right'| 'up' | 'down'
export type EventType = 'click' | 'valueUpdate'| 'mousemove' | 'mouseout'
export type EventAction = 'changeProperty' | 'executeAnimation'| 'stopAnimation' | 'executeScript'
export type EventWhereType = 'customScript'|'comparison'|'none'
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

export declare interface Event {
   type?:EventType,
   action?:EventAction,
   value?:any,
   where?:{
     type?:EventWhereType,
     value?: any,
     key?: string,
     comparison?: string,
     fnjs?:string
   }
}
