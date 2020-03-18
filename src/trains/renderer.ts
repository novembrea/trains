import Konva from 'konva'
import { Layer } from 'konva/types/Layer'
import { Stage } from 'konva/types/Stage'

import {
  canvasWidth,
  cavnasHeight,
  coordinates,
  names,
  shouldSnapToGrid,
  stationRadius,
  stations,
  vertexExclusionRadius,
  xBound,
  yBound,
} from './constants'
import RailRoadGraph from './railroad'
import { randBetween, randColor, verifyExclusion } from './utils'

export interface VertexProps {
  layer: Layer
  radius?: number
  name: string
}

function placeVertex({ layer, name, radius = stationRadius }: VertexProps) {
  let placed = false
  while (!placed) {
    randBetween
    let x = randBetween(vertexExclusionRadius, xBound)
    let y = randBetween(vertexExclusionRadius, yBound)
    if (shouldSnapToGrid) {
      x -= x % vertexExclusionRadius
      y -= y % vertexExclusionRadius
    }
    if (x < vertexExclusionRadius || y < vertexExclusionRadius || x > xBound || y > yBound) continue
    if (!verifyExclusion(x, y)) continue
    const station = new Konva.Circle({
      x,
      y,
      radius: radius / 2,
      fill: randColor(),
      stroke: 'black',
      strokeWidth: 2,
    })

    stations[name] = { name: name, station, edges: [] }

    layer.add(
      station,
      new Konva.Text({
        x: x + radius - 15,
        y: y - radius,
        text: name,
        fontSize: 15,
        fontFamily: 'Roboto',
      }),
    )
    coordinates[name] = { x: +x.toFixed(0), y: +y.toFixed(0) }
    placed = true
  }
}

function render(rr: RailRoadGraph) {
  let stage: Stage
  stage = new Konva.Stage({
    container: 'main',
    width: canvasWidth,
    height: cavnasHeight,
    scale: {
      x: 1,
      y: 1,
    },
  })

  const graphLayer: Layer = new Konva.Layer()
  for (let i = 0; i < names.length; i++) {
    placeVertex({ layer: graphLayer, name: names[i] })
  }

  stage.add(graphLayer)
  stage.draw()
}

export default render
