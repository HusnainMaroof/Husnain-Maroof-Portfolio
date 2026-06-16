
uniform vec3 uColor;
uniform float uTime;

varying float vInfluence;
varying float vScale;

void main() {

    vec3 color = uColor;

    vec3 glowColor =
        vec3(
            1.0,
            1.0,
            1.0
        );

    color = mix(
        color,
        glowColor,
        vInfluence
    );

    float alpha =
        0.45 +
        vInfluence * 0.55;

    gl_FragColor =
        vec4(
            color,
            alpha
        );
}