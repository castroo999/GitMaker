import * as THREE from "three";

export function iniciarLoginBackground(
  canvas: HTMLCanvasElement
) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false,
  });

  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
  );

  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );

  const scene = new THREE.Scene();

  const camera = new THREE.OrthographicCamera(
    -1,
    1,
    1,
    -1,
    0,
    1
  );

  const uniforms = {
    u_time: {
      value: 0,
    },

    u_resolution: {
      value: new THREE.Vector2(
        window.innerWidth *
          window.devicePixelRatio,
        window.innerHeight *
          window.devicePixelRatio
      ),
    },

    u_opacities: {
      value: [
        0.15,
        0.15,
        0.2,
        0.25,
        0.3,
        0.35,
        0.45,
        0.55,
        0.7,
        0.9,
      ],
    },

    u_colors: {
      value: [
        new THREE.Vector3(0.48, 0.23, 0.92),
        new THREE.Vector3(0.38, 0.16, 0.78),
        new THREE.Vector3(0.6, 0.35, 1),
        new THREE.Vector3(0.3, 0.12, 0.65),
        new THREE.Vector3(0.7, 0.45, 1),
        new THREE.Vector3(0.42, 0.2, 0.85),
      ],
    },

    u_total_size: {
      value: 24,
    },

    u_dot_size: {
      value: 7,
    },

    u_reverse: {
      value: 0,
    },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,

    vertexShader: `
      precision mediump float;

      uniform vec2 u_resolution;

      out vec2 fragCoord;

      void main() {
        gl_Position = vec4(position, 1.0);

        fragCoord =
          (position.xy + 1.0)
          * 0.5
          * u_resolution;

        fragCoord.y =
          u_resolution.y - fragCoord.y;
      }
    `,

    fragmentShader: `
      precision mediump float;

      in vec2 fragCoord;

      uniform float u_time;
      uniform float u_opacities[10];
      uniform vec3 u_colors[6];
      uniform float u_total_size;
      uniform float u_dot_size;
      uniform vec2 u_resolution;

      out vec4 fragColor;

      float PHI = 1.61803398874989484820459;

      float random(vec2 xy) {
        return fract(
          tan(
            distance(xy * PHI, xy) * 0.5
          ) * xy.x
        );
      }

      void main() {

        vec2 st = fragCoord.xy;

        st.x -= abs(
          floor(
            (
              mod(u_resolution.x, u_total_size)
              - u_dot_size
            ) * 0.5
          )
        );

        st.y -= abs(
          floor(
            (
              mod(u_resolution.y, u_total_size)
              - u_dot_size
            ) * 0.5
          )
        );

        float opacity =
          step(0.0, st.x)
          * step(0.0, st.y);

        vec2 grid =
          vec2(
            int(st.x / u_total_size),
            int(st.y / u_total_size)
          );

        float frequency = 5.0;

        float show_offset =
          random(grid);

        float rand =
          random(
            grid *
            floor(
              (u_time / frequency)
              + show_offset
              + frequency
            )
          );

        opacity *=
          u_opacities[
            int(rand * 10.0)
          ];

        opacity *=
          1.0 -
          step(
            u_dot_size / u_total_size,
            fract(st.x / u_total_size)
          );

        opacity *=
          1.0 -
          step(
            u_dot_size / u_total_size,
            fract(st.y / u_total_size)
          );

        vec3 color =
          u_colors[
            int(show_offset * 6.0)
          ];

        float animationSpeed = 3.0;

        vec2 centerGrid =
          u_resolution /
          2.0 /
          u_total_size;

        float distanceFromCenter =
          distance(centerGrid, grid);

        float timingOffset =
          distanceFromCenter * 0.01
          + random(grid) * 0.15;

        opacity *=
          step(
            timingOffset,
            u_time * animationSpeed
          );

        opacity *=
          clamp(
            (
              1.0 -
              step(
                timingOffset + 0.1,
                u_time * animationSpeed
              )
            ) * 1.25,
            1.0,
            1.25
          );

        fragColor =
          vec4(color, opacity);

        fragColor.rgb *=
          fragColor.a;
      }
    `,

    glslVersion: THREE.GLSL3,

    blending: THREE.CustomBlending,

    blendSrc: THREE.SrcAlphaFactor,

    blendDst: THREE.OneFactor,

    transparent: true,
  });

  const geometry =
    new THREE.PlaneGeometry(2, 2);

  const mesh = new THREE.Mesh(
    geometry,
    material
  );

  scene.add(mesh);

  const startTime = performance.now();

  let animationFrame = 0;

  const animate = () => {
    animationFrame =
      requestAnimationFrame(animate);

    uniforms.u_time.value =
      (performance.now() - startTime) /
      1000;

    renderer.render(scene, camera);
  };

  animate();

  const handleResize = () => {
    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );

    uniforms.u_resolution.value.set(
      window.innerWidth *
        window.devicePixelRatio,

      window.innerHeight *
        window.devicePixelRatio
    );
  };

  window.addEventListener(
    "resize",
    handleResize
  );

  return () => {
    cancelAnimationFrame(animationFrame);

    window.removeEventListener(
      "resize",
      handleResize
    );

    geometry.dispose();
    material.dispose();
    renderer.dispose();
  };
}