import Konva from 'konva'
import { Shape } from 'konva/types/Shape'
import { Path } from 'konva/types/shapes/Path'

import { stationRadius, trainPandmicHealthyColor, trainPandmicInfectedColor, trainRadius } from './constants'
import Station from './station'
import { TrainShape, Vertex } from './types'
import { round } from './utils'

export class Train {
  readonly shape: TrainShape
  velocity: number
  maxSpeed: number
  speedModifier: number
  isInfected: boolean
  passangers: Shape[]

  // Position of the shape along current edge, lies in range of 0 to routeLength.
  private currentPosition: number
  public routeLength: number

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
    maxSpeed: number,
    speedModifier: number,
  ) {
    this.isInfected = false
    this.name = name
    this.trainType = trainType
    this.shape = shape
    this.passangers = []
    this.maxSpeed = maxSpeed
    this.velocity = maxSpeed
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

  public get isMoving(): boolean {
    return this.velocity > 0
  }

  public get currentPath(): Path {
    return this.route[this.currentRouteIndex]
  }

  public get lastPath(): Path {
    return this.route[this.routeLength - 1]
  }

  public get isEndOfRoute(): boolean {
    return this.currentRouteIndex === this.routeLength
  }

  public get isEndOfPath(): boolean {
    const { x, y } = this.currentPath.getPointAtLength(this.actualVelocity * this.currentPosition)
    const { x: x2, y: y2 } = this.currentPath.getPointAtLength(this.currentPath.getLength())
    return round(x) === round(x2) && round(y) === round(y2)
  }

  public get prevVisitedStation(): string {
    return this.currentPath
      .name()
      .split('-')
      .shift()!
  }

  public get currVisitedStation(): string {
    return this.currentPath
      .name()
      .split('-')
      .pop()!
  }

  public halt() {
    this.velocity = 0
  }

  public resume() {
    this.velocity = this.maxSpeed
  }

  public infect() {
    this.isInfected = true
    this.shape.fill(trainPandmicInfectedColor)
  }

  public disinfect() {
    this.isInfected = false
    this.shape.fill(trainPandmicHealthyColor)
  }

  public moveForward() {
    const { x, y } = this.currentPath.getPointAtLength(this.actualVelocity * this.currentPosition)
    this.shape.position({ x: x, y: y })
    this.currentPosition++
  }

  public updateRoute(route: Path[], endVertex: Vertex) {
    this.init(route, endVertex)
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

  public stationStop() {
    this.halt()
    let stopTime = 0
    if (this.isEndOfRoute) stopTime = 300
    setTimeout(() => this.resume(), stopTime)
  }

  //! Canvas can't handle a large number of naively implemented passangers.
  public handlePassangers(station: Station) {
    const waiting = station.passangers.length

    // Unload passangers.
    this.passangers.forEach(p => {
      const r = stationRadius * Math.sqrt(Math.random())
      const theta = Math.random() * 2 * Math.PI
      p.position({
        x: station.shape.x() + r * Math.cos(theta),
        y: station.shape.y() + r * Math.sin(theta),
      })
      station.passangers.push(p)
      setTimeout(() => {
        p.show()
      }, 20)
    })
    this.passangers = []

    // Load passangers.
    const outbound = station.passangers.slice(0, waiting)
    outbound.forEach(p => {
      p.hide()
      this.passangers.push(p)
    })
  }
}

export class Freight extends Train {
  constructor(
    name: string,
    color: string,
    route: Path[],
    endVertex: Vertex,
    speedModifier: number,
    x1: number,
    y1: number,
  ) {
    const shape = new Konva.RegularPolygon({
      x: x1,
      y: y1,
      sides: 4,
      radius: trainRadius,
      fill: color,
      stroke: 'black',
      strokeWidth: 1,
    })

    const maxSpeed = 0.2
    const trainType = 'freight'
    super(name, trainType, route, endVertex, shape, maxSpeed, speedModifier)
  }
}
