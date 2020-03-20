import { Circle } from 'konva/types/shapes/Circle'
import { Path } from 'konva/types/shapes/Path'
import { RegularPolygon } from 'konva/types/shapes/RegularPolygon'

import { Vertex } from './types'
import { info } from './utils'

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
    this.route = route
    this.name = name
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
    info({ text: `new route for ${this.name}`, bg: 'lighgray' })
    info({ text: route.map(r => r.name()).join(' ⇄ '), bg: 'lighgray' })
    this.hasArrived = false
    this.currentRouteIndex = 0
    this.currentPosition = 0
    this.route = route
    this.pathLength = route.length
    this.endVertex = endVertex
  }

  public incrementPos() {
    this.currentPosition++
  }

  public nextStation() {
    console.log(
      `from: ${this.currentRoute
        .name()
        .split('-')
        .pop()}, next up ${this.route[this.currentRouteIndex + 1]
        ?.name()
        .split('-')
        .pop() ?? 'end'}`,
    )
    let prevPos = this.currentPosition
    this.currentPosition = 1

    this.currentRouteIndex++
    if (this.currentRouteIndex === this.pathLength) {
      this.hasArrived = true
      this.currentPosition = prevPos
    }
  }
}

export class Freight extends Train {
  shape: RegularPolygon
  velocity: number
  acceleration: number

  constructor({ name, route, endVertex }: TrainProps, shape: RegularPolygon) {
    super({ name, route, endVertex })
    this.shape = shape

    this.velocity = 2
    this.acceleration = 0.1
  }
}

export class Passanger extends Train {
  shape: Circle
  velocity: number
  acceleration: number

  constructor({ name, route, endVertex }: TrainProps, shape: RegularPolygon) {
    super({ name, route, endVertex })
    this.shape = shape

    this.velocity = 0.8
    this.acceleration = 0.1
  }
}

export class Bullet extends Train {
  shape: RegularPolygon
  velocity: number
  acceleration: number

  constructor({ name, route, endVertex }: TrainProps, shape: RegularPolygon) {
    super({ name, route, endVertex })
    this.shape = shape

    this.velocity = 0.2
    this.acceleration = 0.2
  }
}
