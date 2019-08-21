
var THREE = require('three')
var Shader = {
    vs:`
    varying vec2 vUv;
    void main()
    {
        vUv = vec2(uv.x,uv.y);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
    }
    `,
    fs:`
    varying vec2 vUv;
    uniform vec2 shape;

    vec3 getBlockColor(vec2 coord)
    {
        vec2 normallize = floor(coord);
        float type = mod(normallize.x+normallize.y,2.);
        return vec3(.4+floor(type)*.4);
    
    }
    vec3 block(vec2 range,vec2 uv)
    {
        float w = 1./range.x;
        float h = 1./range.y;
        float modedx = mod(uv.x,w);
        float modedy = mod(uv.y,h);
        vec3 color = getBlockColor(vec2(uv.x/w,uv.y/h));
        return color;
    }
    void main()
    {
        vec3 color = block(shape,vUv);
        gl_FragColor = vec4(color,1.);
    }
    `
    ,
    uniform:{
        shape:{
            value:new THREE.Vector2(30,30)
        }
    }
}
var checkerboard = function(option)
{
    THREE.Mesh.call(this);
    var self = this;
    option = option||{};
    var baseWidth = option.width || 100;
    var baseHeight = option.height || 100;
    //console.log(baseHeight);
    this.geometry = new THREE.PlaneBufferGeometry(baseWidth,baseHeight);
    this.material = new THREE.ShaderMaterial({
        vertexShader:Shader.vs,
        fragmentShader:Shader.fs,
        uniforms:Shader.uniform,
        side:THREE.DoubleSide
    });
    //this.material = new THREE.MeshBasicMaterial({color:0x6656f1});
    this.updatePlane = function(camera){
        if(camera.isOrthographicCamera)
        {
            var width  =  camera.right - camera.left;
            var height = camera.top - camera.bottom;
            var newscale = Math.max(width/baseWidth,height/baseHeight) * 1./camera.zoom;
            if(this.scale.x !== newscale)
            {
                this.scale.set(newscale,newscale,1);
            }
        }
    }
    this.onBeforeRender = function(renderer,scene,camera)
    {
        self.updatePlane(camera);
        self.visible = true;    
    }

}
checkerboard.prototype = Object.create(THREE.Mesh.prototype);
checkerboard.prototype.constructer = checkerboard;

module.exports = {
    checkerboard,
    Shader
}