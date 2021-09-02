import '../css/style.css'
import * as THREE from 'three';
import { Pane } from 'tweakpane';

import doubleVertex from './shader/double/vertex.glsl?raw'
import doubleFragment from './shader/double/fragment.glsl?raw'

class Sketch {
  constructor(options) {
    this.scene = new THREE.Scene();

    this.container = document.getElementById(options.domElement)
    this.width = this.container.offsetWidth
    this.height = this.container.offsetHeight

    this.debugMode = window.location.hash === '#debug'

    this.time = 0;

    this.settings = {
      doubleOffset: 0.2,
      doubleMix: 0.5,
    }

    this.startButton = document.getElementById('startButton')
    this.startButton.addEventListener('click', () => {
      this.init();
      this.setSettings();
      this.resize();
      this.addScreen();
      this.addVideoFeed();
      this.render();
      this.setupResize();
    })
  }

  init() {
    const overlay = document.getElementById('overlay')
    overlay.remove();

    // set the camera
    this.camera = new THREE.PerspectiveCamera(30, this.width / this.height, 10, 1000)
    this.camera.position.z = 600;
    this.camera.fov = 2 * Math.atan((this.height / 2) / 600) * 180 / Math.PI

    //set the renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(this.width, this.height)
    this.container.appendChild(this.renderer.domElement)

  }

  setSettings() {
    if (!this.debugMode) return

    this.pane = new Pane({
      expanded: true
    });

    this.doubleOffsetPane = this.pane.addInput(this.settings, 'doubleOffset', {
      min: 0.0,
      max: 1.0,

    })

    this.doubleMixPane = this.pane.addInput(this.settings, 'doubleMix', {
      min: 0.0,
      max: 1.0,

    })
  }

  setupResize() {
    window.addEventListener('resize', this.resize.bind(this))
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;

    this.renderer.setSize(this.width, this.height);

    this.camera.aspect = this.width / this.height;
    this.camera.fov = 2 * Math.atan((this.height / 2) / 600) * 180 / Math.PI
    this.camera.updateProjectionMatrix();

    // device orientation
    if (this.mesh) {
      if (this.width > this.height) {
        //landscape
        this.mesh.scale.set(Math.ceil(this.height * 1.777777), this.height, 1)
      } else {
        //portrait
        this.mesh.scale.set(this.width, this.width * 1.777777, 1)
      }

      this.addVideoFeed()
    }
  }

  addScreen() {
    this.geometry = new THREE.PlaneBufferGeometry(1, 1, 1, 1);
    this.shaderMaterial = new THREE.ShaderMaterial({
      vertexShader: doubleVertex,
      fragmentShader: doubleFragment,
      uniforms: {
        uDesaturate: { value: this.settings.desaturate },
        uDoubleOffset: { value: this.settings.doubleOffset },
        uDoubleMix: { value: this.settings.doubleMix },
        feed: { value: 0 },
        uProgress: { value: 0.0 },
        uQuadSize: { value: new THREE.Vector2(100, 178) },
        uResolution: { value: new THREE.Vector2(this.width, this.height) },
        uTime: { value: 0.0 },
      }
    })

    this.mesh = new THREE.Mesh(this.geometry, this.shaderMaterial)
    this.scene.add(this.mesh)

    if (this.width > this.height) {
      // landscape
      this.mesh.scale.set(this.width, this.height, 1)
    } else {
      // portrait
      this.mesh.scale.set(this.width, this.height, 1)
    }
  }

  addVideoFeed() {
    if (!this.video) {
      this.video = document.createElement('video');
      this.video.style.width = `800px`
      this.video.style.height = `600px`
      this.video.style.transform = `scale(0.0001, 0.0001)`
      this.video.style.position = `fixed`
      this.video.style.bottom = `0px`
      this.video.style.right = `0px`

      this.video.setAttribute('id', 'video')
      this.video.setAttribute('muted', 'true')
      this.video.setAttribute('autoplay', 'true')
      this.video.setAttribute('playsinline', 'true')

      document.body.appendChild(this.video);
      this.videoTexture = new THREE.VideoTexture(this.video)
    }

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const constraints = { video: { facingMode: 'environment' } };

      navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
        // apply the stream to the video element used in the texture
        this.video.srcObject = stream;

      }).catch((error) => {
        console.error('Unable to access the camera/webcam', error)
      })
    } else {
      console.error('MediaDevices interface not available')
    }
  }

  render() {
    this.time += 0.01;

    this.shaderMaterial.uniforms.feed.value = this.videoTexture
    this.shaderMaterial.uniforms.uTime.value = 0.0
    this.shaderMaterial.uniforms.uDoubleOffset.value = this.settings.doubleOffset
    this.shaderMaterial.uniforms.uDoubleMix.value = this.settings.doubleMix

    this.shaderMaterial.needsUpdate = true

    this.renderer.render(this.scene, this.camera)

    requestAnimationFrame(this.render.bind(this))
  }
}

new Sketch({ domElement: 'container-blur' })