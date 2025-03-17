const canvas = document.getElementById("shaderCanvas");
const gl = canvas.getContext("webgl");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const vertexShaderCode = `
    attribute vec2 coordinates;
    void main(void) {
        gl_Position = vec4(coordinates, 0.0, 1.0);
    }
`;

const fragmentShaderCode = `
    precision mediump float;
    uniform float time;
    void main(void) {
        float r = abs(sin(time * 0.5));
        float g = abs(sin(time * 0.7));
        float b = abs(sin(time * 0.9));
        gl_FragColor = vec4(r, g, b, 1.0);
    }
`;

const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vertexShaderCode);
gl.compileShader(vertexShader);

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fragmentShaderCode);
gl.compileShader(fragmentShader);

const shaderProgram = gl.createProgram();
gl.attachShader(shaderProgram, vertexShader);
gl.attachShader(shaderProgram, fragmentShader);
gl.linkProgram(shaderProgram);
gl.useProgram(shaderProgram);

const timeUniform = gl.getUniformLocation(shaderProgram, "time");
let startTime = Date.now();
function render() {
    gl.uniform1f(timeUniform, (Date.now() - startTime) / 1000);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    requestAnimationFrame(render);
}
render();
