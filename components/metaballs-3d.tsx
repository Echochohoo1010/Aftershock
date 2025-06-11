"use client"

import { useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import * as THREE from "three"

// Ultra-smooth SDF-based metaball shader with enhanced blending
const metaballVertexShader = `
  varying vec3 vPosition;
  varying vec3 vWorldPosition;
  varying vec3 vViewPosition;
  varying vec3 vCameraPosition;
  
  void main() {
    vPosition = position;
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = mvPosition.xyz;
    vCameraPosition = cameraPosition;
    gl_Position = projectionMatrix * mvPosition;
  }
`

const metaballFragmentShader = `
  uniform float time;
  uniform vec3 metaballs[5];
  uniform float radii[5];
  varying vec3 vPosition;
  varying vec3 vWorldPosition;
  varying vec3 vViewPosition;
  varying vec3 vCameraPosition;
  
  // SDF for a sphere with smooth field falloff
  float sdSphere(vec3 p, vec3 center, float radius) {
    return length(p - center) - radius;
  }
  
  // Polynomial smooth minimum for ultra-smooth blending
  float smin(float a, float b, float k) {
    float h = max(k - abs(a - b), 0.0) / k;
    return min(a, b) - h * h * h * k * (1.0 / 6.0);
  }
  
  // Scene SDF - combines all metaballs with ultra-smooth blending
  float sceneSDF(vec3 p) {
    // Start with first metaball
    float d = sdSphere(p, metaballs[0], radii[0]);
    
    // Blend with other metaballs using high smoothness factor
    for(int i = 1; i < 5; i++) {
      float sphereD = sdSphere(p, metaballs[i], radii[i]);
      d = smin(d, sphereD, 1.5); // Much higher smoothness parameter (1.5)
    }
    
    return d;
  }
  
  // Calculate normal using high-precision gradient of SDF
  vec3 calcNormal(vec3 p) {
    const float eps = 0.001; // Smaller epsilon for higher precision
    vec3 n = vec3(
      sceneSDF(p + vec3(eps, 0.0, 0.0)) - sceneSDF(p - vec3(eps, 0.0, 0.0)),
      sceneSDF(p + vec3(0.0, eps, 0.0)) - sceneSDF(p - vec3(0.0, eps, 0.0)),
      sceneSDF(p + vec3(0.0, 0.0, eps)) - sceneSDF(p - vec3(0.0, 0.0, eps))
    );
    return normalize(n);
  }
  
  // Enhanced raymarching with more steps for smoother surface
  float rayMarch(vec3 ro, vec3 rd) {
    float t = 0.0;
    float minStep = 0.005; // Minimum step size for precision
    
    for(int i = 0; i < 128; i++) { // Increased step count for better quality
      vec3 p = ro + t * rd;
      float d = sceneSDF(p);
      
      // Early termination with high precision
      if(d < 0.001) break;
      if(t > 20.0) return -1.0;
      
      // Adaptive step size with minimum threshold for precision
      t += max(d * 0.5, minStep); // Smaller step multiplier (0.5) for accuracy
    }
    return t;
  }
  
  void main() {
    // Ray setup using varying camera position
    vec3 rayOrigin = vCameraPosition;
    vec3 rayDirection = normalize(vWorldPosition - vCameraPosition);
    
    // Raymarch to find surface
    float t = rayMarch(rayOrigin, rayDirection);
    
    if(t < 0.0) discard; // No intersection
    
    // Calculate surface point and normal
    vec3 surfacePoint = rayOrigin + t * rayDirection;
    vec3 normal = calcNormal(surfacePoint);
    
    // Enhanced fresnel effect
    vec3 viewDir = normalize(rayOrigin - surfacePoint);
    float fresnel = 1.0 - max(0.0, dot(normal, viewDir));
    fresnel = pow(fresnel, 2.0); // Adjusted power for smoother fresnel
    
    // Pure white color with subtle gray fresnel
    vec3 baseColor = vec3(0.98, 0.98, 0.98);
    vec3 fresnelColor = vec3(0.35, 0.35, 0.35);
    
    vec3 color = mix(baseColor, fresnelColor, fresnel * 0.6);
    
    // Enhanced lighting
    vec3 lightDir1 = normalize(vec3(1.0, 1.0, 1.0));
    vec3 lightDir2 = normalize(vec3(-0.5, 0.8, -0.3));
    
    float diffuse1 = max(0.3, dot(normal, lightDir1));
    float diffuse2 = max(0.2, dot(normal, lightDir2));
    
    // Soft specular highlights
    vec3 reflectDir = reflect(-lightDir1, normal);
    float specular = pow(max(0.0, dot(viewDir, reflectDir)), 0.0); // Higher power for tighter highlights
    
    color *= (diffuse1 + diffuse2 * 0.5);
    color += vec3(specular * 0.2);
    
    // Very subtle ambient occlusion
    float ao = 1.0 - clamp(sceneSDF(surfacePoint + normal * 0.2) * 2.0, 0.0, 0.3);
    color *= mix(1.0, ao, 0.2);
    
    gl_FragColor = vec4(color, 0.95);
  }
`

 
 

function MetaballSurface() {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  // Metaball setup with positions optimized for smooth blending
  const metaballData = useMemo(() => {
    // Position spheres closer together for better blending
    const positions = [
      -0.8,
      0.4,
      0.2, // Sphere 1
      0.8,
      -0.3,
      -0.4, // Sphere 2
      0.1,
      0.9,
      0.5, // Sphere 3
      -0.5,
      -0.7,
      0.4, // Sphere 4
      0.9,
      0.2,
      -0.8, // Sphere 5
    ]
    const radii = [0.65, 0.6, 0.55, 0.6, 0.55] // Larger radii for more overlap

    return { positions, radii }
  }, [])

  const uniforms = useMemo(
    () => ({
      time: { value: 0 },
      metaballs: { value: metaballData.positions },
      radii: { value: metaballData.radii },
    }),
    [metaballData],
  )

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime

      // Gentler animation for smoother visual flow
      const time = state.clock.elapsedTime * 0.25
      const newPositions = []

      for (let i = 0; i < 5; i++) {
        const baseX = metaballData.positions[i * 3]
        const baseY = metaballData.positions[i * 3 + 1]
        const baseZ = metaballData.positions[i * 3 + 2]

        // Smaller movement range to keep spheres closer together
        newPositions.push(
          baseX + Math.sin(time + i * 1.4) * 0.5,
          baseY + Math.cos(time + i * 1.1) * 0.5,
          baseZ + Math.sin(time * 0.9 + i * 0.8) * 0.5,
        )
      }

      materialRef.current.uniforms.metaballs.value = newPositions
    }

    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.05
    }
  })

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[8, 8, 8]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={metaballVertexShader}
        fragmentShader={metaballFragmentShader}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}



