import render from './renderer'

const byid = (id: string) => document.getElementById(id)
const btnRefresh = byid('refresh')

export default function initUI() {
  btnRefresh?.addEventListener('click', () => {
    render()
  })
}
