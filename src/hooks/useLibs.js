import Stats from 'three/examples/jsm/libs/stats.module'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min'

export function useLibs() {
  function initStats(_el) {
    const stats = new Stats()
    _el.appendChild(stats.dom)

    return stats
  }

  function initGUI() {
    const panel = new GUI({ width: 310 })

    return panel
  }

  return {
    initStats,
    initGUI,
  }
}