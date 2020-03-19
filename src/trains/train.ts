import { Arrow } from 'konva/types/shapes/Arrow'
import { Path } from 'konva/types/shapes/Path'

export default class Train {
  currentPath: number
  id: number
  maxSpeed: number
  pathLength: number
  route: Path[]
  shape: Arrow
  trainType: string
  velocity: number
  currentPos: number
  hasArrived: boolean
  name: string
  lastNode: Node
  constructor(id: number, name: string, trainType: string, shape: Arrow, route: Path[] = [], node: Node) {
    this.currentPath = 0
    this.id = id
    this.maxSpeed = 0
    this.pathLength = route.length
    this.route = route
    this.shape = shape
    this.trainType = trainType
    this.velocity = 0
    this.currentPos = 0
    this.hasArrived = false
    this.name = name
    this.lastNode = node
  }
  currentRoute() {
    console.log(this.route)
    if (this.route[this.currentPath] === undefined) {
      return this.route[this.currentPath - 1]
    }
    return this.route[this.currentPath]
  }

  public incrementPos = () => {
    this.currentPos++
  }

  public set routes(route: Path[]) {
    this.route = route
  }
  public incrementRoute = () => {
    this.currentPath++
    if (this.currentPath === this.pathLength) {
      this.hasArrived = true
    }
  }
}
