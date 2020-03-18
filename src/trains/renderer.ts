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

let stage: Stage
let stations: Stations
let distances: Distance
let graphBuildAttempts = 0

/*
  placeVertex() attempts to fit vertex on the canvas considering already occupied spots.
  Constraints are based on the padded canvas dimensions and the constant value of exlusion radius,
  function will recursively attempt to place vertex on a random coordinates until it succeeds or
  attempts count reach predifined number - then it throws.
*/
function placeVertex({ name, radius = stationRadius }: { name: string; radius?: number }) {
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
    } else {
      x -= x % 50
      y -= y % 50
    }

    if (x < stationRadius || y < stationRadius || x > xPlacementBound || y > yPlacementBound) continue
    if (!canFitStation(x, y, stations)) {
      attempts++
      continue
    }

    const station = new Konva.Circle({
      x,
      y,
      radius: radius / 2,
      fill: randColor(),
      stroke: 'black',
      strokeWidth: 1,
    })

    stations[name] = { name, station, edges: [] }

    placed = true
  }
}

/* 
  computeDistances takes station name as argument and finds random N closest surrounding stations,
  using pointDistance helper function. Result is written in the distances hash.
*/
function computeDistances(name: string) {
  distances[name] = []
  const keys = Object.keys(stations).filter(k => k !== name)
  const target = stations[name].station
  for (let j = 0; j < keys.length; j++) {
    const key = keys[j]
    const value = stations[key].station
    const distance = pointDistance(target.x(), value.x(), target.y(), value.y())
    distances[name].push({ station: key, distance })
  }
  distances[name] = distances[name].sort((a, b) => a.distance - b.distance).slice(0, randBetween(1, 3))
}

// addEdges assigns edges to the graph based on computed distances.
function addEdges(name: string, rr: RailRoadGraph) {
  distances[name].forEach(entry => {
    const truncatedDistance = +(entry.distance / 10).toFixed(0)
    rr.addEdge(makeVertex(name, truncatedDistance, 'station'), makeVertex(entry.station, truncatedDistance, 'station'))
  })
}

// drawStations places station and its name on the canvas.
function drawStations(graphLayer: Layer) {
  Object.keys(stations).forEach(k => {
    const { station, name } = stations[k]
    const text = new Konva.Text({
      x: station.x() - station.radius() + 15,
      y: station.y() - station.radius() * 2,
      text: name,
      fontSize: 10,
      fontFamily: 'Roboto',
    })
    const textBg = new Konva.Rect({
      x: station.x() - 5 - station.radius() + 15,
      y: station.y() - station.radius() * 2 - 3,
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
  names.forEach(computeDistances)
  names.forEach(name => addEdges(name, rr))

  console.log(rr.adjList)
  if (!rr.isDisconnected()) {
    graphBuildAttempts++
    return render(new RailRoadGraph(names))
  }

  drawEdges(rr, graphLayer)
  drawStations(graphLayer)
  stage.add(graphLayer)
  stage.draw()
  graphBuildAttempts = 0
}

export default render
