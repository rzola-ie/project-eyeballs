import * as THREE from 'three'
import Experience from './Experience.js'

import defaultVertex from '../shader/default/vertex.glsl?raw'
import defaultFragment from '../shader/default/fragment.glsl?raw'

export default class World {
  constructor(_options) {
    this.experience = new Experience()
    this.config = this.experience.config
    this.scene = this.experience.scene
    this.time = this.experience.time
    this.resources = this.experience.resources

    this.facingMode = 'environment'

    this.setScreen()
    this.setVideo()
  }

  setScreen() {
    const meshWidth = this.config.width / window.devicePixelRatio
    const meshHeight = (this.config.width / window.devicePixelRatio) * 1.77777778
    this.geometry = new THREE.PlaneBufferGeometry(1, 1)
    // this.material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    this.material = new THREE.ShaderMaterial({
      vertexShader: defaultVertex,
      fragmentShader: defaultFragment,
      uniforms: {
        feed: { value: 0 },
        uTime: { value: 0 }
      }
    })
    this.mesh = new THREE.Mesh(this.geometry, this.material)
    this.mesh.scale.set(meshWidth, meshHeight, 1)

    this.scene.add(this.mesh)
  }

  setVideo() {
    // video element
    this.video = document.createElement('video')
    this.video.setAttribute('id', 'video')
    this.video.setAttribute('muted', 'true')
    this.video.setAttribute('autoplay', '')
    this.video.setAttribute('playsinline', '')
    this.video.style.display = 'none'
    document.body.appendChild(this.video)

    // video texture
    this.videoTexture = new THREE.VideoTexture(this.video)

    // camera init
    if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const constraints = { video: { facingMode: this.facingMode }}

      navigator.mediaDevices.getUserMedia(constraints)
      .then(stream => {
        this.video.srcObject = stream
      })
      .catch(error => {
        console.error('Unable to acces the camera/webcam')
      })
    }

    // no camera interface
    else {
      console.error('MediaDevices interface not available')
    }
  }

  resize() {}

  update() {
    this.material.uniforms.uTime.value = this.time.elapsed
    this.material.uniforms.feed.value = this.videoTexture
  }

  destroy() {}
} // end class