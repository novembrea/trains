import Konva from 'konva'
import { Layer } from 'konva/types/Layer'
import { Circle } from 'konva/types/shapes/Circle'
import { Path } from 'konva/types/shapes/Path'
import { Stage } from 'konva/types/Stage'
import sample from 'lodash/sample'
import shuffle from 'lodash/shuffle'

import {
  abortGraphBuildAttempts,
  abortPlacementAttempts,
  canvasWidth,
  cavnasHeight,
  names,
  stationPandmicHealthyColor,
  stationPandmicInfectedColor,
  stationRadius,
  trainNames,
  trainPandmicHealthyColor,
  vertexExclusionRadius,
  xPlacementBound,
  yPlacementBound,
} from './constants'
import RailRoadGraph from './railroad'
import Station from './station'
import { Freight } from './train'
import { Config, Distance } from './types'
import { bindPlayBtn, incrementInfectedCounter, insertTrainSchedule, updateTrainSchedule } from './ui'
import {
  canFitStation,
  doesLineIntersectCircle,
  generateRoute,
  info,
  makeVertex,
  pointDistance,
  randBetween,
  randColor,
} from './utils'

let routeCache: { [key: string]: Path[] }
let config: Config
let stage: Stage
let stations: { [key: string]: Station }
let distances: Distance
let graphBuildAttempts = 0

