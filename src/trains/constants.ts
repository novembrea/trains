import { Circle } from 'konva/types/shapes/Circle'
import { Path } from 'konva/types/shapes/Path'

import { Pair } from './types'

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

export const canvasWidth = 1400
export const cavnasHeight = 800
export const vertexExclusionRadius = 100
export const xBound = canvasWidth - vertexExclusionRadius
export const yBound = cavnasHeight - vertexExclusionRadius
export const coordinates: { [key: string]: Pair } = {}
export const stations: { [key: string]: { name: string; edges: Path[]; station: Circle } } = {}
export const stationRadius = 25
