const toggle=document.querySelector('.menu-toggle');
const menu=document.querySelector('.menu');
const yearEl=document.getElementById('year');
if(yearEl){yearEl.textContent=new Date().getFullYear();}
// Force single-image live typing overlay for hero
window.__HERO_MODE = '2d-live';

// 3D background (Three.js) — lightweight, runs on all pages
(()=>{
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGrid = !!document.querySelector('.bg-grid');
  if(prefersReduced || !hasGrid) return;

  function loadScriptOnce(src,id){
    return new Promise((resolve,reject)=>{
      if(document.getElementById(id)) return resolve();
      const s=document.createElement('script');
      s.id=id; s.src=src; s.async=true; s.onload=()=>resolve(); s.onerror=reject;
      document.head.appendChild(s);
    });
  }

  function createCanvas(){
    const canvas=document.createElement('canvas');
    canvas.className='bg-3d-canvas';
    const grid=document.querySelector('.bg-grid');
    if(grid && grid.parentNode){
      grid.parentNode.insertBefore(canvas, grid);
    } else {
      document.body.prepend(canvas);
    }
    return canvas;
  }

  async function init(){
    try{
      await loadScriptOnce('https://unpkg.com/three@0.158.0/build/three.min.js','three-cdn');
    }catch(err){
      return; // fail silently if CDN blocked
    }
    const THREE=window.THREE; if(!THREE) return;
    const canvas=createCanvas();
    const renderer=new THREE.WebGLRenderer({canvas, antialias:true, alpha:true, powerPreference:'low-power'});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, 1.8));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    renderer.setClearColor(0x000000, 0);

    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 100);
    camera.position.set(0, 0.2, 8);

    const ambient=new THREE.AmbientLight(0x89c9ff, 0.6);
    scene.add(ambient);
    const keyLight=new THREE.PointLight(0x7c3aed, 1.2, 40);
    keyLight.position.set(6, 4, 6);
    const fillLight=new THREE.PointLight(0x13b9fd, 0.9, 40);
    fillLight.position.set(-6, -2, -4);
    scene.add(keyLight, fillLight);

    const coreGeo=new THREE.IcosahedronGeometry(2, 1);
    const coreMat=new THREE.MeshStandardMaterial({color:0x4f9aff, metalness:0.6, roughness:0.25, emissive:0x001a2a, emissiveIntensity:0.25, wireframe:false});
    const core=new THREE.Mesh(coreGeo, coreMat);
    scene.add(core);

    // Code glyph sprites instead of particles
    const glyphChars=['{','}','<','>',';','=','const','let','()','[]','=>','class','return','if','for','while','async','await','Future','Widget'];
    const glyphTextures=new Map();
    function makeGlyphTexture(label){
      if(glyphTextures.has(label)) return glyphTextures.get(label);
      const c=document.createElement('canvas'); c.width=256; c.height=128;
      const g=c.getContext('2d');
      const grad=g.createLinearGradient(0,0,c.width,0); grad.addColorStop(0,'#79e9ff'); grad.addColorStop(1,'#b3e5ff');
      g.fillStyle='rgba(12,24,40,0)'; g.fillRect(0,0,c.width,c.height);
      g.shadowColor='rgba(19,185,253,0.55)'; g.shadowBlur=14; g.fillStyle=grad;
      g.font='bold 72px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'; g.textAlign='center'; g.textBaseline='middle';
      g.fillText(label, c.width/2, c.height/2);
      const tex=new THREE.CanvasTexture(c); tex.needsUpdate=true; tex.anisotropy=4; glyphTextures.set(label, tex); return tex;
    }
    const glyphGroup=new THREE.Group();
    scene.add(glyphGroup);
    const glyphCount=120;
    const glyphs=[];
    for(let i=0;i<glyphCount;i++){
      const label=glyphChars[Math.floor(Math.random()*glyphChars.length)];
      const mat=new THREE.SpriteMaterial({map:makeGlyphTexture(label), transparent:true, opacity:0.65, depthWrite:false});
      const sp=new THREE.Sprite(mat);
      const r=THREE.MathUtils.randFloat(4.8,9.2);
      const phi=Math.random()*Math.PI*2;
      const theta=Math.random()*Math.PI;
      sp.position.set(
        r*Math.sin(theta)*Math.cos(phi),
        r*Math.cos(theta)*0.6,
        r*Math.sin(theta)*Math.sin(phi)
      );
      const s=THREE.MathUtils.randFloat(0.15,0.35);
      sp.scale.setScalar(s);
      sp.userData={dr:THREE.MathUtils.randFloat(-0.002,0.002), wob:Math.random()*Math.PI*2, wobSpd:THREE.MathUtils.randFloat(0.002,0.006)};
      glyphGroup.add(sp); glyphs.push(sp);
    }

    let t=0; let targetX=0, targetY=0; let currentX=0, currentY=0;
    window.addEventListener('pointermove', (e)=>{
      const nx=(e.clientX / window.innerWidth)*2-1;
      const ny=(e.clientY / window.innerHeight)*2-1;
      targetX=nx*0.6; targetY=ny*0.4;
    }, {passive:true});

    function onResize(){
      const w=window.innerWidth, h=window.innerHeight;
      renderer.setSize(w,h,false);
      camera.aspect=w/h; camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', onResize);

    function animate(){
      t+=0.005;
      currentX += (targetX-currentX)*0.05;
      currentY += (targetY-currentY)*0.05;

      core.rotation.x += 0.003 + currentY*0.004;
      core.rotation.y += 0.004 + currentX*0.006;
      glyphGroup.rotation.y -= 0.0008;
      glyphGroup.rotation.x += 0.0005;
      // gentle drift for glyphs
      for(const sp of glyphs){
        sp.userData.wob += sp.userData.wobSpd;
        sp.position.x += Math.sin(sp.userData.wob)*0.002;
        sp.position.y += Math.cos(sp.userData.wob)*0.0015;
        sp.material.opacity = 0.45 + 0.35*Math.sin(sp.userData.wob*0.8);
      }

      camera.position.x = currentX*1.2;
      camera.position.y = 0.2 - currentY*0.8;
      camera.lookAt(0,0,0);

      renderer.render(scene,camera);
      requestAnimationFrame(animate);
    }
    animate();
  }

  // Slight delay to avoid layout thrash on first paint
  if(document.readyState === 'complete' || document.readyState === 'interactive'){
    setTimeout(init, 0);
  } else {
    window.addEventListener('DOMContentLoaded', ()=>setTimeout(init,0));
  }
})();

