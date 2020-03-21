import { Animation } from 'konva/types/Animation'

import { names } from './constants'
import render from './renderer'
import { Train } from './train'
import { Config } from './types'
import { byid } from './utils'

const toggleState: { [key: string]: boolean } = {}

const uiTrainInfoTmpl = (t: Train) => `
<li id="${t.name}">
  <div style="margin-bottom: 10px;">
    <div style="display:flex;">
      <p style="margin:0 0 5px 0; font-size: 14; font-weight: bold;">
        loco. <span style="color:tomato;">${t.name}</span>, class ${t.trainType}
      </p>
    </div>
    <small ${toggleState[`${t.name}-route`] && 'hidden'} id="${t.name}-route" style="font-size: 12">
      ${t.route
        .map(
          (r, i) =>
            `<span style="${i === 0 && 'color:tomato;'}" id="${t.name.toLowerCase()}-${r
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

const uiStationsPassed = byid('stations-passed')!
const uiRoutesCompleted = byid('routes-completed')!
const uiPlayBtn = byid('play')!
const uiRefreshBtn = byid('refresh')!
const uiScheduleBox = byid('schedule')!
const uiStationSlider = byid('stations-slider')!
const uiStationCounter = byid('stations-slider-counter')!
const uiSnapCheckbox = byid('snap-checkbox')!

let isPlaying = false
let animation: Animation

export function insertTrainSchedule(t: Train) {
  const entry = byid(t.name)
  if (!entry) {
    return uiScheduleBox.insertAdjacentHTML('afterbegin', uiTrainInfoTmpl(t))
  }
  uiRoutesCompleted.innerText = (Number(uiRoutesCompleted.innerText) + 1).toString()
  uiScheduleBox.querySelector(`#${t.name}`)!.innerHTML = ''
  return uiScheduleBox.querySelector(`#${t.name}`)!.insertAdjacentHTML('afterbegin', uiTrainInfoTmpl(t))
}

export function updateTrainSchedule(t: Train) {
  const [prev, next] = t.route[t.currentRouteIndex]
    .name()
    .split('-')
    .map(w => w.toLowerCase())
  const tid = t.name.toLowerCase()
  const prevEl = byid(`${tid}-${prev}`)
  const nextEl = byid(`${tid}-${next}`)
  if (prevEl) prevEl.style.color = ''
  if (nextEl) nextEl.style.color = 'tomato'
  uiStationsPassed.innerText = (Number(uiStationsPassed.innerText) + 1).toString()
}

const playHandler = () => {
  if (!isPlaying) {
    uiPlayBtn.innerText = 'STOP'
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

export default function initUI() {
  let config: Config = {
    shouldSnapToGrid: false,
    stationsCount: names.length,
    playBtn: uiPlayBtn,
  }

  uiRefreshBtn.addEventListener('click', () => {
    animation.stop()
    uiPlayBtn.removeEventListener('click', playHandler)
    uiPlayBtn.innerText = 'PLAY'
    isPlaying = false

    uiScheduleBox.innerHTML = ''
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

  render(config)
}
