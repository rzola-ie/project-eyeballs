import '../css/style.css'
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass';

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
    this.hasPostProcessing = false;

    this.time = 0;

    this.settings = {
      focus: 2000.0,
      aperture: 5,
      maxBlur: 0.03
    }

    this.startButton = document.getElementById('startButton')
    this.startButton.addEventListener('click', () => {
      this.init();
      this.setSettings();
      this.resize();
      this.addScreen();
      this.addVideoFeed();
      this.initPostProcessing()
      this.render();
      this.setupResize();
      // this.addDebugCube()
    })
  }

  init() {
    const overlay = document.getElementById('overlay')
    overlay.remove();

    // set the camera
    this.camera = new THREE.PerspectiveCamera(30, this.width / this.height, 1, 1000)
    this.camera.position.z = 600;
    this.camera.fov = 2 * Math.atan((this.height / 2) / 600) * 180 / Math.PI

    //set the renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    this.renderer.setPixelRatio(Math.min(Math.max(window.devicePixelRatio, 1), 2))
    this.renderer.setSize(this.width, this.height)
    this.renderer.autoClear = false;
    this.container.appendChild(this.renderer.domElement)

  }

  initPostProcessing() {
    this.hasPostProcessing = true
    this.effectComposer = new EffectComposer(this.renderer)
    this.renderPass = new RenderPass(this.scene, this.camera)

    this.bokehPass = new BokehPass(this.scene, this.camera, {
      focus: 2000.0,
      aperture: 0.025,
      maxblur: 0.03,
      width: this.width,
      height: this.height
    });
    this.bokehBlurOffset = 0;

    this.effectComposer.addPass(this.renderPass)
    this.effectComposer.addPass(this.bokehPass)
  }

  setSettings() {
    if (!this.debugMode) return

    this.pane = new Pane({
      expanded: true
    });

    this.pane.addInput(this.settings, 'focus', {
      min: 0,
      max: 3000,
      step: 10
    })

    this.pane.addInput(this.settings, 'aperture', {
      min: 0,
      max: 10,
      step: 0.1
    })

    this.pane.addInput(this.settings, 'maxBlur', {
      min: 0,
      max: 0.1,
      step: 0.001
    })
  }

  setupResize() {
    window.addEventListener('resize', this.resize.bind(this))
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;

    const pixelRatio = Math.min(Math.max(window.devicePixelRatio, 1), 2)

    if (this.hasPostProcessing) {
      this.effectComposer.setSize(this.width, this.height)
      this.effectComposer.setPixelRatio(pixelRatio)
    } else {
      this.renderer.setSize(this.width, this.height);
      this.renderer.setPixelRatio(pixelRatio)
    }

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

  addDebugCube() {
    this.camera.position.z = 6;
    this.camera.fov = 30

    const geometry = new THREE.BoxBufferGeometry(2, 2, 2)
    const material = new THREE.MeshLambertMaterial({ color: 0xff0000, })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.rotation.x = 0.25
    mesh.rotation.y = 0.25

    const light = new THREE.HemisphereLight(0xddddff, 0x552200, 1);

    this.scene.add(mesh, light)
  }

  addScreen() {
    this.geometry = new THREE.PlaneBufferGeometry(1, 1, 1, 1);
    this.shaderMaterial = new THREE.ShaderMaterial({
      vertexShader: doubleVertex,
      fragmentShader: doubleFragment,
      uniforms: {
        feed: { value: 0 },
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

    this.shaderMaterial.needsUpdate = true

    if (this.hasPostProcessing) {
      this.bokehPass.uniforms.focus.value = this.settings.focus;
      this.bokehPass.uniforms.aperture.value = this.settings.aperture * 0.00001;
      this.bokehPass.uniforms.maxblur.value = this.settings.maxBlur;

      this.effectComposer.render()
    } else {
      this.renderer.render(this.scene, this.camera)
    }

    requestAnimationFrame(this.render.bind(this))
  }
}

new Sketch({ domElement: 'container-blur' })