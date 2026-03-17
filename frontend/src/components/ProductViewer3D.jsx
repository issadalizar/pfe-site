import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const ProductViewer3D = ({ product }) => {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const animationRef = useRef(null);
  const controlsRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

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

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(4, 2, 5);
    camera.lookAt(0, 1, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // Lumières
    const ambientLight = new THREE.AmbientLight(0x606080);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(3, 5, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const backLight = new THREE.DirectionalLight(0x4466ff, 0.5);
    backLight.position.set(-3, 3, -3);
    scene.add(backLight);

    // Grille
    const gridHelper = new THREE.GridHelper(8, 20, 0x4361ee, 0x2a2a4a);
    gridHelper.position.y = -0.01;
    scene.add(gridHelper);

    const imageUrl =
      product?.image ||
      product?.images?.[0] ||
      product?.thumbnail ||
      product?.img ||
      null;

    const textureLoader = new THREE.TextureLoader();

    const buildScene = (texture) => {
      const geometry = new THREE.BoxGeometry(2, 2, 2);

      let cube;
      if (texture) {
        const imageMat = new THREE.MeshStandardMaterial({
          map: texture,
          roughness: 0.3,
          metalness: 0.1,
        });

        const materials = [
          imageMat.clone(),
          imageMat.clone(),
          imageMat.clone(),
          imageMat.clone(),
          imageMat.clone(),
          imageMat.clone(),
        ];

        cube = new THREE.Mesh(geometry, materials);
      } else {
        const material = new THREE.MeshStandardMaterial({
          color: 0x4361ee,
          roughness: 0.2,
          metalness: 0.6,
        });
        cube = new THREE.Mesh(geometry, material);
      }

      cube.castShadow = true;
      cube.receiveShadow = true;
      cube.position.y = 1;
      scene.add(cube);

      setLoading(false);
    };

    if (imageUrl) {
      setLoading(true);
      textureLoader.load(
        imageUrl,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.minFilter = THREE.LinearFilter;
          texture.magFilter = THREE.LinearFilter;
          buildScene(texture);
        },
        undefined,
        () => buildScene(null)
      );
    } else {
      buildScene(null);
    }

    // Contrôles
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.5;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.target.set(0, 1, 0);
    controlsRef.current = controls;

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
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      rendererRef.current = null;
      controlsRef.current = null;
      animationRef.current = null;
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          const mats = Array.isArray(object.material)
            ? object.material
            : [object.material];
          mats.forEach((m) => {
            if (m.map) m.map.dispose();
            m.dispose();
          });
        }
      });
    };
  }, [product]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        background: '#1a1a2e',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '12px',
      }}
    >
      {loading && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'white',
            zIndex: 10,
            background: 'rgba(0,0,0,0.8)',
            padding: '16px 32px',
            borderRadius: '8px',
          }}
        >
          Chargement 3D...
        </div>
      )}

      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          background: 'rgba(0,0,0,0.6)',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '6px',
          fontSize: '13px',
          zIndex: 10,
        }}
      >
        <div>🖱️ Rotation: cliquer + glisser</div>
        <div>🔍 Zoom: molette</div>
        <div>🔄 Auto-rotation activée</div>
      </div>

      <div
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: '#4361ee',
          color: 'white',
          padding: '6px 12px',
          borderRadius: '20px',
          fontSize: '14px',
          zIndex: 10,
        }}
      >
        {product?.title || 'Produit'}
      </div>
    </div>
  );
};

export default ProductViewer3D;