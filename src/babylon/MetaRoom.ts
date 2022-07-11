import {
    Scene, 
    Engine, 
    Camera,
    Color4, 
    Color3,
    Vector3, 
    FreeCamera, 
    HemisphericLight, 
    MeshBuilder,
    PBRMaterial,
    Texture,
    SceneLoader,
    AbstractMesh,
    VideoTexture,
    GlowLayer,
    MeshAssetTask,
    ScreenSpaceReflectionPostProcess
  } from "@babylonjs/core";
  import "@babylonjs/loaders"
  
  
  
  export class MetaRoom {
    scene: Scene;
    engine: Engine;
  
    camera!: FreeCamera;
  
  
  constructor (private canvas: HTMLCanvasElement) {
    this.engine = new Engine(this.canvas, false,{
      antialias: false,
      preserveDrawingBuffer: false,
    });

    this.engine.setHardwareScalingLevel(0.5);
    this.scene = this.CreateScene();
    // this.CreateGround();
    this.CreateEnvironment();
    this.CreateCamera();
  
    this.engine.runRenderLoop(()=>{
        this.scene.render();
    });
    this.canvas.addEventListener("resize", () => { 
      this.engine.resize(); 
    });

    window.addEventListener("resize", () => {
      this.engine.resize();
    });
  }
  
  
  
  
  CreateScene(): Scene {
  
    const scene = new Scene(this.engine);
    const hemiLight = new HemisphericLight("hemiLight", new Vector3(0,1,1), this.scene);
    hemiLight.intensity = 1.5;

    scene.onPointerDown = (evt) => {
      if (evt.button === 0) this.engine.enterPointerlock();
      if (evt.button === 1) this.engine.exitPointerlock();
    };

    const assumedFramesPerSecond = 60;
    const earthGravity = -9.81;
    scene.gravity = new Vector3(0, earthGravity / assumedFramesPerSecond, 0);
    
  
    scene.clearColor = new Color4(0, 0, 0, 1);


    scene.collisionsEnabled = true;

    return scene;
  }
  
  async CreateCamera(): Promise<void> {
    this.camera = new FreeCamera("freecamera", new Vector3(0, 1, 10), this.scene);
    this.camera.attachControl();
    this.camera.minZ = 0.25;
    this.camera.speed = 0.1;
    this.camera.applyGravity = true;
    this.camera.ellipsoid = new Vector3(0.5, 0.5, 0.5);
    this.camera.checkCollisions = true;
    this.camera.rotation = new Vector3(0, Math.PI, 0);
    this.camera.keysUp.push(87); // "w"
    this.camera.keysDown.push(83); // "s"
    this.camera.keysLeft.push(65); // "a"
    this.camera.keysRight.push(68); // "d"
  }
  
  
  async CreateEnvironment(): Promise<void>{
    // const model = await SceneLoader.ImportMeshAsync(
    //     "",
    //     "./models/",
    //     "light.glb",
    //     this.scene
    // );

    const model = await SceneLoader.ImportMeshAsync(
      "",
      "./models/",
      "room1.glb",
      this.scene,
      (evt) => {
      const status = ((evt.loaded)/209946).toFixed();
      });

    console.log(model.transformNodes, model.meshes);
  
    for(let i = 0; i < model.meshes.length; i++) {
      if(i != 1) model.meshes[i].checkCollisions = true;
    }

    const ground = new PBRMaterial("cubeMat", this.scene);
    const groundReflectivityTex = new Texture("./models/DefaultMaterial_Roughness.png", this.scene, false, false); 
    groundReflectivityTex.uScale = groundReflectivityTex.vScale = 1;
    ground.albedoColor = Color3.White();
    ground.metallic = 0.5;
    ground.roughness = 0.14;
    ground.reflectivityTexture = groundReflectivityTex;
    ground.metallicReflectanceTexture = groundReflectivityTex;
    model.meshes[12].material = ground;



    const displayMat1 = new PBRMaterial("displayMat1", this.scene);
    const displayTex1 = new VideoTexture(
      "displayTex1", 
      "./models/inertia1.mp4", 
      this.scene, 
      false,
      true, 
      VideoTexture.BILINEAR_SAMPLINGMODE, {
        autoUpdateTexture: true,
        autoPlay: true,
        loop: true
      });
    // displayTex1.getAlphaFromRGB = false;
    // displayTex1.wAng = Math.PI/2;
    // displayMat1.reflectionColor = Color3.Black();
    // displayMat1.backFaceCulling = false;
    // displayMat1.opacityTexture = displayTex1;
    // displayMat1.alpha = 0.1;		
    // displayMat1.alphaMode = Engine.ALPHA_ONEONE;
    displayMat1.metallic = 0;
    displayMat1.albedoColor = Color3.Black();
    displayMat1.emissiveColor = new Color3(1, 1, 1);
    displayMat1.emissiveIntensity = 1;
    displayMat1.emissiveTexture = displayTex1;
  
    model.meshes[3].material = displayMat1;
    model.meshes[3].position = new Vector3(model.meshes[3].position.x, model.meshes[3].position.y, model.meshes[3].position.z);
  
    const ssr = new ScreenSpaceReflectionPostProcess("ssr", this.scene, 2, this.camera);
    ssr.reflectionSamples = 16; 
    ssr.strength = 1;
    ssr.reflectionSpecularFalloffExponent = 1;


    const gl = new GlowLayer("glow", this.scene, { 
        mainTextureSamples: 4,
        blurKernelSize: 256
      });
      gl.intensity = 0.5;
  }
  
  
  }