import '../css/style.css'
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import { Pane } from 'tweakpane';

import lightVertex from './shader/light/vertex.glsl?raw'
import lightFragment from './shader/light/fragment.glsl?raw'

class Sketch {
  constructor(options) {
    this.scene = new THREE.Scene();

    this.container = document.getElementById(options.domElement)
    this.width = this.container.offsetWidth
    this.height = this.container.offsetWidth

    this.debugMode = window.location.hash === '#debug'

    this.time = 0;

    this.settings = {
      sensetivity: 0
    }

    this.startButton = document.getElementById('startButton')
    this.startButton.addEventListener('click', () => {
      this.init();
      this.setSettings();
      this.resize();
      this.addScreen();
      this.addVideoFeed();
      this.addPostProcessing()
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
    this.renderer.setPixelRatio(Math.min(Math.max(window.devicePixelRatio, 1), 2))
    this.renderer.setSize(this.width, this.height)
    this.container.appendChild(this.renderer.domElement)
  }

  setSettings() {
    if (!this.debugMode) return

    this.pane = new Pane({
      expanded: true
    });

    this.pane.addInput(this.settings, 'sensetivity', {
      min: 0,
      max: 1,
    });
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
      vertexShader: lightVertex,
      fragmentShader: lightFragment,
      uniforms: {
        uSensetivity: { value: 0.5 },
        feed: { value: 0 },
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
    if (this.shaderIndex === 0) return

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
        // this.video.play()
      }).catch((error) => {
        console.error('Unable to access the camera/webcam', error)
      })
    } else {
      console.error('MediaDevices interface not available')
    }
  }

  addPostProcessing() {
    // webgl render target
    this.renderTarget = new THREE.WebGLRenderTarget(this.width, this.height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBFormat,
      encoding: THREE.sRGBEncoding
    })

    // effect composer
    this.effectComposer = new EffectComposer(this.renderer, this.renderTarget)
    this.effectComposer.setPixelRatio(window.devicePixelRatio)
    this.effectComposer.setSize(this.width, this.height)

    // passes
    this.renderPass = new RenderPass(this.scene, this.camera)
    this.effectComposer.addPass(this.renderPass)

    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(this.width, this.height),
      0.65, // strength
      1, // radius
      0.2 // threshold
    )
    this.effectComposer.addPass(this.bloomPass)
  }

  render() {
    this.time += 0.01;

    this.shaderMaterial.uniforms.feed.value = this.videoTexture
    this.shaderMaterial.uniforms.uTime.value = this.time
    this.shaderMaterial.uniforms.uSensetivity.value = this.settings.sensetivity

    this.shaderMaterial.needsUpdate = true

    // this.renderer.render(this.scene, this.camera)
    this.effectComposer.render()

    requestAnimationFrame(this.render.bind(this))
  }
}

new Sketch({ domElement: 'container-light' })