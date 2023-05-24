


import type { Nullable } from '.'
import type Konva from 'konva'

export declare interface BaseConfig {
  container?: HTMLDivElement
  graph?:string
  style?:Partial<{
    strokeWidth: number,
    stroke: string,
    draggable: boolean,
    strokeScaleEnabled: boolean,
    hitStrokeWidth: number
  }>
}
export declare interface EditorConfig extends BaseConfig {

  view?: Partial<{
    grid: Partial<{
      show: boolean,
      distance: number,
      color: string
    }>,
    size: Partial<{
      width: number,
      height: number
    }>
  }>
  drawing?: Partial<{
    snapToGrid: Partial<{
      enable: boolean,
      strokeWidth: number,
      stroke: string,
      dash: Array<number>
    }>
    editAnchor:Partial<{
      anchorFill: string,
      anchorStroke: string
    }>
  }>
  selection?: Partial<{
    interactive: boolean
    keyboard: Partial<
      Nullable<{
        enabled: boolean
        movingSpaces: number
        map: Partial<
          Nullable<{
            delete?: string[]
            moveLeft?: string[]
            moveRight?: string[]
            moveUp?: string[]
            moveDown?: string[]
            selectAll?: string[]
            deselect?: string[]
            inverseSelect?: string[]
            copy?: string[]
            paste?: string[]
            group?: string[]
          }>
        >
      }>
    >
    transformer: Konva.TransformerConfig
    zone: Partial<{
      fill: string,
      stroke: string
    }>
  }>
  history?: Partial<{
    keyboard: {
      enabled: boolean
    }
  }>
}

export declare interface ViewerConfig extends BaseConfig{
  
}

export declare type Config = Partial<BaseConfig>

