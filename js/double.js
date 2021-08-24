import '../css/style.css'

import './lib/three/v112/three.min.js'
import './helpers/JeelizResizer.js'


import '../dist/WebARRocksFace.js'
import './helpers/webAR/WebARRocksFaceThreeHelper'
import './helpers/webAR/WebARRocksResizer.js'
import './helpers/webAR/WebARRocksFaceDebugHelper.js'
import './helpers/webAR/stablizers/WebARRocksLMStabilizer.js'

import vertex from './shader/test/vertex.glsl?raw'
import fragment from './shader/test/fragment.glsl?raw'



class Double {
  constructor(_options) {

    this.width = window.innerWidth
    this.height = window.innerHeight

    this.canvasFace = {}
    this.canvasFace.id = 'WebARRocksFaceCanvas'
    this.canvasFace.instance = document.getElementById(this.canvasFace.id)

    this.canvasThree = {}
    this.canvasThree.id = 'threeCanvas'
    this.canvasThree.instance = document.getElementById(this.canvasThree.id)

    if(_options.videoElement) {
      this.video = {}
      this.video.id = _options.videoElement
      this.video.instance = document.getElementById(this.video.id)
    }

    this.start()
  }

  // entry point
  start() {
    WebARRocksResizer.size_canvas({
      canvasId: this.canvasThree.id,
      callback: this.init.bind(this),
    })

  }

  init() {
    console.log('oh hi')

    // WEBARROCKSFACE.init({
    //   canvasId: this.canvas.id,
    //   videoElement: this.video.instance,
    //   NNCPath: '/neuralNets/NN_FACE_0.json',
    //   callbackReady: function(errCode, spec) {
    //     console.log(spec)
    //     if (errCode){
    //       console.log('AN ERROR HAPPENS. ERROR CODE =', errCode);
    //       return;
    //     }

    //     console.log('INFO: WEBARROCKSFACE IS READY');
    //   }, //end callbackReady()

    //   // called at each render iteration (drawing loop)
    //   callbackTrack: function(detectState){
    //     // render your scene here

    //   }
    // });

    // WebARRocksFaceDebugHelper.init({
    //   spec: {
    //     GPUThermalThrottlingDetectionEnabled: true,
    //     facingMode: 'environment'
    //   }, // keep default specs
    //   callbackReady: function(err, spec){
    //     console.log('ready')
    //   },
    //   callbackTrack: function(detectState){
    //     console.log('track, jack')
    //   }
    // })

    if(this.width > this.height) {
      this.canvasFace.instance.style.width = this.width + 'px'
      this.canvasFace.instance.style.height = this.height + 'px'
      this.canvasFace.instance.setAttribute('width', this.width)
      this.canvasFace.instance.setAttribute('height', this.height)
    } else {
      this.canvasFace.instance.style.width = this.width + 'px';
      this.canvasFace.instance.style.height = this.height + 'px'
      this.canvasFace.instance.setAttribute('width', this.width)
      this.canvasFace.instance.setAttribute('height', this.height)
    }

    WebARRocksFaceThreeHelper.init({
      NNCPath: '/neuralNets/NN_FACE_0.json',
      canvas: this.canvasFace.instance,
      canvasThree: this.canvasThree.instance,
      callbackReady: (err, threeInstances) => {
        console.log('pow', threeInstances)
      }
    })
  }

  buildScene() {

  }

  resize() {
    console.log('pow')
    WebARRocksResizer.resize_canvas()
  }

  setupResize() {
    window.addEventListener('resize', this.resize.bind(this))
  }

  // render() {
  //   WebARRocksFaceThreeHelper.render(this.detectState, this.camera);
  // }
}

new Double({ canvasElement: 'WebARRocksFaceCanvas' }) 