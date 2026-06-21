import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { Terminal, LayoutTemplate } from 'lucide-react';

export default function App() {
  const containerRef = useRef(null);
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const requestRef = useRef(null);
  const mouseRef = useRef(new THREE.Vector2(-999, -999));
  const smoothMouseRef = useRef(new THREE.Vector2(0, 0));
  const [isTerminalMode, setIsTerminalMode] = useState(false);
  const isTerminalModeRef = useRef(false);

  useEffect(() => {
    isTerminalModeRef.current = isTerminalMode;
  }, [isTerminalMode]);

  useEffect(() => {
    if (!containerRef.current) return;

    // --- 1. SETUP SCENE, CAMERA, RENDERER ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(0, 0, 100);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);

    // --- 2. SCREEN DIMENSIONS AT Z=0 ---
    const vFov = (camera.fov * Math.PI) / 180;
    const height = 2 * Math.tan(vFov / 2) * camera.position.z;
    const width = height * camera.aspect;

    // --- 3. GENERATE UI TEXTURE ---
    let texture;
    const generateTexture = () => {
      const texCanvas = document.createElement('canvas');
      const dpr = Math.min(window.devicePixelRatio, 2);
      texCanvas.width = window.innerWidth * dpr;
      texCanvas.height = window.innerHeight * dpr;
      const ctx = texCanvas.getContext('2d');
      ctx.scale(dpr, dpr);

      // Light gray background
      ctx.fillStyle = '#f4f4f5';
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      // Top-left: Playground
      ctx.fillStyle = '#9ca3af';
      ctx.font = '12px "Inter", -apple-system, sans-serif';
      ctx.fillText('Playground', 40, 40);

      // Top-right: version dot
      ctx.textAlign = 'right';
      ctx.fillStyle = '#111827';
      ctx.beginPath();
      ctx.arc(window.innerWidth - 55, 36, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#9ca3af';
      ctx.font = '12px "Inter", sans-serif';
      ctx.fillText('Aeris  v2.1', window.innerWidth - 40, 40);
      ctx.textAlign = 'left';

      // Label
      ctx.fillStyle = '#9ca3af';
      ctx.font = '11px "Inter", sans-serif';
      ctx.letterSpacing = '2px';
      ctx.fillText('SOFT INTELLIGENCE LAYER', 100, 160);

      // Title
      ctx.fillStyle = '#111827';
      ctx.font = 'bold 80px "Inter", -apple-system, sans-serif';
      ctx.fillText('Aeris Field', 100, 220);

      // Subtitle
      ctx.fillStyle = '#4b5563';
      ctx.font = '20px "Inter", -apple-system, sans-serif';
      ctx.fillText('A quiet interface for shaping model behavior, policy, and', 100, 270);
      ctx.fillText('memory into one continuous surface.', 100, 300);

      // Black pill button: "I'm an agent →"
      const btnX = 100, btnY = 340, btnW = 140, btnH = 40, btnR = 20;
      ctx.fillStyle = '#111827';
      ctx.beginPath();
      ctx.moveTo(btnX + btnR, btnY);
      ctx.lineTo(btnX + btnW - btnR, btnY);
      ctx.quadraticCurveTo(btnX + btnW, btnY, btnX + btnW, btnY + btnR);
      ctx.lineTo(btnX + btnW, btnY + btnH - btnR);
      ctx.quadraticCurveTo(btnX + btnW, btnY + btnH, btnX + btnW - btnR, btnY + btnH);
      ctx.lineTo(btnX + btnR, btnY + btnH);
      ctx.quadraticCurveTo(btnX, btnY + btnH, btnX, btnY + btnH - btnR);
      ctx.lineTo(btnX, btnY + btnR);
      ctx.quadraticCurveTo(btnX, btnY, btnX + btnR, btnY);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '13px sans-serif';
      ctx.fillText("I'm an agent →", 120, 365);

      // Small helper text under button
      ctx.fillStyle = '#9ca3af';
      ctx.font = '11px "Inter", sans-serif';
      ctx.fillText('Three.js  •  Instanced canvas', 260, 365);

      // Grid
      const segmentsX = 24;
      const segmentsY = 16;
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.06)';
      ctx.lineWidth = 1;
      const stepX = window.innerWidth / segmentsX;
      const stepY = window.innerHeight / segmentsY;

      for (let i = 0; i <= segmentsX; i++) {
        ctx.beginPath();
        ctx.moveTo(i * stepX, 0);
        ctx.lineTo(i * stepX, window.innerHeight);
        ctx.stroke();
      }
      for (let i = 0; i <= segmentsY; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * stepY);
        ctx.lineTo(window.innerWidth, i * stepY);
        ctx.stroke();
      }

      // Bottom-left badge area (from image)
      ctx.fillStyle = '#111827';
      ctx.beginPath();
      ctx.roundRect(40, window.innerHeight - 90, 90, 36, 6);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText('NEED', 52, window.innerHeight - 72);
      ctx.fillStyle = '#f97316';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('SOMETHING', 52, window.innerHeight - 58);
      ctx.fillStyle = '#f97316';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('FUN?', 110, window.innerHeight - 58);

      // Bottom-right text
      ctx.textAlign = 'right';
      ctx.fillStyle = '#9ca3af';
      ctx.font = '11px "Inter", sans-serif';
      ctx.fillText('Docs  •  Changelog', window.innerWidth - 40, window.innerHeight - 40);
      ctx.textAlign = 'left';

      const newTexture = new THREE.CanvasTexture(texCanvas);
      newTexture.minFilter = THREE.LinearFilter;
      newTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      return newTexture;
    };

    texture = generateTexture();

    // --- 4. ROUNDED INSTANCED GEOMETRY ---
    const segmentsX = 24;
    const segmentsY = 16;
    const boxWidth = width / segmentsX;
    const boxHeight = height / segmentsY;
    const boxDepth = 10;

    // RoundedBoxGeometry gives that soft "routed" / molded look
    const radius = Math.min(boxWidth, boxHeight) * 0.12; // slight rounding
    const smoothness = 4;
    const geometry = new RoundedBoxGeometry(boxWidth, boxHeight, boxDepth, smoothness, radius);

    const count = segmentsX * segmentsY;
    const basePositions = new Float32Array(count * 3);
    const randoms = new Float32Array(count);

    let idx = 0;
    const startX = -width / 2 + boxWidth / 2;
    const startY = height / 2 - boxHeight / 2;

    for (let y = 0; y < segmentsY; y++) {
      for (let x = 0; x < segmentsX; x++) {
        basePositions[idx * 3 + 0] = startX + x * boxWidth;
        basePositions[idx * 3 + 1] = startY - y * boxHeight;
        basePositions[idx * 3 + 2] = 0;
        randoms[idx] = Math.random();
        idx++;
      }
    }

    geometry.setAttribute('aBasePos', new THREE.InstancedBufferAttribute(basePositions, 3));
    geometry.setAttribute('aRandom', new THREE.InstancedBufferAttribute(randoms, 1));

    // --- 5. SHADER MATERIAL ---
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uProgress: { value: 0 },
        tDiffuse: { value: texture },
        uMouse: { value: mouseRef.current },
        uScreenSize: { value: new THREE.Vector2(width, height) },
        uCameraPos: { value: camera.position }
      },
      vertexShader: `
        uniform float uProgress;
        uniform vec2 uMouse;
        uniform vec2 uScreenSize;
        
        attribute vec3 aBasePos;
        attribute float aRandom;
        
        varying vec2 vGlobalUv;
        varying vec3 vLocalNormal;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPos;
        varying vec3 vLocalPos;

        mat4 rotationMatrix(vec3 axis, float angle) {
            axis = normalize(axis);
            float s = sin(angle);
            float c = cos(angle);
            float oc = 1.0 - c;
            return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                        oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                        oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                        0.0,                                0.0,                                0.0,                                1.0);
        }

        void main() {
            vLocalNormal = normal;
            vWorldNormal = normalize(normalMatrix * normal);
            vLocalPos = position;
            
            vec3 localPos = position;
            vec3 instPos = aBasePos;

            vec2 globalXY = instPos.xy + localPos.xy;
            vGlobalUv = vec2(globalXY.x / uScreenSize.x + 0.5, globalXY.y / uScreenSize.y + 0.5);

            // --- HOVER EFFECT ---
            vec2 centerNDC = vec2(instPos.x / (uScreenSize.x / 2.0), instPos.y / (uScreenSize.y / 2.0));
            float aspect = uScreenSize.x / uScreenSize.y;
            vec2 aspectMouse = uMouse * vec2(aspect, 1.0);
            vec2 aspectCenter = centerNDC * vec2(aspect, 1.0);
            
            float dist = distance(aspectCenter, aspectMouse);
            float hoverIntensity = smoothstep(0.5, 0.0, dist);

            if (uProgress < 0.05 && uMouse.x > -2.0) {
                instPos.z += hoverIntensity * 20.0; 
                
                vec2 dir = centerNDC - uMouse;
                if (length(dir) > 0.001) {
                    dir = normalize(dir);
                    vec3 hoverAxis = normalize(vec3(-dir.y, dir.x, 0.0));
                    mat4 hoverRot = rotationMatrix(hoverAxis, hoverIntensity * 0.8);
                    localPos = (hoverRot * vec4(localPos, 1.0)).xyz;
                    vWorldNormal = (hoverRot * vec4(vWorldNormal, 0.0)).xyz;
                }
            }

            // --- SCROLL ANIMATION: TWO PHASES ---
            float phase1 = smoothstep(0.0, 0.35, uProgress);
            float phase2 = smoothstep(0.35, 1.0, uProgress);

            float shrink = 1.0 - (phase1 * 0.3);
            localPos *= shrink;
            instPos.z += phase1 * 40.0;

            if (phase2 > 0.0) {
                float delay = aRandom * 0.3;
                float explProgress = clamp((phase2 - delay) / 0.7, 0.0, 1.0);
                float ease = explProgress * explProgress * explProgress;

                vec3 axis = normalize(vec3(aRandom * 2.0 - 1.0, (1.0 - aRandom) * 2.0 - 1.0, aRandom));
                float angle = ease * aRandom * 15.0;
                
                mat4 rot = rotationMatrix(axis, angle);
                localPos = (rot * vec4(localPos, 1.0)).xyz;
                vWorldNormal = (rot * vec4(vWorldNormal, 0.0)).xyz;

                vec2 explDir = normalize(instPos.xy);
                instPos.x += explDir.x * ease * 60.0 * aRandom;
                instPos.y += explDir.y * ease * 60.0 * aRandom;
                instPos.z += ease * 100.0;
                instPos.y -= ease * ease * 400.0; 
            }

            vec4 finalPos = vec4(instPos + localPos, 1.0);
            vWorldPos = (modelMatrix * finalPos).xyz;
            gl_Position = projectionMatrix * viewMatrix * finalPos;
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform vec3 uCameraPos;
        
        varying vec2 vGlobalUv;
        varying vec3 vLocalNormal;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPos;
        varying vec3 vLocalPos;

        void main() {
            vec4 texColor = texture2D(tDiffuse, vGlobalUv);
            vec3 frontColor = texColor.rgb;
            
            float isFront = step(0.5, vLocalNormal.z);
            
            vec3 sideBaseColor = vec3(0.10, 0.11, 0.13); 
            float depthShadow = smoothstep(5.0, -5.0, vLocalPos.z);
            vec3 sideColor = sideBaseColor * mix(1.0, 0.25, depthShadow);

            vec3 color = mix(sideColor, frontColor, isFront);

            vec3 normal = normalize(vWorldNormal);
            vec3 lightDir = normalize(vec3(0.5, 0.8, 1.0));
            vec3 viewDir = normalize(uCameraPos - vWorldPos);
            
            float ambient = 0.55;
            float diff = max(dot(normal, lightDir), 0.0);
            
            vec3 reflectDir = reflect(-lightDir, normal);
            float specAmount = pow(max(dot(viewDir, reflectDir), 0.0), 48.0);
            float spec = specAmount * mix(0.15, 0.5, isFront); 

            vec3 finalColor = color * (ambient + diff * 0.45) + vec3(spec);

            if (vLocalNormal.z <= 0.5) {
                finalColor *= max(0.55, dot(normal, vec3(0.0, 1.0, 0.0)) * 0.5 + 0.5);
            }

            gl_FragColor = vec4(finalColor, 1.0);
        }
      `
    });

    const mesh = new THREE.InstancedMesh(geometry, material, count);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      mesh.setMatrixAt(i, dummy.matrix);
    }
    scene.add(mesh);

    // --- 6. ANIMATION LOOP ---
    const animate = () => {
      currentProgressRef.current += (targetProgressRef.current - currentProgressRef.current) * 0.04;
      material.uniforms.uProgress.value = currentProgressRef.current;
      material.uniforms.uMouse.value.lerp(mouseRef.current, 0.1);

      if (currentProgressRef.current < 0.1) {
        smoothMouseRef.current.lerp(mouseRef.current, 0.05);
        camera.position.x = smoothMouseRef.current.x * 3.0;
        camera.position.y = smoothMouseRef.current.y * 3.0;
        camera.lookAt(scene.position);
        material.uniforms.uCameraPos.value.copy(camera.position);
      } else {
        camera.position.lerp(new THREE.Vector3(0, 0, 100), 0.05);
        camera.lookAt(scene.position);
        material.uniforms.uCameraPos.value.copy(camera.position);
      }

      renderer.render(scene, camera);
      requestRef.current = requestAnimationFrame(animate);
    };
    animate();

    // --- 7. EVENTS ---
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);

      const vFov = (camera.fov * Math.PI) / 180;
      const h = 2 * Math.tan(vFov / 2) * 100;
      const w = h * camera.aspect;
      material.uniforms.uScreenSize.value.set(w, h);

      if (texture) texture.dispose();
      texture = generateTexture();
      material.uniforms.tDiffuse.value = texture;
    };

    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      mouseRef.current.set(x, y);
    };

    const handleWheel = (e) => {
      e.preventDefault();
      if (e.deltaY > 30) {
        targetProgressRef.current = 1.0;
        if (!isTerminalModeRef.current) setIsTerminalMode(true);
      } else if (e.deltaY < -30) {
        targetProgressRef.current = 0.0;
        if (isTerminalModeRef.current) setIsTerminalMode(false);
      }
    };

    const handleClick = () => {
      if (targetProgressRef.current < 0.5) {
        targetProgressRef.current = 1.0;
        setIsTerminalMode(true);
      } else {
        targetProgressRef.current = 0.0;
        setIsTerminalMode(false);
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('wheel', handleWheel, { passive: false });
    containerRef.current.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('wheel', handleWheel);
      if (containerRef.current) containerRef.current.removeEventListener('click', handleClick);
      cancelAnimationFrame(requestRef.current);
      if (containerRef.current) containerRef.current.innerHTML = '';
      geometry.dispose();
      material.dispose();
      if (texture) texture.dispose();
      renderer.dispose();
    };
  }, []);

  const toggleView = useCallback(() => {
    setIsTerminalMode(prev => {
      const next = !prev;
      targetProgressRef.current = next ? 1.0 : 0.0;
      return next;
    });
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black font-sans select-none">

      {/* BACKGROUND: Terminal */}
      <div className="absolute inset-0 z-0 bg-black text-green-500 font-mono p-10 flex flex-col justify-center">
        <div className="max-w-4xl opacity-90">
          <p className="mb-2 text-green-400">project: Aeris Field</p>
          <p className="mb-2 text-green-400">version: 2.3</p>
          <p className="mb-6 text-gray-400">summary: A seamless surface for shaping model behavior, policy, and routing.</p>

          <p className="mb-2 text-gray-500"># Source Application</p>
          <p className="mb-2 text-gray-300">name: "Aeris Field"</p>
          <p className="mb-2 text-gray-300">applicationCategory: "DeveloperTool"</p>
          <p className="mb-6 text-gray-300">offers.price: 0</p>

          <p className="mb-2 text-gray-500"># MCP Server</p>
          <p className="mb-2 text-gray-300">endpoint: https://aerisfield.com/mcp</p>
          <p className="mb-2 text-gray-300">transport: sse</p>
          <p className="mb-6 text-gray-300">tools: manage_policy, recall_memory, simulate_eval</p>

          <p className="mb-2 text-gray-500"># Available Actions</p>
          <p className="mb-6 text-gray-300">POST /actions/execute, returns -&gt; response.data</p>

          <div className="flex items-center gap-2 mt-8">
            <span className="text-white font-bold">Aeris Field - agent shell v2.1</span>
          </div>
          <p className="text-gray-500 mb-2">Type "help" for guidance, "exit" to leave.</p>
          <div className="flex items-center">
            <span className="text-blue-400 mr-2">agent@aerisfield:~$</span>
            <span className="w-2 h-5 bg-green-500 animate-pulse inline-block"></span>
          </div>
        </div>
      </div>

      {/* FOREGROUND: WebGL Canvas */}
      <div
        ref={containerRef}
        className={`absolute inset-0 z-10 ${isTerminalMode ? 'pointer-events-none' : ''}`}
      />

      {/* TOGGLE BUTTON */}
      <button
        onClick={toggleView}
        className="absolute bottom-10 left-10 z-30 flex items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-5 py-3 rounded-xl transition-all duration-300 shadow-xl cursor-pointer"
      >
        {isTerminalMode ? (
          <>
            <LayoutTemplate size={20} className="text-gray-200" />
            <span className="font-semibold tracking-wide text-sm">UI MODE</span>
          </>
        ) : (
          <>
            <Terminal size={20} className="text-green-400" />
            <span className="font-semibold tracking-wide text-sm">DEV MODE</span>
          </>
        )}
      </button>

    </div>
  );
}