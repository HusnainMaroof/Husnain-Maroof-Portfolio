uniform float uTime;
uniform vec2 uMouse;
uniform float uRadius;

attribute float aScale;

varying float vInfluence;
varying float vScale;

void main() {

    vec3 pos = position;

    float dist = distance(
        pos.xy,
        uMouse
    );

    float influence =
        max(
            0.0,
            1.0 - dist / uRadius
        );

    float ripple =
        sin(
            dist * 12.0 -
            uTime * 4.0
        ) * 0.15;

    pos.z += ripple * influence;

    pos.z += influence * 0.5;

    pos.xy += normalize(
        pos.xy - uMouse
    ) * influence * 0.05;

    vInfluence = influence;
    vScale = aScale;

    vec4 mvPosition =
        modelViewMatrix *
        vec4(pos, 1.0);

    gl_Position =
        projectionMatrix *
        mvPosition;
}