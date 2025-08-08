// Scene/renderer setup (bright daylight), post effects, and city build
import * as THREE from 'three';
import { valueNoise2D } from './utils.js';

export const World={
  scene:null,renderer:null,camera:null,clock:null,sun:null,sky:null,
  composer:null,bloomPass:null,bokehPass:null,vignettePass:null,renderPass:null,

  async init(canvas){
    const { EffectComposer } = await import('three/addons/postprocessing/EffectComposer.js');
    const { RenderPass }     = await import('three/addons/postprocessing/RenderPass.js');
    const { UnrealBloomPass }= await import('three/addons/postprocessing/UnrealBloomPass.js');
    const { BokehPass }      = await import('three/addons/postprocessing/BokehPass.js');
    const { ShaderPass }     = await import('three/addons/postprocessing/ShaderPass.js');

    this.scene=new THREE.Scene();
    this.scene.background=new THREE.Color(0x9fd8ff);
    this.scene.fog=new THREE.FogExp2(0xbfe3ff, 0.008);
    this.camera=new THREE.PerspectiveCamera(72,innerWidth/innerHeight,.08,500);
    this.camera.position.set(0,2.1,6);
    this.renderer=new THREE.WebGLRenderer({canvas,antialias:true});
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(innerWidth,innerHeight);
    this.renderer.toneMapping=THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure=1.25;
    this.renderer.shadowMap.enabled=true;
    this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    this.clock=new THREE.Clock();

    // Lights
    const sun=new THREE.DirectionalLight(0xffffff,2.0);
    sun.position.set(60,80,25); sun.castShadow=true; sun.shadow.mapSize.set(2048,2048);
    Object.assign(sun.shadow.camera,{left:-80,right:80,top:80,bottom:-80}); sun.shadow.bias=-0.0003;
    this.scene.add(sun); this.sun=sun;
    const hemi=new THREE.HemisphereLight(0xe6f7ff, 0xccdce6, 1.0); this.scene.add(hemi);
    const fill=new THREE.DirectionalLight(0x9fd8ff,.8); fill.position.set(-40,50,-30); this.scene.add(fill);

    // Ground + City
    const ground=new THREE.Mesh(new THREE.PlaneGeometry(360,360), new THREE.MeshStandardMaterial({color:0xcfe9f9, roughness:.9, metalness:0}));
    ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; this.scene.add(ground);
    const group=new THREE.Group(); const palette=[0xa6cee3,0x9fd8ff,0x89c2e1,0xb0ddff];
    for(let x=-6;x<=6;x++){ for(let z=-6;z<=6;z++){
      if((Math.abs(x)<2 && Math.abs(z)<2)||(x%2||z%2)) continue;
      const h=6+valueNoise2D(x*.7,z*.7)*34;
      const mat=new THREE.MeshStandardMaterial({color:palette[(Math.abs(x)+Math.abs(z))%palette.length],roughness:.7,metalness:.12,emissive:0xeaf6ff,emissiveIntensity:.25});
      const m=new THREE.Mesh(new THREE.BoxGeometry(7,h,7),mat); m.position.set(x*9,h/2,z*9); m.castShadow=true; m.receiveShadow=true;
      const winMat=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.08}); const w1=new THREE.Mesh(new THREE.PlaneGeometry(6.6,h*.85),winMat); w1.position.set(0,0,.01-h/200); m.add(w1); const w2=w1.clone(); w2.position.z*=-1; w2.rotation.y=Math.PI; m.add(w2);
      group.add(m);
    }} this.scene.add(group);

    // Ambient particles
    {
      const count=400, geo=new THREE.BufferGeometry(), pos=new Float32Array(count*3);
      for(let i=0;i<count;i++){ pos[i*3]= (Math.random()*280-140); pos[i*3+1]= (Math.random()*56+4); pos[i*3+2]= (Math.random()*280-140); }
      geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
      const mat=new THREE.PointsMaterial({color:0x35ffd4,size:.6,sizeAttenuation:true,transparent:true,opacity:.12,blending:THREE.AdditiveBlending,depthWrite:false});
      this.scene.add(new THREE.Points(geo,mat));
    }

    // Post FX
    this.composer=new EffectComposer(this.renderer);
    this.renderPass=new RenderPass(this.scene,this.camera); this.composer.addPass(this.renderPass);
    this.bloomPass=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),0.9,0.2,0.85); this.composer.addPass(this.bloomPass);
    this.bokehPass=new BokehPass(this.scene,this.camera,{focus:85,aperture:0.0012,maxblur:0.006,width:innerWidth,height:innerHeight}); this.bokehPass.enabled=false; this.composer.addPass(this.bokehPass);
    const vignetteShader={uniforms:{tDiffuse:{value:null},enabled:{value:0}},vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`uniform sampler2D tDiffuse;uniform float enabled;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);if(enabled<.5){gl_FragColor=c;return;}vec2 p=vUv-.5;float v=smoothstep(.2,1.2,length(p)*1.5);c.rgb*=mix(1.,.86,v);gl_FragColor=c;}`}; 
    this.vignettePass=new (await import('three/addons/postprocessing/ShaderPass.js')).ShaderPass(vignetteShader);
    this.composer.addPass(this.vignettePass);

    addEventListener('resize',()=>this.onResize());
  },

  onResize(){
    this.camera.aspect=innerWidth/innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(innerWidth,innerHeight);
    this.composer?.setSize(innerWidth,innerHeight);
  },

  render(){ (this.composer?this.composer:this.renderer).render(this.scene,this.camera); }
};

// Expose scene for ECS additions without tight coupling
window.__WORLD__ = World;