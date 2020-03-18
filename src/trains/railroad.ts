import { Vertex } from './types'
import { printVertex } from './utils'

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
    if (!aList || !bList) throw Error('one of two vertices is not found')

    if (aList.find(v => v.name === b.name) === undefined) {
      aList.push(b)
    }
    if (bList.find(v => v.name === a.name) === undefined) {
      bList.push(a)
    }
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

  print() {
    this.adjList.forEach((value, key) => {
      let str = ''
      value.forEach(v => (str += `${printVertex(v)} and `))
      console.log(`${key} with ${str.slice(0, str.length - 4)}`)
    })
  }
}

export default RailRoadGraph
