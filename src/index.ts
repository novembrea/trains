import RailRoadGraph from 'trains/railroad'
import render from 'trains/renderer'
import { makeVertex } from 'trains/utils'

console.log('Choo Choo')

function main() {
  const vertices = ['alpha', 'bravo', 'charly']
  const rr = new RailRoadGraph(vertices)
  vertices.forEach(v0 => {
    let a = makeVertex(v0, 0, 'station')
    vertices.forEach(v1 => {
      let b = makeVertex(v1, 0, 'station')
      rr.addEdge(a, b)
    })
  })
  rr.print()
  render(rr)
}

main()
