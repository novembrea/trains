import { coordinates, vertexExclusionRadius } from './constants'
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

export const randBetween = (min: number, max: number) => Math.random() * max + min
export const randElement = (target: string[]) => target[Math.floor(Math.random() * target.length)]
export const anyButGiven = (given: string[], target: string[]) => randElement(target.filter(n => !given.includes(n)))
export const randColor = () => '#' + (((1 << 24) * Math.random()) | 0).toString(16)
export const pointDistance = (x1: number, x2: number, y1: number, y2: number) => Math.hypot(x2 - x1, y2 - y1)
export const verifyExclusion = (x: number, y: number): boolean => {
  const keys = Object.keys(coordinates)
  for (let i = 0; i < keys.length; i++) {
    const k = coordinates[keys[i]]
    const [xCoord, yCoord] = [k.x, k.y]
    const xDiff = Math.abs(x - xCoord)
    const yDiff = Math.abs(y - yCoord)
    if (xDiff < vertexExclusionRadius && yDiff < vertexExclusionRadius) return false
  }
  return true
}
