import { EffectComposer } from "https://unpkg.com/three@0.120.0/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "https://unpkg.com/three@0.120.0/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "https://unpkg.com/three@0.120.0/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OBJLoader } from "https://unpkg.com/three@0.120.0/examples/jsm/loaders/OBJLoader";
import { OrbitControls } from "https://unpkg.com/three@0.120.0/examples/jsm/controls/OrbitControls";
var cardtemplate = "cardtemplate3.png";
var cardtemplateback = "cardtemplateback4.png";
var flower = "flower3.png";
var noise2 = "noise2.png";
var color11 = "color11.png";
var backtexture = "color3.jpg";
var skullmodel = "skull.obj";
var voronoi = "rgbnoise2.png";

var scene,
  sceneRTT,
  camera,
  cameraRTT,
  renderer,
  container,
  width = window.innerWidth,
  height = window.innerHeight,
  frontmaterial,
  backmaterial,
  controls,
  bloomPass,
  composer,
  frontcard,
  backcard;
var options = {
  exposure: 0.8,
  bloomStrength: 1.3,
  bloomThreshold: 0,
  bloomRadius: 0.89,
  color0: [0, 31, 255],
  color1: [69, 69, 194],
  color2: [0, 150, 255],
  isanimate: false,
};

const vert = `
  varying vec2 vUv;
  varying vec3 camPos;
  varying vec3 eyeVector;
  varying vec3 vNormal;

  void main() {
    vUv = uv;
    camPos = cameraPosition;
    vNormal = normal;
    vec4 worldPosition = modelViewMatrix * vec4( position, 1.0);
    eyeVector = normalize(worldPosition.xyz - abs(cameraPosition));
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  }
`;

const fragPlane = `
	varying vec2 vUv;
  uniform sampler2D skullrender;
  uniform sampler2D cardtemplate;
  uniform sampler2D backtexture;
  uniform sampler2D noiseTex;
  uniform sampler2D color;
  uniform sampler2D noise;
  uniform vec4 resolution;
  varying vec3 camPos;
  varying vec3 eyeVector;
  varying vec3 vNormal;

  float Fresnel(vec3 eyeVector, vec3 worldNormal) {
    return pow( 1.0 + dot( eyeVector, worldNormal), 1.80 );
  }

  void main() {
    vec2 uv = gl_FragCoord.xy/resolution.xy ;
    vec4 temptex = texture2D( cardtemplate, vUv);
    vec4 skulltex = texture2D( skullrender, uv - 0.5 );
    gl_FragColor = temptex;
    float f = Fresnel(eyeVector, vNormal);
    vec4 noisetex = texture2D( noise, mod(vUv*2.,1.));
    if(gl_FragColor.g >= .5 && gl_FragColor.r < 0.6){
      gl_FragColor = f + skulltex;
      gl_FragColor += noisetex/6.;

    } else {
      vec4 bactex = texture2D( backtexture, vUv);
      float tone = pow(dot(normalize(camPos), normalize(bactex.rgb)), 1.);
      vec4 colortex = texture2D( color, vec2(tone,0.));

      //sparkle code, dont touch this!
      vec2 uv2 = vUv;
      vec3 pixeltex = texture2D(noiseTex,mod(uv*5.,1.)).rgb;      
      float iTime = 1.*0.004;
      uv.y += iTime / 10.0;
      uv.x -= (sin(iTime/10.0)/2.0);
      uv2.y += iTime / 14.0;
      uv2.x += (sin(iTime/10.0)/9.0);
      float result = 0.0;
      result += texture2D(noiseTex, mod(uv*4.,1.) * 0.6 + vec2(iTime*-0.003)).r;
      result *= texture2D(noiseTex, mod(uv2*4.,1.) * 0.9 + vec2(iTime*+0.002)).b;
      result = pow(result, 10.0);
      gl_FragColor *= colortex;
      gl_FragColor += vec4(sin((tone + vUv.x + vUv.y/10.)*10.))/8.;
      // gl_FragColor += vec4(108.0)*result;

    }

    gl_FragColor.a = temptex.a;
  }
`;

