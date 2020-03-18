import Konva from 'konva'
import { Layer } from 'konva/types/Layer'
import { Stage } from 'konva/types/Stage'

import {
  abortPlacementAttempts,
  canvasWidth,
  cavnasHeight,
  names,
  shouldSnapToGrid,
  stationRadius,
  stations,
  vertexExclusionRadius,
  xPlacementBound,
  yPlacementBound,
} from './constants'
import RailRoadGraph from './railroad'
import { canFitStation, randBetween, randColor } from './utils'

interface VertexProps {
  layer: Layer
  radius?: number
  name: string
}

function placeVertex({ layer, name, radius = stationRadius }: VertexProps) {
  let placed = false
  let attempts = 0
  while (!placed) {
    if (attempts === abortPlacementAttempts) {
      throw Error(
        `Couldn't fit vector ${name} on the canvas.
        Exclusion radius: ${vertexExclusionRadius}px,
        Placement area width: ${xPlacementBound}px
        Placement area height: ${yPlacementBound}px
        ------------------------------------------
        Verify that there are enough space to fit all vertices
        `,
      )
    }

    let x = randBetween(vertexExclusionRadius, xPlacementBound)
    let y = randBetween(vertexExclusionRadius, yPlacementBound)
    if (shouldSnapToGrid) {
      x -= x % vertexExclusionRadius
      y -= y % vertexExclusionRadius
    }

    if (x < stationRadius || y < stationRadius || x > xPlacementBound || y > yPlacementBound) continue

    if (!canFitStation(x, y)) {
      attempts++
      continue
    }

    const station = new Konva.Circle({
      x: +x.toFixed(0),
      y: +y.toFixed(0),
      radius: radius / 2,
      fill: randColor(),
      stroke: 'black',
      strokeWidth: 1,
    })

    stations[name] = { name, station, edges: [] }

    layer.add(
      station,
      new Konva.Text({
        x: x - radius / 2,
        y: y - radius,
        text: name,
        fontSize: 10,
        fontFamily: 'Roboto',
      }),
    )
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
