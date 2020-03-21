import { Path } from 'konva/types/shapes/Path'

import { vertexExclusionRadius } from './constants'
import dijkstra from './dijkstra'
import RailRoadGraph from './railroad'
import { Pair, Stations, Vertex, VertexType } from './types'

export const printVertex = (v: Vertex): string => `${v.name}[${v.weight}]`
export const makeVertex = (name: string, weight: number, type: VertexType): Vertex => ({
  name,
  weight,
  semaphore: { state: 'green' },
  type,
})

export const toCapital = (w: string) => w[0].toUpperCase() + w.slice(1, w.length)
export const round = (n: number) => +n.toFixed(0)
export const byid = (id: string) => document.getElementById(id)!
export const randBetween = (min: number, max: number) => Math.random() * max + min
export const randElement = (target: string[]) => target[Math.floor(Math.random() * target.length)]
export const anyButGiven = (given: string[], target: string[]) => randElement(target.filter(n => !given.includes(n)))
export const randColor = () => '#' + (((1 << 24) * Math.random()) | 0).toString(16)
export const pointDistance = (x1: number, x2: number, y1: number, y2: number) =>
  +Math.hypot(x2 - x1, y2 - y1).toFixed(0)

export const memoizedPathEnd = (): ((path: Path) => Pair) => {
  let cache: Pair = { x: 0, y: 0 }
  let prevPath = ''
  return (path: Path) => {
    if (prevPath === path.name()) {
      return cache
    }
    prevPath = path.name()
    const { x, y } = path.getPointAtLength(path.getLength())
    cache = { x: round(x), y: round(y) }
    return cache
  }
}

interface intersectionArgs {
  x1: number
  y1: number
  x2: number
  y2: number
  cx: number
  cy: number
  radius: number
}

// Borrowed from https://github.com/davidfig/intersects/blob/master/line-circle.js
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

export const generateRoute = (start: Vertex, end: Vertex, g: RailRoadGraph, stations: Stations): Path[] => {
  let p: string[]
  try {
    p = dijkstra(start, end, g)
  } catch (error) {
    throw Error(error)
  }

  return [
    stations[start.name].edges.find(edge => edge.name() === `${start.name}-${p[0]}`)!,
    ...p
      .map((path, i) => {
        const r = stations[path].edges.find(edge => edge.name() === `${path}-${p[i + 1]}`)!
        return r
      })
      .filter(Boolean),
  ]
}

export const info = ({ text, bg = 'white' }: { text: string; bg?: string }) =>
  console.log(`%c ${text}`, `background: ${bg}; color: black`)
