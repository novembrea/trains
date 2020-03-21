import { Animation } from 'konva/types/Animation'

import { names, trainNames } from './constants'
import render from './renderer'
import { Train } from './train'
import { Config } from './types'
import { byid, toCapital } from './utils'

const uiTrainInfoTmpl = (t: Train) => `
<li id="${t.name}">
  <div style="margin-bottom: 10px;">
    <div style="display:flex;">
      <p style="margin:0 0 5px 0; font-size: 14;">
        loco. <span style="color:deeppink;font-weight: bold;">${toCapital(t.name)}</span>, class ${t.trainType}
      </p>
    </div>
    <small id="${t.name}-route" style="font-size: 12">
      ${t.route
        .map(
          (r, i) =>
            `<span style="${i === 0 && 'color:deeppink;'}" id="${t.name.toLowerCase()}-${r
              .name()
              .toLowerCase()
              .split('-')
              .shift()}">${r.name()}</span>`,
        )
        .join(' ⟶ ')}
    </small>
  </div>
</li>
`

// DOM elements.
const uiSpeedModifier = byid('speed-modifier')!
const uiConnectionDensity = byid('connection-density')!
const uiStationsPassed = byid('stations-passed')!
const uiRoutesCompleted = byid('routes-completed')!
const uiPlayBtn = byid('play')!
const uiRefreshBtn = byid('refresh')!
const uiScheduleBox = byid('schedule')!
const uiSnapCheckbox = byid('snap-checkbox')!
const uiStationSlider = byid('stations-slider')!
const uiStationCounter = byid('stations-slider-counter')!
const uiTrainsSlider = byid('trains-slider')!
const uiTrainsCounter = byid('trains-slider-counter')!

// Read potential values from local storage and initialize config.
const lsget = (x: string) => localStorage.getItem(x)
const initialConfig = () => {
  let stationsCount = names.length
  let trainsCount = trainNames.length
  let connectionDensity = 2
  let shouldSnapToGrid = false
  let globalSpeedModifier = 1

  if (lsget('station_counter') !== null) stationsCount = +lsget('station_counter')!
  if (lsget('connection_density') !== null) connectionDensity = +lsget('connection_density')!
  if (lsget('trains_counter') !== null) trainsCount = +lsget('trains_counter')!
  if (lsget('should_snap') !== null) shouldSnapToGrid = lsget('should_snap')! === 'true'
  if (lsget('global_speed') !== null) globalSpeedModifier = +lsget('global_speed')!

  return {
    stationsCount,
    trainsCount,
    connectionDensity,
    globalSpeedModifier,
    shouldSnapToGrid,
  }
}

// Insert or update train route display for the first time or when the previous one was completed.
export function insertTrainSchedule(t: Train) {
  const entry = byid(t.name)
  if (!entry) {
    return uiScheduleBox.insertAdjacentHTML('afterbegin', uiTrainInfoTmpl(t))
  }
  uiRoutesCompleted.innerText = (Number(uiRoutesCompleted.innerText) + 1).toString()
  uiScheduleBox.querySelector(`#${t.name}`)!.innerHTML = ''
  return uiScheduleBox.querySelector(`#${t.name}`)!.insertAdjacentHTML('afterbegin', uiTrainInfoTmpl(t))
}

// Highlight edges where train is currently moving.
export function updateTrainSchedule(t: Train) {
  const [prev, next] = t.currentPath
    .name()
    .split('-')
    .map(w => w.toLowerCase())
  const tid = t.name.toLowerCase()
  const prevEl = byid(`${tid}-${prev}`)
  const nextEl = byid(`${tid}-${next}`)
  if (prevEl) prevEl.style.color = ''
  if (nextEl) nextEl.style.color = 'deeppink'
  uiStationsPassed.innerText = (Number(uiStationsPassed.innerText) + 1).toString()
}

// Toggle animation handler.
let isPlaying = false
let animation: Animation
function playHandler() {
  if (!isPlaying) {
    uiPlayBtn.innerText = 'PAUSE'
    isPlaying = true
    return animation.start()
  }
  uiPlayBtn.innerText = 'PLAY'
  isPlaying = false
  return animation.stop()
}

export function bindPlayBtn(anim: Animation) {
  animation = anim
  uiPlayBtn.addEventListener('click', playHandler)
}

// Initialize UI, bind events, produce config and render app for the first time.
export default function initUI() {
  let config: Config = {
    ...initialConfig(),
    playBtn: uiPlayBtn,
  }

  const notifyAboutRefresh = () => {
    uiRefreshBtn.style.background = '#222222'
    uiRefreshBtn.innerText = 'APPLY CHANGES'
  }

  // Refresn button. Stop animation, remove listeners, reset UI and render again.
  uiRefreshBtn.addEventListener('click', () => {
    animation.stop()
    uiPlayBtn.removeEventListener('click', playHandler)
    uiPlayBtn.innerText = 'PLAY'
    isPlaying = false
    uiStationsPassed.innerText = '0'
    uiRoutesCompleted.innerText = '0'
    uiScheduleBox.innerHTML = ''

    uiRefreshBtn.style.background = ''
    uiRefreshBtn.style.border = ''
    uiRefreshBtn.innerText = 'REFRESH'
    render(config)
  })

  // Connection density select.
  ;(uiConnectionDensity as HTMLSelectElement).value = config.connectionDensity.toString()
  uiConnectionDensity.addEventListener('change', e => {
    const { value } = e.target as HTMLInputElement
    localStorage.setItem('connection_density', value)
    Object.assign(config, { connectionDensity: +value })
  })

  // Speed modifier select.
  ;(uiSpeedModifier as HTMLSelectElement).value = config.globalSpeedModifier.toString()
  uiSpeedModifier.addEventListener('change', e => {
    const { value } = e.target as HTMLInputElement
    localStorage.setItem('speed_modifier', value)
    Object.assign(config, { globalSpeedModifier: +value })

    notifyAboutRefresh()
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

    notifyAboutRefresh()
  })

  // Trains slider.
  uiTrainsCounter.innerText = config.trainsCount.toString()
  ;(uiTrainsSlider as HTMLInputElement).max = trainNames.length.toString()
  ;(uiTrainsSlider as HTMLInputElement).value = config.trainsCount.toString()
  uiTrainsSlider.addEventListener('input', e => {
    const { value } = e.target as HTMLInputElement
    uiTrainsCounter.innerText = value
    localStorage.setItem('trains_counter', value)
    Object.assign(config, { trainsCount: value })
    notifyAboutRefresh()
  })

  // Snap checkbox.
  ;(uiSnapCheckbox as HTMLInputElement).checked = config.shouldSnapToGrid
  uiSnapCheckbox.addEventListener('change', e => {
    const { checked } = e.target as HTMLInputElement
    localStorage.setItem('should_snap', String(checked))
    Object.assign(config, { shouldSnapToGrid: checked })

    notifyAboutRefresh()
  })

  render(config)
}
