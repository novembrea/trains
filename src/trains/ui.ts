import { defaultConfig, names } from './constants'
import render from './renderer'
import { Config } from './types'
import { byid } from './utils'

let config: Config = defaultConfig

const uiRefresh = byid('refresh')!
const uiStationSlider = byid('stations-slider')!
const uiStationCounter = byid('stations-counter')!
const uiSnapCheckbox = byid('snap-checkbox')!

export default function initUI() {
  if (localStorage.getItem('station_counter')) {
    Object.assign(config, {
      stationsCount: localStorage.getItem('station_counter'),
    })
  }

  uiRefresh.addEventListener('click', () => {
    render(config)
  })

  // Stations slider.
  uiStationCounter.innerText = config.stationsCount.toString()
  ;(uiStationSlider as HTMLInputElement).max = names.length.toString()
  ;(uiStationSlider as HTMLInputElement).value = config.stationsCount.toString()
  uiStationSlider.addEventListener('input', e => {
    const { value } = e.target as HTMLInputElement
    uiStationCounter.innerText = value
    localStorage.setItem('station_counter', value)
    Object.assign(config, { stationsCount: value })
  })

  // Snap checkbox.
  uiSnapCheckbox.addEventListener('change', e => {
    const { checked } = e.target as HTMLInputElement
    Object.assign(config, { shouldSnapToGrid: checked })
  })
}
