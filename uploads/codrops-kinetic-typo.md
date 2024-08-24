# Repository: tmp2glreb0z

# index.html

```html
<!DOCTYPE html>
<html lang="en" class="no-js">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<title>Kinetic Type with Three.js | Codrops</title>
		<meta name="description" content="Some examples of kinetic typography using Three.js" />
		<meta name="keywords" content="typography, webgl, animation, kinetic, three.js, sphere, cloth" />
		<meta name="author" content="Codrops" />
		<link rel="shortcut icon" href="favicon.ico">
		<link rel="stylesheet" href="https://use.typekit.net/ppk0edc.css">
		<link rel="stylesheet" type="text/css" href="css/base.css" />
		<script>document.documentElement.className="js";var supportsCssVars=function(){var e,t=document.createElement("style");return t.innerHTML="root: { --tmp-var: bold; }",document.head.appendChild(t),e=!!(window.CSS&&window.CSS.supports&&window.CSS.supports("font-weight","var(--tmp-var)")),t.parentNode.removeChild(t),e};supportsCssVars()||alert("Please view this demo in a modern browser that supports CSS Variables.");</script>
	</head>
	<body>
		<main>
			<div class="frame">
				<div class="frame__title-wrap">
					<h1 class="frame__title">Kinetic Typography with Three.js</h1>
				</div>
				<div class="frame__links">
					<a href="http://tympanus.net/Tutorials/ScrollLoopMenu/">Previous demo</a>
					<a href="https://tympanus.net/codrops/?p=49770">Article</a>
					<a href="https://github.com/marioecg/codrops-kinetic-typo">GitHub</a>
				</div>
				<div class="frame__demos">
					<a class="frame__demo frame__demo--current">Endless</a>
					<a class="frame__demo">Swirl</a>
					<a class="frame__demo">Twisted</a>
					<a class="frame__demo">Relax</a>
				</div>
			</div>
			<div class="content">
        		<div id="webgl"></div>
			</div>
		</main>
	</body>
</html>

```

# webpack.config.js

```javascript
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './js/index.js',

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js'
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/        
      },

      {
        test: /\.html?$/,
        use: 'html-loader',
      },   

      {
        test: /\.css(\?.*)?$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: 'css/styles.[ext]',
          },
        }, 'extract-loader', 'css-loader'],
      },   
      
      {
        test: /\.(jpe?g|gif|svg)$/i,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
          outputPath: 'images/',
          esModule: false
        }
      },    
      
      {
        test: /\.(woff(2)?|ttf|eot|svg|png|fnt)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'fonts/'
            }
          }
        ]
      },
      
      {
        test: /\.glsl$/,
        use: [
          'raw-loader',
          'glslify-loader'
        ]
      }      
    ]
  },

  devServer: {
    contentBase: path.join(__dirname, "dist"),
    compress: true,
    port: 8000,
    stats: 'errors-only'
  },  

  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      hash: true,
    }),

    new webpack.ProvidePlugin({
      THREE: 'three'
    })    
  ]  
};
```

# css/base.css

