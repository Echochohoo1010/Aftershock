"use client"

import { useRef, useEffect } from "react"
import * as THREE from "three"

const fragmentShader = `
  precision highp float;

  varying vec2 v_texcoord;
  uniform vec2 u_mouse;
  uniform vec2 u_resolution;
  uniform float u_pixelRatio;

  /* Coordinate and unit utils */
  vec2 coord(in vec2 p) {
    p = p / u_resolution.xy;
    if (u_resolution.x > u_resolution.y) {
      p.x *= u_resolution.x / u_resolution.y;
      p.x += (u_resolution.y - u_resolution.x) / u_resolution.y / 2.0;
    } else {
      p.y *= u_resolution.y / u_resolution.x;
      p.y += (u_resolution.x - u_resolution.y) / u_resolution.x / 2.0;
    }
    p -= 0.5;
    p *= vec2(-1.0, 1.0);
    return p;
  }

  #define st0 coord(gl_FragCoord.xy)
  #define mx coord(u_mouse * u_pixelRatio)

  /* signed distance functions */
  float sdRoundRect(vec2 p, vec2 b, float r) {
    vec2 d = abs(p - 0.5) * 4.2 - b + vec2(r);
    return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)) - r;
  }

  float sdCircle(in vec2 st, in vec2 center) {
    return length(st - center) * 2.0;
  }

  /* antialiased step function */
  float aastep(float threshold, float value) {
    float afwidth = length(vec2(dFdx(value), dFdy(value))) * 0.70710678118654757;
    return smoothstep(threshold - afwidth, threshold + afwidth, value);
  }

  /* Signed distance drawing methods */
  float fill(in float x) { return 1.0 - aastep(0.0, x); }
  float fill(float x, float size, float edge) {
    return 1.0 - smoothstep(size - edge, size + edge, x);
  }
  float stroke(float x, float size, float w, float edge) {
    float d = smoothstep(size - edge, size + edge, x + w * 0.5) - smoothstep(size - edge, size + edge, x - w * 0.5);
    return clamp(d, 0.0, 1.0);
  }

  void main() {
    vec2 st = st0 + 0.5;
    vec2 posMouse = mx * vec2(1., -1.) + 0.5;

    // Theme colors - Precisely matched to CSS custom properties
    vec3 background = vec3(1.0, 1.0, 1.0);     // --background oklch(1.0000 0 0)
    vec3 foreground = vec3(0.21, 0.21, 0.25);  // --foreground oklch(0.2101 0.0318 264.6645)
    vec3 primary    = vec3(0.85, 0.55, 0.25);  // --primary oklch(0.6716 0.1368 48.5130) - warm orange
    vec3 secondary  = vec3(0.0, 0.0, 0.0);   // --secondary oklch(0.5360 0.0398 196.0280) - blue
    vec3 muted      = vec3(0.967, 0.967, 0.967); // --muted oklch(0.9670 0.0029 264.5419)
    // Shape parameters
    float size = 1.2;
    float roundness = 0.5;
    float borderSize = 0.05;
    float circleSize = 0.3;
    float circleEdge = 0.5;

    // SDF for mouse circle
    float sdfCircle = fill(sdCircle(st, posMouse), circleSize, circleEdge);

    // SDF for rounded rectangle with stroke affected by sdfCircle
    float sdf = sdRoundRect(st, vec2(size), roundness);
    sdf = stroke(sdf, 0.0, borderSize, sdfCircle) * 4.0;

    // Animated gradient for shape using theme colors
    vec3 shaderColor = mix(primary, secondary, sin(length(st - vec2(0.5)) * 3.0) * 0.5 + 0.5);
    vec3 sdfColor = mix(background, shaderColor, sdf);

    // UV for gradient overlay
    vec2 uv = (gl_FragCoord.xy / u_resolution.xy);

    // Radial gradient 1: circle at 20% 80%
    float r1 = smoothstep(0.2, 0.0, length(uv - vec2(0.2, 0.8)));
    vec3 g1 = primary * 0.15 * r1;

    // Radial gradient 2: circle at 80% 20%
    float r2 = smoothstep(0.6, 0.0, length(uv - vec2(0.8, 0.2)));
    vec3 g2 = primary * 0.12 * r2;

    // Radial gradient 3: circle at 40% 40%
    float r3 = smoothstep(0.8, 0.0, length(uv - vec2(0.4, 0.4)));
    vec3 g3 = secondary * 0.08 * r3;

    // Linear gradient: 135 degrees with subtle theme colors
    vec2 dir = normalize(vec2(1.0, -1.0));
    float lg = dot(uv, dir);
    vec3 g4 = mix(primary * 0.02, secondary * 0.02, lg);

    // Combine all gradients
    vec3 gradients = g1 + g2 + g3 + g4;

    // Final color combines animated shape + background gradients
    vec3 finalColor = sdfColor + gradients;

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

function SDFCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null)
  const materialRef = useRef<THREE.ShaderMaterial | null>(null)
  const vMouse = useRef(new THREE.Vector2())
  const vMouseDamp = useRef(new THREE.Vector2())
  const vResolution = useRef(new THREE.Vector2())

  useEffect(() => {
    const container = containerRef.current
    if (!container) return



    // Scene setup
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // Get container dimensions
    const w = container.clientWidth
    const h = container.clientHeight

    // Orthographic camera setup
    const aspect = w / h
    const camera = new THREE.OrthographicCamera(-aspect, aspect, 1, -1, 0.1, 1000)
    camera.position.z = 1
    cameraRef.current = camera

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Plane geometry covering the full viewport
    const geo = new THREE.PlaneGeometry(1, 1)

    // Shader material creation
    const mat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec2 v_texcoord;
        void main() {
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          v_texcoord = uv;
        }
      `,
      fragmentShader,
      uniforms: {
        u_mouse: { value: vMouseDamp.current },
        u_resolution: { value: vResolution.current },
        u_pixelRatio: { value: Math.min(window.devicePixelRatio, 2) },

      }
    })
    materialRef.current = mat

    // Mesh creation
    const quad = new THREE.Mesh(geo, mat)
    scene.add(quad)

    // Initial resize
    const resize = () => {
      const newW = container.clientWidth
      const newH = container.clientHeight
      const dpr = Math.min(window.devicePixelRatio, 2)

      renderer.setSize(newW, newH)
      renderer.setPixelRatio(dpr)

      camera.left = -newW / 2
      camera.right = newW / 2
      camera.top = newH / 2
      camera.bottom = -newH / 2
      camera.updateProjectionMatrix()

      quad.scale.set(newW, newH, 1)
      vResolution.current.set(newW, newH).multiplyScalar(dpr)
      mat.uniforms.u_pixelRatio.value = dpr
    }

    resize()

    // Mouse event handlers
    const onPointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      vMouse.current.set(e.clientX - rect.left, e.clientY - rect.top)
    }

    container.addEventListener('mousemove', onPointerMove)
    container.addEventListener('pointermove', onPointerMove)



    // Animation loop
    let lastTime = 0
    const animate = () => {
      const time = performance.now() * 0.001
      const dt = time - lastTime
      lastTime = time

      // Ease mouse motion with damping
      vMouseDamp.current.x = THREE.MathUtils.damp(vMouseDamp.current.x, vMouse.current.x, 8, dt)
      vMouseDamp.current.y = THREE.MathUtils.damp(vMouseDamp.current.y, vMouse.current.y, 8, dt)

      renderer.render(scene, camera)
      requestAnimationFrame(animate)
    }

    animate()

    // Resize handler
    const handleResize = () => resize()
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      container.removeEventListener('mousemove', onPointerMove)
      container.removeEventListener('pointermove', onPointerMove)

      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement)
      }
      renderer.dispose()
      mat.dispose()
      geo.dispose()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative"
      style={{ minHeight: '400px' }}
    />
  )
}

export default function Metaballs3D() {
  return (
    <div
      className="w-full h-full border border-border rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl"
      style={{ minHeight: '500px' }}>
      <SDFCanvas />
    </div>
  )
}
