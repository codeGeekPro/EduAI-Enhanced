// Déclarations de types pour React Three Fiber
import { extend } from '@react-three/fiber';
import * as THREE from 'three';

// Étendre le catalogue d'éléments JSX pour Three.js
declare global {
  namespace JSX {
    interface IntrinsicElements {
      // Géométries
      boxGeometry: any;
      sphereGeometry: any;
      planeGeometry: any;
      cylinderGeometry: any;
      
      // Matériaux
      meshStandardMaterial: any;
      meshBasicMaterial: any;
      meshPhongMaterial: any;
      
      // Objets 3D
      mesh: any;
      group: any;
      
      // Éclairage
      ambientLight: any;
      directionalLight: any;
      pointLight: any;
      spotLight: any;
    }
  }
}

export {};