function TopographicPlane({ groupRef }: { groupRef: React.RefObject<THREE.Group> }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    if (materialRef.current && groupRef.current) {
      materialRef.current.uniforms.center.value.copy(groupRef.current.position);
      materialRef.current.uniforms.time.value = state.clock.getElapsedTime();
    }
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.0, 0]}>
      <planeGeometry args={[10, 10, 1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          precision highp float;
          varying vec2 vUv;

          uniform vec3 center;
          uniform float time;

          float computeField(vec2 pos) {
            vec2 center2D = center.xz;
            float d = length(pos - center2D);
            return 1.0 / (0.1 + d); // basic inverse distance field
          }

          void main() {
            vec2 uv = vUv * 10.0 - 5.0;
            float field = computeField(uv);

            // Visualize topographic lines
            float lines = smoothstep(0.02, 0.025, abs(fract(field * 5.0) - 0.5));
            vec3 color = mix(vec3(1.0), vec3(0.0), 1.0 - lines);

            gl_FragColor = vec4(color, 0.95);
          }
        `}
        uniforms={{
          center: { value: new THREE.Vector3(0, 0, 0) },
          time: { value: 0 },
        }}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function FloatingMetaballs() {
  const groupRef = useRef<THREE.Group>(null)

 
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.05
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.015
    }
  })

  return (
    <group ref={groupRef}>
      {/* Ultra-smooth SDF-based metaball surface */}
      <MetaballSurface />
<TopographicPlane groupRef={groupRef} />
       
    </group>
  )
}

export default function Metaballs3D() {
  return (
    <div className="w-full h-full bg-white">
      <Canvas
        camera={{ position: [0, 0, 6.5], fov: 50 }}
        style={{ background: "white" }}
        gl={{ alpha: false, antialias: true }}
      >
        <color attach="background" args={["white"]} />
        <ambientLight intensity={0.5} /> 
        <directionalLight position={[0, 0, -3]} intensity={0.4} />
        <pointLight position={[0, 0, 0]} intensity={0.3} />
        <FloatingMetaballs />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.8}
          maxPolarAngle={Math.PI * 0.75}
          minPolarAngle={Math.PI * 0.25}
        />
      </Canvas>
    </div>
  )
}
