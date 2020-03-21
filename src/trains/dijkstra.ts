import RailRoadGraph from './railroad'
import { Vertex } from './types'

export default function dijkstra(start: Vertex, end: Vertex, g: RailRoadGraph): string[] {
  const queue: { id: string; priority: number }[] = []
  const costs: { [key: string]: number } = {}
  const processed: { [key: string]: string | null } = {}
  const route: string[] = []

  const enqueue = (id: string, priority: number) => {
    queue.push({ id, priority })
    queue.sort((a, b) => a.priority - b.priority)
  }

  g.adjList.forEach((_, name) => {
    if (name === start.name) {
      costs[name] = 0
      enqueue(name, 0)
    } else costs[name] = Infinity
    processed[name] = null
  })

  let current: string
  while (queue.length) {
    current = queue.shift()!.id
    if (current === end.name) {
      while (processed[current]) {
        route.push(current)
        current = processed[current]!
      }
      break
    }
    for (let neighbor of g.adjList.get(current)!) {
      let costToNeighbor = costs[current] + g.adjList.get(current)!.find(n => n.name === neighbor.name)!.weight
      if (costToNeighbor < costs[neighbor.name]) {
        costs[neighbor.name] = costToNeighbor
        processed[neighbor.name] = current
        enqueue(neighbor.name, costToNeighbor)
      }
    }
  }

  return route.reverse()
}
