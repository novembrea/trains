import { Circle } from 'konva/types/shapes/Circle'
import { Path } from 'konva/types/shapes/Path'
import { RegularPolygon } from 'konva/types/shapes/RegularPolygon'

export type VertexType = 'station' | 'semaphore'
export type TrainShape = RegularPolygon | Circle
export type Stations = { [key: string]: { name: string; edges: Path[]; station: Circle } }
export type Distance = { [key: string]: { station: string; distance: number }[] }

export type Semaphore = {
  state: 'red' | 'green'
}

export type Vertex = {
  name: string
  weight: number
  semaphore: Semaphore
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

  globalSpeedModifier: number
  stationsCount: number
  trainsCount: number
  connectionDensity: number
  playBtn: HTMLElement
}
