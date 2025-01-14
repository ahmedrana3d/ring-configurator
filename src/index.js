import {
  ViewerApp,
  AssetManagerPlugin,
  addBasePlugins,
  // AssetManagerBasicPopupPlugin,
  CanvasSnipperPlugin,
  FileTransferPlugin,
  Color, // Import THREE.js internals
  // Texture, // Import THREE.js internals
} from "webgi";

import "./styles.css";
import { getProject, types } from "@theatre/core";
// import studio from "@theatre/studio";

import gsap from "gsap";

// Rest of the code...
import projectState from "./state_new.json";

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
  const ovalBtn = document.getElementById("oval-btn");
  const ovalContainer = document.getElementById("oval-container");
  const editLayout = document.querySelector(".edit-layout");
  const editLayoutMobile = document.querySelector(".edit-layout-mobile");
  const skipBtn = document.getElementById("skip-btn");
  const snapshotBtn = document.getElementById("snapshot-icon");
  const recenterBtn = document.getElementById("recenter-icon");
  const cinematicBtn = document.getElementById("cinematic-icon");

  const optionContainer = document.getElementById("option-container");
  // const closeCheck = document.getElementById("close-check");
  const options_btn = document.querySelectorAll(".options_btn");
  const closeCheck = document.querySelectorAll(".close-check");
  const mobile_options = document.querySelectorAll(".mobile_options");
  

  // Initialize the viewer
  const viewer = new ViewerApp({
    canvas: document.getElementById("webgi-canvas"),
  });

  const isMobile = window.innerWidth < 768;

  if (isMobile) {
    viewer.renderer.displayCanvasScaling = window.devicePixelRatio / 2.2;
  } else {
    viewer.renderer.displayCanvasScaling = Math.min(window.devicePixelRatio, 1);
  }

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
    showUI: types.boolean(false),
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

    if (window.innerWidth > 768) {
      editLayout.style.display = value.showUI ? "block" : "none";
      editLayoutMobile.style.display = "none";
    } else {
      editLayoutMobile.style.display = value.showUI ? "flex" : "none";
      editLayout.style.display = "none";
    }

    if (sheet.sequence.position > 13.05) {
      skipBtn.style.display = "none";
    }

    viewer.scene.activeCamera.positionUpdated(); // this must be called to notify the controller on value update
    viewer.setDirty();
  });

  // 0.04

  // Loading Logic
