import '../css/style.css'
import * as THREE from 'three'
import { DeviceOrientationControls } from 'three/examples/jsm/controls/DeviceOrientationControls.js';

import room from '../static/assets/room.jpg';

class Room {
  constructor(options) {
    this.scene = new THREE.Scene();

    this.container = document.getElementById(options.dom)
    this.width = this.container.offsetWidth
    this.height = this.container.offsetWidth
    
    this.startButton = document.getElementById('startButton')
    this.startButton.addEventListener('click', () => {
      this.init();
      this.resize();
      this.render();
      this.setupResize();
    })


    this.time = 0;
  }

  setupResize() {
    window.addEventListener('resize', this.resize.bind(this))
  }

  init() {
    const overlay = document.getElementById('overlay')
    overlay.remove();

    // set the camera
    this.camera = new THREE.PerspectiveCamera( 75, this.width / this.height, 1, 1100 );

    // set the controls
	  this.controls = new DeviceOrientationControls( this.camera );

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
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
  }

  render() {
    this.time += 0.01;
    requestAnimationFrame(this.render.bind(this))
    this.controls.update();
    this.renderer.render(this.scene, this.camera)
  }
}

new Room({ dom: 'container-room'})