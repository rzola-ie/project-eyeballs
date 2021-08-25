import '../css/style.css'
import * as THREE from 'three'
import { DeviceOrientationControls } from 'three/examples/jsm/controls/DeviceOrientationControls.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

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
    this.intersected = null;
    this.castable = []
    
    this.startButton = document.getElementById('startButton')
    this.startButton.addEventListener('click', () => {
      this.init();

    })    
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

  init() {
    const overlay = document.getElementById('overlay')
    overlay.remove();

    // set the camera
    this.camera = new THREE.PerspectiveCamera( 75, this.width / this.height, 1, 1100 );
    this.camera.position.z = 5

    // set the room
    this.geometry = new THREE.SphereGeometry( 500, 60, 40 );
    // invert the geometry on the x-axis so that all of the faces point inward
    this.geometry.scale( - 1, 1, 1 );

    this.material = new THREE.MeshBasicMaterial( {
      map: new THREE.TextureLoader().load( room )
    } );

    this.mesh = new THREE.Mesh( this.geometry, this.material );
    this.scene.add( this.mesh );

    // set the helper
    this.helperGeometry = new THREE.BoxGeometry( 100, 100, 100, 4, 4, 4 );
    this.helperMaterial = new THREE.MeshBasicMaterial( { color: 0xff00ff, wireframe: true } );
    this.helper = new THREE.Mesh( this.helperGeometry, this.helperMaterial );
    this.scene.add( this.helper );

    // set the renderer
    this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( this.width, this.height );
    this.container.appendChild(this.renderer.domElement)



    this.addControls()
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
	  this.controls = new DeviceOrientationControls( this.camera );
    // this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    // this.controls.enableDamping = true
    // this.controls.update()
  }

  addLights() {
    const light = new THREE.DirectionalLight( 0xffffff, 1 );
    light.position.set( 1, 1, 1 ).normalize();
    this.scene.add( light );
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
    console.log('doinks')
    if(this.intersects.length > 0) {
      if(this.intersected) {
        console.log(window.origin)
        console.log(this.intersected.userData)
        window.location.href = window.origin + this.intersected.userData
      }
    }
  }

  addObject() {
    this.box1 = new THREE.Group()
    this.boxgeo = new THREE.BoxBufferGeometry(1, 1, 1)
    this.boxmat = new THREE.MeshLambertMaterial({
      color: Math.random() * 0xffffff
    })

    this.boxmesh = new THREE.Mesh(this.boxgeo, this.boxmat)
    this.boxmesh.userData = '/face.html'
    this.boxmesh.position.z = -3
    this.castable.push(this.boxmesh)
    this.scene.add(this.boxmesh)

    this.hoverGeo = new THREE.BoxBufferGeometry(1.2, 1.2, 1.2)
    this.hoverMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.4
    })
    this.hoverMesh = new THREE.Mesh(this.hoverGeo, this.hoverMat)
    this.hoverMesh.position.copy(this.boxmesh.position)

    this.box1.add(this.boxmesh, this.hoverMesh)

    this.scene.add(this.box1)

  }



  render() {
    this.time += 0.01;

    this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera)

    this.intersects = this.raycaster.intersectObjects( this.castable );

    if ( this.intersects.length > 0 ) {

      if ( this.intersected != this.intersects[ 0 ].object ) {

        if ( this.intersected ) this.intersected.material.emissive.setHex( this.intersected.currentHex );

        this.intersected = this.intersects[ 0 ].object;
        this.intersected.currentHex = this.intersected.material.emissive.getHex();
        this.intersected.material.emissive.setHex( 0xff0000 );

      }

    } else {

      if ( this.intersected ) this.intersected.material.emissive.setHex( this.intersected.currentHex );

      this.intersected = null;

    }

    this.boxmesh.rotation.x = this.time;
    this.boxmesh.rotation.z = this.time;

    this.hoverMesh.rotation.x = this.boxmesh.rotation.x
    this.hoverMesh.rotation.z = this.boxmesh.rotation.z


    requestAnimationFrame(this.render.bind(this))
    this.controls.update();
    this.renderer.render(this.scene, this.camera)
  }
}

new Room({ domElement: 'container-room'})