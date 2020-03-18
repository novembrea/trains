import { Circle } from 'konva/types/shapes/Circle'
import { Path } from 'konva/types/shapes/Path'

//? All widths, heights and radiuses are based on pixels

export const canvasWidth = 1400
export const cavnasHeight = 800

// Arbitrary number of placement attempts per one vertex.
// Algorithm will abort placement and throw an error on attempts overflow.
export const abortPlacementAttempts = 200

// How big station circle will be drawn on the canvas.
export const stationRadius = 25

// Defines closest possible placement of station next to other station.
export const vertexExclusionRadius = stationRadius * 3

// Placement dimensions: canvas dimension padded by station radius.
export const xPlacementBound = canvasWidth - stationRadius
export const yPlacementBound = cavnasHeight - stationRadius

// export const coordinates: { [key: string]: Pair } = {}
export const stations: { [key: string]: { name: string; edges: Path[]; station: Circle } } = {}

// Vertices will be snapped using modulo of vertexExclusionRadius applied to x and y coordinates.
// Will produce a more grid-like layout.
export const shouldSnapToGrid = false

// Station names
export const names = [
  'Alpha',
  'Bravo',
  'Charlie',
  'Delta',
  'Echo',
  'Foxtrot',
  'Hotel',
  'India',
  'Juliett',
  'Kilo',
  'Lima',
  'Mike',
  'November',
  'Oscar',
  'Papa',
  'Quebec',
  'Romeo',
  'Sierra',
  'Tango',
  'Uniform',
  'Victor',
  'Whiskey',
  'XRay',
  'Yankee',
  'Zulu',
]
