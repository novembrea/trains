import { names } from 'trains/constants'
import RailRoadGraph from 'trains/railroad'
import render from 'trains/renderer'
import initUI from 'trains/ui'

function main() {
  initUI()
  render(new RailRoadGraph(names))
}

main()
