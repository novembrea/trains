import { Circle } from 'konva/types/shapes/Circle'
import { Path } from 'konva/types/shapes/Path'

export type VertexType = 'station' | 'semaphore'

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
  shouldSnapToGrid: boolean
  stationsCount: number
  playBtn: HTMLElement
}

export type Stations = { [key: string]: { name: string; edges: Path[]; station: Circle } }
export type Distance = { [key: string]: { station: string; distance: number }[] }