const fragPlaneback = `
  varying vec2 vUv;
  uniform sampler2D skullrender;
  uniform sampler2D cardtemplate;
  uniform sampler2D backtexture;
  uniform sampler2D noiseTex;
  uniform sampler2D color;
  uniform sampler2D noise;
  uniform vec4 resolution;
  varying vec3 camPos;
  varying vec3 eyeVector;
  varying vec3 vNormal;

  float Fresnel(vec3 eyeVector, vec3 worldNormal) {
    return pow( 1.0 + dot( eyeVector, worldNormal), 1.80 );
  }

  void main() {
    vec2 uv = gl_FragCoord.xy/resolution.xy ;
    vec4 temptex = texture2D( cardtemplate, vUv);
    vec4 skulltex = texture2D( skullrender, vUv );
    gl_FragColor = temptex;
    vec4 noisetex = texture2D( noise, mod(vUv*2.,1.));
    float f = Fresnel(eyeVector, vNormal);

    vec2 uv2 = vUv;
    vec3 pixeltex = texture2D(noiseTex,mod(uv*5.,1.)).rgb;      
    float iTime = 1.*0.004;
    uv.y += iTime / 10.0;
    uv.x -= (sin(iTime/10.0)/2.0);
    uv2.y += iTime / 14.0;
    uv2.x += (sin(iTime/10.0)/9.0);
    float result = 0.0;
    result += texture2D(noiseTex, mod(uv*4.,1.) * 0.6 + vec2(iTime*-0.003)).r;
    result *= texture2D(noiseTex, mod(uv2*4.,1.) * 0.9 + vec2(iTime*+0.002)).b;
    result = pow(result, 10.0);

    vec4 bactex = texture2D( backtexture, vUv);
    float tone = pow(dot(normalize(-camPos), normalize(bactex.rgb)), 1.);
    vec4 colortex = texture2D( color, vec2(tone,0.));
    if(gl_FragColor.g >= .5 && gl_FragColor.r < 0.6){
      float tone = pow(dot(normalize(-camPos), normalize(skulltex.rgb)), 1.);
      vec4 colortex2 = texture2D( color, vec2(tone,0.));
      if(skulltex.a > 0.2){
        gl_FragColor = colortex;
      } else {
        gl_FragColor = vec4(0.) + f;
        gl_FragColor += noisetex/9.;
      }
      gl_FragColor += noisetex/9.;
    
    } else {
      gl_FragColor *= colortex;
      gl_FragColor += vec4(sin((tone + vUv.x + vUv.y/10.)*10.))/8.;
    }

    // Set the opacity of the fragment color
    gl_FragColor.a = temptex.a * 1.;  // Here, multiply the alpha by 0.5 to reduce opacity to 50%
  }
`;

