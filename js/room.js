import '../css/style.css'
import * as THREE from 'three'
import { DeviceOrientationControls } from 'three/examples/jsm/controls/DeviceOrientationControls.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'

import { Pane } from 'tweakpane';

import room from '../static/assets/room.jpg';

class Room {
  constructor(options) {
    this.scene = new THREE.Scene();

    this.container = document.getElementById(options.domElement)
    this.width = this.container.offsetWidth
    this.height = this.container.offsetHeight

    this.debugMode = window.location.hash === '#debug'

    this.time = 0;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.intersects = []
    this.intersected = null;
    this.castable = []

    this.gyroPresent = false
    this.started = false
    this.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    this.blocker = document.getElementById('blocker');
    this.instructions = document.getElementById('instructions');
    this.gyroStatus = document.getElementById('gyro');

    this.loader = new GLTFLoader()


    this.blocker.addEventListener('click', () => {
      this.blocker.style.display = 'none'
      this.instructions.style.display = 'none'
      this.addControls()
    })

    this.init();

  }

  setupResize() {
    window.addEventListener('resize', this.resize.bind(this))
  }

  setupMouseMove() {
    if (this.isMobile && !this.debugMode) return

    window.addEventListener('mousemove', this.onMouseMove.bind(this))
  }

  setupMouseClick() {
    if (this.isMobile && !this.debugMode) {
      window.addEventListener('touchend', this.onTouchEnd.bind(this))
    } else {
      window.addEventListener('pointerdown', this.onMouseDown.bind(this))
    }
  }

  checkForGyro() {
    window.addEventListener('devicemotion', this.setGyroStatus.bind(this))
  }

  setGyroStatus(_event) {
    console.log('checking for accelerometer...')
    if (_event.rotationRate.alpha || _event.rotationRate.beta || _event.rotationRate.gamma) {
      this.gyroPresent = true
    } else {
      this.gyroPresent = false
    }
    this.gyroStatus.innerText = `accelerometer present: ${this.gyroPresent}`
    window.removeEventListener('devicemotion', this.setGyroStatus.bind(this))
  }

  setSettings() {
    if (!this.debugMode) return

    this.settings = {
      strength: 0.15,
      radius: 0.4,
      threshold: 0.85
    }

    this.pane = new Pane({ expanded: true })

    this.pane.addInput(this.settings, 'strength', {
      min: 0,
      max: 5,
    })
      .on('change', ev => {
        console.log(ev.value)
        this.bloomPass.strength = +ev.value
      })

    this.pane.addInput(this.settings, 'radius', {
      min: 0,
      max: 10,
    })
      .on('change', ev => {
        console.log(ev.value)
        this.bloomPass.radius = +ev.value
      })

    this.pane.addInput(this.settings, 'threshold', {
      min: -10,
      max: 10,
    })
      .on('change', ev => {
        console.log(ev.value)
        this.bloomPass.threshold = +ev.value
      })
  }

  init() {
    // set the camera
    this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 1, 1600);
    this.camera.position.z = 5
    // this.camera.position.x = -9.3
    // this.camera.position.y = 1.6

    this.loader.load('/models/office.glb', gltf => {
      // console.log(gltf)
      // gltf.material = new THREE.MeshStandardMaterial({ color: 0xffffff })
      // Traverse
      this.model = gltf.scene

      this.model.traverse((_child) => {
        if (_child instanceof THREE.Mesh) {
          // Save material
          // if (typeof this.materials[_child.material.uuid] === 'undefined') {
          //   this.materials[_child.material.uuid] = {
          //     baseMaterial: _child.material
          //   }
          // }

          // Add shadow
          _child.castShadow = true
          _child.receiveShadow = true
        }
      })

      this.scene.add(this.model)
      this.model.position.set(1, -2, 12)
      this.model.rotation.y = - Math.PI * 0.5
    })

    // set the renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(Math.max(window.devicePixelRatio, 1), 2));
    this.renderer.setSize(this.width, this.height);
    this.renderer.physicallyCorrectLights = true
    this.renderer.gammaOutPut = true
    this.renderer.outputEncoding = THREE.sRGBEncoding
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.shadowMap.enabled = true
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    // this.renderer.toneMappingExposure = 2.3
    this.container.appendChild(this.renderer.domElement)