/*
  placeVertex() attempts to fit vertex on the canvas considering already occupied spots.
  Constraints are based on the padded canvas dimensions and the constant value of exlusion radius,
  function will recursively attempt to place vertex on a random coordinates until it succeeds or
  attempts count reach predifined number, in which case it throws.
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

    const shape = new Konva.Circle({
      x,
      y,
      radius: radius / 2,
      fill: config.isPandemic ? stationPandmicHealthyColor : randColor(),
      stroke: 'black',
      strokeWidth: 1,
    })

    stations[name] = new Station(name, [], shape, false)
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
  const target = stations[name].shape
  for (let j = 0; j < keys.length; j++) {
    const key = keys[j]
    const value = stations[key].shape
    const distance = pointDistance(target.x(), value.x(), target.y(), value.y())
    distances[name].push({ station: key, distance })
  }
  distances[name] = distances[name]
    .sort((a, b) => a.distance - b.distance)
    .slice(0, randBetween(2, config.connectionDensity))
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
  const origin = stations[name].shape
  const [x1, y1] = [origin.x(), origin.y()]
  rr.adjList.get(name)!.forEach(vertex => {
    const [x2, y2] = [stations[vertex.name].shape.x(), stations[vertex.name].shape.y()]
    const hay = rr.adjList.get(name)!.filter(v => v.name !== vertex.name)
    hay.forEach(v => {
      const [cx, cy] = [stations[v.name].shape.x(), stations[v.name].shape.y()]
      if (doesLineIntersectCircle({ x1, y1, x2, y2, cx, cy, radius: stationRadius * 2 })) {
        info({ text: `[${name}] intersects with [${v.name}] on the way to [${vertex.name}]`, bg: 'lightgray' })
        rr.disconnectEdges(name, vertex.name)
      }
    })
  })
}

// drawStations places station and its name on the canvas.
function drawStations(stationLayer: Layer, passangerLayer: Layer) {
  Object.keys(stations).forEach(k => {
    const { shape, name } = stations[k]
    const text = new Konva.Text({
      x: shape.x() - shape.radius() + 15,
      y: shape.y() - shape.radius() * 2,
      text: name,
      fontSize: 10,
      fontFamily: 'Roboto',
    })
    const textBg = new Konva.Rect({
      x: shape.x() - 5 - shape.radius() + 15,
      y: shape.y() - shape.radius() * 2 - 3,
      width: text.width() + 10,
      height: 14,
      fill: 'white',
      cornerRadius: 25,
    })

    const passangers: Circle[] = []
    for (let i = 0; i < randBetween(2, 5); i++) {
      const r = stationRadius * Math.sqrt(Math.random())
      const theta = Math.random() * 2 * Math.PI
      passangers.push(
        new Konva.Circle({
          x: shape.x() + r * Math.cos(theta),
          y: shape.y() + r * Math.sin(theta),
          radius: 2,
          fill: 'lightblue',
        }),
      )
    }
    stations[name].passangers.push(...passangers)
    passangerLayer.add(...passangers)
    stationLayer.add(shape, textBg, text)
  })
}

function drawEdges(rr: RailRoadGraph, edgeLayer: Layer) {
  rr.adjList.forEach((vertices, station) => {
    vertices.forEach(vertex => {
      const { name, weight } = vertex
      const [x1, y1] = [stations[station].shape.x(), stations[station].shape.y()]
      const [x2, y2] = [stations[name].shape.x(), stations[name].shape.y()]

      const edge = new Konva.Path({
        data: `M'${x1} ${y1} L ${x2} ${y2}`,
        name: `${station}-${name}`,
        stroke: 'black',
        strokeWidth: 1,
      })
      stations[station].edges.push(edge)
      const circle = new Konva.Circle({
        x: (x1 + x2) / 2,
        y: (y1 + y2) / 2,
        radius: 9,
        fill: 'white',
        stroke: 'black',
        strokeWidth: 1,
      })
      const text = weight.toFixed(0)
      const marker = new Konva.Text({
        x: (x1 + x2) / 2 - (text.length > 1 ? 5 : 2),
        y: (y1 + y2) / 2 - 3.5,
        fontSize: 10,
        verticalAlign: 'middle',
        text,
      })

      edgeLayer.add(edge)
      if (!config.hideDistances) edgeLayer.add(circle, marker)
    })
  })
}

function render(c: Config): void {
  config = c
  const selecetedNames = names.slice(0, config.stationsCount)
  const rr = new RailRoadGraph(selecetedNames.slice(0, config.stationsCount))
  if (graphBuildAttempts === abortGraphBuildAttempts) {
    throw Error("can't build graph")
  }
  routeCache = {}
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

  const stationLayer: Layer = new Konva.Layer()
  const edgeLayer: Layer = new Konva.Layer()
  const passangerLayer: Layer = new Konva.Layer()
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
  graphBuildAttempts = 0

  drawEdges(rr, edgeLayer)
  drawStations(stationLayer, passangerLayer)

  const trainLayer = new Konva.Layer()
  const trains: Freight[] = []
  for (const trainName of shuffle(trainNames).slice(0, c.trainsCount)) {
    const [start, end] = rr.randomStartEnd()
    const route = generateRoute(start, end, rr, stations)
    routeCache[start.name + end.name] = route
    const train = new Freight(
      trainName,
      config.isPandemic ? trainPandmicHealthyColor : randColor(),
      route,
      end,
      config.globalSpeedModifier,
      stations[start.name].shape.x(),
      stations[start.name].shape.y(),
    )
    trainLayer.add(train.shape)
    insertTrainSchedule(train)
    trains.push(train)
  }

  if (config.isPandemic) {
    const rt = sample(trains)!
    rt.infect()
    stations[rt.prevVisitedStation].isInfected = true
    stations[rt.prevVisitedStation].shape.fill(stationPandmicInfectedColor)
  }

  stage.add(edgeLayer)
  stage.add(stationLayer)
  stage.add(trainLayer)
  // stage.add(passangerLayer)

  const anim = new Konva.Animation(
    (frame: any) => {
      for (const train of trains) {
        // Train has finished moving between stations.
        if (train.isEndOfPath) {
          if (config.isPandemic) {
            const currStation = stations[train.currVisitedStation]
            if (train.isInfected && !currStation.isInfected) {
              currStation.infect()
              incrementInfectedCounter()
            }
            if (currStation.isInfected && !train.isInfected) {
              train.infect()
            }
          }

          updateTrainSchedule(train)
          train.moveForward()
          // train.handlePassangers(stations[train.currVisitedStation])
          train.nextStation()
          train.stationStop()
        }

        // Train has finished running current route.
        if (train.isEndOfRoute) {
          const end = rr.randomEnd(train.endVertex)
          const cacheKey = train.endVertex.name + end.name
          let nextRoute
          if (routeCache[cacheKey]) {
            nextRoute = routeCache[cacheKey]
          } else {
            nextRoute = generateRoute(train.endVertex, end, rr, stations)
            routeCache[cacheKey] = nextRoute
          }
          train.updateRoute(nextRoute, end)
          insertTrainSchedule(train)
        }

        if (train.isMoving) train.moveForward()
      }
    },
    [trainLayer, stationLayer, passangerLayer],
  )

  bindPlayBtn(anim)
}

export default render