```css
*,
*::after,
*::before {
	box-sizing: border-box;
}

:root {
	font-size: 16px;
}

body {
	margin: 0;
	--color-text: #fff;
	--color-bg: #000;
	--color-link: #aaa;
	--color-link-hover: #aaa;
	color: var(--color-text);
	background-color: var(--color-bg);
	font-family: arpona, serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	transition: all 1.5s cubic-bezier(1, 0, 0, 1);
}

body.demo-2 {
	--color-bg: #3e64ff;
	--color-link: #13246d;
	--color-link-hover: #13246d;
}

body.demo-3 {
	--color-bg: #d8345f;
	--color-text: #fff;
	--color-link: #000;
	--color-link-hover: #000;
}

body.demo-4 {
	--color-bg: #f2f3f3;
	--color-text: #888;
	--color-link: #000;
	--color-link-hover: #000;
}

/* Page Loader */
.js .loading::before,
.js .loading::after {
	content: '';
	position: fixed;
	z-index: 1000;
}

.js .loading::before {
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: var(--color-bg);
}

.js .loading::after {
	top: 50%;
	left: 50%;
	width: 60px;
	height: 60px;
	margin: -30px 0 0 -30px;
	border-radius: 50%;
	opacity: 0.4;
	background: var(--color-link);
	animation: loaderAnim 0.7s linear infinite alternate forwards;

}

@keyframes loaderAnim {
	to {
		opacity: 1;
		transform: scale3d(0.5, 0.5, 1);
	}
}

a {
	text-decoration: none;
	color: var(--color-link);
	outline: none;
	cursor: pointer;
	transition: color 1.5s cubic-bezier(1, 0, 0, 1);
}

a:hover,
a:focus {
	color: var(--color-link-hover);
	outline: none;
	transition: none;
}

.frame {
	padding: 3rem 5vw;
	text-align: center;
	position: relative;
	z-index: 1000;
}

.frame__title {
	font-size: 1rem;
	margin: 0 0 1rem;
	font-weight: normal;
}

.frame__links {
	display: inline;
}

.frame__links a:not(:last-child),
.frame__demos a:not(:last-child) {
	margin-right: 1rem;
}

.frame__demos {
	margin: 1rem 0;
}

.frame__demo--current,
.frame__demo--current:hover {
	color: var(--color-text);
}

.content {
	display: flex;
	flex-direction: column;
	width: 100vw;
	height: calc(100vh - 13rem);
	position: relative;
	justify-content: flex-start;
	align-items: center;
}

@media screen and (min-width: 53em) {
	.frame {
		position: fixed;
		text-align: left;
		z-index: 100;
		top: 0;
		left: 0;
		display: grid;
		align-content: space-between;
		width: 100%;
		max-width: none;
		height: 100vh;
		padding: 3rem;
		pointer-events: none;
		grid-template-columns: 75% 25%;
		grid-template-rows: auto auto auto;
		grid-template-areas: 'title links'
			'... ...'
			'... demos';
	}

	.frame__title-wrap {
		grid-area: title;
		display: flex;
	}

	.frame__title {
		margin: 0;
	}

	.frame__tagline {
		position: relative;
		margin: 0 0 0 1rem;
		padding: 0 0 0 1rem;
		opacity: 0.5;
	}

	.frame__demos {
		margin: 0;
		grid-area: demos;
		justify-self: end;
	}

	.frame__links {
		grid-area: links;
		padding: 0;
		justify-self: end;
	}

	.frame a {
		pointer-events: auto;
	}

	.content {
		height: 100vh;
		justify-content: center;
	}
}

canvas {
	position: fixed;
	top: 0;
	left: 0;
}
```

# js/options.js

```javascript
import shaders from './gl/shaders';
import f from './fonts';

const options = [
  {
    word: 'ENDLESS',
    color: '#ffffff',
    fill: '#000000',
    geometry: new THREE.TorusKnotGeometry(9, 3, 768, 3, 4, 3),
    position: {
      texture: [-0.965, -0.4, 0],
      mesh: [0, 0, 0]
    },
    scale: [0.008, 0.04, 1],
    shaders: {
      vertex: shaders.vertex.demo1,
      fragment: shaders.fragment.demo1
    },
    font: {
      file: f.file.demo1,
      atlas: f.atlas.demo1
    },
    class: 'demo-1'
  },

  {
    word: 'SWIRL',
    color: '#ffffff',
    fill: '#3e64ff',
    geometry: new THREE.SphereGeometry(12, 64, 64),
    position: {
      texture: [-0.9, -0.5, 0],
      mesh: [0, 0, 0]
    },
    scale: [0.0115, 0.04, 1],
    shaders: {
      vertex: shaders.vertex.demo2,
      fragment: shaders.fragment.demo2
    },
    font: {
      file: f.file.demo2,
      atlas: f.atlas.demo2
    },
    class: 'demo-2'
  },

  {
    word: 'TWISTED',
    color: '#ffffff',
    fill: '#d8345f',
    geometry: new THREE.BoxGeometry(100, 10, 10, 64, 64, 64),
    position: {
      texture: [-0.945, -0.5, 0],
      mesh: [0, 0, 0]
    },
    scale: [0.009, 0.04, 1],
    shaders: {
      vertex: shaders.vertex.demo3,
      fragment: shaders.fragment.demo3
    },
    font: {
      file: f.file.demo3,
      atlas: f.atlas.demo3
    },
    class: 'demo-3'
  },

  {
    word: 'RELAX',
    color: '#fff',
    fill: '#e3e6e5',
    geometry: new THREE.PlaneGeometry(27, 27, 64, 64),
    position: {
      texture: [-0.9, -0.65, 0],
      mesh: [0, 0, 0]
    },
    scale: [0.014, 0.05, 1],
    shaders: {
      vertex: shaders.vertex.demo4,
      fragment: shaders.fragment.demo4
    },
    font: {
      file: f.file.demo4,
      atlas: f.atlas.demo4
    },
    class: 'demo-4'
  }
];

export default options;
```