    this.setSettings()
    this.checkForGyro()
    this.addCrosshair()
    this.addLights()
    this.setupMouseMove()
    this.setupMouseClick()
    this.addObject()
    // this.setLights()
    this.addPostProcessing()
    this.resize()
    this.render()
    this.setupResize()
  }

  addControls() {
    // set the controls
    if (this.isMobile && !this.debugMode) {
      // orientation controls

      this.controls = new DeviceOrientationControls(this.camera);
      this.started = true
      this.crosshairCanvas.style.display = ''
    }
    else {

      this.controls = new PointerLockControls(this.camera, this.renderer.domElement)
      this.controls.lock()

      instructions.addEventListener('click', () => {
        this.controls.lock();
      });

      this.controls.addEventListener('lock', () => {
        instructions.style.display = 'none';
        blocker.style.display = 'none';
        this.crosshairCanvas.style.display = ''
        this.started = true
      });

      this.controls.addEventListener('unlock', () => {
        blocker.style.display = 'block';
        instructions.style.display = '';
        this.crosshairCanvas.style.display = 'none'
        this.started = false
      });
    }
  }

  addCrosshair() {
    this.crosshairCanvas = document.createElement('canvas')
    const ctx = this.crosshairCanvas.getContext('2d')

    this.crosshairCanvas.width = this.width * window.devicePixelRatio
    this.crosshairCanvas.height = this.height * window.devicePixelRatio
    this.crosshairCanvas.style.display = 'none'
    this.crosshairCanvas.style.width = this.width
    this.crosshairCanvas.style.height = this.height
    this.crosshairCanvas.style.position = 'absolute'
    this.crosshairCanvas.style.top = '0'
    this.crosshairCanvas.style.left = '0'
    this.crosshairCanvas.style.userSelect = 'none'
    this.crosshairCanvas.style.pointerEvents = 'none'
    this.crosshairCanvas.setAttribute('id', 'crosshair')

    ctx.globalAlpha = 0.8
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 4
    ctx.arc(this.width / 2, this.height / 2, 15, 0, 2 * Math.PI)
    ctx.stroke()

    document.body.appendChild(this.crosshairCanvas)
  }

  addLights() {
    const xPos = [-9.3, -4.3, 0.7, 5.7, 10.7, 15.7]
    const zPos = [2.5, 10.6]

    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 6; j++) {
        const light = new THREE.PointLight(0xffffdd, 0.8);
        // const helper = new THREE.PointLightHelper(light)
        light.position.set(xPos[j], 1.2, zPos[i])
        this.scene.add(light);
      }
    }

    // const light2 = new THREE.AmbientLight(0xffffff, 0.5)
    // this.scene.add(light2)
  }

  addPostProcessing() {
    // webgl render target
    this.renderTarget = new THREE.WebGLRenderTarget(800, 600, {
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
      0.25, // strength
      1, // radius
      0.2 // threshold
    )
    this.effectComposer.addPass(this.bloomPass)
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
  }

  onMouseMove(_event) {
    this.mouse.x = (_event.clientX / this.width) * 2 - 1
    this.mouse.y = - (_event.clientY / this.height) * 2 + 1
  }

  onTouchEnd(_event) {
    this.mouse.x = _event.changedTouches[0].clientX;
    this.mouse.y = _event.changedTouches[0].clientY;

    // alert('it works')
    if (!this.started) return



    if (this.intersects.length > 0) {
      if (this.intersected) {
        console.log(window.origin)
        console.log(this.intersected.userData)
        window.location.href = window.origin + this.intersected.userData.href
      }
    }
  }

  onMouseDown(_event) {
    if (this.controls && !this.controls.isLocked || !this.started) return

    if (this.intersects.length > 0) {
      if (this.intersected) {
        console.log(window.origin)
        console.log(this.intersected.userData)
        window.location.href = window.origin + this.intersected.userData.href
      }
    }
  }

  addObject() {
    this.loader.load('/models/home.glb', gltf => {
      console.log(gltf)

      // color loss
      this.color = {}
      this.color.instance = gltf.scene.children[0]
      this.color.instance.position.set(-3, 0, 0.5)
      this.color.instance.scale.set(0.2, 0.2, 0.2)
      this.color.instance.castShadow = true
      this.color.instance.receiveShadow = true
      this.color.instance.userData = {
        name: 'color',
        href: '/color.html'
      }

      // face
      this.face = {}
      this.face.instance = gltf.scene.children[4]
      this.face.instance.castShadow = true
      this.face.instance.receiveShadow = true
      this.face.instance.position.set(-1, 0, 0.5)
      this.face.instance.scale.set(0.3, 0.3, 0.2)
      this.face.instance.userData = {
        name: 'face',
        href: '/face.html'
      }

      // blurry
      this.blur = {}
      this.blur.instance = gltf.scene.children[6]
      this.blur.instance.position.set(1, 0, 0.5)
      this.blur.instance.scale.set(0.2, 0.2, 0.2)
      this.blur.instance.castShadow = true
      this.blur.instance.receiveShadow = true
      this.blur.instance.userData = {
        name: 'blur',
        href: '/blur.html'
      }

      // double vision
      this.double = {}
      this.double.instance = gltf.scene.children[2]
      this.double.instance.castShadow = true
      this.double.instance.receiveShadow = true
      this.double.instance.position.z = 0.5
      this.double.instance.position.x = 3
      this.double.instance.scale.set(0.25, 0.25, 0.2)
      this.double.instance.userData = {
        name: 'double',
        href: '/double.html'
      }

      // highlights
      this.highlights = {}
      this.highlights.material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.BackSide
      })

      // color
      this.highlights.color = {}
      this.highlights.color.instance = gltf.scene.children[1]
      this.highlights.color.instance.material = this.highlights.material.clone()

      // double
      this.highlights.double = {}
      this.highlights.double.instance = gltf.scene.children[3]
      this.highlights.double.instance.material = this.highlights.material.clone()

      // face
      this.highlights.face = {}
      this.highlights.face.instance = gltf.scene.children[5]
      this.highlights.face.instance.material = this.highlights.material.clone()

      // blur
      this.highlights.blur = {}
      this.highlights.blur.instance = gltf.scene.children[7]
      this.highlights.blur.instance.material = this.highlights.material.clone()


      // add castable objects
      this.castable.push(this.color.instance)
      this.castable.push(this.face.instance)
      this.castable.push(this.double.instance)
      this.castable.push(this.blur.instance)

      // add to scene
      this.scene.add(
        this.color.instance,
        this.face.instance,
        this.double.instance,
        this.blur.instance
      )
    })
  }

  setLights() {
    this.lights = []

    const xPos = [-9.3, -4.3, 0.7, 5.7, 10.7, 15.7]
    const zPos = [2.5, 10.6]

    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 6; j++) {
        this.bulbLight = new THREE.PointLight(0xeeeeff, 1, 10, 2);
        this.bulbLight.position.set(xPos[j], 1.6, zPos[i])
        this.bulbLight.castShadow = true
        this.helper = new THREE.PointLightHelper(this.bulbLight)
        this.scene.add(this.bulbLight, this.helper)
        this.lights.push(this.bulbLight)
      }
    }
  }

  render() {
    this.time += 0.01;

    if (this.controls && this.controls.isLocked || this.isMobile && !this.debugMode) {
      this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera)
      this.intersects = this.raycaster.intersectObjects(this.castable);

      this.castable.forEach(i => {
        i.rotation.y = Math.sin(this.time) * 0.5;
      })

      if (this.intersects.length > 0) {

        if (this.intersected != this.intersects[0].object) {

          if (this.intersected) this.intersected.material.color.setHex(this.intersected.currentHex);

          this.intersected = this.intersects[0].object;
          this.intersectedHighlight = this.highlights[this.intersected.userData.name].instance
          this.intersected.add(this.intersectedHighlight);

          if (this.intersectedHighlight) this.intersectedHighlight.scale.set(1.15, 1.15, 1.5)

          this.intersected.currentHex = this.intersected.material.emissive.getHex();
          this.intersected.material.color.setHex(0x4BBFE1);
        }

      } else {

        if (this.intersected) this.intersected.material.color.setHex(0xffffff);

        if (this.intersectedHighlight) this.intersectedHighlight.scale.set(0, 0, 0)

        this.intersected = null;
      }

    }

    if (this.isMobile && this.started && !this.debugMode) this.controls.update()

    requestAnimationFrame(this.render.bind(this))

    // this.renderer.render(this.scene, this.camera)
    this.effectComposer.render()
  }
}

new Room({ domElement: 'container-room' })