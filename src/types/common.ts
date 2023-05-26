import { NodeAttrs } from "../model/Node"

export type Nullable<T> = T | null

export interface UnknownObject {
  [key: string]: boolean | number | string | object | null | undefined
}

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
