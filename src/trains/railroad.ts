import sample from 'lodash/sample'

import { Vertex } from './types'
import { anyButGiven, info, printVertex } from './utils'

class RailRoadGraph {
  vertices: string[]
  adjList: Map<string, Vertex[]>

  constructor(vertices: string[]) {
    this.vertices = vertices
    this.adjList = new Map()

    this.init()
  }

  init() {
    this.vertices.forEach(this.addVertex.bind(this))
  }

  addVertex(v: string) {
    this.adjList.set(v, [])
  }

  addEdge(a: Vertex, b: Vertex) {
    const aList = this.adjList.get(a.name)
    const bList = this.adjList.get(b.name)
    if (!aList || !bList) throw Error('one of two vertices or both not found')
    if (aList.find(v => v.name === b.name) === undefined) aList.push(b)
    if (bList.find(v => v.name === a.name) === undefined) bList.push(a)
  }

  disconnectEdges(a: string, b: string) {
    info({ text: `disconnecting colliding edge [${a} ⇄ ${b}]` })
    this.adjList.set(
      a,
      this.adjList.get(a)!.filter(v => v.name !== b),
    )
    this.adjList.set(
      b,
      this.adjList.get(b)!.filter(v => v.name !== a),
    )
  }

  isDisconnected(): boolean {
    const visited: { [key: string]: boolean } = {}
    const visit = (vertex: Vertex): void => {
      if (visited[vertex.name]) return
      visited[vertex.name] = true
      return this.adjList.get(vertex.name)?.forEach(v => visit(v))
    }
    visit(this.adjList.get(this.vertices[0])![0])
    return Object.keys(visited).length === this.vertices.length
  }

  randomStartEnd(): { start: Vertex; end: Vertex } {
    const a = sample(this.vertices)!
    const b = anyButGiven([a], this.vertices)
    return { start: sample(this.adjList.get(a))!, end: sample(this.adjList.get(b))! }
  }

  randomEnd(start: Vertex): Vertex {
    const pool: Vertex[] = []
    // TODO make it more efficient.
    this.adjList.forEach((vertices, k) => {
      pool.push(...vertices.filter(v => v.name !== start.name))
    })
    return sample(pool)!
  }

  print() {
    this.adjList.forEach((value, key) => {
      let str = ''
      value.forEach(v => (str += `${printVertex(v)} and `))
      console.log(`${key} with ${str.slice(0, str.length - 4)}`)
    })
  }
}

export default RailRoadGraph
