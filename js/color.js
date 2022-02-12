import '../css/style.css'
import * as THREE from 'three';
import { Pane } from 'tweakpane';


import colorVertex from './shader/color/vertex.glsl?raw'
import colorFragment from './shader/color/fragment.glsl?raw'


import test from './test'

class Sketch {
  constructor(options) {
    this.scene = new THREE.Scene();

    this.container = document.getElementById(options.domElement)
    this.width = this.container.offsetWidth
    this.height = this.container.offsetHeight

    this.debugMode = window.location.hash === '#debug'

    this.time = 0;

    this.settings = {
      desaturate: -0.7
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
    this.camera = new THREE.PerspectiveCamera(30, this.width / this.height, 0.001, 1000)
    this.camera.position.z = 5;
    // this.camera.fov = 2 * Math.atan((this.height / 2) / 600) * 180 / Math.PI

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
    window.pane = this.pane

    this.pane.addInput(this.settings, 'desaturate', {
      min: -1.0,
      max: 0.5,
    });

    this.pane.on('change', (ev) => {
      this.shaderMaterial.needsUpdate = true
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

    if (this.shaderMaterial) {
      console.log('derp')
      this.shaderMaterial.uniforms.uResolution.value = new THREE.Vector2(this.width, this.height)
      this.shaderMaterial.needsUpdate = true;
    }
    // this.camera.fov = 2 * Math.atan((this.height / 2) / 600) * 180 / Math.PI
    this.camera.updateProjectionMatrix();

  }

  addScreen() {
    this.geometry = new THREE.PlaneBufferGeometry(2, 2, 1, 1);
    this.shaderMaterial = new THREE.ShaderMaterial({
      vertexShader: colorVertex,
      fragmentShader: colorFragment,
      uniforms: {
        uDesaturate: { value: this.settings.desaturate },
        feed: { value: 0 },
        uProgress: { value: 0.0 },
        uResolution: { value: new THREE.Vector2(this.width, this.height) },
        uTime: { value: 0.0 },
        u_adjust_uv: { value: new THREE.Vector2(1, 9/16)},
      }
    })

    this.mesh = new THREE.Mesh(this.geometry, this.shaderMaterial)
    this.scene.add(this.mesh)
  }

  addVideoFeed() {
    if (!this.video) {
      this.video = document.createElement('video');

      this.video.style.height = this.height
      this.video.style.width = this.width
      this.video.style.transform = `scale(0.0001, 0.0001)`
      this.video.style.position = `fixed`
      this.video.style.bottom = `0px`
      this.video.style.right = `0px`
      this.video.style.objectFit = `cover`

      this.video.setAttribute('id', 'video')
      this.video.setAttribute('muted', 'true')
      this.video.setAttribute('autoplay', 'true')
      this.video.setAttribute('playsinline', 'true')

      document.body.appendChild(this.video);
      this.videoTexture = new THREE.VideoTexture(this.video)
      this.videoTexture.minFilter = THREE.LinearFilter;
      this.videoTexture.magFilter = THREE.LinearFilter;
      this.videoTexture.format = THREE.RGBFormat;

      this.video.addEventListener("loadedmetadata", (e) => {
        console.log(this.videoTexture.image)

        console.log(this.videoTexture.image.videoWidth, this.videoTexture.image.videoHeight);

      }, false);
    }

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const constraints = { video: { 
        facingMode: 'environment',
        aspectRatio: 1.777777778,
        height: this.height,
        width:  this.width
      } 
    };

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
    this.shaderMaterial.uniforms.uTime.value = this.time
    this.shaderMaterial.uniforms.uDesaturate.value = this.settings.desaturate

    this.shaderMaterial.needsUpdate = true

    this.renderer.render(this.scene, this.camera)

    requestAnimationFrame(this.render.bind(this))
  }
}

new Sketch({ domElement: 'container-color' })