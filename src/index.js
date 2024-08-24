import {
  ViewerApp,
  AssetManagerPlugin,
  addBasePlugins,
  AssetManagerBasicPopupPlugin,

  // Color, // Import THREE.js internals
  // Texture, // Import THREE.js internals
} from "webgi";
import "./styles.css";
import  { getProject, types } from "@theatre/core";
// import studio from "@theatre/studio";

import gsap from "gsap";
import projectState from '../assets/state.json'

async function setupViewer() {
  // studio.initialize()
  // studio.extend(extension)

    // Create a project for the animation
    const project = getProject('THREE.js x Theatre.js', { state: projectState })
    
    // Create a sheet
    const sheet = project.sheet("Animated scene");
    const blackScreen = document.getElementById("bg-cover");
    const redScreen = document.getElementById("bg-red");
    const logo = document.getElementById("dialedweb_logo");
  const clipEl = document.getElementById("clip-el");
  const centerColorBtns = document.querySelectorAll(".center-color-btn");
    const options_icon = document.querySelectorAll(".options_edit");
    const accent_options = document.querySelectorAll(".accent_options");
    const shank_options = document.querySelectorAll(".shank_options");


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




  function hideLayout(element) {
    const layout = document.querySelectorAll(element);
    layout.forEach((el) => {
         el.style.opacity = 0;
         el.style.visibility = "hidden";
     }); 
   }

  function showLayout(element) {
    const layout = document.querySelectorAll(element);
    layout.forEach((el) => {
     el.style.opacity = 0;
     el.style.visibility = "visible";
     el.style.transition = "opacity 0.2s ease";
     setTimeout(() => {
      el.style.opacity = 1;
     }, 10);
    });
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

      // showLayout(".layout-2");
      showLayout(".options_container");
      showLayout(".layout-1");
      
  
    }, 13300);
  }

  const model = await manager.addFromPath("./assets/ring_new.glb");

  const object3D = model[0].modelObject;

  // const ground = await viewer.addPlugin(GroundPlugin);

  let diamonds = [
    viewer.scene.findObjectsByName("item01")[0].modelObject,
    viewer.scene.findObjectsByName("item02")[0].modelObject,
  ];


  let accents = [];
  for (let i = 1; i <= 20; i++) {
    const accent = viewer.scene.findObjectsByName(`dia_2_${String(i).padStart(3, '0')}`)[0].modelObject;
    accents.push(accent);
  }
  for (let i = 1; i <= 26; i++) {
    const accent = viewer.scene.findObjectsByName(`dia_1_${String(i).padStart(3, '0')}`)[0].modelObject;
    accents.push(accent);
  }



const oval = viewer.scene.findObjectsByName("oval")[0].modelObject;
const shank = viewer.scene.findObjectsByName("ring_metal")[0].modelObject;



  const ground = viewer.scene.findObjectsByName("Ground Plane")[0].modelObject;

  ringBox.onValuesChange((value) => {
    const { x, y, z } = value.position;
    diamonds.forEach((diamond) => {
      diamond.position.set(x, y, z);
    });
    ground.material.opacity = value.groundOpacity;
    viewer.setDirty();
  });


        
  centerColorBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
  
        // drop-shadow(2px 4px 6px black)
  
        centerColorBtns.forEach((otherBtn) => {
          if (otherBtn !== btn) {
            otherBtn.style.filter = "none";
          }
        });
  
        btn.style.filter = "drop-shadow(2px 4px 6px black)";
  
        const color = btn.dataset.color;
        oval.material.color.set(color);
        viewer.setDirty();
  
        console.log(color)
      });
  });


  accent_options.forEach((btn) => {
    btn.addEventListener("click", () => {


      
    accent_options.forEach((otherBtn) => {
      if (otherBtn !== btn) {
        otherBtn.style.border = "1px solid #a16207";
      }
    });

    btn.style.border = "4px solid #a16207";



    const color = btn.dataset.color;
    accents.forEach((accent) => {
      accent.material.color.set(color);
    });
    viewer.setDirty();

    console.log(color)
    });
});


shank_options.forEach((btn) => {
  btn.addEventListener("click", () => {


    shank_options.forEach((otherBtn) => {
      if (otherBtn !== btn) {
        otherBtn.style.border = "1px solid #a16207";
      }
    });

    btn.style.border = "4px solid #a16207";

  const color = btn.dataset.color;
  shank.material.color.set(color);
  viewer.setDirty();

  console.log(color)

  });
});






options_icon.forEach((icon) => {
  icon.addEventListener("click", () => {
    const layout = icon.dataset.value;
    
    options_icon.forEach((otherIcon) => {
      if (otherIcon !== icon) {
        otherIcon.style.filter = "none";
      }
    });

    icon.style.filter = "invert(1)";

    if (layout === "gem") {
      hideLayout(".accent");
      hideLayout(".shank");
      showLayout(".gem");
    } else if (layout === "accent") {
      hideLayout(".gem");
      hideLayout(".shank");
      showLayout(".accent");
    } else if (layout === "shank") {
      hideLayout(".gem");
      hideLayout(".accent");
      showLayout(".shank");
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
