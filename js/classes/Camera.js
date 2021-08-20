
import * as THREE from 'three'
import Experience from './Experience.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export default class Camera {
  constructor(_options) {
    this.experience = new Experience()
    this.config = this.experience.config
    this.debug = this.experience.debug
    this.time = this.experience.time
    this.sizes = this.experience.sizes
    this.targetElemet = this.experience.targetElement
    this.scene = this.experience.scene

    // setup
    this.mode = 'default' // default camera / debug camera

    this.setInstance()
    this.setModes()
  }

  setInstance() {
    // setup
    this.instance = new THREE.PerspectiveCamera(25, this.config.width / this.config.height, 1, 2000)
    this.instance.rotation.reorder('YXZ')

    this.scene.add(this.instance)
  }

  setModes() {
    this.modes = {}

    // default
    this.modes.default = {}
    this.modes.default.instance = this.instance.clone()
    this.modes.default.instance.rotation.reorder('YXZ')
    this.modes.default.instance.position.set(0, 0, 600)
    this.modes.default.instance.fov = 2 * Math.atan((this.config.height / 2) / 600) * 180/Math.PI

    // debug
    this.modes.debug = {}
    this.modes.debug.instance = this.instance.clone()
    this.modes.debug.instance.rotation.reorder('YXZ')
    this.modes.debug.instance.position.set(0, 0, 600)

    this.modes.debug.orbitControls = new OrbitControls(this.modes.debug.instance, this.targetElemet)
    this.modes.debug.orbitControls.enabled = this.modes.debug.active
    this.modes.debug.orbitControls.screenSpacePanning = true
    this.modes.debug.orbitControls.enableKeys = false
    this.modes.debug.orbitControls.zoomSpeed = 0.25
    this.modes.debug.orbitControls.enableDamping = true
    this.modes.debug.orbitControls.update()
  }

  resize() {
    this.instance.aspect = this.config.width / this.config.height
    this.instance.updateProjectionMatrix()

    this.modes.default.instance.aspect = this.config.width / this.config.height
    this.modes.default.instance.updateProjectionMatrix()

    this.modes.debug.instance.aspect = this.config.width / this.config.height
    this.modes.debug.instance.updateProjectionMatrix()
  }

  update() {
    // update debug orbit controls
    this.modes.debug.orbitControls.update()

    // apply coordinates
    this.instance.position.copy(this.modes[this.mode].instance.position)
    this.instance.quaternion.copy(this.modes[this.mode].instance.quaternion)
    this.instance.updateMatrixWorld() // to be used in projection
  }

  destroy() {
    this.modes.debug.OrbitControls.destroy()
  }
}