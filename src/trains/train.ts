import Konva from 'konva'
import { Path } from 'konva/types/shapes/Path'

import { trainRadius } from './constants'
import { TrainShape, Vertex } from './types'
import { randColor, round } from './utils'

export class Train {
  readonly shape: TrainShape
  private readonly velocity: number
  speedModifier: number

  // Position of the shape along current edge, lies in range of 0 to routeLength.
  private currentPosition: number
  private routeLength: number

  // Train route is a composition of edges between stations, represented by Konva's Path shapes.
  route: Path[]

  // Index of a Path on which train is currently moving.
  // Upon reaching the end of the Path (currentPosition == routeLength) this field is incremented.
  private currentRouteIndex: number

  // End point in this train's route.
  endVertex: Vertex

  // Auxiliary fields.
  name: string
  trainType: string

  constructor(
    name: string,
    trainType: string,
    route: Path[],
    endVertex: Vertex,
    shape: TrainShape,
    velocity: number,
    speedModifier: number,
  ) {
    this.name = name
    this.trainType = trainType
    this.shape = shape
    this.velocity = velocity
    this.speedModifier = speedModifier
    this.init(route, endVertex)
  }

  private init(route: Path[], endVertex: Vertex) {
    this.route = route
    this.endVertex = endVertex

    this.routeLength = route.length
    this.currentRouteIndex = 0
    this.currentPosition = 0
  }

  private get actualVelocity() {
    return this.velocity * this.speedModifier
  }

  public get currentPath(): Path {
    return this.route[this.currentRouteIndex]
  }

  public get isEndOfRoute(): boolean {
    return this.currentRouteIndex === this.routeLength
  }

  public get isEndOfPath(): boolean {
    const { x, y } = this.currentPath.getPointAtLength(this.actualVelocity * this.currentPosition)
    const { x: x2, y: y2 } = this.currentPath.getPointAtLength(this.currentPath.getLength())
    return round(x) === round(x2) && round(y) === round(y2)
  }

  public moveForward() {
    const { x, y } = this.currentPath.getPointAtLength(this.actualVelocity * this.currentPosition)
    this.shape.position({ x: x, y: y })
    this.currentPosition++
  }

  public updateRoute(route: Path[], endVertex: Vertex) {
    this.init(route, endVertex)
  }

  public incrementPos() {
    this.currentPosition++
  }

  public nextStation() {
    // Store and reset current position to the beginning of the new path
    let prevPos = this.currentPosition
    this.currentPosition = 0
    this.currentRouteIndex++

    if (this.isEndOfRoute) {
      // If this is the end of the current route, restore currentPosition until new route is generated.
      this.currentPosition = prevPos
    }
  }
}

export class Freight extends Train {
  constructor(name: string, route: Path[], endVertex: Vertex, speedModifier: number, x1: number, y1: number) {
    const shape = new Konva.RegularPolygon({
      x: x1,
      y: y1,
      sides: 3,
      radius: trainRadius,
      fill: randColor(),
      stroke: 'black',
      strokeWidth: 1,
    })
    const velocity = 0.2
    const trainType = 'freight'
    super(name, trainType, route, endVertex, shape, velocity, speedModifier)
  }
}