// 3D mini icons for service cards (replaces emojis with small WebGL shapes)
(()=>{
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(prefersReduced) return;

  const icons=[...document.querySelectorAll('.card .card-icon')];
  if(!icons.length) return;

  function loadScriptOnce(src,id){
    return new Promise((resolve,reject)=>{
      if(document.getElementById(id) || window.THREE) return resolve();
      const s=document.createElement('script');
      s.id=id; s.src=src; s.async=true; s.onload=()=>resolve(); s.onerror=reject;
      document.head.appendChild(s);
    });
  }

  function makeRenderer(canvas, w, h){
    const THREE=window.THREE;
    const renderer=new THREE.WebGLRenderer({canvas, antialias:true, alpha:true, powerPreference:'low-power'});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, 1.8));
    renderer.setSize(w, h, false);
    renderer.setClearColor(0x000000, 0);
    return renderer;
  }

  function buildScene(shape){
    const THREE=window.THREE;
    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(55, 1, 0.1, 50);
    camera.position.set(0.8, 0.6, 3.2);
    const amb=new THREE.AmbientLight(0xbfe9ff, 0.7);
    const key=new THREE.PointLight(0x7c3aed, 1.0, 20); key.position.set(4,4,6);
    const fill=new THREE.PointLight(0x13b9fd, 0.9, 20); fill.position.set(-4,-2,-4);
    scene.add(amb,key,fill);

    let mesh;
    const mat=new THREE.MeshStandardMaterial({color:0xb3e5ff, metalness:0.5, roughness:0.35, emissive:0x0a1e2e, emissiveIntensity:0.15});
    switch(shape){
      case 'bolt': mesh=new THREE.Mesh(new THREE.TetrahedronGeometry(1.1), mat); break;
      case 'brain': mesh=new THREE.Mesh(new THREE.IcosahedronGeometry(1.1,1), mat); break;
      case 'wrench': mesh=new THREE.Mesh(new THREE.TorusKnotGeometry(0.7,0.22,80,8), mat); break;
      case 'phone': mesh=new THREE.Mesh(new THREE.BoxGeometry(0.9,1.4,0.18), mat); break;
      case 'puzzle': mesh=new THREE.Mesh(new THREE.TorusGeometry(0.9,0.28,16,64), mat); break;
      case 'rocket': mesh=new THREE.Mesh(new THREE.ConeGeometry(0.9,1.6,24), mat); break;
      default: mesh=new THREE.Mesh(new THREE.DodecahedronGeometry(1.0), mat);
    }
    scene.add(mesh);
    return {scene, camera, mesh};
  }

  function mapEmojiToShape(txt){
    if(/⚡/.test(txt)) return 'bolt';
    if(/🧠/.test(txt)) return 'brain';
    if(/🛠️|🔧/.test(txt)) return 'wrench';
    if(/📱|📲/.test(txt)) return 'phone';
    if(/🧩/.test(txt)) return 'puzzle';
    if(/🚀/.test(txt)) return 'rocket';
    return 'default';
  }

  async function init(){
    try{ await loadScriptOnce('https://unpkg.com/three@0.158.0/build/three.min.js','three-cdn'); }catch{ return; }
    const THREE=window.THREE; if(!THREE) return;

    icons.forEach(iconEl=>{
      const label=iconEl.textContent||'';
      const shape=mapEmojiToShape(label);
      iconEl.textContent='';
      const canvas=document.createElement('canvas');
      canvas.className='icon-3d';
      iconEl.appendChild(canvas);
      const rect=iconEl.getBoundingClientRect();
      const size=Math.round(Math.min(rect.width||36, rect.height||36) || 36);
      const renderer=makeRenderer(canvas, size, size);
      const {scene, camera, mesh}=buildScene(shape);

      let targetRot=0, rot=0;
      iconEl.addEventListener('pointerenter', ()=>{ targetRot += Math.PI*0.5; }, {passive:true});
      function tick(){
        rot += (targetRot-rot)*0.08;
        mesh.rotation.x += 0.01;
        mesh.rotation.y = rot*0.5;
        renderer.render(scene, camera);
        requestAnimationFrame(tick);
      }
      tick();
    });
  }

  if(document.readyState === 'complete' || document.readyState === 'interactive'){
    setTimeout(init, 0);
  } else {
    window.addEventListener('DOMContentLoaded', ()=>setTimeout(init,0));
  }
})();

