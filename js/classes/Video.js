import * as THREE from 'three'
import Experience from './Experience.js'

export default class Video {
  constructor(_options) {
    this.experience = new Experience()
    this.config = this.experience.config
    this.scene = this.experience.scene
    this.time = this.experience.time

    this.facingMode = 'environment'
  }

  setScreen() {}

  setVideo() {}

  resize() {}

  update() {}

  destroy() {}
}