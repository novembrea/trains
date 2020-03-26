import { Circle } from 'konva/types/shapes/Circle'
import { Path } from 'konva/types/shapes/Path'
import { Rect } from 'konva/types/shapes/Rect'
import { RegularPolygon } from 'konva/types/shapes/RegularPolygon'

export type VertexType = 'station' | 'semaphore'
export type TrainShape = RegularPolygon | Circle | Rect
export type Stations = { [key: string]: { name: string; edges: Path[]; station: Circle; isInfected?: boolean } }
export type Distance = { [key: string]: { station: string; distance: number }[] }

export type Vertex = {
  name: string
  weight: number
  type: VertexType
}

export type Pair = {
  x: number
  y: number
}

export type Config = {
  // Vertices will be snapped using modulo of vertexExclusionRadius applied to x and y coordinates.
  // True will produce a more grid-like layout.
  shouldSnapToGrid: boolean
  hideDistances: boolean
  isPandemic: boolean

  globalSpeedModifier: number
  stationsCount: number
  trainsCount: number
  connectionDensity: number
  playBtn: HTMLElement
}
