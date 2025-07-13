/**
 * 🌍 Visualisations Three.js pour l'Apprentissage Immersif 3D
 * Environnements 3D interactifs et animations sophistiquées
 */

import * as THREE from 'three';
import { useEffect, useRef, useState, useCallback } from 'react';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer';

// Types pour les données 3D
export interface Learning3DNode {
  id: string;
  name: string;
  position: { x: number; y: number; z: number };
  connections: string[];
  mastery: number;
  type: 'concept' | 'skill' | 'topic' | 'achievement';
  color?: string;
  size?: number;
}

export interface LearningWorld {
  id: string;
  name: string;
  nodes: Learning3DNode[];
  environment: 'space' | 'underwater' | 'forest' | 'city';
  theme: string;
}

/**
 * 🌌 Hook pour monde d'apprentissage 3D
 */
export const use3DLearningWorld = (
  worldData: LearningWorld,
  containerRef: React.RefObject<HTMLDivElement>
) => {
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialisation de la scène 3D
  const initScene = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scène
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Caméra
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 0, 50);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // Contrôles
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 10;
    controls.maxDistance = 200;
    controlsRef.current = controls;

    // Éclairage basé sur l'environnement
    setupEnvironmentLighting(scene, worldData.environment);

    // Créer l'environnement 3D
    createEnvironment(scene, worldData.environment);

    setIsLoaded(true);

    // Gestion du redimensionnement
    const handleResize = () => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      container.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [containerRef, worldData]);

  // Configuration de l'éclairage selon l'environnement
  const setupEnvironmentLighting = (scene: THREE.Scene, environment: string) => {
    // Éclairage ambiant
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    switch (environment) {
      case 'space':
        // Éclairage spatial dramatique
        const starLight = new THREE.DirectionalLight(0xffffff, 1);
        starLight.position.set(10, 10, 5);
        starLight.castShadow = true;
        scene.add(starLight);
        scene.background = new THREE.Color(0x000011);
        break;

      case 'underwater':
        // Éclairage aquatique
        const waterLight = new THREE.DirectionalLight(0x4499ff, 0.8);
        waterLight.position.set(0, 10, 0);
        scene.add(waterLight);
        scene.background = new THREE.Color(0x001133);
        break;

      case 'forest':
        // Éclairage forestier
        const sunLight = new THREE.DirectionalLight(0xffdd88, 0.7);
        sunLight.position.set(5, 10, 5);
        sunLight.castShadow = true;
        scene.add(sunLight);
        scene.background = new THREE.Color(0x228833);
        break;

      case 'city':
        // Éclairage urbain
        const cityLight = new THREE.DirectionalLight(0xffffff, 0.6);
        cityLight.position.set(10, 20, 10);
        scene.add(cityLight);
        scene.background = new THREE.Color(0x87CEEB);
        break;
    }
  };

  // Création de l'environnement 3D
  const createEnvironment = (scene: THREE.Scene, environment: string) => {
    switch (environment) {
      case 'space':
        createSpaceEnvironment(scene);
        break;
      case 'underwater':
        createUnderwaterEnvironment(scene);
        break;
      case 'forest':
        createForestEnvironment(scene);
        break;
      case 'city':
        createCityEnvironment(scene);
        break;
    }
  };

  // Environnement spatial
  const createSpaceEnvironment = (scene: THREE.Scene) => {
    // Création des étoiles
    const starsGeometry = new THREE.BufferGeometry();
    const starsVertices = [];
    
    for (let i = 0; i < 10000; i++) {
      starsVertices.push(
        (Math.random() - 0.5) * 2000,
        (Math.random() - 0.5) * 2000,
        (Math.random() - 0.5) * 2000
      );
    }
    
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 2 });
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // Nébuleuse de fond
    const nebulaGeometry = new THREE.SphereGeometry(500, 32, 32);
    const nebulaMaterial = new THREE.MeshBasicMaterial({
      color: 0x4411ff,
      transparent: true,
      opacity: 0.1,
      side: THREE.BackSide
    });
    const nebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial);
    scene.add(nebula);
  };

  // Environnement aquatique
  const createUnderwaterEnvironment = (scene: THREE.Scene) => {
    // Création de bulles
    const bubbleGeometry = new THREE.SphereGeometry(0.5, 8, 8);
    const bubbleMaterial = new THREE.MeshBasicMaterial({
      color: 0x88ccff,
      transparent: true,
      opacity: 0.3
    });

    for (let i = 0; i < 50; i++) {
      const bubble = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
      bubble.position.set(
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100
      );
      scene.add(bubble);
    }

    // Effet de caustiques (simulation simple)
    const causticsGeometry = new THREE.PlaneGeometry(200, 200);
    const causticsMaterial = new THREE.MeshBasicMaterial({
      color: 0x44aaff,
      transparent: true,
      opacity: 0.1
    });
    const caustics = new THREE.Mesh(causticsGeometry, causticsMaterial);
    caustics.position.y = -50;
    caustics.rotation.x = -Math.PI / 2;
    scene.add(caustics);
  };

  // Créer les nœuds d'apprentissage 3D
  const createLearningNodes = useCallback(() => {
    if (!sceneRef.current) return;

    const scene = sceneRef.current;
    
    // Nettoyer les nœuds existants
    const existingNodes = scene.children.filter(child => child.userData.isLearningNode);
    existingNodes.forEach(node => scene.remove(node));

    // Créer les nouveaux nœuds
    worldData.nodes.forEach(nodeData => {
      const nodeGroup = new THREE.Group();
      nodeGroup.userData.isLearningNode = true;
      nodeGroup.userData.nodeData = nodeData;

      // Géométrie du nœud basée sur le type
      let geometry: THREE.BufferGeometry;
      switch (nodeData.type) {
        case 'concept':
          geometry = new THREE.SphereGeometry(2, 16, 16);
          break;
        case 'skill':
          geometry = new THREE.BoxGeometry(3, 3, 3);
          break;
        case 'topic':
          geometry = new THREE.ConeGeometry(2, 4, 8);
          break;
        case 'achievement':
          geometry = new THREE.OctahedronGeometry(2.5);
          break;
        default:
          geometry = new THREE.SphereGeometry(2, 16, 16);
      }

      // Matériau avec couleur basée sur la maîtrise
      const hue = nodeData.mastery * 0.33; // Rouge à vert
      const color = new THREE.Color().setHSL(hue, 0.7, 0.5);
      
      const material = new THREE.MeshPhongMaterial({
        color: color,
        transparent: true,
        opacity: 0.8 + nodeData.mastery * 0.2
      });

      const nodeMesh = new THREE.Mesh(geometry, material);
      nodeMesh.castShadow = true;
      nodeMesh.receiveShadow = true;
      nodeGroup.add(nodeMesh);

      // Halo autour du nœud
      const haloGeometry = new THREE.SphereGeometry(3, 16, 16);
      const haloMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.1
      });
      const halo = new THREE.Mesh(haloGeometry, haloMaterial);
      nodeGroup.add(halo);

      // Position du nœud
      nodeGroup.position.set(
        nodeData.position.x,
        nodeData.position.y,
        nodeData.position.z
      );

      // Animation de rotation douce
      nodeGroup.userData.rotationSpeed = {
        x: (Math.random() - 0.5) * 0.01,
        y: (Math.random() - 0.5) * 0.01,
        z: (Math.random() - 0.5) * 0.01
      };

      scene.add(nodeGroup);
    });

    // Créer les connexions entre nœuds
    createNodeConnections();
  }, [worldData.nodes]);

  // Créer les connexions visuelles entre nœuds
  const createNodeConnections = () => {
    if (!sceneRef.current) return;

    const scene = sceneRef.current;
    
    // Nettoyer les connexions existantes
    const existingConnections = scene.children.filter(child => child.userData.isConnection);
    existingConnections.forEach(connection => scene.remove(connection));

    worldData.nodes.forEach(node => {
      node.connections.forEach(targetId => {
        const targetNode = worldData.nodes.find(n => n.id === targetId);
        if (!targetNode) return;

        // Créer une ligne courbe entre les nœuds
        const curve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(node.position.x, node.position.y, node.position.z),
          new THREE.Vector3(
            (node.position.x + targetNode.position.x) / 2,
            (node.position.y + targetNode.position.y) / 2 + 5,
            (node.position.z + targetNode.position.z) / 2
          ),
          new THREE.Vector3(targetNode.position.x, targetNode.position.y, targetNode.position.z)
        );

        const points = curve.getPoints(50);
        const connectionGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const connectionMaterial = new THREE.LineBasicMaterial({
          color: 0x666666,
          transparent: true,
          opacity: 0.4
        });

        const connection = new THREE.Line(connectionGeometry, connectionMaterial);
        connection.userData.isConnection = true;
        scene.add(connection);
      });
    });
  };

  // Boucle d'animation
  const animate = useCallback(() => {
    if (!sceneRef.current || !rendererRef.current || !cameraRef.current || !controlsRef.current) return;

    const scene = sceneRef.current;
    const renderer = rendererRef.current;
    const camera = cameraRef.current;
    const controls = controlsRef.current;

    // Animer les nœuds d'apprentissage
    scene.children.forEach(child => {
      if (child.userData.isLearningNode && child.userData.rotationSpeed) {
        const speed = child.userData.rotationSpeed;
        child.rotation.x += speed.x;
        child.rotation.y += speed.y;
        child.rotation.z += speed.z;

        // Animation de pulsation basée sur la maîtrise
        const nodeData = child.userData.nodeData as Learning3DNode;
        const pulseFactor = 1 + Math.sin(Date.now() * 0.001 + nodeData.mastery * 10) * 0.1;
        child.scale.setScalar(pulseFactor);
      }
    });

    controls.update();
    renderer.render(scene, camera);

    animationIdRef.current = requestAnimationFrame(animate);
  }, []);

  // Gestion des interactions (clic sur nœud)
  const handleNodeClick = useCallback((event: MouseEvent) => {
    if (!containerRef.current || !cameraRef.current || !sceneRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);

    const learningNodes = sceneRef.current.children.filter(child => child.userData.isLearningNode);
    const intersects = raycaster.intersectObjects(learningNodes, true);

    if (intersects.length > 0) {
      const clickedNode = intersects[0].object.parent;
      if (clickedNode && clickedNode.userData.nodeData) {
        // Déclencher événement de clic sur nœud
        const nodeData = clickedNode.userData.nodeData as Learning3DNode;
        console.log('Nœud cliqué:', nodeData);
        
        // Animation de sélection
        const originalScale = clickedNode.scale.clone();
        clickedNode.scale.multiplyScalar(1.5);
        
        setTimeout(() => {
          clickedNode.scale.copy(originalScale);
        }, 300);
      }
    }
  }, [containerRef]);

  // Effets
  useEffect(() => {
    const cleanup = initScene();
    return cleanup;
  }, [initScene]);

  useEffect(() => {
    if (isLoaded) {
      createLearningNodes();
    }
  }, [isLoaded, createLearningNodes]);

  useEffect(() => {
    if (isLoaded) {
      animate();
    }
    
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [isLoaded, animate]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.addEventListener('click', handleNodeClick);
      
      return () => {
        if (containerRef.current) {
          containerRef.current.removeEventListener('click', handleNodeClick);
        }
      };
    }
  }, [handleNodeClick]);

  return {
    isLoaded,
    scene: sceneRef.current,
    camera: cameraRef.current,
    renderer: rendererRef.current,
  };
};

