import { changeScene } from "./main.js";

// Objet pour stocker les tags par scène
export let tagsByScene = {};

// Classe de base pour les tags
class Tag {
  constructor(sceneId, title, position) {
    this.sceneId = sceneId; // ID de la scène à laquelle le tag appartient
    this.title = title; // Titre du tag
    this.position = position; // Position du tag dans la scène
    this.id = `${Date.now()}`; // ID unique pour le tag basé sur le timestamp actuel
  }

  // Méthode pour créer un élément HTML avec des attributs spécifiés
  createElement(type, attributes) {
    const element = document.createElement(type);
    for (const key in attributes) {
      element.setAttribute(key, attributes[key]);
    }
    return element;
  }

  // Méthode pour ajouter des éléments à une scène
  appendToScene(scene, elements) {
    elements.forEach(element => scene.appendChild(element));
  }
}

// Classe pour les tags de type porte
class DoorTag extends Tag {
  constructor(sceneId, title, position, targetSceneId) {
    super(sceneId, title, position);
    this.targetSceneId = targetSceneId; // ID de la scène cible pour la navigation
  }

  // Méthode pour créer un tag de type porte
  create() {
    const scene = document.getElementById(this.sceneId);
    const newSphere = this.createElement("a-sphere", {
      position: this.position,
      id: this.id,
      radius: "0.5",
      color: "#EF2D5E",
      dragndrop: "",
      "look-at-camera": ""
    });

    const infoBox = document.createElement("a-entity");
    
    const infoBoxOffset = { x: -2, y: 4, z: 0 }; // Décalage basé sur la taille du `backgroundPlane`
    infoBox.setAttribute("position", {
        x: this.position.x + infoBoxOffset.x,
        y: this.position.y + infoBoxOffset.y,
        z: this.position.z + infoBoxOffset.z,
    });

    // Ajouter les composants de suivi
    infoBox.setAttribute("follow-mover", { target: newSphere });
    infoBox.setAttribute("look-at-camera", "");

    const newBox = this.createElement("a-box", {
      position: "1 -2 0",
      color: "#4CC3D9",
      id: this.id,
      width: "2",
      height: "4",
      depth: "0.5",
      "look-at-camera": "",
      class: "door",
      "data-target-scene": this.targetSceneId
    });
    infoBox.appendChild(newBox);

    // Ajout d'un écouteur d'événements pour la boîte
    newBox.addEventListener("click", () => {
      if (this.targetSceneId) {
        changeScene(this.targetSceneId);
      } else {
        console.warn("Aucune scène sélectionnée pour la navigation.");
      }
    });

    // Ajouter la sphère et la boîte à la scène
    this.appendToScene(scene, [newSphere, infoBox]);
  }
}

// Classe pour les tags de type information
class InfoTag extends Tag {
  constructor(sceneId, title, position, description) {
    super(sceneId, title, position);
    this.description = description; // Description du tag
  }

  // Méthode pour créer un tag de type information
  create() {
    const scene = document.getElementById(this.sceneId);
    const newSphere = this.createElement("a-sphere", {
      position: this.position,
      radius: "0.2",
      color: "#EF2D5E",
      dragndrop: "",
      "look-at-camera": ""
    });

    const infoBox = document.createElement("a-entity");
    
    const infoBoxOffset = { x: -2, y: 0.7, z: 0 }; // Décalage basé sur la taille du `backgroundPlane`
    infoBox.setAttribute("position", {
        x: this.position.x + infoBoxOffset.x,
        y: this.position.y + infoBoxOffset.y,
        z: this.position.z + infoBoxOffset.z,
    });

    // Ajouter les composants de suivi
    infoBox.setAttribute("follow-mover", { target: newSphere });
    infoBox.setAttribute("look-at-camera", "");

    // Créer le fond noir de la boîte
    const backgroundPlane = document.createElement("a-plane");
    backgroundPlane.setAttribute("width", "3");
    backgroundPlane.setAttribute("height", "1.8");
    backgroundPlane.setAttribute("color", "#000000");
    backgroundPlane.setAttribute("material", "opacity: 0.8; transparent: true");
    backgroundPlane.setAttribute("position", "1 -0.7 0.05"); 
    infoBox.appendChild(backgroundPlane);

    // Ajouter le titre
    const titleText = document.createElement("a-text");
    titleText.setAttribute("value", this.title);
    titleText.setAttribute("position", "1 -0.3 0.1"); // Position du texte dans le conteneur
    titleText.setAttribute("width", "2.8");
    titleText.setAttribute("scale", "1.8 1.8 1.8");
    titleText.setAttribute("align", "center");
    titleText.setAttribute("color", "#EF2D5E");
    titleText.setAttribute("font", "https://cdn.aframe.io/fonts/mozillavr.fnt");
    infoBox.appendChild(titleText);

    // Ajouter la description stylisée
    const descriptionText = document.createElement("a-text");
    descriptionText.setAttribute("value", this.description);
    descriptionText.setAttribute("position", "1 -0.6 0.1"); // Position de la description
    descriptionText.setAttribute("scale", "1.4 1.4 1.4");
    descriptionText.setAttribute("width", "1.6");
    descriptionText.setAttribute("align", "center");
    descriptionText.setAttribute("color", "#FFFFFF");
    descriptionText.setAttribute("font", "https://cdn.aframe.io/fonts/mozillavr.fnt");
    infoBox.appendChild(descriptionText);

    // Ajouter la sphère et l'infoBox dans la scène
    this.appendToScene(scene, [newSphere, infoBox]);
  }
}

// Classe pour les tags de type photo
class PhotoTag extends Tag {
  constructor(sceneId, title, position, imageUrl) {
    super(sceneId, title, position);
    this.imageUrl = imageUrl; // URL de l'image pour le tag photo
  }

  // Méthode pour créer un tag de type photo
  create() {
    const scene = document.getElementById(this.sceneId);

    const camera = scene.camera;
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    const cameraPosition = camera.position.clone();
    const distance = 2; 
    const targetPosition = cameraPosition.add(cameraDirection.multiplyScalar(distance));

    const image = this.createElement("a-image", {
      id: this.id,
      src: this.imageUrl,
      position: `${targetPosition.x} ${targetPosition.y} ${targetPosition.z}`,
      width: "2",
      height: "2",
      dragndrop: "", 
      "look-at-camera": "" 
    });

    this.appendToScene(scene, [image]);
  }
}

// Classe pour les tags de type vidéo
class VideoTag extends Tag {
  constructor(sceneId, title, position, videoUrl) {
    super(sceneId, title, position);
    this.videoUrl = videoUrl; // URL de la vidéo pour le tag vidéo
  }

  // Méthode pour créer un tag de type vidéo
  create() {
    const scene = document.getElementById(this.sceneId);

    
    const camera = scene.camera;
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    const cameraPosition = camera.position.clone();
    const distance = 2; 
    const targetPosition = cameraPosition.add(cameraDirection.multiplyScalar(distance));


    const video = this.createElement("a-video", {
      id: this.id,
      src: this.videoUrl,
      position: `${targetPosition.x} ${targetPosition.y} ${targetPosition.z}`,
      width: "4",
      height: "2.25",
      autoplay: "true", // Ajoutez cet attribut pour lancer automatiquement la vidéo
      loop: "true", // Ajoutez cet attribut pour boucler la vidéo
      dragndrop: "", 
      "look-at-camera": "" 
    });

    this.appendToScene(scene, [video]);
  }
}

export { Tag, DoorTag, InfoTag, PhotoTag, VideoTag };