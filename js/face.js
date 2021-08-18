import '../css/style.css'

import './dist/jeelizFaceFilter.js'
import './lib/three/v112/three.min.js'
import './helpers/JeelizResizer.js'
import './helpers/JeelizThreeHelper.js'

import { Pane } from 'tweakpane';

import faceVertex from './shader/face/vertex.glsl?raw'
import faceFragment from './shader/face/fragment.glsl?raw'


class Face {
  constructor(options) {
    this.canvasId = options.canvasElement;
    this.overlay = document.getElementById('overlay')
    this.startButton = document.getElementById('startButton')
    this.startButton.addEventListener('click', this.startDemo.bind(this))
  }

  init() {
    this.overlay.remove()

    JeelizResizer.size_canvas({
      canvasId: this.canvasId,
      callback: (isError, bestVideoSettings) => {
        this.initFaceFilter(bestVideoSettings);
      }
    })
  }

  startDemo() {
    this.init()
    this.startButton.removeEventListener('click', this.startDemo.bind(this))
  }

  initFaceFilter(videoSettings) {
    JEELIZFACEFILTER.init({
      canvasId: this.canvasId,
      NNCPath: './js/neuralNets/', // path to JSON neural network model (NN_DEFAULT.json by default)
      videoSettings: videoSettings,
      callbackReady: (errCode, spec) => {
        if (errCode){
          console.log('AN ERROR HAPPENS. ERROR CODE =', errCode);
          return;
        }
        // [init scene with spec...]
        console.log('INFO: JEELIZFACEFILTER IS READY');
        this.initThreeScene(spec)
      }, //end callbackReady()

      // called at each render iteration (drawing loop)
      callbackTrack: (detectState) => {
        // Render your scene here
        // [... do something with detectState]
        // console.log(detectState)
        JeelizThreeHelper.render(detectState, this.camera);
      } //end callbackTrack()
    });
  }

  initThreeScene(spec) {
    const threeStuffs = JeelizThreeHelper.init(spec, this.detectCallback);

    // CREATE THE MASK:
    const maskLoader= new THREE.BufferGeometryLoader();
    /*
    faceLowPoly.json has been exported from dev/faceLowPoly.blend using THREE.JS blender exporter with Blender v2.76
    */
    maskLoader.load('./js/models/faceLowPoly.json', (maskBufferGeometry) => {
      maskBufferGeometry.computeVertexNormals();
      const threeMask = new THREE.Mesh(maskBufferGeometry, this.buildMaskMaterial(spec.videoTransformMat2));
      threeMask.frustumCulled=false;
      threeMask.scale.multiplyScalar(1.2);
      threeMask.position.set(0,0.2,-0.5);
      threeStuffs.faceObject.add(threeMask);
    });

    this.camera = JeelizThreeHelper.create_camera();
  }

  buildMaskMaterial(videoTransformMat2){
    /*
      THIS IS WHERE THE DEFORMATIONS ARE BUILT:
      1) create a tearpoint where the deformation will be located
      2) add a displacement(x, y) to deform the zone around your tearpoint
      3) select a radius: the bigger the radius the bigger the size of the deformed zone
      around your tearpoint will be
    */
    // const vertexShaderSource = 'uniform mat2 videoTransformMat2;\n\
    // varying vec2 vUVvideo;\n\
    // // deformation 0 parameters:\n\
    // const vec2 TEARPOINT0 = vec2(0.,-0.5);\n\
    // const vec2 DISPLACEMENT0 = vec2(0.,0.15);\n\
    // const float RADIUS0 = 0.4;\n\
    // // deformation 1 parameters:\n\
    // const vec2 TEARPOINT1 = vec2(0.25,-0.4);\n\
    // const vec2 DISPLACEMENT1 = vec2(0.12,-0.07);\n\
    // const float RADIUS1 = 0.3;\n\
    // // deformation 2 parameters:\n\
    // const vec2 TEARPOINT2 = vec2(-0.25,-0.4);\n\
    // const vec2 DISPLACEMENT2 = vec2(-0.12,-0.07);\n\
    // const float RADIUS2 = 0.3;\n\
    // void main() {\n\
    //   vec3 positionDeformed=position;\n\
    //   // apply deformation 0\n\
    //   float deformFactor0 = 1.-smoothstep(0.0, RADIUS0, distance(TEARPOINT0, position.xy));\n\
    //   positionDeformed.xy += deformFactor0*DISPLACEMENT0;\n\
    //   // apply deformation 1\n\
    //   float deformFactor1 = 1.-smoothstep(0.0, RADIUS1, distance(TEARPOINT1, position.xy));\n\
    //   positionDeformed.xy += deformFactor1*DISPLACEMENT1;\n\
    //   // apply deformation 2\n\
    //   float deformFactor2 = 1. - smoothstep(0.0, RADIUS2, distance(TEARPOINT2, position.xy));\n\
    //   positionDeformed.xy += deformFactor2*DISPLACEMENT2;\n\
    //   // project deformed point:\n\
    //   vec4 mvPosition = modelViewMatrix * vec4( positionDeformed, 1.0 );\n\
    //   vec4 projectedPosition=projectionMatrix * mvPosition;\n\
    //   gl_Position=projectedPosition;\n\
    //   // compute UV coordinates on the video texture:\n\
    //   vec4 mvPosition0 = modelViewMatrix * vec4( position, 1.0 );\n\
    //   vec4 projectedPosition0 = projectionMatrix * mvPosition0;\n\
    //   vUVvideo = vec2(0.5,0.5) + videoTransformMat2 * projectedPosition0.xy / projectedPosition0.w;\n\
    // }';

    // const fragmentShaderSource = "precision mediump float;\n\
    // uniform sampler2D samplerVideo;\n\
    // varying vec2 vUVvideo;\n\
    // void main() {\n\
    //   gl_FragColor = texture2D(samplerVideo, vUVvideo);\n\
    // }";

    const mat = new THREE.ShaderMaterial({
      vertexShader: faceVertex,
      fragmentShader: faceFragment,
      uniforms: {
        samplerVideo: { value: JeelizThreeHelper.get_threeVideoTexture() },
        videoTransformMat2: { value: videoTransformMat2 }
      }
    })

    return mat
  }

  detectCallback(isDetected){
    if (isDetected){
      console.log('INFO in detect_callback(): DETECTED');
    } else {
      console.log('INFO in detect_callback(): LOST');
    }
  }
}

new Face({ canvasElement: 'three-canvas'})