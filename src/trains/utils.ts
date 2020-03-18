import { stations, vertexExclusionRadius } from './constants'
import { Vertex, VertexType } from './types'

export const printVertex = (v: Vertex): string => `${v.name}[${v.weight}]`
export const makeVertex = (name: string, weight: number, type: VertexType): Vertex => ({
  name,
  weight,
  semaphore: { state: 'green' },
  type,
})

// Generic helpers.
export const randBetween = (min: number, max: number) => Math.random() * max + min
export const randElement = (target: string[]) => target[Math.floor(Math.random() * target.length)]
export const anyButGiven = (given: string[], target: string[]) => randElement(target.filter(n => !given.includes(n)))
export const randColor = () => '#' + (((1 << 24) * Math.random()) | 0).toString(16)
export const pointDistance = (x1: number, x2: number, y1: number, y2: number) => Math.hypot(x2 - x1, y2 - y1)

// Checks whether provided pooint at given x/y can accomodate station considering constant value of exclusion radius.
export const canFitStation = (x: number, y: number): boolean => {
  const keys = Object.keys(stations)
  for (let i = 0; i < keys.length; i++) {
    const { station } = stations[keys[i]]
    const [sx, sy] = [station.x(), station.y()]
    const xDiff = Math.abs(x - sx)
    const yDiff = Math.abs(y - sy)
    if (xDiff < vertexExclusionRadius && yDiff < vertexExclusionRadius) return false
  }
  return true
}
