// Configuración de Three.js para el modelo 3D con animación de scroll
(function() {
  let scene, camera, renderer, model, mixer, clock;
  let scrollProgress = 0;
  const container = document.getElementById('model-container');

  function init() {
    // Crear escena
    scene = new THREE.Scene();

    // Configurar cámara
    camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);

    // Configurar renderer
    renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Iluminación
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    const pointLight1 = new THREE.PointLight(0x0175C2, 1, 50);
    pointLight1.position.set(-5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff6b35, 0.8, 50);
    pointLight2.position.set(5, 3, -5);
    scene.add(pointLight2);


    // Cargar modelo GLB
    const loader = new THREE.GLTFLoader();
    loader.load(
      'mech_drone.glb',
      function(gltf) {
        model = gltf.scene;
        
        // Escalar y posicionar el modelo
        model.scale.set(8, 8, 8);
        model.position.set(-15, 0, 0); // Comienza desde la izquierda
        
        // Rotar el modelo para que muestre el frente (hacia la derecha)
        model.rotation.y = -Math.PI / 2;
        
        
        scene.add(model);

        // Configurar animaciones si existen
        if (gltf.animations && gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(model);
          gltf.animations.forEach((clip) => {
            const action = mixer.clipAction(clip);
            action.play();
          });
        }

        console.log('Mech Drone cargado exitosamente', model);
      },
      function(xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% cargado');
      },
      function(error) {
        console.error('Error al cargar el modelo:', error);
      }
    );

    // Clock para animaciones
    clock = new THREE.Clock();

    // Event listeners
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('scroll', onScroll);

    // Iniciar animación
    animate();
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function onScroll() {
    // Calcular progreso del scroll (0 a 1)
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress = Math.min(scrollTop / scrollHeight, 1);
  }

  function animate() {
    requestAnimationFrame(animate);

    if (model) {
      // Movimiento de izquierda a derecha basado en scroll
      // Scroll 0% = izquierda (-15), Scroll 100% = derecha (+15)
      const targetX = -15 + (scrollProgress * 30);
      model.position.x += (targetX - model.position.x) * 0.08; // Suavizado

      // Calcular rotación para que siempre muestre el frente hacia el centro
      // Cuando está a la izquierda mira hacia la derecha, cuando está a la derecha mira hacia la izquierda
      const centerX = 0; // Centro de la pantalla
      const directionToCenter = Math.atan2(0, centerX - model.position.x);
      model.rotation.y = directionToCenter - Math.PI / 2; // -90° para mostrar el frente
      
      // Movimiento vertical sutil (efecto de flotación)
      model.position.y = Math.sin(Date.now() * 0.001) * 0.5;
    }

    // Actualizar animaciones del modelo
    if (mixer) {
      const delta = clock.getDelta();
      mixer.update(delta);
    }

    renderer.render(scene, camera);
  }

  // Inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