const vertskull = `
      varying vec3 vNormal;
      varying vec3 camPos;
      varying vec3 vPosition;
      varying vec2 vUv;
      varying vec3 eyeVector;

      void main() {
        vNormal = normal;
        vUv = uv;
        camPos = cameraPosition;
        vPosition = position;
        vec4 worldPosition = modelViewMatrix * vec4( position, 1.0);
        eyeVector = normalize(worldPosition.xyz - cameraPosition);
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      }
`;
const fragskull = `
      #define NUM_OCTAVES 5
      uniform vec4 resolution;
      varying vec3 vNormal;
      varying vec3 vPosition;
      uniform float time;
      varying vec3 camPos;
      varying vec2 vUv;
      uniform vec3 color1;
      uniform vec3 color0;
      varying vec3 eyeVector;

      
      float rand(vec2 n) {
        return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
      }

      float noise(vec2 p){
        vec2 ip = floor(p);
        vec2 u = fract(p);
        u = u*u*(3.0-2.0*u);

        float res = mix(
          mix(rand(ip),rand(ip+vec2(1.0,0.0)),u.x),
          mix(rand(ip+vec2(0.0,1.0)),rand(ip+vec2(1.0,1.0)),u.x),u.y);
        return res*res;
      }

      float fbm(vec2 x) {
        float v = 0.0;
        float a = 0.8;
        vec2 shift = vec2(100);
        // Rotate to reduce axial bias
        mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
        for (int i = 0; i < NUM_OCTAVES; ++i) {
          v += a * noise(x);
          x = rot * x * 2.0 + shift;
          a *= 0.99;
        }
        return v;
      }

      float setOpacity(float r, float g, float b) {
        float tone = (r + g + b) / 3.4;
        float alpha = 1.0;
        if(tone<0.69) {
          alpha = 0.0;
        }
        return alpha;
      }

      vec3 rgbcol(float r, float g, float b) {
        return vec3(r/255.0,g/255.0,b/255.0);
      }

      float Fresnel(vec3 eyeVector, vec3 worldNormal) {
        return pow( 1.0 + dot( eyeVector, worldNormal), 3.0 );
      }
     
      void main() {
        vec2 olduv = gl_FragCoord.xy/resolution.xy ;
        float f = Fresnel(eyeVector, vNormal);
        float gradient2 = (f)*(.93 - vPosition.y) ;
        float scale = 4.;
        // olduv *= 0.5;
        // olduv.y -= 0.5; 
        olduv.y = olduv.y - time;
        vec2 p = olduv*scale;
        float noise = fbm( p + time );
        
        vec2 uv = gl_FragCoord.xy/resolution.xy ; 
        //  uv = normalize( vNormal ).xy ; 


        vec3 newCam = vec3(0.,5.,10.);
        float gradient = dot(.0 -  normalize( newCam ), normalize( vNormal )) ;

        vec3 viewDirectionW = normalize(camPos - vPosition);
        float fresnelTerm = dot(viewDirectionW, vNormal);  
        fresnelTerm = clamp( 1. - fresnelTerm, 0., 1.) ;

        vec3 color = vec3(noise) + gradient;
        vec3 color2 = color - 0.3;


        float noisetone = setOpacity(color.r,color.g,color.b);
        float noisetone2 = setOpacity(color2.r,color2.g,color2.b);


        vec4 backColor = vec4(color, 1.);
        backColor.rgb = rgbcol(color0.r,color0.g,color0.b)*noisetone;
        // backColor.a = noisetone;

        vec4 frontColor = vec4(color2, 1.);
        frontColor.rgb = rgbcol(color1.r,color1.g,color1.b)*noisetone;
        // frontColor.a = noisetone2;

        if(noisetone2>0.0){
          // show first color
          gl_FragColor = frontColor;
        } else {
          // show 2nd color
          gl_FragColor = backColor;
        }
      }

`;
function init() {
  container = document.getElementById("world");

  camera = new THREE.PerspectiveCamera(
    33,
    window.innerWidth / window.innerHeight,
    1,
    10000
  );
  camera.position.z = 100;
  cameraRTT = new THREE.PerspectiveCamera(
    33,
    window.innerWidth / window.innerHeight,
    1,
    10000
  );
  cameraRTT.position.z = 33;
  cameraRTT.position.y = 0;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x191b25);
  sceneRTT = new THREE.Scene();
  sceneRTT.background = new THREE.Color(0x000000);

  renderer = new THREE.WebGLRenderer({ antialias: true, autoSize: true });
  renderer.setPixelRatio(2);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.autoClear = false;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.interpolateneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputEncoding = THREE.sRGBEncoding;
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.update();
  document.getElementById("world").appendChild(renderer.domElement);
  //
  var renderScene = new RenderPass(sceneRTT, cameraRTT);
  bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.7,
    0.4,
    0.85
  );
  composer = new EffectComposer(renderer);
  composer.renderToScreen = false;
  composer.addPass(renderScene);
  composer.addPass(bloomPass);
  //
  background();
  plane();
  planeback();
  loadskull();
  animate();
  loadAll();
}

function background() {
  const textureURL = "cosmos.jpg";
 
  // Create the sphere geometry
  const sphereGeometry = new THREE.SphereGeometry(80, 80, 80);

  // Load the texture
  const textureLoader = new THREE.TextureLoader();
  textureLoader.load(textureURL, (texture) => {
    // Set texture encoding and properties
    texture.encoding = THREE.sRGBEncoding; // Ensure correct gamma correction for textures
    texture.anisotropy = 16; // Increase if texture appears blurry
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearMipMapLinearFilter;

    // Create a material with the texture and set side to BackSide to make it visible from inside
    const sphereMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.BackSide,
    });

    // Create the sphere mesh
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

    // Add the sphere to the scene
    scene.add(sphere);
  });
}

