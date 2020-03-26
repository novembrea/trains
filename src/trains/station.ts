import { Circle } from 'konva/types/shapes/Circle'
import { Path } from 'konva/types/shapes/Path'

import { stationPandmicHealthyColor, stationPandmicInfectedColor } from './constants'

class Station {
  name: string
  edges: Path[]
  shape: Circle
  isInfected?: boolean

  constructor(name: string, edges: Path[], shape: Circle, isInfected?: boolean) {
    this.name = name
    this.edges = edges
    this.shape = shape
    this.isInfected = this.isInfected
  }

  public infect() {
    this.isInfected = true
    this.shape.fill(stationPandmicInfectedColor)
  }

  public disinfect() {
    this.isInfected = false
    this.shape.fill(stationPandmicHealthyColor)
  }
}

export default Station