/**
 * 🎮 Composant React pour monde d'apprentissage 3D
 */
export const LearningWorld3D: React.FC<{
  worldData: LearningWorld;
  onNodeClick?: (node: Learning3DNode) => void;
  onEnvironmentChange?: (environment: string) => void;
}> = ({ worldData, onNodeClick, onEnvironmentChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedEnvironment, setSelectedEnvironment] = useState<"space" | "underwater" | "forest" | "city">(worldData.environment);
  
  const { isLoaded } = use3DLearningWorld(worldData, containerRef);

  const environments = [
    { id: 'space', name: 'Espace', icon: '🌌' },
    { id: 'underwater', name: 'Sous-marin', icon: '🌊' },
    { id: 'forest', name: 'Forêt', icon: '🌲' },
    { id: 'city', name: 'Ville', icon: '🏙️' }
  ];

  const handleEnvironmentChange = (environment: "space" | "underwater" | "forest" | "city") => {
    setSelectedEnvironment(environment);
    onEnvironmentChange?.(environment);
  };

  return (
    <div className="learning-world-3d">
      <div className="world-controls">
        <h3>🌍 Monde d'Apprentissage: {worldData.name}</h3>
        
        <div className="environment-selector">
          <label>Environnement:</label>
          {environments.map(env => (
            <button
              key={env.id}
              className={`env-btn ${selectedEnvironment === env.id ? 'active' : ''}`}
              onClick={() => handleEnvironmentChange(env.id as "space" | "underwater" | "forest" | "city")}
            >
              {env.icon} {env.name}
            </button>
          ))}
        </div>

        <div className="world-stats">
          <div className="stat">
            <span>Nœuds: {worldData.nodes.length}</span>
          </div>
          <div className="stat">
            <span>Progression moyenne: {
              Math.round(worldData.nodes.reduce((sum, node) => sum + node.mastery, 0) / worldData.nodes.length * 100)
            }%</span>
          </div>
        </div>
      </div>

      <div 
        ref={containerRef} 
        className="world-container"
        style={{ 
          width: '100%', 
          height: '600px', 
          position: 'relative',
          background: 'linear-gradient(to bottom, #1e3c72, #2a5298)',
          borderRadius: '10px',
          overflow: 'hidden'
        }}
      >
        {!isLoaded && (
          <div className="loading-overlay">
            <div className="loading-spinner">🌍 Chargement du monde...</div>
          </div>
        )}
      </div>

      <div className="world-instructions">
        <p>
          💡 <strong>Instructions:</strong> 
          Utilisez la souris pour naviguer (clic-glisser pour tourner, molette pour zoomer). 
          Cliquez sur les nœuds pour plus d'informations.
        </p>
      </div>
    </div>
  );
};