function plane() {
  var geometry = new THREE.PlaneGeometry(20, 30);
  frontmaterial = new THREE.ShaderMaterial({
    uniforms: {
      cardtemplate: {
        type: "t",
        value: new THREE.TextureLoader().load(cardtemplate),
      },
      backtexture: {
        type: "t",
        value: new THREE.TextureLoader().load(backtexture),
      },
      noise: {
        type: "t",
        value: new THREE.TextureLoader().load(noise2),
      },
      skullrender: {
        type: "t",
        value: composer.readBuffer.texture,
      },
      resolution: {
        value: new THREE.Vector2(window.innerWidth, window.innerHeight),
      },
      noiseTex: {
        type: "t",
        value: new THREE.TextureLoader().load(voronoi),
      },
      color: {
        type: "t",
        value: new THREE.TextureLoader().load(color11),
      },
    },
    fragmentShader: fragPlane,
    vertexShader: vert,
    transparent: true,
    depthWrite: false,
  });

  frontcard = new THREE.Mesh(geometry, frontmaterial);
  scene.add(frontcard);
}

function planeback() {
  var geometry = new THREE.PlaneGeometry(20, 30);
  backmaterial = new THREE.ShaderMaterial({
    uniforms: {
      cardtemplate: {
        type: "t",
        value: new THREE.TextureLoader().load(cardtemplateback),
      },
      backtexture: {
        type: "t",
        value: new THREE.TextureLoader().load(backtexture),
      },
      noise: {
        type: "t",
        value: new THREE.TextureLoader().load(noise2),
      },
      skullrender: {
        type: "t",
        value: new THREE.TextureLoader().load(flower),
      },
      resolution: {
        value: new THREE.Vector2(window.innerWidth, window.innerHeight),
      },
      noiseTex: {
        type: "t",
        value: new THREE.TextureLoader().load(voronoi),
      },
      color: {
        type: "t",
        value: new THREE.TextureLoader().load(color11),
      },
    },
    fragmentShader: fragPlaneback,
    vertexShader: vert,
    transparent: true,
    depthWrite: false,
  });
  backcard = new THREE.Mesh(geometry, backmaterial);
  backcard.rotation.set(0, Math.PI, 0);
  scene.add(backcard);
}
var basicmat,
  skullmaterial,
  modelgroup = new THREE.Group();

function loadskull() {
  skullmaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: {
        type: "f",
        value: 0.0,
      },
      color1: {
        value: new THREE.Vector3(...options.color1),
      },
      color0: {
        value: new THREE.Vector3(...options.color0),
      },
      resolution: {
        value: new THREE.Vector2(window.innerWidth, window.innerHeight),
      },
    },
    fragmentShader: fragskull,
    vertexShader: vertskull,
    // depthWrite: false,
  });

  basicmat = new THREE.MeshBasicMaterial();
  basicmat.color.setRGB(...options.color2);

  modelgroup = new THREE.Object3D();

  var objloader = new OBJLoader();
  objloader.load(skullmodel, function (object) {
    var mesh2 = object.clone();
    mesh2.position.set(0, 0, -4);

    mesh2.rotation.set(Math.PI, 0, Math.PI);

    mesh2.children.forEach((val, key) => {
      val.traverse(function (child) {
        child.geometry = new THREE.Geometry().fromBufferGeometry(
          child.geometry
        );
        child.geometry.mergeVertices();
        child.material = skullmaterial;
        child.verticesNeedUpdate = true;
        child.normalsNeedUpdate = true;
        child.uvsNeedUpdate = true;
        child.material.flatShading = THREE.SmoothShading;
        child.geometry.computeVertexNormals();
      });
      mesh2.scale.set(0.22, 0.22, 0.22);

      modelgroup.add(mesh2);
      sceneRTT.add(modelgroup);
    });
  });
}
var matrix = new THREE.Matrix4();
var period = 5;
var clock = new THREE.Clock();
var pausedCameraY = null;
let pausedTime = clock.getElapsedTime();

var matrix = new THREE.Matrix4();
var period = 5;
var clock = new THREE.Clock();
var pausedCameraY = null;

let ParentQuaternion = new THREE.Quaternion();
let childQuaternion = new THREE.Quaternion();

let offsetMatrix = new THREE.Matrix4();
let offsetVector = new THREE.Vector3(0, 0, -4); // Offset for the modelgroup

