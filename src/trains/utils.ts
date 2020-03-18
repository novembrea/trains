import { Vertex, VertexType } from './types'

export function printVertex(v: Vertex): string {
  return `${v.name}[${v.weight}]`
}

export function makeVertex(name: string, weight: number, type: VertexType): Vertex {
  return {
    name,
    weight,
    semaphore: { state: 'green' },
    type,
  }
}