# js/index.js

```javascript
import '../css/base.css';

import gsap from 'gsap';

import Gl from './gl';
import Type from './gl/Type';
import options from './options';

class App {
  constructor() {
    this.elems = [...document.querySelectorAll('.frame__demo')]
    this.prev = 0;
    this.current = 0;
    this.turn = 0;    

    this.init();
  }

  init() {
    this.createGl();
    this.changeDemo();
  }

  createGl() {
    for (let i = 0; i < options.length; i++) {
      // Position elements in a circle
      let angle = (i / options.length) * (Math.PI * 2) + Math.PI * 1.5; // Offset the turn
      let radius = 50;
      let x = radius * Math.cos(angle);
      let z = radius * Math.sin(angle);  
      options[i].position.mesh = [x, 0, z];

      // Create kinetic type
      let type = new Type();
      type.init(options[i]);
    }    
  }

  changeDemo() {
    this.elems.forEach((el, index) => el.addEventListener('click', this.onClick.bind(this, index)));    
  }
  
  onClick(index, { currentTarget }) {
    this.elems.forEach(el => el.classList.remove('frame__demo--current'));
    currentTarget.classList.add('frame__demo--current');
  
    this.prev = this.current;
    this.current = this.elems.indexOf(currentTarget);
  
    if (this.prev === this.current) return;
  
    this.turn = (Math.PI / 2) * (this.current - this.prev);
  
    this.tl = gsap.timeline({
      onStart: () => {
        document.body.classList = "";
        document.body.classList.add(options[index].class);
      }
    });
  
    this.tl
      .to(Gl.scene.rotation, {
        duration: 1.5,
        ease: "expo.inOut",
        y: `+=${this.turn}`,
      });
  }
}

new App();
```

# js/fonts.js

```javascript
import file1 from '../assets/Orbitron-Black.fnt';
import atlas1 from '../assets/Orbitron-Black.png';
import file2 from '../assets/MontserratAlternates-Bold.fnt';
import atlas2 from '../assets/MontserratAlternates-Bold.png';
import file3 from '../assets/ArchivoBlack-Regular.fnt';
import atlas3 from '../assets/ArchivoBlack-Regular.png';
import file4 from '../assets/OpenSans-SemiBold.fnt';
import atlas4 from '../assets/OpenSans-SemiBold.png';

export default {
  file: {
    demo1: file1,
    demo2: file2,
    demo3: file3,
    demo4: file4,
  },

  atlas: {
    demo1: atlas1,
    demo2: atlas2,
    demo3: atlas3,
    demo4: atlas4,
  },
};
```

# js/gl/Type.js

