import '../../css/style.css'

import * as THREE from 'three'
import Time from './utils/Time.js'
import Sizes from './utils/Sizes.js'
import Stats from './utils/Stats.js'

import Resources from './Resources.js'
import Renderer from './Renderer.js'
import Camera from './Camera.js'
import World from './World.js'

import assets from './assets.js'

export default class Experience {
  static instance

  constructor(_options = {}) {
    if(Experience.instance) {
      return Experience.instance
    }

    Experience.instance = this

    window.experience = this

    // options
    this.targetElement = _options.targetElement

    if(!this.targetElement) {
      console.warn('missing targetElement property')
      return
    }

    this.time = new Time()
    this.sizes = new Sizes()

    this.setConfig()
    this.setStats()
    this.setScene()
    this.setCamera()
    this.setRenderer()
    this.setResources()
    this.setWorld()

    this.sizes.on('resize', () => {
      this.resize()
    })

    this.update()
  }

  setConfig() {
    this.config = {}

    // debug
    this.config.debug = window.location.hash === '#debug'

    // pixel ratio
    this.config.pixelRatio = Math.min(Math.max(window.devicePixelRatio, 1), 2)

    // width and height
    const boundings = this.targetElement.getBoundingClientRect()
    this.config.width = boundings.width
    this.config.height = boundings.height || window.innerHeight
  }

  setStats() {
    if(this.config.debug) this.stats = new Stats(true)
  }

  setScene() {
    this.scene = new THREE.Scene()
  }

  setCamera() {
    this.camera = new Camera()
  }

  setRenderer() {
    this.renderer = new Renderer({ rendererInstance: this.rendererInstance})

    this.targetElement.appendChild(this.renderer.instance.domElement)
  }

  setResources() {
    this.resources = new Resources(assets)
  }

  setWorld() {
    this.world = new World()
  }

  update() {
    if(this.stats) this.stats.update()

    this.camera.update()

    if(this.world) this.world.update()

    if(this.renderer) this.renderer.update()

    window.requestAnimationFrame(() => {
      this.update()
    })
  }

  resize() {
    // config
    const boundings = this.targetElement.getBoundingClientRect()
    this.config.width = boundings.width
    this.config.height = boundings.height

    this.config.pixelRatio = Math.min(Math.max(window.devicePixelRatio, 1), 3)

    if(this.camera) this.camera.resize()

    if(this.renderer) this.renderer.resize()

    if(this.world) this.world.resize()
  }

  destroy() {}
} // end class