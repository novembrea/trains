import { names } from 'trains/constants'
import RailRoadGraph from 'trains/railroad'
import render from 'trains/renderer'

function main() {
  const rr = new RailRoadGraph(names)
  render(rr)
}

main()
