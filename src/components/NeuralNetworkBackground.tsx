import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

export const NeuralNetworkBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const config = {
      paused: false,
      activePaletteIndex: 1,
      currentFormation: 0,
      numFormations: 4,
      densityFactor: 1
    };

    const colorPalettes = [
      [new THREE.Color(0x4F46E5), new THREE.Color(0x7C3AED), new THREE.Color(0xC026D3), new THREE.Color(0xDB2777), new THREE.Color(0x8B5CF6)],
      [new THREE.Color(0xF59E0B), new THREE.Color(0xF97316), new THREE.Color(0xDC2626), new THREE.Color(0x7F1D1D), new THREE.Color(0xFBBF24)],
      [new THREE.Color(0xEC4899), new THREE.Color(0x8B5CF6), new THREE.Color(0x6366F1), new THREE.Color(0x3B82F6), new THREE.Color(0xA855F7)],
      [new THREE.Color(0x10B981), new THREE.Color(0xA3E635), new THREE.Color(0xFACC15), new THREE.Color(0xFB923C), new THREE.Color(0x4ADE80)]
    ];

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.0015);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1200);
    camera.position.set(0, 5, 22);

    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    function createStarfield() {
      const count = 5000, pos = [];
      for (let i = 0; i < count; i++) {
        const r = THREE.MathUtils.randFloat(40, 120);
        const phi = Math.acos(THREE.MathUtils.randFloatSpread(2));
        const theta = THREE.MathUtils.randFloat(0, Math.PI * 2);
        pos.push(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi)
        );
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      const mat = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.15,
        sizeAttenuation: true,
        depthWrite: false,
        opacity: 0.8,
        transparent: true
      });
      return new THREE.Points(geo, mat);
    }
    const starField = createStarfield();
    scene.add(starField);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.5;
    controls.minDistance = 5;
    controls.maxDistance = 100;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.15;
    controls.enablePan = false;

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.68);
    composer.addPass(bloomPass);

    const filmPass = new FilmPass(0.35, 0.55, 2048, false);
    composer.addPass(filmPass);

    composer.addPass(new OutputPass());

    const pulseUniforms = {
      uTime: { value: 0.0 },
      uPulsePositions: { value: [new THREE.Vector3(1e3, 1e3, 1e3), new THREE.Vector3(1e3, 1e3, 1e3), new THREE.Vector3(1e3, 1e3, 1e3)] },
      uPulseTimes: { value: [-1e3, -1e3, -1e3] },
      uPulseColors: { value: [new THREE.Color(1, 1, 1), new THREE.Color(1, 1, 1), new THREE.Color(1, 1, 1)] },
      uPulseSpeed: { value: 15.0 },
      uBaseNodeSize: { value: 0.5 },
      uActivePalette: { value: 0 }
    };

    const noiseFunctions = `
    vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
    vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
    vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
    vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
    float snoise(vec3 v){
        const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);
        vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);vec3 g=step(x0.yzx,x0.xyz);
        vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
        vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;i=mod289(i);
        vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
        float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;
        vec4 j=p-49.0*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);
        vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);
        vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;
        vec4 sh=-step(h,vec4(0.0));vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
        vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
        vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
        p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
        m*=m;return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
    }
    float fbm(vec3 p,float time){
        float value=0.0;float amplitude=0.5;float frequency=1.0;int octaves=3;
        for(int i=0;i<octaves;i++){
            value+=amplitude*snoise(p*frequency+time*0.2*frequency);
            amplitude*=0.5;frequency*=2.0;
        }
        return value;
    }`;

    const nodeShader = {
      vertexShader: `${noiseFunctions}
      attribute float nodeSize;attribute float nodeType;attribute vec3 nodeColor;attribute vec3 connectionIndices;attribute float distanceFromRoot;
      uniform float uTime;uniform vec3 uPulsePositions[3];uniform float uPulseTimes[3];uniform float uPulseSpeed;uniform float uBaseNodeSize;
      varying vec3 vColor;varying float vNodeType;varying vec3 vPosition;varying float vPulseIntensity;varying float vDistanceFromRoot;

      float getPulseIntensity(vec3 worldPos, vec3 pulsePos, float pulseTime) {
          if (pulseTime < 0.0) return 0.0;
          float timeSinceClick = uTime - pulseTime;
          if (timeSinceClick < 0.0 || timeSinceClick > 3.0) return 0.0;

          float pulseRadius = timeSinceClick * uPulseSpeed;
          float distToClick = distance(worldPos, pulsePos);
          float pulseThickness = 2.0;
          float waveProximity = abs(distToClick - pulseRadius);

          return smoothstep(pulseThickness, 0.0, waveProximity) * smoothstep(3.0, 0.0, timeSinceClick);
      }

      void main() {
          vNodeType = nodeType;
          vColor = nodeColor;
          vDistanceFromRoot = distanceFromRoot;

          vec3 worldPos = (modelMatrix * vec4(position, 1.0)).xyz;
          vPosition = worldPos;

          float totalPulseIntensity = 0.0;
          for (int i = 0; i < 3; i++) {
              totalPulseIntensity += getPulseIntensity(worldPos, uPulsePositions[i], uPulseTimes[i]);
          }
          vPulseIntensity = min(totalPulseIntensity, 1.0);

          float timeScale = 0.5 + 0.5 * sin(uTime * 0.8 + distanceFromRoot * 0.2);
          float baseSize = nodeSize * (0.8 + 0.2 * timeScale);
          float pulseSize = baseSize * (1.0 + vPulseIntensity * 2.0);

          vec3 modifiedPosition = position;
          if (nodeType > 0.5) {
              float noise = fbm(position * 0.1, uTime * 0.1);
              modifiedPosition += normal * noise * 0.2;
          }

          vec4 mvPosition = modelViewMatrix * vec4(modifiedPosition, 1.0);
          gl_PointSize = pulseSize * uBaseNodeSize * (800.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
      }`,

      fragmentShader: `
      uniform float uTime;uniform vec3 uPulseColors[3];uniform int uActivePalette;
      varying vec3 vColor;varying float vNodeType;varying vec3 vPosition;varying float vPulseIntensity;varying float vDistanceFromRoot;

      void main() {
          vec2 center = 2.0 * gl_PointCoord - 1.0;
          float dist = length(center);
          if (dist > 1.0) discard;

          float glowStrength = 1.0 - smoothstep(0.0, 1.0, dist);
          glowStrength = pow(glowStrength, 1.4);

          vec3 baseColor = vColor * (0.8 + 0.2 * sin(uTime * 0.5 + vDistanceFromRoot * 0.3));
          vec3 finalColor = baseColor;

          if (vPulseIntensity > 0.0) {
              vec3 pulseColor = mix(vec3(1.0), uPulseColors[0], 0.3);
              finalColor = mix(baseColor, pulseColor, vPulseIntensity);
              finalColor *= (1.0 + vPulseIntensity * 0.7);
          }

          float alpha = glowStrength * (0.9 - 0.5 * dist);

          float camDistance = length(vPosition - cameraPosition);
          float distanceFade = smoothstep(80.0, 10.0, camDistance);

          if (vNodeType > 0.5) {
              alpha *= 0.85;
          } else {
              finalColor *= 1.2;
          }

          gl_FragColor = vec4(finalColor, alpha * distanceFade);
      }`
    };

    const connectionShader = {
      vertexShader: `${noiseFunctions}
      attribute vec3 startPoint;attribute vec3 endPoint;attribute float connectionStrength;attribute float pathIndex;attribute vec3 connectionColor;
      uniform float uTime;uniform vec3 uPulsePositions[3];uniform float uPulseTimes[3];uniform float uPulseSpeed;
      varying vec3 vColor;varying float vConnectionStrength;varying float vPulseIntensity;varying float vPathPosition;

      float getPulseIntensity(vec3 worldPos, vec3 pulsePos, float pulseTime) {
          if (pulseTime < 0.0) return 0.0;
          float timeSinceClick = uTime - pulseTime;
          if (timeSinceClick < 0.0 || timeSinceClick > 3.0) return 0.0;
          float pulseRadius = timeSinceClick * uPulseSpeed;
          float distToClick = distance(worldPos, pulsePos);
          float pulseThickness = 2.0;
          float waveProximity = abs(distToClick - pulseRadius);
          return smoothstep(pulseThickness, 0.0, waveProximity) * smoothstep(3.0, 0.0, timeSinceClick);
      }

      void main() {
          float t = position.x;
          vPathPosition = t;

          vec3 midPoint = mix(startPoint, endPoint, 0.5);
          float pathOffset = sin(t * 3.14159) * 0.1;
          vec3 perpendicular = normalize(cross(normalize(endPoint - startPoint), vec3(0.0, 1.0, 0.0)));
          if (length(perpendicular) < 0.1) perpendicular = vec3(1.0, 0.0, 0.0);
          midPoint += perpendicular * pathOffset;

          vec3 p0 = mix(startPoint, midPoint, t);
          vec3 p1 = mix(midPoint, endPoint, t);
          vec3 finalPos = mix(p0, p1, t);

          float noiseTime = uTime * 0.2;
          float noise = fbm(vec3(pathIndex * 0.1, t * 0.5, noiseTime), noiseTime);
          finalPos += perpendicular * noise * 0.1;

          vec3 worldPos = (modelMatrix * vec4(finalPos, 1.0)).xyz;

          float totalPulseIntensity = 0.0;
          for (int i = 0; i < 3; i++) {
              totalPulseIntensity += getPulseIntensity(worldPos, uPulsePositions[i], uPulseTimes[i]);
          }
          vPulseIntensity = min(totalPulseIntensity, 1.0);

          vColor = connectionColor;
          vConnectionStrength = connectionStrength;

          gl_Position = projectionMatrix * modelViewMatrix * vec4(finalPos, 1.0);
      }`,

      fragmentShader: `
      uniform float uTime;uniform vec3 uPulseColors[3];
      varying vec3 vColor;varying float vConnectionStrength;varying float vPulseIntensity;varying float vPathPosition;

      void main() {
          vec3 baseColor = vColor * (0.7 + 0.3 * sin(uTime * 0.5 + vPathPosition * 10.0));

          float flowPattern = sin(vPathPosition * 20.0 - uTime * 3.0) * 0.5 + 0.5;
          float flowIntensity = 0.3 * flowPattern * vConnectionStrength;

          vec3 finalColor = baseColor;

          if (vPulseIntensity > 0.0) {
              vec3 pulseColor = mix(vec3(1.0), uPulseColors[0], 0.3);
              finalColor = mix(baseColor, pulseColor, vPulseIntensity);
              flowIntensity += vPulseIntensity * 0.5;
          }

          finalColor *= (0.6 + flowIntensity + vConnectionStrength * 0.4);

          float alpha = 0.8 * vConnectionStrength + 0.2 * flowPattern;
          alpha = mix(alpha, min(1.0, alpha * 2.0), vPulseIntensity);

          gl_FragColor = vec4(finalColor, alpha);
      }`
    };

    class Node {
      position: THREE.Vector3;
      connections: Array<{ node: Node; strength: number }> = [];
      level: number;
      type: number;
      size: number;
      distanceFromRoot: number = 0;

      constructor(position: THREE.Vector3, level = 0, type = 0) {
        this.position = position;
        this.level = level;
        this.type = type;
        this.size = type === 0 ? THREE.MathUtils.randFloat(0.7, 1.2) : THREE.MathUtils.randFloat(0.4, 0.9);
      }

      addConnection(node: Node, strength = 1.0) {
        if (!this.isConnectedTo(node)) {
          this.connections.push({ node, strength });
          node.connections.push({ node: this, strength });
        }
      }

      isConnectedTo(node: Node) {
        return this.connections.some(conn => conn.node === node);
      }
    }

    function generateNeuralVortex(densityFactor: number) {
      const nodes: Node[] = [];
      const rootNode = new Node(new THREE.Vector3(0, 0, 0), 0, 0);
      rootNode.size = 1.8;
      nodes.push(rootNode);

      const numSpirals = 6;
      const totalHeight = 30;
      const maxRadius = 16;
      const nodesPerSpiral = Math.floor(30 * densityFactor);
      const spiralNodes: Node[][] = [];

      for (let s = 0; s < numSpirals; s++) {
        const spiralPhase = (s / numSpirals) * Math.PI * 2;
        const spiralArray: Node[] = [];
        for (let i = 0; i < nodesPerSpiral; i++) {
          const t = i / (nodesPerSpiral - 1);
          const height = (t - 0.5) * totalHeight;
          const radiusCurve = Math.sin(t * Math.PI);
          const radius = maxRadius * radiusCurve;
          const revolutions = 2.5;
          const angle = spiralPhase + t * Math.PI * 2 * revolutions;

          const pos = new THREE.Vector3(radius * Math.cos(angle), height, radius * Math.sin(angle));
          pos.add(new THREE.Vector3(
            THREE.MathUtils.randFloatSpread(1.5),
            THREE.MathUtils.randFloatSpread(1.5),
            THREE.MathUtils.randFloatSpread(1.5)
          ));

          const level = Math.floor(t * 5) + 1;
          const isLeaf = Math.random() < 0.3 || i > nodesPerSpiral - 3;
          const newNode = new Node(pos, level, isLeaf ? 1 : 0);
          newNode.distanceFromRoot = Math.sqrt(radius * radius + height * height);
          nodes.push(newNode);
          spiralArray.push(newNode);
        }
        spiralNodes.push(spiralArray);
      }

      for (const spiral of spiralNodes) {
        rootNode.addConnection(spiral[0], 1.0);
        for (let i = 0; i < spiral.length - 1; i++) {
          spiral[i].addConnection(spiral[i + 1], 0.9);
        }
      }

      for (let s = 0; s < numSpirals; s++) {
        const currentSpiral = spiralNodes[s];
        const nextSpiral = spiralNodes[(s + 1) % numSpirals];
        const connectionPoints = 5;
        for (let c = 0; c < connectionPoints; c++) {
          const t = c / (connectionPoints - 1);
          const idx1 = Math.floor(t * (currentSpiral.length - 1));
          const idx2 = Math.floor(t * (nextSpiral.length - 1));
          currentSpiral[idx1].addConnection(nextSpiral[idx2], 0.7);
        }
      }

      return { nodes, rootNode };
    }

    let nodesMesh: THREE.Points | null = null;
    let connectionsMesh: THREE.LineSegments | null = null;
    let neuralNetwork: { nodes: Node[]; rootNode: Node } | null = null;

    function createNetworkVisualization(densityFactor: number) {
      if (nodesMesh) {
        scene.remove(nodesMesh);
        nodesMesh.geometry.dispose();
        (nodesMesh.material as THREE.Material).dispose();
        nodesMesh = null;
      }
      if (connectionsMesh) {
        scene.remove(connectionsMesh);
        connectionsMesh.geometry.dispose();
        (connectionsMesh.material as THREE.Material).dispose();
        connectionsMesh = null;
      }

      neuralNetwork = generateNeuralVortex(densityFactor);
      if (!neuralNetwork || neuralNetwork.nodes.length === 0) {
        return;
      }

      const nodesGeometry = new THREE.BufferGeometry();
      const nodePositions: number[] = [], nodeTypes: number[] = [], nodeSizes: number[] = [],
            nodeColors: number[] = [], connectionIndices: number[] = [], distancesFromRoot: number[] = [];

      neuralNetwork.nodes.forEach((node) => {
        nodePositions.push(node.position.x, node.position.y, node.position.z);
        nodeTypes.push(node.type);
        nodeSizes.push(node.size);
        distancesFromRoot.push(node.distanceFromRoot);

        const indices = node.connections.slice(0, 3).map(conn => neuralNetwork!.nodes.indexOf(conn.node));
        while (indices.length < 3) indices.push(-1);
        connectionIndices.push(...indices);

        const palette = colorPalettes[config.activePaletteIndex];
        const colorIndex = Math.min(node.level, palette.length - 1);
        const baseColor = palette[colorIndex % palette.length].clone();
        baseColor.offsetHSL(
          THREE.MathUtils.randFloatSpread(0.05),
          THREE.MathUtils.randFloatSpread(0.1),
          THREE.MathUtils.randFloatSpread(0.1)
        );
        nodeColors.push(baseColor.r, baseColor.g, baseColor.b);
      });

      nodesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(nodePositions, 3));
      nodesGeometry.setAttribute('nodeType', new THREE.Float32BufferAttribute(nodeTypes, 1));
      nodesGeometry.setAttribute('nodeSize', new THREE.Float32BufferAttribute(nodeSizes, 1));
      nodesGeometry.setAttribute('nodeColor', new THREE.Float32BufferAttribute(nodeColors, 3));
      nodesGeometry.setAttribute('connectionIndices', new THREE.Float32BufferAttribute(connectionIndices, 3));
      nodesGeometry.setAttribute('distanceFromRoot', new THREE.Float32BufferAttribute(distancesFromRoot, 1));

      const nodesMaterial = new THREE.ShaderMaterial({
        uniforms: THREE.UniformsUtils.clone(pulseUniforms),
        vertexShader: nodeShader.vertexShader,
        fragmentShader: nodeShader.fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });

      nodesMesh = new THREE.Points(nodesGeometry, nodesMaterial);
      scene.add(nodesMesh);

      const connectionsGeometry = new THREE.BufferGeometry();
      const connectionColors: number[] = [], connectionStrengths: number[] = [], connectionPositions: number[] = [],
            startPoints: number[] = [], endPoints: number[] = [], pathIndices: number[] = [];
      const processedConnections = new Set<string>();
      let pathIndex = 0;

      neuralNetwork.nodes.forEach((node, nodeIndex) => {
        node.connections.forEach(connection => {
          const connectedNode = connection.node;
          const connectedIndex = neuralNetwork!.nodes.indexOf(connectedNode);
          if (connectedIndex === -1) return;

          const key = [Math.min(nodeIndex, connectedIndex), Math.max(nodeIndex, connectedIndex)].join('-');
          if (!processedConnections.has(key)) {
            processedConnections.add(key);

            const startPoint = node.position;
            const endPoint = connectedNode.position;
            const numSegments = 15;

            for (let i = 0; i < numSegments; i++) {
              const t = i / (numSegments - 1);
              connectionPositions.push(t, 0, 0);
              startPoints.push(startPoint.x, startPoint.y, startPoint.z);
              endPoints.push(endPoint.x, endPoint.y, endPoint.z);
              pathIndices.push(pathIndex);
              connectionStrengths.push(connection.strength);

              const palette = colorPalettes[config.activePaletteIndex];
              const avgLevel = Math.min(Math.floor((node.level + connectedNode.level) / 2), palette.length - 1);
              const baseColor = palette[avgLevel % palette.length].clone();
              baseColor.offsetHSL(
                THREE.MathUtils.randFloatSpread(0.05),
                THREE.MathUtils.randFloatSpread(0.1),
                THREE.MathUtils.randFloatSpread(0.1)
              );
              connectionColors.push(baseColor.r, baseColor.g, baseColor.b);
            }
            pathIndex++;
          }
        });
      });

      connectionsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(connectionPositions, 3));
      connectionsGeometry.setAttribute('startPoint', new THREE.Float32BufferAttribute(startPoints, 3));
      connectionsGeometry.setAttribute('endPoint', new THREE.Float32BufferAttribute(endPoints, 3));
      connectionsGeometry.setAttribute('connectionStrength', new THREE.Float32BufferAttribute(connectionStrengths, 1));
      connectionsGeometry.setAttribute('connectionColor', new THREE.Float32BufferAttribute(connectionColors, 3));
      connectionsGeometry.setAttribute('pathIndex', new THREE.Float32BufferAttribute(pathIndices, 1));

      const connectionsMaterial = new THREE.ShaderMaterial({
        uniforms: THREE.UniformsUtils.clone(pulseUniforms),
        vertexShader: connectionShader.vertexShader,
        fragmentShader: connectionShader.fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });

      connectionsMesh = new THREE.LineSegments(connectionsGeometry, connectionsMaterial);
      scene.add(connectionsMesh);

      const palette = colorPalettes[config.activePaletteIndex];
      connectionsMaterial.uniforms.uPulseColors.value[0].copy(palette[0]);
      connectionsMaterial.uniforms.uPulseColors.value[1].copy(palette[1]);
      connectionsMaterial.uniforms.uPulseColors.value[2].copy(palette[2]);
      nodesMaterial.uniforms.uPulseColors.value[0].copy(palette[0]);
      nodesMaterial.uniforms.uPulseColors.value[1].copy(palette[1]);
      nodesMaterial.uniforms.uPulseColors.value[2].copy(palette[2]);
      nodesMaterial.uniforms.uActivePalette.value = config.activePaletteIndex;
    }

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const interactionPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const interactionPoint = new THREE.Vector3();
    let lastPulseIndex = 0;

    function triggerPulse(clientX: number, clientY: number) {
      pointer.x = (clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);

      interactionPlane.normal.copy(camera.position).normalize();
      interactionPlane.constant = -interactionPlane.normal.dot(camera.position) + camera.position.length() * 0.5;

      if (raycaster.ray.intersectPlane(interactionPlane, interactionPoint)) {
        const time = clock.getElapsedTime();

        if (nodesMesh && connectionsMesh) {
          lastPulseIndex = (lastPulseIndex + 1) % 3;

          (nodesMesh.material as THREE.ShaderMaterial).uniforms.uPulsePositions.value[lastPulseIndex].copy(interactionPoint);
          (nodesMesh.material as THREE.ShaderMaterial).uniforms.uPulseTimes.value[lastPulseIndex] = time;
          (connectionsMesh.material as THREE.ShaderMaterial).uniforms.uPulsePositions.value[lastPulseIndex].copy(interactionPoint);
          (connectionsMesh.material as THREE.ShaderMaterial).uniforms.uPulseTimes.value[lastPulseIndex] = time;

          const palette = colorPalettes[config.activePaletteIndex];
          const randomColor = palette[Math.floor(Math.random() * palette.length)];
          (nodesMesh.material as THREE.ShaderMaterial).uniforms.uPulseColors.value[lastPulseIndex].copy(randomColor);
          (connectionsMesh.material as THREE.ShaderMaterial).uniforms.uPulseColors.value[lastPulseIndex].copy(randomColor);
        }
      }
    }

    const handleClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('.content-overlay')) return;
      if (!config.paused) triggerPulse(e.clientX, e.clientY);
    };

    renderer.domElement.addEventListener('click', handleClick);

    const clock = new THREE.Clock();
    let animationId: number;

    function animate() {
      animationId = requestAnimationFrame(animate);

      const t = clock.getElapsedTime();

      if (!config.paused) {
        if (nodesMesh) {
          (nodesMesh.material as THREE.ShaderMaterial).uniforms.uTime.value = t;
          nodesMesh.rotation.y = Math.sin(t * 0.05) * 0.08;
        }
        if (connectionsMesh) {
          (connectionsMesh.material as THREE.ShaderMaterial).uniforms.uTime.value = t;
          connectionsMesh.rotation.y = Math.sin(t * 0.05) * 0.08;
        }
      }

      starField.rotation.y += 0.0003;

      controls.update();
      composer.render();
    }

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);

      bloomPass.resolution.set(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', onWindowResize);

    createNetworkVisualization(config.densityFactor);
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', onWindowResize);
      renderer.domElement.removeEventListener('click', handleClick);
      renderer.dispose();
      composer.dispose();
      controls.dispose();
      scene.clear();
    };
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 -z-10">
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};