```javascript
import * as THREE from 'three';
import Gl from './index';

// THREE BMFONT TEXT
import loadFont from 'load-bmfont';
import createGeometry from 'three-bmfont-text';
import MSDFShader from 'three-bmfont-text/shaders/msdf';
import fontFile from '../../assets/Orbitron-Black.fnt';
import fontAtlas from '../../assets/Orbitron-Black.png';

export default class extends THREE.Object3D {
  init(options) {
    this.opts = {
      word: options.word,
      color: options.color,
      fill: options.fill,
      wordPosition: options.position.texture,
      wordScale: options.scale,
      position: options.position.mesh,
      rotation: options.rotation || [0, 0, 0],
      geometry: options.geometry,
      vertex: options.shaders.vertex,
      fragment: options.shaders.fragment,
      fontFile: options.font.file || fontFile,
      fontAtlas: options.font.atlas || fontAtlas
    };

    // Create geometry of packed glyphs
    loadFont(this.opts.fontFile, (err, font) => {
      this.fontGeometry = createGeometry({
        font,
        text: this.opts.word,
      })

      // Load texture containing font glyps
      this.loader = new THREE.TextureLoader();
      this.loader.load(this.opts.fontAtlas, (texture) => {
        this.fontMaterial = new THREE.RawShaderMaterial(
          MSDFShader({
            map: texture,
            side: THREE.DoubleSide,
            transparent: true,
            negate: false,
            color: this.opts.color
          })
        );

        this.createRenderTarget();
        this.createMesh();
      });
    });
  }

  createRenderTarget() {
    // Render Target setup
    this.rt = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);
    this.rtCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    this.rtCamera.position.z = 2.4;

    this.rtScene = new THREE.Scene();
    this.rtScene.background = new THREE.Color(this.opts.fill);

    this.text = new THREE.Mesh(this.fontGeometry, this.fontMaterial);
    this.text.position.set(...this.opts.wordPosition);
    this.text.rotation.set(Math.PI, 0, 0);
    this.text.scale.set(...this.opts.wordScale);
    this.rtScene.add(this.text);
  }

  createMesh() {
    this.geometry = this.opts.geometry;

    this.material = new THREE.ShaderMaterial({
      vertexShader: this.opts.vertex,
      fragmentShader: this.opts.fragment,
      uniforms: {
        uTime: { value: 0 },
        uTexture: { value: this.rt.texture },
      },
      defines: {
        PI: Math.PI
      },
      // wireframe: true,
      side: THREE.DoubleSide
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.set(...this.opts.position);
    this.mesh.rotation.set(...this.opts.rotation);
    this.mesh.lookAt(new THREE.Vector3());

    this.mesh.onBeforeRender = (renderer) => {
      renderer.setRenderTarget(this.rt);
      renderer.render(this.rtScene, this.rtCamera);
      renderer.setRenderTarget(null);
    }

    this.add(this.mesh);

    Gl.scene.add(this);
  }

  updateTime(time) {
    this.material.uniforms.uTime.value = time;
  }
}
```

# js/gl/index.js

```javascript
import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default new class {
  constructor() {
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x000000, 0);

    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      1,
      1000
    );

    this.camera.position.z = 1;

    this.scene = new THREE.Scene();

    // this.controls = new OrbitControls(this.camera, this.renderer.domElement);    

    this.clock = new THREE.Clock();

    this.init();
  }

  render() {
    // this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    for (let i = 0; i < this.scene.children.length; i++) {
      const obj = this.scene.children[i];
      obj.updateTime(this.clock.getElapsedTime());
    }    

    this.render();
  }

  addEvents() {
    window.addEventListener('resize', this.resize.bind(this));
  }

  init() {
    this.addToDom();
    this.animate();
    this.addEvents();
  }

  addToDom() {
    const canvas = this.renderer.domElement;
    const container = document.querySelector('#webgl');
    container.appendChild(canvas);
  }

  resize() {
    let width = window.innerWidth;
    let height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }
}
```

# js/gl/shaders.js

```javascript
//----------------- TORUS KNOT SHADERS -----------------//

const torusVertex = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vPosition;

  uniform float uTime;

  void main() {
    vUv = uv;
    vPosition = position;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
  }
`;

