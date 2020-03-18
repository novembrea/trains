import Konva from 'konva'
import { Layer } from 'konva/types/Layer'
import { Stage } from 'konva/types/Stage'

import {
  abortGraphBuildAttempts,
  abortPlacementAttempts,
  canvasWidth,
  cavnasHeight,
  names,
  shouldSnapToGrid,
  stationRadius,
  vertexExclusionRadius,
  xPlacementBound,
  yPlacementBound,
} from './constants'
import RailRoadGraph from './railroad'
import { Distance, Stations } from './types'
import { canFitStation, makeVertex, pointDistance, randBetween, randColor } from './utils'

interface VertexProps {
  radius?: number
  name: string
}

let stage: Stage
let stations: Stations
let distances: Distance
let graphBuildAttempts = 0

function placeVertex({ name, radius = stationRadius }: VertexProps) {
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

    let x = randBetween(stationRadius, xPlacementBound)
    let y = randBetween(stationRadius, yPlacementBound)
    if (shouldSnapToGrid) {
      x -= x % vertexExclusionRadius
      y -= y % vertexExclusionRadius
    }

    if (x < stationRadius || y < stationRadius || x > xPlacementBound || y > yPlacementBound) continue
    if (!canFitStation(x, y, stations)) {
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

    placed = true
  }
}

function computeDistances(name: string, rr: RailRoadGraph) {
  distances[name] = []
  const keys = Object.keys(stations).filter(k => k !== name)
  const target = stations[name].station
  for (let j = 0; j < keys.length; j++) {
    const key = keys[j]
    const value = stations[key].station
    const distance = +pointDistance(target.x(), value.x(), target.y(), value.y()).toFixed(0)
    distances[name].push({ station: key, distance })
  }
  distances[name] = distances[name].sort((a, b) => a.distance - b.distance).slice(0, randBetween(1, 3))
  distances[name].forEach(entry => {
    const truncatedDistance = +(entry.distance / 10).toFixed(0)
    rr.addEdge(makeVertex(name, truncatedDistance, 'station'), makeVertex(entry.station, truncatedDistance, 'station'))
  })
}

function drawStations(graphLayer: Layer) {
  Object.keys(stations).forEach(k => {
    const { station, name } = stations[k]
    const text = new Konva.Text({
      x: station.x() - station.radius() + 15,
      y: station.y() - station.radius() * 2,
      text: name,
      fontSize: 12,
      fontFamily: 'Roboto',
    })
    const textBg = new Konva.Rect({
      x: station.x() - 5 - station.radius() + 15,
      y: station.y() - station.radius() * 2 - 2,
      width: text.width() + 10,
      height: 14,
      fill: 'white',
      cornerRadius: 25,
    })
    graphLayer.add(station, textBg, text)
  })
}

function drawEdges(rr: RailRoadGraph, graphLayer: Layer) {
  rr.adjList.forEach((vertices, station) => {
    vertices.forEach(vertex => {
      const { name, weight } = vertex
      const [xStart, yStart] = [stations[station].station.x(), stations[station].station.y()]
      const [xEnd, yEnd] = [stations[name].station.x(), stations[name].station.y()]
      const edge = new Konva.Path({
        data: `M'${xStart} ${yStart} L ${xEnd} ${yEnd}`,
        id: `${station}-${name}`,
        stroke: 'black',
        strokeWidth: 1,
      })
      stations[station].edges.push(edge)
      const circle = new Konva.Circle({
        x: (xStart + xEnd) / 2,
        y: (yStart + yEnd) / 2,
        radius: 9,
        fill: 'white',
        stroke: 'black',
        strokeWidth: 1,
      })
      const text = weight.toFixed(0)
      const marker = new Konva.Text({
        x: (xStart + xEnd) / 2 - (text.length > 1 ? 5 : 2),
        y: (yStart + yEnd) / 2 - 3.5,
        fontSize: 10,
        verticalAlign: 'middle',
        text,
      })
      graphLayer.add(edge, circle, marker)
    })
  })
}

function render(rr: RailRoadGraph): void {
  if (graphBuildAttempts === abortGraphBuildAttempts) {
    throw Error("can't build graph")
  }
  stations = {}
  distances = {}
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
  names.forEach(name => placeVertex({ name }))
  names.forEach(name => computeDistances(name, rr))

  drawEdges(rr, graphLayer)
  drawStations(graphLayer)

  if (!rr.isDisconnected()) {
    graphBuildAttempts++
    return render(new RailRoadGraph(names))
  }
  stage.add(graphLayer)
  stage.draw()
  graphBuildAttempts = 0
}

export default render
