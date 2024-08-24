import {
    ViewerApp,
    AssetManagerPlugin,
    GBufferPlugin,
    timeout,
    ProgressivePlugin,
    TonemapPlugin,
    SSRPlugin,
    SSAOPlugin,
    DiamondPlugin,
    FrameFadePlugin,
    GLTFAnimationPlugin,
    GroundPlugin,
    BloomPlugin,
    TemporalAAPlugin,
    AnisotropyPlugin,
    GammaCorrectionPlugin,
    addBasePlugins,
    TweakpaneUiPlugin,
    AssetManagerBasicPopupPlugin,
    CanvasSnipperPlugin,
    FileTransferPlugin,
  
    // Color, // Import THREE.js internals
    // Texture, // Import THREE.js internals
  } from "webgi";
  import "./styles.css";
  import core, { getProject, types } from "@theatre/core";
  import studio from "@theatre/studio";
  import gsap from "gsap";
  
  async function setupViewer() {
      studio.initialize();
      
      // Create a project for the animation
      const project = getProject("WebGI x Theatre.js");
      
      // Create a sheet
      const sheet = project.sheet("Animated scene");
      const blackScreen = document.getElementById("bg-cover");
      const redScreen = document.getElementById("bg-red");
      const logo = document.getElementById("dialedweb_logo");
      const customizeBtn = document.getElementById("ringBtn");
    const clipEl = document.getElementById("clip-el");
  
    console.log(logo, blackScreen, redScreen);
  
    // Initialize the viewer
    const viewer = new ViewerApp({
      canvas: document.getElementById("webgi-canvas"),
    });
  
    // or use this to add all main ones at once.
    await addBasePlugins(viewer); // check the source: https://codepen.io/repalash/pen/JjLxGmy for the list of plugins added.
    const manager = await viewer.addPlugin(AssetManagerPlugin);
  
    await viewer.addPlugin(AssetManagerBasicPopupPlugin);
  
    // Import and add a GLB file.
    // await viewer.load("./assets/ring_new.glb")
  
    const defCam = sheet.object("Enter Camera", {
      position: types.compound({
        x: types.number(0, { nudgeMultiplier: 0.01, range: [-50, 50] }),
        y: types.number(0, { nudgeMultiplier: 0.01, range: [-50, 50] }),
        z: types.number(0, { nudgeMultiplier: 0.01, range: [-50, 50] }),
      }),
      rotation: types.compound({
        xR: types.number(0, { nudgeMultiplier: 0.01, range: [-10, 10] }),
        yR: types.number(0, { nudgeMultiplier: 0.01, range: [-10, 10] }),
        zR: types.number(0, { nudgeMultiplier: 0.01, range: [-10, 10] }),
      }),
      Urotation: types.compound({
        xU: types.number(0, { nudgeMultiplier: 0.01, range: [-2, 2] }),
        yU: types.number(0, { nudgeMultiplier: 0.01, range: [0, 2] }),
        zU: types.number(0, { nudgeMultiplier: 0.01, range: [0, 2] }),
      }),
      screenOpacity: types.number(0, { nudgeMultiplier: 0.01, range: [0, 1] }),
      redScreenOpacity: types.number(0, { nudgeMultiplier: 0.01, range: [0, 1] }),
      logoOpacity: types.number(0, { nudgeMultiplier: 0.01, range: [0, 1] }),
    });
  
    const ringBox = sheet.object("Ring Box", {
      position: types.compound({
        x: types.number(0, { nudgeMultiplier: 0.01, range: [-50, 50] }),
        y: types.number(0, { nudgeMultiplier: 0.01, range: [-50, 50] }),
        z: types.number(0, { nudgeMultiplier: 0.01, range: [-50, 50] }),
      }),
  
      groundOpacity: types.number(0.6, { nudgeMultiplier: 0.01, range: [0, 1] }),
    });
  
    defCam.onValuesChange((value) => {
      const { x, y, z } = value.position;
      // viewer.scene.activeCameraera.position.set(x,y,z)
      viewer.scene.activeCamera.position.set(x, y, z);
  
      blackScreen.style.opacity = value.screenOpacity;
      redScreen.style.opacity = value.redScreenOpacity;
      logo.style.opacity = value.logoOpacity;
  
      // console.log(upperbox)
  
      viewer.scene.activeCamera.positionUpdated(); // this must be called to notify the controller on value update
      viewer.setDirty();
    });
  
    // 0.04
  
    // Loading Logic
  
    const importer = manager.importer;
  
    let progressQueue = [];
    let isAnimating = false;
  
    importer.addEventListener("onProgress", (event) => {
      // Calculate the new progress value
      const progress = (event.loaded / event.total) * 100;
  
      // Add the progress to the queue
      progressQueue.push(progress);
  
      // Start the animation if it's not already running
      if (!isAnimating) {
        processQueue(() => {
          // Callback when all progress animations are done
          startAnimationSequence();
        });
      }
    });
  
    function processQueue(onComplete) {
      if (progressQueue.length === 0) {
        isAnimating = false;
        if (onComplete) onComplete(); // Trigger callback after all animations
        return;
      }
  
      // Get the next progress value from the queue
      const nextProgress = progressQueue.shift();
  
      // Animate to the next progress value
      gsap.to(clipEl, {
        clipPath: `inset(${100 - nextProgress}% 0 0 0)`,
        duration: 0.5,
        ease: "power2.inOut",
        onComplete: () => {
          // Process the next value in the queue
          processQueue(onComplete);
        },
      });
  
      // Mark as animating
      isAnimating = true;
    }
  
    function startAnimationSequence() {
      const controls = viewer.scene.activeCamera.controls;
  
      setTimeout(() => {
        sheet.sequence.play({ range: [0, 13] });
        controls.enabled = false;
      }, 300);
  
      setTimeout(() => {
        controls.enabled = true;
        controls.maxPolarAngle = Math.PI / 2 - 0.1;
        controls.enableDamping = true;
  
        gsap.to(".layout-1", {
          opacity: 1,
          duration: 0.5,
          ease: "power2.inOut", // Smoother easing
        });
      }, 13300);
    }
  
    const model = await manager.addFromPath("./assets/ring_new.glb");
  
    const object3D = model[0].modelObject;
  
    // const ground = await viewer.addPlugin(GroundPlugin);
  
    let diamonds = [
      viewer.scene.findObjectsByName("item01")[0].modelObject,
      viewer.scene.findObjectsByName("item02")[0].modelObject,
    ];
    const ground = viewer.scene.findObjectsByName("Ground Plane")[0].modelObject;
  
    ringBox.onValuesChange((value) => {
      const { x, y, z } = value.position;
      diamonds.forEach((diamond) => {
        diamond.position.set(x, y, z);
      });
      ground.material.opacity = value.groundOpacity;
      viewer.setDirty();
    });
  
  
  
        
       
        
        customizeBtn.addEventListener("click", () => {
  
          gsap.to(viewer.scene.activeCamera.position , {
              x: -0.8499999999998722,
              y : 2.7299999999999898,
              z : 5.2099183852428395,
              duration: 1.5,
              onStart: () => { 
      viewer.scene.activeCamera.controls.enabled = false;
              },
              onUpdate: () => {
                  viewer.scene.activeCamera.positionUpdated()
               },
               onComplete : ()=>{
                  viewer.scene.activeCamera.controls.enabled = true;
               },
              ease: "power2.inOut", // Smoother easing
          })
            
            gsap.to(".layout-1", {
                opacity: 0,
                duration: 1.5,
                ease: "power2.inOut", // Smoother easing
                onComplete : ()=>{
                    sheet.sequence.play({ range: [13, 14.15] });
                    viewer.scene.activeCamera.controls.autoRotate = true;
                  }
              });
              
              
              
          });
          
          
     
  
  
  
  
  
  
  
  
  
  
    
  }
  
  setupViewer();
  
  // // Add a popup(in HTML) with download progress when any asset is downloading.
  // await viewer.addPlugin(AssetManagerBasicPopupPlugin)
  
  // // Required for downloading files from the UI
  // await viewer.addPlugin(FileTransferPlugin)
  
  // // Add more plugins not available in base, like CanvasSnipperPlugin which has helpers to download an image of the canvas.
  // await viewer.addPlugin(CanvasSnipperPlugin)
  