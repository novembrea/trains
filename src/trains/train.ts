import Konva from 'konva'
import { Circle } from 'konva/types/shapes/Circle'
import { Path } from 'konva/types/shapes/Path'
import { RegularPolygon } from 'konva/types/shapes/RegularPolygon'

import { trainRadius } from './constants'
import { Vertex } from './types'
import { info, randColor } from './utils'

interface TrainProps {
  name: string
  route: Path[]
  endVertex: Vertex
}

export class Train {
  currentPosition: number
  currentRouteIndex: number
  endVertex: Vertex
  hasArrived: boolean
  name: string
  pathLength: number
  route: Path[]

  constructor({ route, endVertex, name }: TrainProps) {
    this.name = name
    this.route = route
    this.endVertex = endVertex
    this.pathLength = route.length
    this.currentRouteIndex = 0
    this.currentPosition = 0
    this.hasArrived = false
  }

  get currentRoute() {
    return this.route[this.currentRouteIndex]
  }

  public updateRoute(route: Path[], endVertex: Vertex) {
    info({ text: `new route for ${this.name}`, bg: 'lightgray' })
    info({ text: route.map(r => r.name()).join('-'), bg: 'lightgray' })
    this.route = route
    this.endVertex = endVertex
    this.pathLength = route.length
    this.currentRouteIndex = 0
    this.currentPosition = 0
    this.hasArrived = false
  }

  public incrementPos() {
    this.currentPosition++
  }

  public nextStation() {
    // info({
    //   text: `from: ${this.currentRoute
    //     .name()
    //     .split('-')
    //     .pop()}, to: ${this.route[this.currentRouteIndex + 1]
    //     ?.name()
    //     .split('-')
    //     .pop() ?? 'end'}`,
    //   bg: 'gold',
    // })
    this.currentPosition = 0
    this.currentRouteIndex++
    let prevPos = this.currentPosition
    if (this.currentRouteIndex === this.pathLength) {
      this.hasArrived = true
      this.currentPosition = prevPos
    }
  }
}

export class Freight extends Train {
  shape: RegularPolygon
  velocity: number

  constructor({ name, route, endVertex }: TrainProps, x1: number, y1: number) {
    super({ name, route, endVertex })
    this.shape = new Konva.RegularPolygon({
      x: x1,
      y: y1,
      sides: 3,
      radius: trainRadius,
      fill: randColor(),
      stroke: 'black',
      strokeWidth: 1,
    })
    this.velocity = 0.2
  }
}

export class Passanger extends Train {
  shape: Circle
  velocity: number

  constructor({ name, route, endVertex }: TrainProps, x1: number, y1: number) {
    super({ name, route, endVertex })
    this.shape = this.shape = new Konva.Circle({
      x: x1,
      y: y1,
      radius: trainRadius - 2,
      fill: randColor(),
      stroke: 'black',
      strokeWidth: 1,
    })

    this.velocity = 0.4
  }
}

export class Bullet extends Train {
  shape: RegularPolygon
  velocity: number

  constructor({ name, route, endVertex }: TrainProps, shape: RegularPolygon) {
    super({ name, route, endVertex })
    this.shape = shape

    this.velocity = 0.2
  }
}
