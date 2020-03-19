import RailRoadGraph from './railroad'
import { Vertex } from './types'

class PriorityQueue {
  queue: { id: string; priority: number }[]
  constructor() {
    this.queue = []
  }

  enqueue(id: string, priority: number) {
    this.queue.push({ id, priority })
    this.sort()
  }

  dequeue() {
    return this.queue.shift()
  }

  sort() {
    this.queue.sort((a, b) => a.priority - b.priority)
  }
}

export default function dijkstra(start: Vertex, end: Vertex, g: RailRoadGraph): string[] {
  const costs: { [key: string]: number } = {}
  const pq = new PriorityQueue()
  const processed: { [key: string]: string | null } = {}
  const route: string[] = []
  let current: string

  g.adjList.forEach((_, name) => {
    if (name === start.name) {
      costs[name] = 0
      pq.enqueue(name, 0)
    } else costs[name] = Infinity
    processed[name] = null
  })

  while (pq.queue.length) {
    current = pq.dequeue()!.id
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
        pq.enqueue(neighbor.name, costToNeighbor)
      }
    }
  }

  return route.reverse()
}