// Environnements spécialisés
const createForestEnvironment = (scene: THREE.Scene) => {
  // Création d'arbres stylisés
  for (let i = 0; i < 30; i++) {
    const treeGroup = new THREE.Group();
    
    // Tronc
    const trunkGeometry = new THREE.CylinderGeometry(0.5, 1, 8);
    const trunkMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 4;
    treeGroup.add(trunk);
    
    // Feuillage
    const leavesGeometry = new THREE.SphereGeometry(4, 8, 8);
    const leavesMaterial = new THREE.MeshPhongMaterial({ color: 0x228B22 });
    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
    leaves.position.y = 10;
    treeGroup.add(leaves);
    
    treeGroup.position.set(
      (Math.random() - 0.5) * 100,
      0,
      (Math.random() - 0.5) * 100
    );
    
    scene.add(treeGroup);
  }
};

const createCityEnvironment = (scene: THREE.Scene) => {
  // Création de bâtiments stylisés
  for (let i = 0; i < 20; i++) {
    const buildingHeight = Math.random() * 30 + 10;
    const buildingGeometry = new THREE.BoxGeometry(
      Math.random() * 4 + 2,
      buildingHeight,
      Math.random() * 4 + 2
    );
    const buildingMaterial = new THREE.MeshPhongMaterial({
      color: new THREE.Color().setHSL(Math.random() * 0.1 + 0.1, 0.3, 0.7)
    });
    
    const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
    building.position.set(
      (Math.random() - 0.5) * 80,
      buildingHeight / 2,
      (Math.random() - 0.5) * 80
    );
    
    scene.add(building);
  }
};

export default LearningWorld3D;
