import '../css/style.css'
import * as THREE from 'three'
import { DeviceOrientationControls } from 'three/examples/jsm/controls/DeviceOrientationControls.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import room from '../static/assets/room.jpg';

class Room {
  constructor(options) {
    this.scene = new THREE.Scene();

    this.container = document.getElementById(options.domElement)
    this.width = this.container.offsetWidth
    this.height = this.container.offsetWidth

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

  init() {
    // set the camera
    this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 1, 1600);
    this.camera.position.z = 5
    // this.camera.position.x = 5

    this.loader.load('/models/office.glb', gltf => {
      // console.log(gltf)
      // gltf.material = new THREE.MeshStandardMaterial({ color: 0xffffff })
      this.scene.add(gltf.scene)
      gltf.scene.position.set(1, -2, 12)
      gltf.scene.rotation.y = - Math.PI * 0.5
    })

    // set the renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.container.appendChild(this.renderer.domElement)


    this.checkForGyro()
    this.addCrosshair()
    this.addLights()
    this.setupMouseMove()
    this.setupMouseClick()
    this.addObject()
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
    this.crosshairCanvas.width = 100
    this.crosshairCanvas.height = 100
    this.crosshairCanvas.style.display = 'none'
    this.crosshairCanvas.style.height = '30px'
    this.crosshairCanvas.style.width = '30px'
    this.crosshairCanvas.style.position = 'absolute'
    this.crosshairCanvas.style.top = '50%'
    this.crosshairCanvas.style.left = '50%'
    this.crosshairCanvas.style.userSelect = 'none'
    this.crosshairCanvas.style.pointerEvents = 'none'
    this.crosshairCanvas.style.transform = 'translate(-50%, -50%)'
    this.crosshairCanvas.setAttribute('id', 'crosshair')

    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 12
    ctx.arc(50, 50, 40, 0, 2 * Math.PI)
    ctx.stroke()

    document.body.appendChild(this.crosshairCanvas)
  }

  addLights() {
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 1, 1).normalize();
    this.scene.add(light);
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
    const tappy = document.getElementById('tappy')

    tappy.innerText = `x: ${this.mouse.x}, y: ${this.mouse.y}`

    // alert('it works')
    if (!this.started) return



    if (this.intersects.length > 0) {
      if (this.intersected) {
        console.log(window.origin)
        console.log(this.intersected.userData)
        window.location.href = window.origin + this.intersected.userData
      }
    }
  }

  onMouseDown(_event) {
    if (this.controls && !this.controls.isLocked || !this.started) return

    if (this.intersects.length > 0) {
      if (this.intersected) {
        console.log(window.origin)
        console.log(this.intersected.userData)
        // window.location.href = window.origin + this.intersected.userData.href
      }
    }
  }

  addObject() {
    this.loader.load('/models/home.glb', gltf => {
      // console.log(gltf)

      // color loss
      this.color = {}
      this.color.instance = gltf.scene.children[0]
      this.color.instance.position.z = 0.5
      this.color.instance.position.x = -3
      this.color.instance.scale.set(0.2, 0.2, 0.2)
      this.color.instance.userData = {
        name: 'color',
        href: '/color.html'
      }

      // face
      this.face = {}
      this.face.instance = gltf.scene.children[4]
      this.face.instance.position.z = 0.5
      this.face.instance.position.x = -1
      this.face.instance.scale.set(0.3, 0.3, 0.2)
      this.face.instance.userData = {
        name: 'face',
        href: '/face.html'
      }

      // blurry
      this.blur = {}
      this.blur.instance = gltf.scene.children[6]
      this.blur.instance.position.z = 0.5
      this.blur.instance.position.x = 1
      this.blur.instance.scale.set(0.2, 0.2, 0.2)
      this.blur.instance.userData = {
        name: 'blur',
        href: '/blur.html'
      }

      // double vision
      this.double = {}
      this.double.instance = gltf.scene.children[2]
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
      this.castable.push(this.double.instance)
      this.castable.push(this.face.instance)
      this.castable.push(this.blur.instance)

      // add to scene
      this.scene.add(
        this.color.instance,
        this.double.instance,
        this.face.instance,
        this.blur.instance
      )
    })

    const light = new THREE.PointLight(0xFFF0C9)
    this.scene.add(light)
  }

  render() {
    this.time += 0.01;

    if (this.controls && this.controls.isLocked || this.isMobile && !this.debugMode) {
      this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera)
      this.intersects = this.raycaster.intersectObjects(this.castable);

      this.castable.forEach(i => {
        i.rotation.y = this.time;
      })

      if (this.intersects.length > 0) {

        if (this.intersected != this.intersects[0].object) {

          if (this.intersected) this.intersected.material.emissive.setHex(this.intersected.currentHex);

          this.intersected = this.intersects[0].object;
          this.intersectedHighlight = this.highlights[this.intersected.userData.name].instance
          this.intersected.add(this.intersectedHighlight);

          if (this.intersectedHighlight) this.intersectedHighlight.scale.set(1.1, 1.1, 1.1)

          this.intersected.currentHex = this.intersected.material.emissive.getHex();
          this.intersected.material.emissive.setHex(0x966CE0);
        }

      } else {

        if (this.intersected) this.intersected.material.emissive.setHex(this.intersected.currentHex);

        if (this.intersectedHighlight) this.intersectedHighlight.scale.set(0, 0, 0)

        this.intersected = null;
      }

    }

    if (this.isMobile && this.started && !this.debugMode) this.controls.update()

    requestAnimationFrame(this.render.bind(this))

    this.renderer.render(this.scene, this.camera)
  }
}

new Room({ domElement: 'container-room' })