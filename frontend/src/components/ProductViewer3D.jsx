import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const ProductViewer3D = ({ product, modelData }) => {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const animationRef = useRef(null);
  const controlsRef = useRef(null);
  const modelRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [error, setError] = useState(false);

  /* ─────────────────────────────────────────────────────────────
     Mapping avec les chemins EXACTS de votre structure
  ───────────────────────────────────────────────────────────── */
  const getModelPath = (product) => {
    if (!product) return null;

    const title = product.title || '';
    const ref = product.reference || product.sku || '';

    console.log('🔍 Titre produit:', `"${title}"`);

    // Mapping avec vos chemins exacts (basé sur vos images)
    const modelMapping = {
      // CNC Turning Machines (Tournage)
      'De2-Ultra Mini CNC Turning Center': '/models/products/CNC EDUCATION/CNC Turning Machine/De2-Ultra Mini CNC Turning Center.glb',
      'De4-Eco (KC4S) Bench CNC Lathe': '/models/products/CNC EDUCATION/CNC Turning Machine/De4-Eco (KC4S) Bench CNC Lathe.glb',
      'De4-Pro (iKC4) Bench CNC Lathe': '/models/products/CNC EDUCATION/CNC Turning Machine/De4-Pro (iKC4) Bench CNC Lathe.glb',
      'De6 (iKC6S) CNC Turning Machine': '/models/products/CNC EDUCATION/CNC Turning Machine/De6 (iKC6S) CNC Turning Machine.glb',
      'De8 (iKC8) CNC Turning Machine': '/models/products/CNC EDUCATION/CNC Turning Machine/De8 (iKC8) CNC Turning Machine.glb',
      
      // CNC Milling Machines (Fraisage)
      'Fa2-Ultra Mini CNC Milling Center': '/models/products/CNC EDUCATION/CNC Milling Machine/Fa2-Ultra Mini CNC Milling Center.glb',
      'Fa4-Eco (KX1S) CNC Milling Machine': '/models/products/CNC EDUCATION/CNC Milling Machine/Fa4-Eco (KX1S) CNC Milling Machine.glb',
      'PX1 Baby CNC Milling Machine': '/models/products/CNC EDUCATION/CNC Milling Machine/PX1 Baby CNC Milling Machine.glb',
      
      // Education Equipment
      'ACL-7000 – Analogue Training System': '/models/products/MCP lab electronics/EDUCATION EQUIPMENT/ACL-7000 – Analogue Training System.glb',
      'F1-3 – Basic Logic Circuit Training System': '/models/products/MCP lab electronics/EDUCATION EQUIPMENT/F1-3 – Basic Logic Circuit Training System.glb',
      'M21-7100 – Digital & Analogue Training System': '/models/products/MCP lab electronics/EDUCATION EQUIPMENT/M21-7100 – Digital & Analogue Training System.glb',
      
      // Accessoires
      'PTL908-2H – High Voltage Safety Test Lead 10kV': '/models/products/Accessories/PTL908-2H – High Voltage Safety Test Lead 10kV.glb',
      'PTL908-8 – Test Lead 4mm 20A': '/models/products/Accessories/PTL908-8 – Test Lead 4mm 20A.glb',
      'PTL940 – Oscilloscope Probe 100MHz': '/models/products/Accessories/PTL940 – Oscilloscope Probe 100MHz.glb',
      'PTL955 – Oscilloscope Probe 40kV': '/models/products/Accessories/PTL955 – Oscilloscope Probe 40kV.glb',
      'PTL960 – Oscilloscope Probe 500MHz': '/models/products/Accessories/PTL960 – Oscilloscope Probe 500MHz.glb',
      'PTL970 – Oscilloscope Probe 5kV': '/models/products/Accessories/PTL970 – Oscilloscope Probe 5kV.glb',
      
      // Capteurs et Actionneurs
      'DT-E001 – Unité de Contrôle Électronique': '/models/products/voitures/CAPTEURS ET ACTIONNEURS/DT-E001 – Unité de Contrôle Électronique.glb',
      'MT-M002 – Mesure des Positions': '/models/products/voitures/CAPTEURS ET ACTIONNEURS/MT-M002 – Mesure des Positions.glb',
      
      // Électricité Auto
      'DT-M005 – Mesure des Courants et des Tensions': '/models/products/voitures/ÉLECTRICITÉ/DT-M005 – Mesure des Courants et des Tensions.glb',
      'DTM7000 – Modules Éclairage et Signalisation': '/models/products/voitures/ÉLECTRICITÉ/DTM7000 – Modules Éclairage et Signalisation.glb',
      'DTM7020 – Modules Essuie-Glaces': '/models/products/voitures/ÉLECTRICITÉ/DTM7020 – Modules Essuie-Glaces.glb',
      'MT-4002V – Maquette de Charge Démarrage 12V': '/models/products/voitures/ÉLECTRICITÉ/MT-4002V – Maquette de Charge Démarrage 12V.glb',
      
      // Réseaux Multiplexés
      'MT-MOTEUR-MECA – Maquette Diagnostic Mécanique Moteur': '/models/products/voitures/RÉSEAUX MULTIPLEXÉS/MT-MOTEUR-MECA – Maquette Diagnostic Mécanique Moteur.glb',
    };

    // 1. Match exact
    if (modelMapping[title]) {
      console.log('✅ Match exact:', modelMapping[title]);
      return modelMapping[title];
    }

    // 2. Match insensible à la casse
    for (const [key, path] of Object.entries(modelMapping)) {
      if (title.toLowerCase() === key.toLowerCase()) {
        console.log('✅ Match (insensible casse):', path);
        return path;
      }
    }

    // 3. Match partiel par mot-clé
    const keywords = ['De2', 'De4', 'De6', 'De8', 'Fa2', 'Fa4', 'PX1', 'Turning', 'Milling', 'CNC'];
    for (const keyword of keywords) {
      if (title.includes(keyword)) {
        // Trouver le chemin correspondant
        for (const [key, path] of Object.entries(modelMapping)) {
          if (key.includes(keyword)) {
            console.log('✅ Match par mot-clé:', keyword, '→', path);
            return path;
          }
        }
      }
    }

    console.warn('⚠️ Aucun modèle trouvé pour:', title);
    return null;
  };

  /* ─────────────────────────────────────────────────────────────
     Fallback cube avec image du produit
  ───────────────────────────────────────────────────────────── */
  const loadFallbackCube = (scene, camera, controls) => {
    const imageUrl = product?.image || product?.images?.[0] || product?.thumbnail || null;
    
    const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
    
    if (imageUrl) {
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(imageUrl, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        const material = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.3, metalness: 0.1 });
        const cube = new THREE.Mesh(geometry, material);
        cube.castShadow = true;
        cube.position.y = 0;
        scene.add(cube);
        setModelLoaded(true);
        
        // Ajuster la caméra pour le cube
        camera.position.set(2, 2, 3);
        controls.target.set(0, 0, 0);
        controls.update();
      });
    } else {
      const material = new THREE.MeshStandardMaterial({ color: 0x4361ee, roughness: 0.2, metalness: 0.6 });
      const cube = new THREE.Mesh(geometry, material);
      cube.castShadow = true;
      cube.position.y = 0;
      scene.add(cube);
      setModelLoaded(true);
    }
  };

  /* ─────────────────────────────────────────────────────────────
     useEffect principal
  ───────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    // Nettoyage précédent
    if (rendererRef.current) {
      cancelAnimationFrame(animationRef.current);
      controlsRef.current?.dispose();
      rendererRef.current.dispose();
      if (rendererRef.current.domElement.parentNode === container) {
        container.removeChild(rendererRef.current.domElement);
      }
      rendererRef.current = null;
    }

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f7);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(3, 2, 4);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // Lumières
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(5, 5, 5);
    mainLight.castShadow = true;
    mainLight.receiveShadow = true;
    scene.add(mainLight);

    const fillLight = new THREE.PointLight(0x4466cc, 0.3);
    fillLight.position.set(-2, 1, 3);
    scene.add(fillLight);

    const backLight = new THREE.DirectionalLight(0xffaa66, 0.4);
    backLight.position.set(-2, 2, -3);
    scene.add(backLight);

    // Grille au sol
    const gridHelper = new THREE.GridHelper(8, 20, 0x4361ee, 0xccccdd);
    gridHelper.position.y = -0.8;
    scene.add(gridHelper);

    // Plan d'ombre
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(5, 5),
      new THREE.ShadowMaterial({ opacity: 0.4, color: 0x000000, transparent: true })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.8;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // Contrôles
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.5;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    setLoading(true);
    setModelLoaded(false);
    setError(false);

    const modelPath = getModelPath(product);
    console.log('📁 Chemin final:', modelPath);

    if (modelPath) {
      const loader = new GLTFLoader();
      
      loader.load(
        modelPath,
        (gltf) => {
          const model = gltf.scene;
          modelRef.current = model;
          
          model.scale.set(1, 1, 1);
          model.position.set(0, -0.5, 0);
          
          model.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });
          
          scene.add(model);
          setModelLoaded(true);
          setLoading(false);
          
          // Ajuster la caméra
          const box = new THREE.Box3().setFromObject(model);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const distance = maxDim * 2;
          
          camera.position.set(distance * 0.8, distance * 0.6, distance);
          camera.lookAt(center);
          controls.target.copy(center);
          controls.update();
          
          console.log('✅ Modèle 3D chargé avec succès !');
        },
        (xhr) => {
          if (xhr.total > 0) {
            const percent = Math.round((xhr.loaded / xhr.total) * 100);
            console.log(`📥 Chargement: ${percent}%`);
          }
        },
        (error) => {
          console.error('❌ Erreur chargement:', error);
          setError(true);
          loadFallbackCube(scene, camera, controls);
          setLoading(false);
        }
      );
    } else {
      console.error('❌ Aucun chemin trouvé');
      setError(true);
      loadFallbackCube(scene, camera, controls);
      setLoading(false);
    }

    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w && h) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', handleResize);
      if (controlsRef.current) controlsRef.current.dispose();
      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (rendererRef.current.domElement.parentNode === container) {
          container.removeChild(rendererRef.current.domElement);
        }
      }
      if (modelRef.current) scene.remove(modelRef.current);
    };
  }, [product]);

  /* ── JSX ── */
  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        background: '#f5f5f7',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '12px',
      }}
    >
      {loading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#333',
          zIndex: 10,
          background: 'rgba(255,255,255,0.9)',
          padding: '16px 32px',
          borderRadius: '8px',
          textAlign: 'center',
        }}>
          <div>Chargement du modèle 3D...</div>
          <div style={{ fontSize: '12px', marginTop: '8px' }}>{product?.title || 'Produit'}</div>
        </div>
      )}

      {!loading && modelLoaded && !error && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          background: 'rgba(255,255,255,0.85)',
          padding: '8px 16px',
          borderRadius: '6px',
          fontSize: '13px',
          zIndex: 10,
        }}>
          <div>🖱️ Rotation: cliquer + glisser</div>
          <div>🔍 Zoom: molette</div>
          <div>🔄 Auto-rotation activée</div>
        </div>
      )}

      {error && !loading && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          background: 'rgba(255,255,255,0.85)',
          color: '#d32f2f',
          padding: '8px 16px',
          borderRadius: '6px',
          fontSize: '12px',
          zIndex: 10,
        }}>
        </div>
      )}

      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        background: '#4361ee',
        color: 'white',
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '14px',
        zIndex: 10,
      }}>
        {product?.title || 'Produit'} {modelLoaded && !error && '✓ 3D'}
      </div>
    </div>
  );
};

export default ProductViewer3D;