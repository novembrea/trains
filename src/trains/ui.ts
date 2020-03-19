import { defaultConfig } from './constants'
import render from './renderer'
import { Config } from './types'

let config: Config = defaultConfig

const byid = (id: string) => document.getElementById(id)!

const uiRefresh = byid('refresh')!
const uiStationSlider = byid('stations-slider')!
const uiStationCounter = byid('stations-counter')!
const uiSnapCheckbox = byid('snap-checkbox')!

export default function initUI() {
  uiRefresh.addEventListener('click', e => {
    render(config)
  })

  // Stations slider.
  uiStationCounter.innerText = config.stationsCount.toString()
  ;(uiStationSlider as HTMLInputElement).max = config.stationsCount.toString()
  ;(uiStationSlider as HTMLInputElement).value = config.stationsCount.toString()
  uiStationSlider.addEventListener('input', e => {
    const v = (e.target as HTMLInputElement).value
    uiStationCounter.innerText = v
    Object.assign(config, { stationsCount: v })
  })

  // Snap checkbox.
  uiSnapCheckbox.addEventListener('change', e => {
    const v = (e.target as HTMLInputElement).checked
    Object.assign(config, { shouldSnapToGrid: v })
  })
}
