import { vertexExclusionRadius } from './constants'
import { Stations, Vertex, VertexType } from './types'

export const printVertex = (v: Vertex): string => `${v.name}[${v.weight}]`
export const makeVertex = (name: string, weight: number, type: VertexType): Vertex => ({
  name,
  weight,
  semaphore: { state: 'green' },
  type,
})

export const randBetween = (min: number, max: number) => Math.random() * max + min
export const randElement = (target: string[]) => target[Math.floor(Math.random() * target.length)]
export const anyButGiven = (given: string[], target: string[]) => randElement(target.filter(n => !given.includes(n)))
export const randColor = () => '#' + (((1 << 24) * Math.random()) | 0).toString(16)
export const pointDistance = (x1: number, x2: number, y1: number, y2: number) =>
  +Math.hypot(x2 - x1, y2 - y1).toFixed(0)

interface intersectionArgs {
  x1: number
  y1: number
  x2: number
  y2: number
  cx: number
  cy: number
  radius: number
}
const dot = (v1: number[], v2: number[]) => v1[0] * v2[0] + v1[1] * v2[1]
export const doesLineIntersectCircle = (props: intersectionArgs) => {
  let { x1, x2, y1, y2, cx, cy, radius } = props
  let ac = [cx - x1, cy - y1]
  let ab = [x2 - x1, y2 - y1]
  let ab2 = dot(ab, ab)
  let acab = dot(ac, ab)
  let t = acab / ab2
  t = t < 0 ? 0 : t
  t = t > 1 ? 1 : t
  let h = [ab[0] * t + x1 - cx, ab[1] * t + y1 - cy]
  let h2 = dot(h, h)
  return h2 <= radius * radius
}

// Checks whether provided point at given x/y can accomodate station considering constant value of exclusion radius.
export const canFitStation = (x: number, y: number, stations: Stations): boolean => {
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

export const info = ({ text, bg = 'white' }: { text: string; bg?: string }) =>
  console.log(`%c ${text}`, `background: ${bg}; color: black`)
