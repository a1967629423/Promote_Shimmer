(function (window) {
    function SetCoord(point, screenCoord) {
        var clientX = point.clientX;
        var clientY = point.clientY;
        screenCoord.source.x = clientX;
        screenCoord.source.y = clientY;
        screenCoord.canvas.x = clientX - window.innerWidth / 2;
        screenCoord.canvas.y = -clientY + window.innerHeight / 2;
        screenCoord.screen.x = (clientX / window.innerWidth) * 2 - 1;
        screenCoord.screen.y = -(clientY / window.innerHeight) * 2 + 1;
        return screenCoord;

    }
    function ConvertScreenToSourceCoord(screen) {
        screen.x = (screen.x + 1) / 2 * window.innerWidth;
        screen.y = -(screen.y - 1) / 2 * window.innerHeight;
        return screen;
    }
    function ConvertCanvasToSourceCoord(canvas) {
        canvas.x = canvas.x + window.innerWidth / 2;
        canvas.y = -(canvas.y - window.innerHeight / 2);
        return canvas;
    }
    var EditorBox = function (element, camera) {
        var self = this;
        this.camera = camera;
        this.position = new THREE.Vector3(0, 0, 0);
        this.shape = new THREE.Vector3(0, 0, 0);
        EventBase.call(this);
        if (element && element instanceof window.HTMLElement) {
            var container = $(`<div class='editorbox-container'></div>`)

            var anchors = {
                left: $(`<div class='editorbox-anchor left'></div>`),
                leftTop: $(`<div class='editorbox-anchor left top'></div>`),
                leftBottom: $(`<div class='editorbox-anchor left bottom'></div>`),
                right: $(`<div class='editorbox-anchor right'></div>`),
                rightTop: $(`<div class='editorbox-anchor right top'></div>`),
                rightBottom: $(`<div class='editorbox-anchor right bottom'></div>`),
                top: $(`<div class='editorbox-anchor top'></div>`),
                bottom: $(`<div class='editorbox-anchor bottom'></div>`)
            };
            for (var item in anchors) {
                container.append(anchors[item]);
            }
            $(element).after(container);
            container.width(100);
            container.height(100);
            container.hide();

        }
        function syncPositionAndSize(img) {
            self.position.setFromMatrixPosition(img.obj.matrixWorld);
            ConvertCanvasToSourceCoord(self.position)
            container.css('left', self.position.x);
            container.css('top', self.position.y);
            self.shape.setFromMatrixScale(img.obj.matrixWorld);
            container.width(Math.abs(self.shape.x * img.source.image.width));
            container.height(Math.abs(self.shape.y * img.source.image.height));
        }
        this.active = function (img) {
            if (img && img.obj instanceof THREE.Object3D) {
                syncPositionAndSize(img);
                window.img = img;
                container.show();
            }
        }
        this.update = function (img) {
            syncPositionAndSize(img);
        }
        this.disable = function () {
            container.hide();
        }
    }
    EditorBox.prototype = Object.create(EventBase.prototype);
    EditorBox.prototype.constructor = EditorBox;
    var PictureEditor = function (canvas) {
        EventBase.call(this);
        var width = canvas.offsetWidth;
        var height = canvas.offsetHeight;
        var self = this;
        var mouse = {
            screen: new THREE.Vector3(),
            canvas: new THREE.Vector3(),
            source: new THREE.Vector3(),
        }
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
        this.init = function () {
            this.initSm();
            this.initBox();
        }
        this.initBox = function () {
            this.editorBox = new EditorBox(this.canvas, this.Camera);
        }
        this.initSm = function () {
            this.smStates = {
                default: this.sm.createDefaultState('default', {
                    pointDown(intersectImgs, point) {
                        if (intersectImgs.length > 0) {
                            this.context.activeImg = intersectImgs[0];
                            this.context.lastPoint.copy(point.canvas);
                            this.context.changeState(self.smStates.active);
                        }
                    },
                    start() {
                        if (self.editorBox) {
                            self.editorBox.disable();
                        }
                        if (!this.context.lastPoint) {
                            this.context.lastPoint = new THREE.Vector3();
                        }
                        console.log('defalut', this);
                    }
                }),
                active: this.sm.createState('active', {
                    pointMove: (function () {
                        var diff = new THREE.Vector3();
                        return function (point) {
                            diff.subVectors(point.canvas, this.context.lastPoint);
                            this.context.activeImg.obj.position.add(diff);
                            self.editorBox.update(this.context.activeImg);
                            this.context.lastPoint.copy(point.canvas);
                        }
                    })(),
                    pointUp() {
                        this.context.changeState(self.smStates.idel);
                    },
                    start() {
                        if (self.editorBox) {
                            self.editorBox.active(this.context.activeImg);
                        }
                        console.log('active', this);
                        console.log('context', this.context);
                    }
                }),
                idel: this.sm.createState('idel', {
                    pointDown(intersectImgs, point) {
                        if (intersectImgs.length > 0 && this.context.activeImg.id !== intersectImgs.id) {
                            this.context.activeImg = intersectImgs[0];
                        }
                        else {
                            this.context.activeImg = null;

                            this.context.changeState(self.smStates.default);
                            return;
                        }
                        this.context.lastPoint.copy(point.canvas);
                        this.context.changeState(self.smStates.active);
                    },
                    start() {
                        console.log('idel', this);
                    }
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
            raycaster.setFromCamera(point.screen, self.Camera);
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
        function convertTouchToMouse(point) {
            if (point.clientX || (point.touches && point.touches.length > 0) || (point.changedTouches && point.changedTouches.length > 0)) {
                var cursor = point.clientX ? point : point.touches && point.touches.length > 0 ? point.touches[0] : point.changedTouches && point.changedTouches.length > 0 ? point.changedTouches[0] : null;
                return cursor;
            }
            else {
                throw 'un supported point'
            }
        }
        function pointUp(point) {
            self.sm.emit('pointUp', point);
            self.emit('pointUp', point);
        }
        function pointMove(point) {
            self.sm.emit('pointMove', point);
            self.emit('pointMove', point);
        }
        function pointDonw(point) {
            var intersectImgs = pointTest(point);
            self.sm.emit('pointDown', intersectImgs, point);
            self.emit('pointDown', intersectImgs, point);
        }
        this.canvas.addEventListener('mousedown', function (ev) {
            if (ev.cancelable) ev.preventDefault();
            pointDonw(SetCoord(convertTouchToMouse(ev), mouse));
        });
        this.canvas.addEventListener('touchstart', function (ev) {
            if (ev.cancelable) ev.preventDefault();
            pointDonw(SetCoord(convertTouchToMouse(ev), mouse));
        });
        this.canvas.addEventListener('mousemove', function (ev) {
            if (ev.cancelable) ev.preventDefault();
            pointMove(SetCoord(convertTouchToMouse(ev), mouse));
        });
        this.canvas.addEventListener('touchmove', function (ev) {
            if (ev.cancelable) ev.preventDefault();
            if (ev.touches.length < 2) {
                pointMove(SetCoord(convertTouchToMouse(ev), mouse));
            }
        });
        this.canvas.addEventListener('mouseup', function (ev) {
            if (ev.cancelable) ev.preventDefault();
            pointUp(SetCoord(convertTouchToMouse(ev), mouse));
        });
        this.canvas.addEventListener('touchend', function (ev) {
            if (ev.cancelable) ev.preventDefault();
            pointUp(SetCoord(convertTouchToMouse(ev), mouse));
        })
        this.init();
        this.Frame();


    }
    PictureEditor.prototype = Object.create(EventBase.prototype);
    PictureEditor.prototype.constructor = PictureEditor;
    window.PictureEditor = PictureEditor;
})(window)