// Hero image 3D plane (index.html) using the existing hero image as texture
(()=>{
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(prefersReduced) return;
  const img=document.querySelector('.hero-img');
  if(!img) return;

  // Allow forcing a single 2D overlay mode (requested by user)
  if(window.__HERO_MODE === '2d-live'){
    // Hide the original image to avoid duplicated visuals
    img.style.display='none';
    createTypingOverlay2D();
    return;
  }

  function loadScriptOnce(src,id){
    return new Promise((resolve,reject)=>{
      if(document.getElementById(id) || window.THREE) return resolve();
      const s=document.createElement('script');
      s.id=id; s.src=src; s.async=true; s.onload=()=>resolve(); s.onerror=reject;
      document.head.appendChild(s);
    });
  }

  function createCanvas(afterEl){
    const canvas=document.createElement('canvas');
    canvas.className='hero-3d-canvas';
    afterEl.insertAdjacentElement('afterend', canvas);
    return canvas;
  }

  function createTypingOverlay2D(){
    // Remove any previous fallback canvas
    document.querySelector('.hero-code-fallback')?.remove();
    document.querySelector('.hero-3d-canvas')?.remove();
    // Create overlay canvas styled like hero image
    const c=document.createElement('canvas');
    c.className='hero-live-code';
    img.insertAdjacentElement('afterend', c);
    const g=c.getContext('2d');
    // Load the base photo so we draw code over the actual image
    const baseImg=new Image(); baseImg.crossOrigin='anonymous'; baseImg.src=img.src;
    let photoReady=false; baseImg.onload=()=>{ photoReady=true; draw(); };
    const code=[
      "import 'package:flutter/material.dart';",
      '',
      'void main() => runApp(const MyApp());',
      '',
      'class MyApp extends StatelessWidget {',
      '  const MyApp({super.key});',
      '  @override',
      '  Widget build(BuildContext context) {',
      "    return MaterialApp(",
      "      theme: ThemeData(colorSchemeSeed: Colors.cyan),",
      "      home: const HomePage(),",
      '    );',
      '  }',
      '}',
      '',
      'class HomePage extends StatefulWidget {',
      '  const HomePage({super.key});',
      '  @override State<HomePage> createState() => _HomePageState();',
      '}',
      '',
      'class _HomePageState extends State<HomePage> {',
      '  int counter = 0;',
      '  @override',
      '  Widget build(BuildContext context) {',
      "    return Scaffold(",
      "      appBar: AppBar(title: const Text('Proyecto JK')),",
      "      body: Center(child: Text('Clicks: \\${counter}',",
      "        style: const TextStyle(fontSize: 24))),",
      "      floatingActionButton: FloatingActionButton(",
      "        onPressed: () => setState(() => counter++),",
      "        child: const Icon(Icons.add),",
      '      ),',
      '    );',
      '  }',
      '}',
    ];
    const syntax={kw:'#80e9ff', type:'#ffd67a', str:'#a0ffcc', id:'#d6f2ff', ann:'#ff79d1', num:'#b3e5ff'};
    // Line-by-line typing
    let iLine=0, blink=0;
    let lastStep=0; const perLineDelayMs=600; // delay between lines
    let waitingUntil=0;

    function resize(){
      const rect=c.getBoundingClientRect();
      const w=Math.max(300, Math.round(img.clientWidth||rect.width||800));
      const h=Math.round(w*0.56);
      c.width=w; c.height=h;
      draw();
    }
    window.addEventListener('resize', resize);

    function draw(){
      // Draw the base image (cover)
      if(photoReady){
        const cw=c.width, ch=c.height; const iw=baseImg.naturalWidth||1600, ih=baseImg.naturalHeight||900;
        const cr=cw/ch, ir=iw/ih; let dw=cw, dh=cw/ir;
        if(dh<ch){ dh=ch; dw=ch*ir; }
        const dx=(cw-dw)/2, dy=(ch-dh)/2;
        g.drawImage(baseImg, dx, dy, dw, dh);
      } else {
        // Fallback gradient until photo loads
        const bg=g.createLinearGradient(0,0,0,c.height);
        bg.addColorStop(0,'#0b1e33'); bg.addColorStop(1,'#0f2c4f');
        g.fillStyle=bg; g.fillRect(0,0,c.width,c.height);
      }
      // Dark glaze for readability
      g.fillStyle='rgba(3,10,18,0.60)';
      g.fillRect(0,0,c.width,c.height);
      // Editor chrome: top bar and tab
      const radius=18;
      g.fillStyle='rgba(8,16,28,0.65)';
      g.beginPath();
      g.moveTo(20+radius, 20);
      g.lineTo(c.width-20-radius, 20);
      g.quadraticCurveTo(c.width-20,20,c.width-20,20+radius);
      g.lineTo(c.width-20, 72);
      g.lineTo(20, 72);
      g.lineTo(20, 20+radius);
      g.quadraticCurveTo(20,20,20+radius,20);
      g.closePath();
      g.fill();
      // traffic lights
      const cx=40, cy=46; const r=6;
      g.fillStyle='#ff5f57'; g.beginPath(); g.arc(cx,cy,r,0,Math.PI*2); g.fill();
      g.fillStyle='#febc2e'; g.beginPath(); g.arc(cx+18,cy,r,0,Math.PI*2); g.fill();
      g.fillStyle='#28c840'; g.beginPath(); g.arc(cx+36,cy,r,0,Math.PI*2); g.fill();
      // tab
      g.fillStyle='rgba(19,185,253,0.15)';
      g.fillRect(110,30,160,30);
      g.fillStyle='#bfe8ff'; g.font='14px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
      g.textBaseline='middle'; g.fillText('main.dart', 120, 45);

      // Subtle grid (lighter and spaced)
      g.fillStyle='rgba(255,255,255,0.03)';
      for(let x=0;x<c.width;x+=20){ g.fillRect(x,0,1,c.height); }
      for(let y=0;y<c.height;y+=20){ g.fillRect(0,y,c.width,1); }
      // Gutter
      g.fillStyle='rgba(19,185,253,0.22)'; g.fillRect(40,40,4,c.height-80);
      // Code
      g.font='24px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
      g.textBaseline='top'; g.shadowBlur=12; g.shadowColor='rgba(19,185,253,0.35)';
      const x0=70; let y=50;
      for(let r=0;r<code.length;r++){
        const full=code[r];
        // line-by-line: show full lines below current, hide current until reveal
        const vis = r<iLine ? full : '';
        let color=syntax.id;
        if(/^(class|extends|with|return|void|const|final|import|package|new|override|int|State|Widget|build)$/.test(vis.trim().split(/\s+/)[0]||'')) color=syntax.kw;
        if(/'(?:[^']*)'|"(?:[^"]*)"/.test(vis)) color=syntax.str;
        if(/\b\d+\b/.test(vis)) color=syntax.num;
        if(/@\w+/.test(vis)) color=syntax.ann;
        if(/\b(MyApp|HomePage|_HomePageState|BuildContext|Scaffold|AppBar|Text|StatefulWidget|StatelessWidget)\b/.test(vis)) color=syntax.type;
        g.fillStyle=color; g.fillText(vis, x0, y);
        if(r===iLine){
          // cursor at start of next line to indicate incoming line
          const cursorX=x0+4;
          if((blink++%30)<20){ g.fillStyle='#bfe8ff'; g.fillRect(cursorX, y, 10, 22); }
        }
        y+=34;
      }
    }
    function tick(ts){
      if(!ts) ts=performance.now();
      // wait between lines
      if(ts < waitingUntil){ draw(); requestAnimationFrame(tick); return; }
      if(ts - lastStep >= perLineDelayMs){
        lastStep = ts; iLine++;
        if(iLine>code.length){ iLine=0; waitingUntil = ts + perLineDelayMs*2; }
        draw();
      } else { draw(); }
      requestAnimationFrame(tick);
    }
    resize();
    requestAnimationFrame(tick);
  }

  function startCodeRainFallback(){
    // Creates a matrix-style code rain over the hero image as a visible fallback
    const c=document.createElement('canvas');
    c.className='hero-code-fallback';
    img.insertAdjacentElement('afterend', c);
    const ctx=c.getContext('2d');
    const chars='01{}<>[]=+*-/constlet()=>';
    let columns=[], fontSize=16;
    function resize(){
      const rect=c.getBoundingClientRect();
      c.width=Math.max(300, Math.round(rect.width||img.clientWidth||800));
      c.height=Math.round(c.width*0.56);
      fontSize=Math.max(14, Math.round(c.width/60));
      columns=new Array(Math.floor(c.width/fontSize)).fill(0).map(()=>Math.random()*c.height);
    }
    window.addEventListener('resize', resize);
    resize();
    function tick(){
      ctx.fillStyle='rgba(10,20,35,0.25)';
      ctx.fillRect(0,0,c.width,c.height);
      ctx.fillStyle='#79e9ff';
      ctx.shadowColor='rgba(19,185,253,0.6)'; ctx.shadowBlur=8;
      ctx.font=`bold ${fontSize}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
      for(let i=0;i<columns.length;i++){
        const ch=chars[Math.floor(Math.random()*chars.length)];
        ctx.fillText(ch, i*fontSize, columns[i]);
        columns[i] += fontSize*(0.8+Math.random()*0.6);
        if(columns[i] > c.height + 50) columns[i] = -Math.random()*200;
      }
      requestAnimationFrame(tick);
    }
    tick();
  }

  async function init(){
    try{ await loadScriptOnce('https://unpkg.com/three@0.158.0/build/three.min.js','three-cdn'); }
    catch{ startCodeRainFallback(); return; }
    const THREE=window.THREE; if(!THREE){ startCodeRainFallback(); return; }

    const canvas=createCanvas(img);

    const renderer=new THREE.WebGLRenderer({canvas, antialias:true, alpha:true, powerPreference:'low-power'});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, 1.8));
    renderer.setClearColor(0x000000, 0);

    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(45, 16/9, 0.1, 100);
    camera.position.set(0,0,3.2);

    const amb=new THREE.AmbientLight(0xffffff, 0.9);
    const dir=new THREE.DirectionalLight(0x7c3aed, 0.35); dir.position.set(1,1,1);
    scene.add(amb,dir);

    function makeTypingTexture(){
      const w=1024, h=640;
      const c=document.createElement('canvas'); c.width=w; c.height=h;
      const g=c.getContext('2d');
      const bgGrad=g.createLinearGradient(0,0,0,h);
      bgGrad.addColorStop(0,'#0b1e33'); bgGrad.addColorStop(1,'#0f2c4f');
      const code = [
        "import 'package:flutter/material.dart';",
        '',
        'void main() => runApp(const MyApp());',
        '',
        'class MyApp extends StatelessWidget {',
        '  const MyApp({super.key});',
        '  @override',
        '  Widget build(BuildContext context) {',
        "    return MaterialApp(",
        "      theme: ThemeData(colorSchemeSeed: Colors.cyan),",
        "      home: const HomePage(),",
        '    );',
        '  }',
        '}',
        '',
        'class HomePage extends StatefulWidget {',
        '  const HomePage({super.key});',
        '  @override State<HomePage> createState() => _HomePageState();',
        '}',
        '',
        'class _HomePageState extends State<HomePage> {',
        '  int counter = 0;',
        '  @override',
        '  Widget build(BuildContext context) {',
        "    return Scaffold(",
        "      appBar: AppBar(title: const Text('Proyecto JK')),",
        "      body: Center(child: Text('Clicks: \$counter',",
        "        style: const TextStyle(fontSize: 24))),",
        "      floatingActionButton: FloatingActionButton(",
        "        onPressed: () => setState(() => counter++),",
        "        child: const Icon(Icons.add),",
        '      ),',
        '    );',
        '  }',
        '}',
      ];
      const syntax = {
        kw: '#80e9ff', // keywords
        type: '#ffd67a',
        str: '#a0ffcc',
        id: '#d6f2ff',
        ann: '#ff79d1',
        num: '#b3e5ff'
      };
      const tex=new THREE.CanvasTexture(c); tex.anisotropy=4; tex.needsUpdate=true;
      let iLine=0, iChar=0, blink=0;
      function draw(){
        // background
        g.fillStyle=bgGrad; g.fillRect(0,0,w,h);
        // line number gutter
        g.fillStyle='rgba(19,185,253,0.18)'; g.fillRect(40,40,4,h-80);
        g.font='24px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
        g.textBaseline='top'; g.shadowBlur=12; g.shadowColor='rgba(19,185,253,0.35)';
        const x0=70; let y=50;
        for(let r=0;r<code.length;r++){
          const full=code[r];
          const visible = r<iLine ? full : full.slice(0, iChar);
          // simple syntax tint
          let color=syntax.id;
          if(/^(class|extends|with|return|void|const|final|import|package|new|override|int|State|Widget|build)$/.test(visible.trim().split(/\s+/)[0]||'')) color=syntax.kw;
          if(/'(?:[^']*)'|"(?:[^"]*)"/.test(visible)) color=syntax.str;
          if(/\b\d+\b/.test(visible)) color=syntax.num;
          if(/@\w+/.test(visible)) color=syntax.ann;
          if(/\b(MyApp|HomePage|_HomePageState|BuildContext|Scaffold|AppBar|Text|StatefulWidget|StatelessWidget)\b/.test(visible)) color=syntax.type;
          g.fillStyle=color; g.fillText(visible, x0, y);
          if(r===iLine){
            const cursorX = x0 + g.measureText(visible).width + 2;
            if((blink++ % 30)<20){ g.fillStyle='#bfe8ff'; g.fillRect(cursorX, y, 10, 22); }
          }
          y+=34;
        }
        tex.needsUpdate=true;
      }
      function tick(){
        iChar++;
        const current = code[iLine];
        if(iChar>current.length){ iLine++; iChar=0; }
        if(iLine>=code.length){ iLine=0; iChar=0; }
        draw();
      }
      // initial frame
      draw();
      return { texture: tex, tick };
    }

    const chassis=new THREE.Group();
    scene.add(chassis);

    const baseGeo=new THREE.BoxGeometry(1.8,0.06,1.2);
    const baseMat=new THREE.MeshStandardMaterial({color:0x1a2b40, metalness:0.7, roughness:0.4});
    const base=new THREE.Mesh(baseGeo, baseMat);
    base.position.set(0,-0.28,0);
    chassis.add(base);

    const kbCols=12, kbRows=5;
    const keyGeo=new THREE.BoxGeometry(0.10,0.02,0.10);
    const keyMat=new THREE.MeshStandardMaterial({color:0x223a57, metalness:0.4, roughness:0.5, emissive:0x0b1e33, emissiveIntensity:0.2});
    const keys=new THREE.InstancedMesh(keyGeo,keyMat,kbCols*kbRows);
    let i=0; for(let r=0;r<kbRows;r++){ for(let c=0;c<kbCols;c++){
      const m=new THREE.Matrix4();
      const x=-0.55 + c*(0.10+0.02);
      const z= 0.25 - r*(0.10+0.03);
      m.makeTranslation(x,-0.25,z);
      keys.setMatrixAt(i++, m);
    }}
    chassis.add(keys);

    const pad=new THREE.Mesh(new THREE.BoxGeometry(0.36,0.01,0.26), new THREE.MeshStandardMaterial({color:0x1f3652, metalness:0.3, roughness:0.6}));
    pad.position.set(0,-0.265,0.38);
    chassis.add(pad);

    const screenGroup=new THREE.Group();
    const hingeY=-0.28; const hingeZ=-0.58;
    screenGroup.position.set(0,hingeY,hingeZ);
    screenGroup.rotation.x = Math.PI*0.9;
    chassis.add(screenGroup);

    const frame=new THREE.Mesh(new THREE.BoxGeometry(1.82,1.08,0.04), new THREE.MeshStandardMaterial({color:0x182a40, metalness:0.6, roughness:0.5}));
    frame.position.set(0,0,0);
    screenGroup.add(frame);

    const typing=makeTypingTexture();
    const scrMat=new THREE.MeshStandardMaterial({map:typing.texture, emissive:0x0f6aa0, emissiveIntensity:0.35, roughness:0.85});
    const scr=new THREE.Mesh(new THREE.PlaneGeometry(1.62,0.98, 8,5), scrMat);
    scr.position.set(0,0,0.022);
    screenGroup.add(scr);

    // Glyph burst system (sprites)
    const raycaster=new THREE.Raycaster();
    const ndc=new THREE.Vector2();
    const glyphChars=['{','}','<','>',';','=', 'const','let','()','[]','=>'];
    const glyphTextures=new Map();
    function makeGlyphTexture(label){
      if(glyphTextures.has(label)) return glyphTextures.get(label);
      const c=document.createElement('canvas'); c.width=256; c.height=128;
      const g=c.getContext('2d');
      const grad=g.createLinearGradient(0,0,c.width,0); grad.addColorStop(0,'#79e9ff'); grad.addColorStop(1,'#b3e5ff');
      g.fillStyle='rgba(12,24,40,0)'; g.fillRect(0,0,c.width,c.height);
      g.shadowColor='rgba(19,185,253,0.6)'; g.shadowBlur=14; g.fillStyle=grad;
      g.font='bold 72px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'; g.textAlign='center'; g.textBaseline='middle';
      g.fillText(label, c.width/2, c.height/2);
      const tex=new THREE.CanvasTexture(c); tex.needsUpdate=true; tex.anisotropy=4; glyphTextures.set(label, tex); return tex;
    }
    const glyphs=[]; const maxGlyphs=140;
    function spawnGlyph(worldPoint){
      const label=glyphChars[Math.floor(Math.random()*glyphChars.length)];
      const mat=new THREE.SpriteMaterial({map:makeGlyphTexture(label), transparent:true, opacity:0.0, depthWrite:false});
      const sp=new THREE.Sprite(mat);
      sp.position.copy(worldPoint.clone().add(new THREE.Vector3(0,0,0.01)));
      const s=0.08+Math.random()*0.06; sp.scale.setScalar(s);
      sp.userData={life:1.0, vel:new THREE.Vector3(0,0,0.9+Math.random()*0.6)};
      scene.add(sp); glyphs.push(sp);
      if(glyphs.length>maxGlyphs){ const old=glyphs.shift(); old.parent?.remove(old); old.material.map?.dispose(); old.material.dispose(); }
    }

    let targetX=0,targetY=0,cx=0,cy=0,t=0;
    function resize(){
      const rect=canvas.getBoundingClientRect();
      const w=Math.max(300, Math.round(rect.width));
      const h=Math.max(200, Math.round(w*0.56));
      renderer.setSize(w,h,false);
      camera.aspect=w/h; camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', resize);
    let hovering=false; 
    canvas.addEventListener('pointerenter', ()=>{ hovering=true; }, {passive:true});
    canvas.addEventListener('pointerleave', ()=>{ hovering=false; }, {passive:true});
    window.addEventListener('pointermove', (e)=>{
      const rect=canvas.getBoundingClientRect();
      const nx=((e.clientX-rect.left)/rect.width)*2-1;
      const ny=((e.clientY-rect.top)/rect.height)*2-1;
      targetX=nx*0.6; targetY=ny*0.4;
      if(!hovering) return;
      ndc.set(nx, -ny);
      raycaster.setFromCamera(ndc, camera);
      const hit=raycaster.intersectObject(scr, false)[0];
      if(hit){
        // spawn more glyphs to make the effect obvious
        for(let k=0;k<5;k++) spawnGlyph(hit.point);
      }
    }, {passive:true});

    function animate(){
      t+=0.01;
      cx += (targetX-cx)*0.06;
      cy += (targetY-cy)*0.06;
      chassis.rotation.y = cx*0.6;
      chassis.rotation.x = -cy*0.4;
      screenGroup.rotation.x = Math.PI*0.9 + Math.sin(t*0.2)*0.02;
      scrMat.emissiveIntensity = 0.32 + Math.sin(t*0.8)*0.06;
      // advance typing every few frames
      if((Math.floor(t*60) % 2)===0){ typing.tick(); }
      // update glyphs
      for(let i=glyphs.length-1;i>=0;i--){
        const sp=glyphs[i];
        sp.userData.life -= 0.02;
        sp.material.opacity = Math.max(0, Math.min(1, 1.2*sp.userData.life));
        sp.position.addScaledVector(camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(-1), -sp.userData.vel.z*0.01);
        sp.position.y += (cy*0.02);
        const scale=sp.scale.x*(1+0.01);
        sp.scale.setScalar(scale);
        if(sp.userData.life<=0){
          sp.parent?.remove(sp); sp.material.map?.dispose(); sp.material.dispose(); glyphs.splice(i,1);
        }
      }
      renderer.render(scene,camera);
      requestAnimationFrame(animate);
    }
    // 3D successfully initialized; hide original image
    img.style.display='none';
    resize();
    animate();
  }

  if(document.readyState === 'complete' || document.readyState === 'interactive'){
    setTimeout(init, 0);
  } else {
    window.addEventListener('DOMContentLoaded', ()=>setTimeout(init,0));
  }
})();

// Reveal on scroll
(()=>{
  const io = ('IntersectionObserver' in window) ? new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add('reveal-in');
        io.unobserve(e.target);
      }
    });
  },{threshold:0.12}) : null;
  const toReveal=[...document.querySelectorAll('.card,.work-item,.price,.testimonials blockquote,.stack span,.faq-item,.form, .page-hero h1, .page-hero .chips, .page-hero p')];
  toReveal.forEach(el=>{
    el.classList.add('reveal');
    if(io) io.observe(el); else el.classList.add('reveal-in');
  });
})();
if(toggle&&menu){toggle.addEventListener('click',()=>{
  const open=menu.classList.toggle('open');
  toggle.setAttribute('aria-expanded',open? 'true':'false');
});}
const links=[...document.querySelectorAll('a[href^="#"]')];
links.forEach(l=>l.addEventListener('click',e=>{
  const id=l.getAttribute('href');
  if(id&&id.length>1){
    const target=document.querySelector(id);
    if(target){
      e.preventDefault();
      const top=target.getBoundingClientRect().top+window.scrollY-70;
      window.scrollTo({top,behavior:'smooth'});
      menu?.classList.remove('open');
      toggle?.setAttribute('aria-expanded','false');
    }
  }
}));
// Toast helper
function ensureToastWrap(){
  let wrap=document.querySelector('.toast-wrap');
  if(!wrap){
    wrap=document.createElement('div');
    wrap.className='toast-wrap';
    document.body.appendChild(wrap);
  }
  return wrap;
}
function showToast(message){
  const wrap=ensureToastWrap();
  const el=document.createElement('div');
  el.className='toast';
  el.textContent=message;
  wrap.appendChild(el);
  // trigger transition
  requestAnimationFrame(()=>el.classList.add('show'));
  setTimeout(()=>{
    el.classList.remove('show');
    setTimeout(()=>el.remove(),250);
  },3000);
}

const form=document.getElementById('contact-form');
if(form){
  const setError=(input,msg)=>{
    input.classList.add('error');
    let err=input.nextElementSibling;
    if(!(err&&err.classList?.contains('field-error'))){
      err=document.createElement('div');
      err.className='field-error';
      input.parentNode.insertBefore(err,input.nextSibling);
    }
    err.textContent=msg;
  };
  const clearError=(input)=>{
    input.classList.remove('error');
    const err=input.nextElementSibling;
    if(err&&err.classList?.contains('field-error')) err.remove();
  };
  form.addEventListener('submit',e=>{
    e.preventDefault();
    const nombre=form.querySelector('input[name="nombre"]');
    const email=form.querySelector('input[name="email"]');
    const mensaje=form.querySelector('textarea[name="mensaje"]');
    [nombre,email,mensaje].forEach(clearError);
    let ok=true;
    if(!nombre.value.trim()){setError(nombre,'Ingresa tu nombre'); ok=false;}
    const mail=email.value.trim();
    const re=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    if(!mail||!re.test(mail)){setError(email,'Email inválido'); ok=false;}
    if(!mensaje.value.trim()){setError(mensaje,'Cuéntanos tu idea'); ok=false;}
    if(!ok){showToast('Revisa los campos resaltados'); return;}
    showToast(`Gracias ${nombre.value||''}! Te contactaremos pronto.`);
    form.reset();
  });
}
// FAQs accordion
const faqButtons=[...document.querySelectorAll('.faq-q')];
if(faqButtons.length){
  faqButtons.forEach(btn=>{
    btn.addEventListener('click',()=>{
      const item=btn.closest('.faq-item');
      const open=item?.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(i=>{
        i.classList.remove('open');
        const q=i.querySelector('.faq-q');
        q?.setAttribute('aria-expanded','false');
      });
      if(!open){
        item?.classList.add('open');
        btn.setAttribute('aria-expanded','true');
      } else {
        btn.setAttribute('aria-expanded','false');
      }
    });
  });
}