function updateDraw(deltaTime) {
  ParentQuaternion.copy(camera.quaternion);

  // Create a transformation matrix for the offset
  offsetMatrix.makeRotationFromQuaternion(ParentQuaternion);
  offsetMatrix.setPosition(offsetVector);

  // Apply the offset transformation to the modelgroup
  modelgroup.position.set(0, 0, 0); // Reset position
  modelgroup.applyMatrix4(offsetMatrix);

  // Apply the inverse rotation to the modelgroup
  childQuaternion.copy(ParentQuaternion);
  childQuaternion.inverse();
  modelgroup.setRotationFromQuaternion(childQuaternion);

  if (options.isanimate) {
    if (!clock.running) {
      clock.start();

      if (pausedCameraY !== null) {
        // Update the matrix with the stored Y position
        matrix.set(1, 0, 0, 0, 0, 1, 0, pausedCameraY, 0, 0, 1, 0, 0, 0, 0, 1);
        pausedCameraY = null;
      }

      clock.startTime += pausedTime * 1000;
    }

    // Calculate rotation angle based on fixed speed
    var rotationAngle = (clock.getDelta() * 0.7 * Math.PI) / period;

    // Create rotation matrix
    matrix.makeRotationY(rotationAngle);

    // Apply rotation and Y position adjustment to camera position
    camera.position.applyMatrix4(matrix);
    camera.lookAt(frontcard.position);
  } else {
    if (clock.running) {
      clock.stop();
      pausedTime = clock.getElapsedTime();
      // Store the Y position of the camera
      pausedCameraY = camera.position.y;
    }
  }

  bloomPass.threshold = options.bloomThreshold;
  bloomPass.strength = options.bloomStrength;
  bloomPass.radius = options.bloomRadius;

  if (skullmaterial) {
    skullmaterial.uniforms.time.value = deltaTime / 4000;
    skullmaterial.uniforms.color1.value = new THREE.Vector3(...options.color1);
    skullmaterial.uniforms.color0.value = new THREE.Vector3(...options.color0);
  }
}

function animate(deltaTime) {
  requestAnimationFrame(animate);
  updateDraw(deltaTime);
  composer.render();
  renderer.render(scene, camera);
}
function handleResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  cameraRTT.aspect = window.innerWidth / window.innerHeight;
  cameraRTT.updateProjectionMatrix();

  frontcard.material.uniforms.resolution.value = new THREE.Vector2(
    window.innerWidth,
    window.innerHeight
  );
  skullmaterial.uniforms.resolution.value = new THREE.Vector2(
    window.innerWidth,
    window.innerHeight
  );
  renderer.setPixelRatio(2);
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("load", init, false);
window.addEventListener("resize", handleResize, false);

// paerticles

var canvas = document.createElement("canvas"),
  ctx = canvas.getContext("2d"),
  fl = 3000,
  count = 200,
  points = [],
  startSpeed = -40,
  tick = 0,
  width,
  height,
  bounds,
  vp,
  mouse,
  canvasOffset;

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function norm(val, min, max) {
  return (val - min) / (max - min);
}

function resetPoint(p, init) {
  p.z = init ? rand(0, bounds.z.max) : bounds.z.max;
  p.x = rand(bounds.x.min, bounds.x.max) / (fl / (fl + p.z));
  p.y = rand(bounds.y.min, bounds.y.max) / (fl / (fl + p.z));
  p.ox = p.x;
  p.oy = p.y;
  p.oz = p.z;
  p.vx = 0;
  p.vy = 0;
  p.vz = rand(-1, -6) + startSpeed;
  p.ax = 0;
  p.ay = 0;
  p.az = 0;
  p.s = 0;
  p.sx = 0;
  p.sy = 0;
  p.os = p.s;
  p.osx = p.sx;
  p.osy = p.sy;
  p.hue = rand(255, 255);
  p.lightness = rand(70, 100);
  p.alpha = 0;
  return p;
}

function create() {
  vp = {
    x: width / 2,
    y: height / 2,
  };
  mouse = {
    x: vp.x,
    y: vp.y,
    down: false,
  };
  bounds = {
    x: { min: -vp.x, max: width - vp.x },
    y: { min: -vp.y, max: height - vp.y },
    z: { min: -fl, max: 1000 },
  };
}

