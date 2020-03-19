import Konva from 'konva'
import { Layer } from 'konva/types/Layer'
import { Stage } from 'konva/types/Stage'

import {
  abortGraphBuildAttempts,
  abortPlacementAttempts,
  canvasWidth,
  cavnasHeight,
  defaultConfig,
  names,
  stationRadius,
  vertexExclusionRadius,
  xPlacementBound,
  yPlacementBound,
} from './constants'
import RailRoadGraph from './railroad'
import { Config, Distance, Stations } from './types'
import {
  canFitStation,
  doesLineIntersectCircle,
  info,
  makeVertex,
  pointDistance,
  randBetween,
  randColor,
} from './utils'

let config: Config
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
    if (config.shouldSnapToGrid) {
      x -= x % vertexExclusionRadius
      y -= y % vertexExclusionRadius
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

/* 
  disconnectCollisions removes edge between two vertices if said edge collides with a thrid vertex on its path.
  Such collisions happen due to the random nature of assigning edges between given vertex and its closest N neighbours.
  Sometimes it produces an unnatural connections of
  ![A<->B<->C] and [A<->C] where distances d are d(A,B) + d(B,C) = d(A,C)
  This means that [A<->C] edge goes through B vertex and therefore can be removed in favor
  of a more realistic connection [A<->B<->C].
  What is considered to be a collision is dictated by radius argument in doesLineIntersectCircle() func,
  it's set to be the double of station initial radius, but it's tunable.
*/
function disconnectCollisions(name: string, rr: RailRoadGraph) {
  const origin = stations[name].station
  const [x1, y1] = [origin.x(), origin.y()]
  rr.adjList.get(name)!.forEach(vertex => {
    const [x2, y2] = [stations[vertex.name].station.x(), stations[vertex.name].station.y()]
    const hay = rr.adjList.get(name)!.filter(v => v.name !== vertex.name)
    hay.forEach(v => {
      const [cx, cy] = [stations[v.name].station.x(), stations[v.name].station.y()]
      if (doesLineIntersectCircle({ x1, y1, x2, y2, cx, cy, radius: stationRadius * 2 })) {
        info({ text: `[${name}] intersects with [${v.name}] on the way to [${vertex.name}]`, bg: 'lightgray' })
        rr.disconnectEdges(name, vertex.name)
      }
    })
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

function render(c?: Config): void {
  config = c || defaultConfig
  let selecetedNames = names.slice(0, config.stationsCount)
  const rr = new RailRoadGraph(selecetedNames.slice(0, config.stationsCount))
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
  selecetedNames.forEach(name => placeVertex({ name }))
  selecetedNames.forEach(computeDistances)
  selecetedNames.forEach(name => addEdges(name, rr))
  selecetedNames.forEach(name => disconnectCollisions(name, rr))
  if (!rr.isDisconnected()) {
    graphBuildAttempts++
    console.clear()
    return render(config)
  }

  info({ text: `attempts needed to build graph: ${graphBuildAttempts + 1}`, bg: 'lightgreen' })
  drawEdges(rr, graphLayer)
  drawStations(graphLayer)
  stage.add(graphLayer)
  stage.draw()
  graphBuildAttempts = 0
}

export default render
