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