function update() {
  if (mouse.down) {
    if (startSpeed > -30) {
      startSpeed -= 0.1;
    } else {
      startSpeed = -30;
    }
  } else {
    if (startSpeed < 0) {
      startSpeed += 1;
    } else {
      startSpeed = 0;
    }
  }

  if (!options.isanimate) {
    if (startSpeed > -20) {
      startSpeed -= 0.1;
    } else {
      startSpeed = -20;
    }
  } else {
    if (startSpeed < 0) {
      startSpeed += 1;
    } else {
      startSpeed = 0;
    }
  }

  vp.x += (width / 2 - (mouse.x - width / 2) - vp.x) * 0.025;
  vp.y += (height / 2 - (mouse.y - height / 2) - vp.y) * 0.025;
  bounds = {
    x: { min: -vp.x, max: width - vp.x },
    y: { min: -vp.y, max: height - vp.y },
    z: { min: -fl, max: 1000 },
  };

  if (points.length < count) {
    points.push(resetPoint({}));
  }
  var i = points.length;
  while (i--) {
    var p = points[i];
    p.vx += p.ax;
    p.vy += p.ay;
    p.vz += p.az;
    p.x += p.vx;
    p.y += p.vy;
    p.z += p.vz;
    if (mouse.down) {
      p.az = -0.5;
    }
    if (options.isanimate) {
      p.az = 0;
    } else {
      p.az = 0.01;
    }
    if (
      p.sx - p.sr > bounds.x.max ||
      p.sy - p.sr > bounds.y.max ||
      p.z > bounds.z.max ||
      p.sx + p.sr < bounds.x.min ||
      p.sy + p.sr < bounds.y.min ||
      p.z < bounds.z.min
    ) {
      resetPoint(p);
    }
    p.ox = p.x;
    p.oy = p.y;
    p.oz = p.z;
    p.os = p.s;
    p.osx = p.sx;
    p.osy = p.sy;
  }
}

function render() {
  ctx.save();
  ctx.translate(vp.x, vp.y);
  ctx.clearRect(-vp.x, -vp.y, width, height);
  var i = points.length;
  while (i--) {
    var p = points[i];
    p.s = fl / (fl + p.z);
    p.sx = p.x * p.s;
    p.sy = p.y * p.s;
    p.alpha = (bounds.z.max - p.z) / (bounds.z.max / 2);
    ctx.beginPath();
    ctx.moveTo(p.sx, p.sy);
    ctx.lineTo(p.osx, p.osy);
    ctx.lineWidth = 2;
    ctx.strokeStyle =
      "hsla(" + p.hue + ", 100%, " + p.lightness + "%, " + p.alpha + ")";
    ctx.stroke();
  }
  ctx.restore();
}

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  canvasOffset = { x: canvas.offsetLeft, y: canvas.offsetTop };
}

function mousemove(e) {
  mouse.x = e.pageX - canvasOffset.x;
  mouse.y = e.pageY - canvasOffset.y;
}

function mousedown() {
  mouse.down = true;
}

function mouseup() {
  mouse.down = false;
}

function loop() {
  requestAnimationFrame(loop);
  update();
  render();
  tick++;
}

canvas.style.backgroundColor = "transparent";
canvas.style.position = "absolute";
canvas.style.top = "0";
canvas.style.left = "0";
canvas.style.pointerEvents = "none";

window.addEventListener("resize", resize);
document.body.insertBefore(canvas, document.body.firstChild);
document.body.addEventListener("mousemove", mousemove);
// document.body.addEventListener('mousedown', mousedown);
// document.body.addEventListener('mouseup', mouseup);

resize();
create();
loop();

const button = document.getElementById("toggleButton");
const svg1 = document.getElementById("svg1");
const svg2 = document.getElementById("svg2");

button.addEventListener("click", () => {
  options.isanimate = !options.isanimate;

  // Toggle SVGs based on the state of options.isanimate
  if (options.isanimate) {
    svg2.classList.add("hidden");
    svg1.classList.remove("hidden");
    startSpeed = -50;
    resize();
  } else {
    resize();
    svg2.classList.remove("hidden");
    svg1.classList.add("hidden");
    startSpeed = 0;
  }
});

// script.js

// window.addEventListener("load", function () {
//   // const loadingOverlay = document.getElementById('loading-overlay');
//   // loadingOverlay.classList.add('hidden');
//   // options.isanimate = true;
// });

function loadAll() {

  setTimeout(() => {
    const loadingOverlay = document.getElementById("loading-overlay");
    loadingOverlay.classList.add("hidden");
  }, "300");

  setTimeout(() => {
    options.isanimate = true;
  }, "966");

}