let skipped = false;
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
  });



  function onConfiguratorStart() {
    const controls = viewer.scene.activeCamera.controls;
    const moveIndicator = document.getElementById("move-indicator");
    moveIndicator.style.visibility = "visible";
    controls.autoRotateSpeed= 1.0
    controls.autoRotate = true;
    
// Get the canvas and controls
const canvas = document.getElementById("webgi-canvas");
let isDragging = false;

// Desktop: Stop auto-rotation when user starts dragging
window.addEventListener("mousedown", () => {
  isDragging = true;
  controls.autoRotate = false; // Stop auto-rotation on click/drag
  moveIndicator.style.visibility = "hidden"
  
});

window.addEventListener("mousemove", () => {
  if (isDragging) {
    controls.autoRotate = false; // Ensure rotation stops on drag move
    moveIndicator.style.visibility = "hidden"
    
  }
});

// Mobile: Stop auto-rotation on touch start and move
window.addEventListener("touchstart", () => {
  controls.autoRotate = false; // Stop auto-rotation on touch
  moveIndicator.style.visibility = "hidden"
  
});

window.addEventListener("touchmove", () => {
  controls.autoRotate = false; // Stop auto-rotation on drag move
  moveIndicator.style.visibility = "hidden"
  
});

    
  }



  function showLayout(element) {
    const layout = document.querySelectorAll(element);
    layout.forEach((el) => {
      el.style.transition = "opacity 0.3s ease, transform 0.6s ease";
      el.style.opacity = "1"; // Fade in
      el.style.transform = "translateY(0%)";

      // Ensure editLayoutMobile is defined and its style is set properly
      editLayoutMobile.style.transition =
        "opacity 0.3s ease, transform 0.6s ease";
      editLayoutMobile.style.transform = "translateY(100%)";
    });
  }

  closeOption.forEach((btn) => {
    // Ensure the initial state of parentElement
    btn.parentElement.style.transform = "translateY(100%)"; // Slide down initially

    btn.addEventListener("click", () => {
      const optionContainer = btn.parentElement;
      optionContainer.style.transition =
        "opacity 0.3s ease, transform 0.6s ease";
      optionContainer.style.opacity = "0"; // Fade out
      optionContainer.style.transform = "translateY(100%)"; // Slide down

      // Ensure editLayoutMobile style is applied correctly
      editLayoutMobile.style.transition =
        "opacity 0.3s ease, transform 0.6s ease";
      editLayoutMobile.style.transform = "translateY(0%)"; // Slide in


      gsap.to(viewer.scene.activeCamera.position, {
        x: 0.051,
        y: 4.978,
        z: 8.657,
        duration: 1.5,
        ease: "power2.inOut",
        onStart: () => {
          viewer.scene.activeCamera.controls.enabled = false;
        },
        onUpdate: () => {
          viewer.scene.activeCamera.positionUpdated();
        },
        onComplete: () => {
          viewer.scene.activeCamera.controls.enabled = true;
        },
      });



    });
  });

  function startAnimationSequence() {
    const controls = viewer.scene.activeCamera.controls;

    setTimeout(() => {
      if (window.innerWidth > 768) {
        const options = viewer.scene.activeCamera.getCameraOptions();
        options.fov = 25;
        viewer.scene.activeCamera.setCameraOptions(options);
      } else {
        const options = viewer.scene.activeCamera.getCameraOptions();
        options.fov = 45;
        viewer.scene.activeCamera.setCameraOptions(options);
      }

      sheet.sequence.play({ range: [0, 13.5] });

      controls.enabled = false;
    }, 300);

    setTimeout(() => {
      controls.enabled = true;
      controls.maxPolarAngle = Math.PI / 2 - 0.1;
      controls.enableDamping = true;
      controls.minDistance = 1.0;
      controls.maxDistance = 10;
      controls.enablePan = false;

      if (skipped) {
       return;
      } else {
        onConfiguratorStart();
      }

      // showLayout(".layout-2");
      showLayout(".options_container");
      showLayout(".layout-1");
    }, 13700);
  }

  skipBtn.addEventListener("click", () => {
    sheet.sequence.pause();
    const controls = viewer.scene.activeCamera.controls;

    setTimeout(() => {
      sheet.sequence.play({ range: [13.4, 13.5] });
      skipBtn.style.display = "none";
      controls.enabled = true;
      controls.maxPolarAngle = Math.PI / 2 - 0.1;
      controls.enableDamping = true;
      controls.minDistance = 1.0;
      controls.maxDistance = 10;
      controls.enablePan = false;
      onConfiguratorStart();
      skipped = true;
    }, 1000);
    const tl = gsap.timeline();

    tl.fromTo(blackScreen, { opacity: 0 }, { opacity: 1, duration: 1 }).fromTo(
      blackScreen,
      { opacity: 1 },
      { opacity: 0, duration: 1 },
      ">"
    );
  });

  snapshotBtn.addEventListener("click", () => {
    canvasSnipper.filename = "ring_design";
    canvasSnipper.downloadSnapshot();
  });

  recenterBtn.addEventListener("click", () => {
    gsap.to(viewer.scene.activeCamera.position, {
      x: 0.05142029733085921,
      y: 4.978943031325454,
      z: 8.657993100810216,
      duration: 1.5,
      ease: "power2.inOut",
      onStart: () => {
        viewer.scene.activeCamera.controls.enabled = false;
      },
      onUpdate: () => {
        viewer.scene.activeCamera.positionUpdated();
      },
      onComplete: () => {
        viewer.scene.activeCamera.controls.enabled = true;
      },
    });
  });

  cinematicBtn.addEventListener("click", () => {
    startAnimationSequence();
    setTimeout(() => {
      onConfiguratorStart();
      skipBtn.style.display = "block";
    }, 1000);
  });

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
  ];

  const ground = viewer.scene.findObjectsByName("Ground Plane")[0].modelObject;

  function animateContainer(element) {
    const container = document.getElementById(element);
    optionContainer.style.scale = 0.99;
    optionContainer.style.opacity = 0.4;
    optionContainer.style.transform = "translateX(-3%)";
    container.style.transform = "translateX(0)";
  }

  function closeContainer(element) {
    const container = document.getElementById(element);
    optionContainer.style.opacity = 1;
    optionContainer.style.scale = 1;
    optionContainer.style.transform = "translateX(0)";
    container.style.transform = "translateX(100%)";
  }

  options_btn.forEach((btn) => {
    btn.addEventListener("click", () => {
      const container = btn.dataset.container;

      if (container === "oval-container") {
        gsap.to(viewer.scene.activeCamera.position, {
          x: 0.15000000000012795,
          y: 2.1199999999999917,
          z: 1.7899999999999452,
          duration: 1.5,
          ease: "power2.inOut",
          onStart: () => {
            viewer.scene.activeCamera.controls.enabled = false;
          },
          onUpdate: () => {
            viewer.scene.activeCamera.positionUpdated();
          },
          onComplete: () => {
            viewer.scene.activeCamera.controls.enabled = true;
          },
        });
      } else if (container === "shank-container") {
        gsap.to(viewer.scene.activeCamera.position, {
          x: 2.0300000000001313,
          y: 1.149999999999992,
          z: -0.190000000000055,
          duration: 1.5,
          ease: "power2.inOut",
          onStart: () => {
            viewer.scene.activeCamera.controls.enabled = false;
          },
          onUpdate: () => {
            viewer.scene.activeCamera.positionUpdated();
          },
          onComplete: () => {
            viewer.scene.activeCamera.controls.enabled = true;
          },
        });
      } else if (container === "box-container") {
        gsap.to(viewer.scene.activeCamera.position, {
          x: 0.05142029733085921,
          y: 4.978943031325454,
          z: 8.657993100810216,
          duration: 1.5,
          ease: "power2.inOut",
          onStart: () => {
            viewer.scene.activeCamera.controls.enabled = false;
          },
          onUpdate: () => {
            viewer.scene.activeCamera.positionUpdated();
          },
          onComplete: () => {
            viewer.scene.activeCamera.controls.enabled = true;
          },
        });
      } else if (container === "accent-container") {
        gsap.to(viewer.scene.activeCamera.position, {
          x: -0.7799999999998757,
          y: 2.1299999999999937,
          z: 0.05999999999996581,
          duration: 1.5,
          ease: "power2.inOut",
          onStart: () => {
            viewer.scene.activeCamera.controls.enabled = false;
          },
          onUpdate: () => {
            viewer.scene.activeCamera.positionUpdated();
          },
          onComplete: () => {
            viewer.scene.activeCamera.controls.enabled = true;
          },
        });
      }

      animateContainer(container);
    });
  });

  closeCheck.forEach((btn) => {
    btn.addEventListener("click", () => {
      closeContainer(btn.dataset.closecontainer);

    });
  });

  // Oval Btn Configurations

  centerColorBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Reset all other buttons first
      centerColorBtns.forEach((otherBtn) => {
        if (otherBtn !== btn) {
          if (isMobile) {
            // Reset scale for other buttons
            otherBtn.style.transform = "scale(1)";
            otherBtn.style.transition = "all 0.3s ease";
          } else {
            // Reset border for other buttons
            otherBtn.style.border = "none";
          }
        }
      });
  
      // Apply the highlight to the clicked button
      if (isMobile) {
        btn.style.transform = "scale(1.1)";
        btn.style.transition = "all 0.3s ease";
      } else {
        btn.style.border = "1px solid #000";
      }
  
      // Change color of the material
      const color = btn.dataset.color;
      transitionMaterialColor(oval.material, color, 0.25);
      viewer.setDirty();
    });
  });
  

  shank_options.forEach((btn) => {
    btn.addEventListener("click", () => {
      shank_options.forEach((otherBtn) => {
        if (otherBtn !== btn) {
          if (isMobile) {
            // Reset scale for other buttons
            otherBtn.style.transform = "scale(1)";
            otherBtn.style.transition = "all 0.3s ease";
          } else {
            // Reset border for other buttons
            otherBtn.style.border = "none";
          }
        }
      });
  
      // Apply the highlight to the clicked button
      if (isMobile) {
        btn.style.transform = "scale(1.1)";
        btn.style.transition = "all 0.3s ease";
      } else {
        btn.style.border = "1px solid #000";
      }
      

      const color = btn.dataset.color;
      transitionMaterialColor(shank.material, color, 0.25);
      viewer.setDirty();
    });
  });

  // Function to animate color transition

  // Event listener for button clicks
  box_options.forEach((btn) => {
    btn.addEventListener("click", () => {
      box_options.forEach((otherBtn) => {
        if (otherBtn !== btn) {
          if (isMobile) {
            // Reset scale for other buttons
            otherBtn.style.transform = "scale(1)";
            otherBtn.style.transition = "all 0.3s ease";
          } else {
            // Reset border for other buttons
            otherBtn.style.border = "none";
          }
        }
      });
  
      // Apply the highlight to the clicked button
      if (isMobile) {
        btn.style.transform = "scale(1.1)";
        btn.style.transition = "all 0.3s ease";
      } else {
        btn.style.border = "1px solid #000";
      }

      const color = btn.dataset.color;
      const innerColor = btn.dataset.innercolor;

      // Apply the color transition
      transitionMaterialColor(boxItems[0].material, color, 0.25);
      transitionMaterialColor(boxItems[1].material, innerColor, 0.25);
    });
  });

  accent_options.forEach((btn) => {
    btn.addEventListener("click", () => {
      accent_options.forEach((otherBtn) => {
        if (otherBtn !== btn) {
          if (isMobile) {
            // Reset scale for other buttons
            otherBtn.style.transform = "scale(1)";
            otherBtn.style.transition = "all 0.3s ease";
          } else {
            // Reset border for other buttons
            otherBtn.style.border = "none";
          }
        }
      });
  
      // Apply the highlight to the clicked button
      if (isMobile) {
        btn.style.transform = "scale(1.1)";
        btn.style.transition = "all 0.3s ease";
      } else {
        btn.style.border = "1px solid #000";
      }
      
 
      const color = btn.dataset.color;
      accents.forEach((accent) => {
        transitionMaterialColor(accent.material, color, 0.25);
      });
      viewer.setDirty();
    });
  });

  const canvasSnipper = await viewer.addPlugin(CanvasSnipperPlugin);

  // snapshotBtn.addEventListener("click", () => {
  //   canvasSnipper.downloadSnapshot();
  // });

  mobile_options.forEach((btn) => {
    btn.addEventListener("click", () => {
      const container = btn.dataset.container;

      if (container === "oval-mobile") {
        gsap.to(viewer.scene.activeCamera.position, {
          x: 0.15000000000012795,
          y: 2.1199999999999917,
          z: 1.7899999999999452,
          duration: 1.5,
          ease: "power2.inOut",
          onStart: () => {
            viewer.scene.activeCamera.controls.enabled = false;
          },
          onUpdate: () => {
            viewer.scene.activeCamera.positionUpdated();
          },
          onComplete: () => {
            viewer.scene.activeCamera.controls.enabled = true;
          },
        });
      } else if (container === "shank-mobile") {
        gsap.to(viewer.scene.activeCamera.position, {
          x: 2.0300000000001313,
          y: 1.149999999999992,
          z: -0.190000000000055,
          duration: 1.5,
          ease: "power2.inOut",
          onStart: () => {
            viewer.scene.activeCamera.controls.enabled = false;
          },
          onUpdate: () => {
            viewer.scene.activeCamera.positionUpdated();
          },
          onComplete: () => {
            viewer.scene.activeCamera.controls.enabled = true;
          },
        });
      } else if (container === "box-mobile") {
        gsap.to(viewer.scene.activeCamera.position, {
          x: 0.05142029733085921,
          y: 4.978943031325454,
          z: 8.657993100810216,
          duration: 1.5,
          ease: "power2.inOut",
          onStart: () => {
            viewer.scene.activeCamera.controls.enabled = false;
          },
          onUpdate: () => {
            viewer.scene.activeCamera.positionUpdated();
          },
          onComplete: () => {
            viewer.scene.activeCamera.controls.enabled = true;
          },
        });
      } else if (container === "accent-mobile") {
        gsap.to(viewer.scene.activeCamera.position, {
          x: -0.7799999999998757,
          y: 2.1299999999999937,
          z: 0.05999999999996581,
          duration: 1.5,
          ease: "power2.inOut",
          onStart: () => {
            viewer.scene.activeCamera.controls.enabled = false;
          },
          onUpdate: () => {
            viewer.scene.activeCamera.positionUpdated();
          },
          onComplete: () => {
            viewer.scene.activeCamera.controls.enabled = true;
          },
        });
      }

      showLayout(`.${btn.dataset.container}`);
    });
  });

  function transitionMaterialColor(material, endColorHex, duration) {
    const startColor = new Color(material.color.getHex());
    const endColor = new Color(endColorHex);

    let startTime = null;
    let isAnimating = true;

    function animateColorTransition(time) {
      if (startTime === null) startTime = time;

      const elapsed = (time - startTime) / 1000; // in seconds
      const lerpFactor = Math.min(elapsed / duration, 1);

      const currentColor = startColor.clone().lerp(endColor, lerpFactor);
      material.color.set(currentColor);

      if (lerpFactor < 1) {
        requestAnimationFrame(animateColorTransition);
        viewer.setDirty();
      } else {
        isAnimating = false;
      }
    }

    if (isAnimating) {
      requestAnimationFrame(animateColorTransition);
    }
  }
}

setupViewer();

// // Add a popup(in HTML) with download progress when any asset is downloading.
// await viewer.addPlugin(AssetManagerBasicPopupPlugin)

// // Required for downloading files from the UI
// await viewer.addPlugin(FileTransferPlugin)

// // Add more plugins not available in base, like CanvasSnipperPlugin which has helpers to download an image of the canvas.
// await viewer.addPlugin(CanvasSnipperPlugin)
