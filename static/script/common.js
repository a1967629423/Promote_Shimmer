console.log("%c/* Powered by Shimmer Network Studio */", "color:green");
console.log("%c/* by @Tangtsz&Ruan Ver.20198 */", "color:green");
console.log("%c( ´ ▽ ` )ﾉ 小小世界中的又一个Web组织，微光网络工作室，期待和你相遇！\n了解更多 -> http://shimmer.neusoft.edu.cn/", "color:blue");
(function (window) {
  var wechatGetway = {
    login: function (redirect_uri) {
      var uri = redirect_uri && typeof redirect_uri === 'string' ? redirect_uri : location.href;
      $.get('http://shimmer.neusoft.edu.cn/wechat/web/page/login?redirect_uri=' + uri);
    }
  }
  function mix(a, b) {
    for (var key in b) {
      if (!a[key]) {
        a[key] = b[key];
      }
    }
  }
  var StateMachine = function () {
    this.nowState = null;
    this.states = [];
    this.changeState = function (ns) {
      if (this.nowState) this.nowState.quit();
      this.nowState = ns;
      this.nowState.start();
    }
    this.emit = function (e, ...arg) {
      if (this.nowState[e] && typeof this.nowState[e] === 'function') {
        this.nowState[e]();
      }
    }
    this.createState = function (name = 'newState', option) {
      var state = new State(name, mix(option, { context: this }));
      this.states.push(state);
      return state;
    }
    this.createDefaultState = function (name = 'newState', option) {
      var state = this.createState(name, option);
      this.changeState(state);
      return state;
    }
  }
  var State = function (name = 'newState', option) {
    this.name = name;
    if (option && typeof option === 'object') {
      for (var key in option) {
        this.on(key, option[key]);
      }
    }
  }
  State.prototype = {
    constructor:State,
    start:function(){

    },
    quit:function(){

    },
    on:function (event, cb) {
      if (event && typeof event === 'string') {
        this[event] = cb;
      }
    }
  }
  var PictureEditor = function (canvas) {
    var width = canvas.offsetWidth;
    var height = canvas.offsetHeight;
    var events = []
    var self = this;
    var mouse = new THREE.Vector2();
    this.canvas = canvas;
    this.Scene = new THREE.Scene();
    this.Camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2);
    this.Camera.position.z = 1000;
    this.Camera.lookAt(new THREE.Vector3(0, 0, 0))
    this.Renderer = new THREE.WebGLRenderer({ canvas: canvas });
    this.Renderer.setClearColor(new THREE.Color(0xffffff))
    this.clock = new THREE.Clock();
    this.idCursor = 0;
    this.imgs = [];
    this.sm = new StateMachine();
    this.smStates = {};
    this.init = function()
    {
      this.initSm();
    }
    this.initSm = function()
    {
      this.smStates = {
        default:this.sm.createDefaultState('default',{}),
      }
    }
    
    this.on = function (event, listener) {
      var cbs = [];
      if (events.length === 0) {
        events.push({ en: events, cb: cbs });
      }
      else {
        for (var i = 0; i < events.length; i++) {
          if (events[i].en === event) {
            cbs = events[i].cb;
            break;
          }
          if (i === events.length - 1) {
            events.push({ en: events, cb: cbs });
          }
        }
      }
      cbs.push(listener);
    }
    this.emit = function (event, ...args) {
      var e = events.find(function (v) { return v.en === events });
      if (e) {
        e.cb.forEach(function (v) {
          if (v && typeof v === 'function') v(...args);
        })
      }
    }
    this.onSizeChange = function () {
      var width = canvas.offsetWidth;
      var height = canvas.offsetHeight;
      this.Camera.left = width / -2;
      this.Camera.right = width / 2;
      this.Camera.top = height / 2;
      this.Camera.bottom = height / -2;
      this.Camera.updateProjectionMatrix();
      this.Renderer.setSize(width, height, false);
    }
    this.onSizeChange();
    window.addEventListener('resize', this.onSizeChange.bind(this));
    this.Render = function () {
      this.Renderer.render(this.Scene, this.Camera);
    }
    this.Logic = function () {

    }
    this.Frame = function () {
      self.Render();
      self.Logic();
      requestAnimationFrame(self.Frame)
    }
    this.addImg = function (Img) {
      var planeGeometry = new THREE.PlaneBufferGeometry(Img.image.width, Img.image.height);
      var basicMaterial = new THREE.MeshBasicMaterial({ map: Img, side: THREE.DoubleSide });
      var mesh = new THREE.Mesh(planeGeometry, basicMaterial);
      mesh.rotation.z = Math.PI / 2;
      window.imgs = this.imgs
      this.imgs.push({ source: Img, obj: mesh, id: this.idCursor++ });
      this.Scene.add(mesh);
    }
    this.removeImg = function (id) {
      for (var i = this.imgs.length - 1; i > -1; i--) {
        if (this.imgs[i].id === id) {
          this.Scene.remove(this.imgs.splice(i, 1)[0].obj);
          return;
        }
      }
    }
    function pointTest(point) {
      var raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(point, self.Camera);
      var intersects = raycaster.intersectObjects(self.Scene.children);
      var intersectImgs = []
      for (var i = 0; i < intersects.length; i++) {
        var img = self.imgs.find(v => v.obj === intersects[i].object);
        if (img) {
          intersectImgs.push(img);
        }
      }
      return intersectImgs;
    }
    function pointUp(point)
    {
      self.sm.emit('pointUp',point);
      self.emit('pointMove',point);
    }
    function pointMove(point) {
      self.sm.emit('pointMove',point);
      self.emit('pointMove',point);
    }
    function pointDonw(point) {
      var intersectImgs = pointTest(point);
      self.sm.emit('pointDown',intersectImgs);
      self.emit('pointDown', intersectImgs);
    }
    function toScreenCoord(point,screenCoord)
    {
      if(point.clientX||(point.touches&&point.touches.length>0)||(point.changedTouches&&point.changedTouches.length>0))
      {
        var cursor = point.clientX?point:point.touches&&point.touches.length>0?point.touches[0]:point.changedTouches&&point.changedTouches.length>0?point.changedTouches[0]:null;
        var clientX = cursor.clientX;
        var clientY = cursor.clientY;
        screenCoord.x = (clientX/window.innerWidth)*2-1;
        screenCoord.y = -(clientY/window.innerHeight)*2+1;
        return screenCoord;
      }
      else
      {
        throw 'un supported point'
      }
    }
    window.addEventListener('mousedown', function (ev) {
      pointDonw(toScreenCoord(ev,mouse));
    });
    window.addEventListener('touchstart', function (ev) {
      pointDonw(toScreenCoord(ev,mouse));
    });
    window.addEventListener('mousemove',function(ev){
      pointMove(toScreenCoord(ev,mouse));
    });
    window.addEventListener('touchmove',function(ev){
      if(ev.touches.length<2)
      {
        pointMove(toScreenCoord(ev,mouse));
      }
    });
    window.addEventListener('mouseup',function(ev){
      pointUp(toScreenCoord(ev,mouse));
    });
    window.addEventListener('touchend',function(ev){
      pointUp(toScreenCoord(ev,mouse));
    })
    this.init();
    this.Frame();


  }
  window.wechatGetway = wechatGetway;
  window.PictureEditor = PictureEditor;
  window.StateMachine = StateMachine;
  window.State = State;
})(window)
