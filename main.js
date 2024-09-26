import { closeAllMenus, syncRangeAndValue } from './domUtils.js';
import { scenes, createSceneElement, displayScene, displayDefaultScene } from './sceneManager.js';

document.addEventListener('DOMContentLoaded', function () {
  const sceneDropdown = document.getElementById('sceneDropdown');
  const fileInput = document.getElementById('fileInput');
  const createSceneBtn = document.getElementById('createSceneBtn');
  const editSceneForm = document.getElementById('editSceneForm');
  const sceneNameInput = document.getElementById('sceneNameInput');
  const editFileInput = document.getElementById('editFileInput');
  const saveSceneBtn = document.getElementById('saveSceneBtn');
  const deleteSceneBtn = document.getElementById('deleteSceneBtn');
  const deleteModal = document.getElementById('deleteModal');
  const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
  const customFileInputBtn = document.getElementById('customFileInputBtn');
  const fileName = document.getElementById('fileName');
  const OpenTagMenuText = document.getElementById('OpenTagMenuText');
  const doorSceneSelect = document.getElementById('doorSceneSelect');
  const createDoorBtn = document.getElementById('createDoorTagBtn');
  const tagsByScene = {};


  ['doorTag', 'photoTag', 'videoTag', 'tag'].forEach(tag => {
    syncRangeAndValue(`${tag}Range`, `${tag}RangeValue`);
  });

  [
    { button: OpenTagMenuText, containerId: 'textTagFormContainer' },
    { button: OpenTagMenuDoor, containerId: 'doorTagFormContainer' },
    { button: OpenTagMenuPhoto, containerId: 'photoTagFormContainer' },
    { button: OpenTagMenuVideo, containerId: 'videoTagFormContainer' }
  ].forEach(menu => {
    menu.button.addEventListener('click', function () {
      closeAllMenus();
      const formContainer = document.getElementById(menu.containerId);
      formContainer.classList.toggle('hidden');
    });
  });

  createSceneBtn.addEventListener('click', function () {
    fileInput.click();
  });


  fileInput.addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const sceneId = `scene-${scenes.length + 1}`;
        scenes.push({ id: sceneId, name: `Scène ${scenes.length + 1}`, src: e.target.result, fileName: file.name });

        const option = document.createElement('option');
        option.value = sceneId;
        option.textContent = `Scène ${scenes.length}`;
        sceneDropdown.appendChild(option);

        createSceneElement(sceneId, e.target.result);
        sceneDropdown.value = sceneId;
        displayScene(sceneId);
        editSceneForm.classList.remove('hidden');
        sceneNameInput.value = `Scène ${scenes.length}`;
        fileName.textContent = file.name;
      };
      reader.readAsDataURL(file);
    }
  });

  sceneDropdown.addEventListener('change', function () {
    const selectedSceneId = sceneDropdown.value;
    if (selectedSceneId) {
      displayScene(selectedSceneId);
      const selectedScene = scenes.find(scene => scene.id === selectedSceneId);
      if (selectedScene) {
        sceneNameInput.value = selectedScene.name;
        fileName.textContent = selectedScene.fileName || '';
        editSceneForm.classList.remove('hidden');
      }
    } else {
      editSceneForm.classList.add('hidden');
      fileName.textContent = '';
    }
  });

  saveSceneBtn.addEventListener('click', function () {
    const selectedSceneId = sceneDropdown.value;
    const selectedScene = scenes.find(scene => scene.id === selectedSceneId);
    if (selectedScene) {
      selectedScene.name = sceneNameInput.value;
      const option = sceneDropdown.querySelector(`option[value="${selectedSceneId}"]`);
      if (option) {
        option.textContent = selectedScene.name;
      }

      const file = editFileInput.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          selectedScene.src = e.target.result;
          selectedScene.fileName = file.name;
          const skyElement = document.querySelector(`#${selectedSceneId} a-sky`);
          if (skyElement) {
            skyElement.setAttribute('src', selectedScene.src);
          }
          fileName.textContent = file.name;
        };
        reader.readAsDataURL(file);
      }
    }
  });

  deleteSceneBtn.addEventListener('click', function () {
    deleteModal.classList.add('show');
  });

  cancelDeleteBtn.addEventListener('click', function () {
    deleteModal.classList.remove('show');
  });

  confirmDeleteBtn.addEventListener('click', function () {
    const selectedSceneId = sceneDropdown.value;
    const selectedSceneIndex = scenes.findIndex(scene => scene.id === selectedSceneId);
    if (selectedSceneIndex !== -1) {
      scenes.splice(selectedSceneIndex, 1);
      const option = sceneDropdown.querySelector(`option[value="${selectedSceneId}"]`);
      if (option) {
        option.remove();
      }
      const sceneElement = document.getElementById(selectedSceneId);
      if (sceneElement) {
        sceneElement.remove();
      }
      sceneDropdown.value = '';
      editSceneForm.classList.add('hidden');
      fileName.textContent = '';
      displayDefaultScene();
    }
    deleteModal.classList.remove('show');
  });

  customFileInputBtn.addEventListener('click', function () {
    editFileInput.click();
  });

  editFileInput.addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file) {
      fileName.textContent = file.name;
    } else {
      fileName.textContent = '';
    }
  });

  document.getElementById('ExportSceneBtn').addEventListener('click', function () {
    const scenes = document.querySelectorAll('a-scene:not(#defaultScene)');

    // Créer un nouveau document HTML
    let exportContent = '<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Exported Scenes</title>';
    exportContent += '<script src="https://aframe.io/releases/1.6.0/aframe.min.js"></script>';
    exportContent += '<style>a-scene { width: 100vw; height: 100vh; position: absolute; top: 0; left: 0; transform: scaleX(-1); }</style></head><body>';

    scenes.forEach(scene => {
      // Ajouter les contrôles de caméra
      const cameraEntity = scene.querySelector('[camera]');
      if (cameraEntity) {
        cameraEntity.setAttribute('wasd-controls', 'enabled: false');
        cameraEntity.setAttribute('look-controls', 'enabled: true');
      }
      exportContent += scene.outerHTML;
    });

    exportContent += '</body></html>';

    // Créer un blob et ouvrir l'URL dans une nouvelle fenêtre
    const blob = new Blob([exportContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    URL.revokeObjectURL(url);
  });


  function updateSceneName(sceneId, newName) {
    const sceneElement = document.getElementById(sceneId);
    if (sceneElement) {
      sceneElement.setAttribute('data-name', newName);
      const option = doorSceneSelect.querySelector(`option[value="${sceneId}"]`);
      if (option) {
        option.textContent = newName;
        option.setAttribute('data-name', newName);
      }
    }
  }

  document.getElementById('sceneNameInput').addEventListener('input', function (event) {
    const sceneId = document.getElementById('sceneDropdown').value;
    const newName = event.target.value;
    if (sceneId) {
      updateSceneName(sceneId, newName);
    }
  });



  // TAGS 

  createDoorBtn.addEventListener('click', function () {
    // récupere la scene selectionné
    const selectedSceneId = sceneDropdown.value;
    const scene = document.getElementById(selectedSceneId);
    let messageError = document.getElementById('error');
  
    if (!scene) {
      messageError.innerText = "Erreur : Scène non trouvée.";
      console.error("Scène non trouvée.");
      return;
    }
    
    const doorTagTitle = document.getElementById('doorTagTitle').value; // Titre
    const doorTagRange = document.getElementById('doorTagRange').value; // Profondeur
    const doorSceneSelect = document.getElementById('doorSceneSelect'); // scene suivante

    const cameraId = 'camera-' + selectedSceneId; // Construire l'ID de la caméra
    const camera = document.getElementById(cameraId);

    if (!camera || !camera.object3D) {
        console.error("Caméra non trouvée ou non initialisée.");
        return; // Sortir si la caméra n'est pas trouvée
    }

    const cameraDirection = new THREE.Vector3();
    camera.object3D.getWorldDirection(cameraDirection);

    // récupere la profondeur sélectionné par l'utilisateur 
    const distance = -doorTagRange;
  
    const tagPosition = new THREE.Vector3();
    tagPosition.copy(camera.object3D.position).addScaledVector(cameraDirection, distance);
  
    if (!tagsByScene[selectedSceneId]) {
      tagsByScene[selectedSceneId] = [];
    }
  
    const tagCounter = tagsByScene[selectedSceneId].length + 1;
    const tagId = `${tagCounter}`;
  

    // Création de la sphère à côté de la box
    const newSphere = document.createElement('a-sphere');
    newSphere.setAttribute('position', tagPosition);
    newSphere.setAttribute('radius', '0.5'); // Rayon de la sphère (peut être modifié)
    newSphere.setAttribute('color', '#EF2D5E'); // Couleur de la sphère (peut être modifié)
    newSphere.setAttribute('dragndrop', '')
    
    
  

    const newBox = document.createElement('a-box');
    newBox.setAttribute('position', tagPosition);
    // newBox.setAttribute('rotation', '0 45 0');
    newBox.setAttribute('color', '#4CC3D9');
    newBox.setAttribute('id', tagId);
    newBox.setAttribute('follow-mover', { target: newSphere })
    newBox.setAttribute('width', '2');   
    newBox.setAttribute('height', '4');  
    newBox.setAttribute('depth', '0.5'); 

    newBox.addEventListener('click', function () {
      // Récupérer la scène sélectionnée dans le select
      const doorSceneSelect = document.getElementById('doorSceneSelect');
      const targetSceneId = doorSceneSelect.value;

      // Vérifier si une scène a été sélectionnée dans le select
      if (targetSceneId) {
        // Appeler la fonction de changement de scène avec la scène sélectionnée
        changeScene(targetSceneId); 
        updateSceneMenu(targetSceneId);
      } else {
        console.warn("Aucune scène sélectionnée pour la navigation.");
      }
    });

    // Ajout de la box à la scène
    scene.appendChild(newBox);
    //ajout de la sphere a la scene
    scene.appendChild(newSphere);
  


    tagsByScene[selectedSceneId].push(tagId);
    console.log(tagsByScene[selectedSceneId]);
    
      // // Ajouter le tag au sélecteur
      // addTagToSelector(tagId, selectedSceneId);


    });

  

    function changeScene(sceneId) {
      const scene = document.getElementById(sceneId); // Sélectionner la nouvelle scène
    
      if (!scene) {
          console.error("Scène non trouvée.");
          return;
      }
    
      // Cacher toutes les scènes existantes
      const allScenes = document.querySelectorAll('a-scene');
      allScenes.forEach(s => s.style.display = 'none');
    
      // Afficher la nouvelle scène
      scene.style.display = 'block';;
      sceneDropdown.value = sceneId; // Mettre à jour le sélecteur de scène
    
      // maj du selecteur de tag
      updateTagSelector(sceneId);
    }
  

// ajoute un tag au selecteur
function addTagToSelector(tagId, sceneId) {
  const selectedSceneId = sceneDropdown.value; // Récupérer l'ID de la scène sélectionnée

  // Vérifie si le tag appartient à la scène sélectionnée
  if (sceneId === selectedSceneId) {
    const option = document.createElement('option');
    option.value = tagId;
    option.textContent = `Tag ${tagId}`;
    tagSelector.appendChild(option);
  }
}

displayDefaultScene();
});