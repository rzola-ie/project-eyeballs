import '../css/style.css'
import * as THREE from 'three'
import { DeviceOrientationControls } from 'three/examples/jsm/controls/DeviceOrientationControls.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

import room from '../static/assets/room.jpg';

class Room {
  constructor(options) {
    this.scene = new THREE.Scene();

    this.container = document.getElementById(options.domElement)
    this.width = this.container.offsetWidth
    this.height = this.container.offsetWidth

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
    window.addEventListener('mousemove', this.onMouseMove.bind(this))
  }

  setupMouseClick() {
    window.addEventListener('pointerdown', this.onMouseDown.bind(this))
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
    this.gyroStatus.innerText = `acceleromete present: ${this.gyroPresent}`
    window.removeEventListener('devicemotion', this.setGyroStatus.bind(this))
  }

  init() {
    // set the camera
    this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 1, 1100);
    this.camera.position.z = 5

    // set the room
    this.geometry = new THREE.SphereGeometry(500, 60, 40);
    // invert the geometry on the x-axis so that all of the faces point inward
    this.geometry.scale(- 1, 1, 1);

    this.material = new THREE.MeshBasicMaterial({
      map: new THREE.TextureLoader().load(room)
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);

    // set the helper
    this.helperGeometry = new THREE.BoxGeometry(100, 100, 100, 4, 4, 4);
    this.helperMaterial = new THREE.MeshBasicMaterial({ color: 0xff00ff, wireframe: true });
    this.helper = new THREE.Mesh(this.helperGeometry, this.helperMaterial);

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
    if (this.isMobile) {
      // orientation controls
      alert('the mobilening')
      this.controls = new DeviceOrientationControls(this.camera);
      this.started = true
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

  onMouseDown(_event) {
    if (this.controls && !this.controls.isLocked || !this.started) return

    if (this.intersects.length > 0) {
      if (this.intersected) {
        console.log(window.origin)
        console.log(this.intersected.userData)
        window.location.href = window.origin + this.intersected.userData
      }
    }
  }

  addObject() {
    this.geo = new THREE.IcosahedronBufferGeometry(1, 0)
    this.mat = new THREE.MeshLambertMaterial({
      color: Math.random() * 0xffffff
    })

    this.boxmesh = new THREE.Mesh(this.geo, this.mat)
    // this.boxmesh.userData = '/face.html'
    // this.boxmesh.position.z = -3

    // this.castable.push(this.boxmesh)
    // this.scene.add(this.boxmesh)

    for (let i = 0; i < 3; i++) {
      const box = this.boxmesh.clone()
      box.material = new THREE.MeshLambertMaterial({
        color: Math.random() * 0xffffff
      })
      this.castable.push(box)
      this.scene.add(box)
    }


    this.castable[0].position.set(-8, 0, 5)
    this.castable[0].userData = '/'

    this.castable[1].position.set(0, 0, -3)
    this.castable[1].userData = '/face.html'

    this.castable[2].position.set(8, 0, 5)
    this.castable[2].userData = '/double.html'


    this.highlight = new THREE.Mesh(this.geo, new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.BackSide
    }))
    // this.highlight.scale.set(1.2, 1.2, 1.2)
    // this.scene.add(this.highlight)



    // this.scene.add(this.boxmesh)

  }

  render() {
    this.time += 0.01;

    if (this.controls && this.controls.isLocked || this.isMobile) {
      this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera)
      this.intersects = this.raycaster.intersectObjects(this.castable);
      document.body.style.cursor = 'pointer'

      this.castable.forEach(i => {
        i.rotation.x = this.time
        i.rotation.z = this.time
      })

      this.boxmesh.rotation.x = this.time;
      this.boxmesh.rotation.z = this.time;
      // this.highlight.rotation.x = this.time;
      // this.highlight.rotation.z = this.time;

      if (this.intersects.length > 0) {

        if (this.intersected != this.intersects[0].object) {

          if (this.intersected) this.intersected.material.emissive.setHex(this.intersected.currentHex);

          this.intersected = this.intersects[0].object;
          this.intersected.add(this.highlight);
          this.highlight.scale.set(1.2, 1.2, 1.2)
          this.intersected.currentHex = this.intersected.material.emissive.getHex();
          this.intersected.material.emissive.setHex(0xff0000);

        }

      } else {

        if (this.intersected) this.intersected.material.emissive.setHex(this.intersected.currentHex);

        this.intersected = null;
        this.highlight.scale.set(1, 1, 1)
        document.body.style.cursor = 'default'
      }

    }

    if (this.isMobile && this.started) this.controls.update()


    requestAnimationFrame(this.render.bind(this))

    this.renderer.render(this.scene, this.camera)
  }
}

new Room({ domElement: 'container-room' })