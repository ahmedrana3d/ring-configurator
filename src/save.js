
import {
  ViewerApp,
  AssetManagerPlugin,
  addBasePlugins,
  // AssetManagerBasicPopupPlugin,
  CanvasSnipperPlugin,
  FileTransferPlugin,

  // Color, // Import THREE.js internals
  // Texture, // Import THREE.js internals
} from "webgi";

import "./styles.css";
import { getProject, types } from "@theatre/core";
// import studio from "@t  heatre/studio";

import gsap from "gsap";

// Rest of the code...
import projectState from "./state.json";

async function setupViewer() {
  // studio.initialize()
  // studio.extend(extension)

  // Create a project for the animation
  const project = getProject("THREE.js x Theatre.js", { state: projectState });

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
  const box_options = document.querySelectorAll(".box_options");
  const closeOption = document.querySelectorAll(".close-option");
  const snapshotBtn = document.getElementById("snapshotBtn");
  const animateBtn = document.getElementById("play_animation");

  // Initialize the viewer
  const viewer = new ViewerApp({
    canvas: document.getElementById("webgi-canvas"),
  });

  // or use this to add all main ones at once.
  await addBasePlugins(viewer); // check the source: https://codepen.io/repalash/pen/JjLxGmy for the list of plugins added.
  const manager = await viewer.addPlugin(AssetManagerPlugin);

  // await viewer.addPlugin(AssetManagerBasicPopupPlugin);
  await viewer.addPlugin(FileTransferPlugin);
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



  clipEl.style.transition = "clip-path 0.5s ease"; // Adjust the duration and easing as needed

importer.addEventListener("onProgress", (event) => {
  // Calculate the new progress value
  const progress = (event.loaded / event.total) * 100;

  // Update the clip-path with a smooth transition
  clipEl.style.clipPath = `inset(${100 - progress}% 0 0 0)`;
});


  importer.addEventListener("onLoad", (event) => {

    startAnimationSequence();

console.log("Loaded")

});

  
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

  closeOption.forEach((btn) => {
    btn.addEventListener("click", () => {
      const optionContainer = btn.parentElement;
      optionContainer.style.transition = "opacity 0.6s ease"; // Add transition property
      optionContainer.style.opacity = 0; // Start opacity transition

      options_icon.forEach((icon) => {
        icon.style.filter = "none";
      });

      // Use the transitionend event to change visibility after the opacity transition is done
      optionContainer.addEventListener(
        "transitionend",
        () => {
          optionContainer.style.visibility = "hidden";
        },
        { once: true }
      ); // The { once: true } option ensures the event listener is removed after it fires once
    });
  });

  function startAnimationSequence() {
    const controls = viewer.scene.activeCamera.controls;

    setTimeout(() => {
      sheet.sequence.play({ range: [12.9, 13] });
      controls.enabled = false;
    }, 300);

    setTimeout(() => {
      controls.enabled = true;
      controls.maxPolarAngle = Math.PI / 2 - 0.1;
      controls.enableDamping = true;
      controls.minDistance = 1.00;
      controls.maxDistance = 40.00;
 

      // showLayout(".layout-2");
      showLayout(".options_container");
      showLayout(".layout-1");
    }, 400);
  }




animateBtn.addEventListener("click", () => {
hideLayout(".layout-1");
hideLayout(".layout-2");
hideLayout(".options_container");
startAnimationSequence();

})






   await manager.addFromPath("./assets/ring_white.glb");


  // const ground = await viewer.addPlugin(GroundPlugin);

  let diamonds = [
    viewer.scene.findObjectsByName("item01")[0].modelObject,
    viewer.scene.findObjectsByName("item02")[0].modelObject,
  ];

  let accents = [];
  for (let i = 1; i <= 20; i++) {
    const accent = viewer.scene.findObjectsByName(
      `dia_2_${String(i).padStart(3, "0")}`
    )[0].modelObject;
    accents.push(accent);
  }
  for (let i = 1; i <= 26; i++) {
    const accent = viewer.scene.findObjectsByName(
      `dia_1_${String(i).padStart(3, "0")}`
    )[0].modelObject;
    accents.push(accent);
  }

  const oval = viewer.scene.findObjectsByName("oval")[0].modelObject;
  const shank = viewer.scene.findObjectsByName("ring_metal")[0].modelObject;

  const boxItems = [
    viewer.scene.findObjectsByName("item01")[0].modelObject,
    viewer.scene.findObjectsByName("item02")[0].modelObject,
  ]

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
      
      console.log(color);
    });
  });
  
  accent_options.forEach((btn) => {
    btn.addEventListener("click", () => {


      
      accent_options.forEach((otherBtn) => {
        if (otherBtn !== btn) {
          otherBtn.style.filter = "none";
        }
      });
      
      btn.style.filter = "drop-shadow(2px 4px 6px black)";
      
      const color = btn.dataset.color;
      accents.forEach((accent) => {
        accent.material.color.set(color);
      });
      viewer.setDirty();
      
      console.log(color);
    });
  });
  
  
  shank_options.forEach((btn) => {
    btn.addEventListener("click", () => {

      shank_options.forEach((otherBtn) => {
        if (otherBtn !== btn) {
          otherBtn.style.filter = "none";
        }
      });
      btn.style.filter = "drop-shadow(2px 4px 6px black)";

      const color = btn.dataset.color;
      shank.material.color.set(color);
      viewer.setDirty();

      console.log(color);
    });
  });


  box_options.forEach((btn) => {
    btn.addEventListener("click", () => {

      box_options.forEach((otherBtn) => {
        if (otherBtn !== btn) {
          otherBtn.style.filter = "none";
        }
      });
      btn.style.filter = "drop-shadow(2px 4px 6px black)";

      const color = btn.dataset.color;
      const innerColor = btn.dataset.innercolor;

      boxItems[0].material.color.set(color);
      boxItems[1].material.color.set(innerColor);

      viewer.setDirty();

      console.log(color , innerColor);
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

        gsap.to(viewer.scene.activeCamera.position, {
          x : 0.15000000000012795,
          y : 2.1199999999999917,
          z : 1.7899999999999452,
          duration: 1.5,
          ease: "power2.inOut",
          onStart : ()=>{
            viewer.scene.activeCamera.controls.enabled = false;
          },
          onUpdate : ()=>{
            viewer.scene.activeCamera.positionUpdated();
          },
          onComplete : ()=>{
            viewer.scene.activeCamera.controls.enabled = true;
          }
                })

                console.log(viewer.scene.activeCamera.position , "Animation")


        hideLayout(".accent");
        hideLayout(".shank");
        hideLayout(".box");
        showLayout(".gem");

      } else if (layout === "accent") {


        gsap.to(viewer.scene.activeCamera.position, {
          x : 0.15000000000012795,
          y : 2.1199999999999917,
          z : -1.4800000000000562,
          duration: 1.5,
          ease: "power2.inOut",
          onStart : ()=>{
            viewer.scene.activeCamera.controls.enabled = false;
          },
          onUpdate : ()=>{
            viewer.scene.activeCamera.positionUpdated();
          },
          onComplete : ()=>{
            viewer.scene.activeCamera.controls.enabled = true;
          }
            })
          

        hideLayout(".gem");
        hideLayout(".shank");
        hideLayout(".box");
        showLayout(".accent");
      } else if (layout === "shank") {

        gsap.to(viewer.scene.activeCamera.position, {
          x : 2.0300000000001313,
          y : 1.149999999999992,
          z : -0.190000000000055,
          duration: 1.5,
          ease: "power2.inOut",
          onStart : ()=>{
            viewer.scene.activeCamera.controls.enabled = false;
            
          },
          onUpdate : ()=>{
            viewer.scene.activeCamera.positionUpdated();
          },
          onComplete : ()=>{
            viewer.scene.activeCamera.controls.enabled = true;
          }
            })

        hideLayout(".gem");
        hideLayout(".accent");
        hideLayout(".box");
        showLayout(".shank");
      } else if (layout === "box") {
          
          gsap.to(viewer.scene.activeCamera.position, {
            x : 0.05142029733085921,
            y : 4.978943031325454,
            z : 8.657993100810216,
            duration: 1.5,
            ease: "power2.inOut",
            onStart : ()=>{
              viewer.scene.activeCamera.controls.enabled = false;
            },
            onUpdate : ()=>{
              viewer.scene.activeCamera.positionUpdated();
            },
            onComplete : ()=>{
              viewer.scene.activeCamera.controls.enabled = true;
            }
              })
  
          hideLayout(".gem");
          hideLayout(".accent");
          hideLayout(".shank");
          showLayout(".box");

      }
    });
  });




  // Canvas Plugins 



  const canvasSnipper = await viewer.addPlugin(CanvasSnipperPlugin);


  snapshotBtn.addEventListener("click", () => {
    canvasSnipper.downloadSnapshot();
  });


  // console.log(canvasSnipper)





















}

setupViewer();

// // Add a popup(in HTML) with download progress when any asset is downloading.
// await viewer.addPlugin(AssetManagerBasicPopupPlugin)

// // Required for downloading files from the UI
// await viewer.addPlugin(FileTransferPlugin)

// // Add more plugins not available in base, like CanvasSnipperPlugin which has helpers to download an image of the canvas.
// await viewer.addPlugin(CanvasSnipperPlugin)