const torusFragment = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vPosition;

  uniform float uTime;
  uniform sampler2D uTexture;

  void main() {
    float time = uTime * 0.4;

    vec2 repeat = -vec2(12., 3.);
    vec2 uv = fract(vUv * repeat - vec2(time, 0.));
    vec3 texture = texture2D(uTexture, uv).rgb;
    // texture *= vec3(uv.x, uv.y, 0.);

    float fog = clamp(vPosition.z / 6., 0., 1.);
    vec3 fragColor = mix(vec3(0.), texture, fog);

    gl_FragColor = vec4(fragColor, 1.);
  }
`;

//----------------- SPHERE SHADERS -----------------//

const sphereVertex = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vPosition;

  uniform float uTime;

  void main() {
    vUv = uv;
    vPosition = position;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
  }
`;

const sphereFragment = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vPosition;

  uniform float uTime;
  uniform sampler2D uTexture;

  void main() {
    float time = uTime * 1.5;

    vec2 repeat = vec2(12., 12.);
    vec2 uv = fract(vUv * repeat + vec2(sin(vUv.y * 1.) * 5., time));

    vec3 texture = texture2D(uTexture, uv).rgb;
    // texture *= vec3(uv.x, uv.y, 0.);

    float depth = vPosition.z / 10.;
    vec3 fragColor = mix(vec3(0., 0., .8), texture, depth);

    gl_FragColor = vec4(fragColor, 1.);
  }
`;

//----------------- BOX SHADERS -----------------//

const boxVertex = /* glsl */ `
  varying vec2 vUv;

  uniform float uTime;

  mat4 rotation3d(vec3 axis, float angle) {
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;

    return mat4(
      oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
      oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
      oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
      0.0,                                0.0,                                0.0,                                1.0
    );
  }

  vec3 rotate(vec3 v, vec3 axis, float angle) {
    return (rotation3d(axis, angle) * vec4(v, 1.0)).xyz;
  }

  void main() {
    vUv = uv;

    vec3 pos = position;

    vec3 axis = vec3(1., 0., 0.);
    float twist = 0.1;
    float angle = pos.x * twist;

    vec3 transformed = rotate(pos, axis, angle);

    // float freq = 0.75;
    // float amp = 1.;
    // transformed.y += cos(transformed.x * freq + 0.) * amp;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.);
  }
`;

const boxFragment = /* glsl */ `
  varying vec2 vUv;

  uniform float uTime;
  uniform sampler2D uTexture;

  void main() {
    float time = uTime * 0.25;
    vec2 uv = fract(vUv * 3. - vec2(time, 0.));
    vec3 texture = texture2D(uTexture, uv).rgb;

    gl_FragColor = vec4(texture, 1.);
  }
`;

//----------------- PLANE SHADERS -----------------//

const planeVertex = /* glsl */ `
  varying vec2 vUv;
  varying float vWave;

  uniform float uTime;

  void main() {
    vUv = uv;

    vec3 pos = position;
    float freq = 0.5;
    float amp = 1.;
    float time = uTime * 3.5;
    pos.z += sin((pos.x - pos.y) * freq - time) * amp;

    vWave = pos.z;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.);
  }
`;

const planeFragment = /* glsl */ `
  varying vec2 vUv;
  varying float vWave;

  uniform float uTime;
  uniform sampler2D uTexture;

  float map(float value, float min1, float max1, float min2, float max2) {
    return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
  }

  void main() {
    float time = uTime * 0.25;
    vec2 repeat = vec2(4., 16.);
    vec2 uv = fract(vUv * repeat);
    vec3 texture = texture2D(uTexture, uv).rgb;
    // texture *= vec3(uv.x, uv.y, 0.);

    float wave = vWave;
    wave = map(wave, -1., 1., 0., 0.1);
    float shadow = 1. - wave;

    vec3 fragColor = texture * shadow;

    gl_FragColor = vec4(fragColor, 1.);
  }
`;

//-------------- EXPORT SHADERS -----------------//

export default {
  vertex: {
    demo1: torusVertex,
    demo2: sphereVertex,
    demo3: boxVertex,
    demo4: planeVertex,
  },

  fragment: {
    demo1: torusFragment,
    demo2: sphereFragment,
    demo3: boxFragment,
    demo4: planeFragment,
  },
};
```

