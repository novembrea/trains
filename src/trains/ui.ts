import { Animation } from 'konva/types/Animation'

import { names } from './constants'
import render from './renderer'
import { Config } from './types'
import { byid } from './utils'

const uiRefreshBtn = byid('refresh')!

const uiPlayBtn = byid('play')!

const uiStationSlider = byid('stations-slider')!
const uiStationCounter = byid('stations-counter')!
const uiSnapCheckbox = byid('snap-checkbox')!

export function bindPlayBtn(anim: Animation) {
  let isPlaying = false
  uiPlayBtn.addEventListener('click', () => {
    if (!isPlaying) {
      uiPlayBtn.innerText = 'STOP'
      isPlaying = true
      return anim.start()
    }
    uiPlayBtn.innerText = 'PLAY'
    isPlaying = false
    return anim.stop()
  })
}

export default function initUI() {
  let config: Config = {
    shouldSnapToGrid: false,
    stationsCount: names.length,
    playBtn: uiPlayBtn,
  }

  uiRefreshBtn.addEventListener('click', () => {
    render(config)
  })

  if (localStorage.getItem('station_counter')) {
    Object.assign(config, {
      stationsCount: localStorage.getItem('station_counter'),
      playBtn: uiPlayBtn,
    })
  }

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
