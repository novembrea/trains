import Konva from 'konva'
import { Stage } from 'konva/types/Stage'

import { canvasWidth, cavnasHeight } from './constants'
import RailRoadGraph from './railroad'

let stage: Stage

function render(rr: RailRoadGraph) {
  stage = new Konva.Stage({
    container: 'main',
    width: canvasWidth,
    height: cavnasHeight,
    scale: {
      x: 1,
      y: 1,
    },
  })

  stage.draw()
}

export default render
