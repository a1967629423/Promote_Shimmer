(function (window) {
    function SetCoord(point, screenCoord, canvas) {
        var clientX = point.clientX;
        var clientY = point.clientY;
        screenCoord.source.x = clientX;
        screenCoord.source.y = clientY;
        screenCoord.canvas.x = clientX - (canvas ? canvas.width : window.innerWidth) / 2;
        screenCoord.canvas.y = -clientY + (canvas ? canvas.height : window.innerHeight) / 2;
        screenCoord.screen.x = (clientX / (canvas ? canvas.width : window.innerWidth)) * 2 - 1;
        screenCoord.screen.y = -(clientY / (canvas ? canvas.height : window.innerHeight)) * 2 + 1;
        return screenCoord;

    }
    function ConvertScreenToSourceCoord(screen, canvas) {
        screen.x = (screen.x + 1) / 2 * (canvas ? canvas.width : window.innerWidth);
        screen.y = -(screen.y - 1) / 2 * (canvas ? canvas.height : window.innerHeight);
        return screen;
    }
    function ConvertScreenToCanvasCoord(screen, canvas) {
        screen.x *= (canvas ? canvas.width : window.innerWidth);
        screen.y *= (canvas ? canvas.height : window.innerHeight);
        return screen;
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
    function ConvertCanvasToSourceCoord(canvas, element) {
        canvas.x = canvas.x + (element ? element.width : window.innerWidth) / 2;
        canvas.y = -(canvas.y - (element ? element.height : window.innerHeight) / 2);
        return canvas;
    }
    var ToolBox = function (editor) {
        EventBase.call(this);
        var self = this;
        var head = $('.editor-toolbox-head'), first = $('.editor-toolbox-warper.first'),
            second = $('.editor-toolbox-warper.second'), third = $('.editor-toolbox-warper.third'),
            headIcon = head.children('i.fa');
        this.init = function () {
            this.initSm();
            this.initDomEvent();
        }
        this.initSm = function () {
            var layoutSm = new StateMachine({ targetElem: second });
            var canvasSm = new StateMachine({ targetElem: second });
            var saveSm = new StateMachine({ targetElem: second });
            var generateIconHtml = function (iconName, text) {
                return `<div class='editor-toolbox-cell'><i class='fa fa-${iconName} fa-lg'></i><div>${text}</div></div>`
            }
            var saveSmStates = {
                default: saveSm.createDefaultState('default', {
                    jpgElem: $(generateIconHtml('file-image-o', 'jpg')).on('click', function () { saveSm.emit('jpg') }),
                    pngElem: $(generateIconHtml('file-image-o', 'png')).on('click', function () { saveSm.emit('png') }),
                    active() {
                        this.context.targetElem.append(this.jpgElem).append(this.pngElem);
                    },
                    inactive() {
                        this.jpgElem.detach();
                        this.pngElem.detach();
                    },
                    jpg() {
                        console.log('jpg')
                    },
                    png() {
                        console.log('png')
                    }
                })
            }
            var canvasSmStates = {
                default: canvasSm.createDefaultState('default', {
                    active() {

                    },
                    inactive() {

                    }
                })
            }
            var layoutSmState = {
                defalut: layoutSm.createDefaultState('default', {
                    addElem:$(generateIconHtml('plus-square','添加')).on('click',function(){layoutSm.emit('add')}),
                    fileSelect:$(`<input type='file' hidden accept="image/*">`).on('change',function(){layoutSm.emit('filechange')}),
                    addLayerLevelElem:$(generateIconHtml('plus','层级+1')).on('click',function(){layoutSm.emit('addLayerLevel')}),
                    diffLayerLevelElem:$(generateIconHtml('minus','层级-1')).on('click',function(){layoutSm.emit('diffLayerLevel')}),
                    loader:new THREE.TextureLoader(),
                    active() {
                        this.context.targetElem.append(this.addElem).append(this.fileSelect).append(this.addLayerLevelElem).append(this.diffLayerLevelElem);
                    },
                    inactive() {
                        this.addElem.detach();
                        this.fileSelect.detach();
                        this.addLayerLevelElem.detach();
                        this.diffLayerLevelElem.detach();
                    },
                    add() {
                        this.fileSelect.trigger('click');
                    },
                    filechange(){
                        var imgUrl = window.URL.createObjectURL(this.fileSelect[0].files[0]);
                        this.loader.load(imgUrl,function(img){
                            img.magFilter = img.minFilter = THREE.LinearFilter;
                            editor.addImg(img);
                        })
                    },
                    addLayerLevel(){
                        editor.sm.emit('addLayerLevel')
                    },
                    diffLayerLevel(){
                        editor.sm.emit('diffLayerLevel')
                    }
                })
            }
            this.fSm = new StateMachine({
                elem: {
                    layout: (function () {
                        var layout = first.children('.layout').on('click', function () {
                            self.fSm.emit('layout');
                        });
                        layout.sm = layoutSm;
                        return layout;
                    })(),
                    canvas: (function () {
                        var canvas = first.children('.canvas').on('click', function () {
                            self.fSm.emit('canvas');
                        });
                        canvas.sm = canvasSm;
                        return canvas;
                    })(),
                    save: (function () {
                        var save = first.children('.save').on('click', function () {
                            self.fSm.emit('save');
                        })
                        save.sm = saveSm;
                        return save;
                    })()
                }
            });

            this.fSmStates = {
                default: this.fSm.createDefaultState('default', {
                    layout() {
                        this.active(this.context.elem.layout);
                    },
                    canvas() {
                        this.active(this.context.elem.canvas);
                    },
                    save() {
                        this.active(this.context.elem.save);
                    },
                    active(element) {
                        if (element) {
                            if (element === this.context.activedElement) {
                                this.context.activedElement.removeClass('active');
                                this.context.activedElement.sm.emit('inactive');
                                this.context.activedElement = null;
                                second.addClass('hidden');
                            }
                            else {
                                if (this.context.activedElement) {
                                    this.context.activedElement.removeClass('active')
                                    this.context.activedElement.sm.emit('inactive');
                                }
                                this.context.activedElement = element;
                                this.context.activedElement.addClass('active');
                                this.context.activedElement.sm.emit('active');
                                second.removeClass('hidden');
                            }
                        }
                    },
                    start() {
                        for (var item in this.context.elem) {
                            this.context.elem[item].removeClass('active');
                        }
                    }
                })
            }
            first.sm = this.fSm;
        }
        this.initDomEvent = function () {
            head.on('click', (function () {
                var nowState = true;
                return function () {
                    if (nowState) {
                        first.removeClass('hidden');
                        if (first.sm) first.sm.emit('start');
                        headIcon.removeClass('fa-angle-up');
                        headIcon.addClass('fa-angle-down');
                    }
                    else {
                        first.addClass('hidden');
                        second.addClass('hidden');
                        third.addClass('hidden');
                        headIcon.removeClass('fa-angle-down');
                        headIcon.addClass('fa-angle-up');
                    }
                    nowState = !nowState;
                }
            })());
        }


        this.init();
    }
    ToolBox.prototype = Object.create(EventBase.prototype);
    ToolBox.prototype.constructor = ToolBox;
    var EditorBox = function (element, camera) {
        EventBase.call(this);
        var self = this;
        this.camera = camera;
        this.position = new THREE.Vector3(0, 0, 0);
        this.shape = new THREE.Vector3(0, 0, 0);
        this.activeImg = null;
        this.sm = new StateMachine();
        this.smStates = {
            default: this.sm.createDefaultState('default', {
                pointDown(point, target) {
                    var isleft = target.hasClass('left'), isright = target.hasClass('right'),
                        istop = target.hasClass('top'), isbottom = target.hasClass('bottom'),
                        horizontal = isleft || isright, vertical = istop || isbottom;
                    if (horizontal && vertical) {
                        if (isleft) {
                            if (istop) {
                                this.context.pointIndexes.push({ idx: 0, horizontal: true, vertical: true });
                                this.context.pointIndexes.push({ idx: 2, horizontal: true })
                                this.context.pointIndexes.push({ idx: 1, vertical: true })
                            }
                            else {
                                this.context.pointIndexes.push({ idx: 2, horizontal: true, vertical: true });
                                this.context.pointIndexes.push({ idx: 0, horizontal: true })
                                this.context.pointIndexes.push({ idx: 3, vertical: true })
                            }
                        }
                        else {
                            if (istop) {
                                this.context.pointIndexes.push({ idx: 1, horizontal: true, vertical: true })
                                this.context.pointIndexes.push({ idx: 3, horizontal: true })
                                this.context.pointIndexes.push({ idx: 0, vertical: true })
                            }
                            else {
                                this.context.pointIndexes.push({ idx: 3, horizontal: true, vertical: true })
                                this.context.pointIndexes.push({ idx: 1, horizontal: true })
                                this.context.pointIndexes.push({ idx: 2, vertical: true })
                            }
                        }
                    } else if (horizontal) {

                        if (isleft) {
                            this.context.pointIndexes.push({ idx: 0, horizontal: true });
                            this.context.pointIndexes.push({ idx: 2, horizontal: true });

                        }
                        else {
                            this.context.pointIndexes.push({ idx: 1, horizontal: true });
                            this.context.pointIndexes.push({ idx: 3, horizontal: true });
                        }
                    } else if (vertical) {

                        if (istop) {
                            this.context.pointIndexes.push({ idx: 0, vertical: true });
                            this.context.pointIndexes.push({ idx: 1, vertical: true });
                        }
                        else {
                            this.context.pointIndexes.push({ idx: 2, vertical: true });
                            this.context.pointIndexes.push({ idx: 3, vertical: true });
                        }
                    }
                    this.context.lastPoint.copy(point.canvas);
                    this.context.changeState(self.smStates.active);
                },
                start() {
                    if (!this.context.lastPoint) this.context.lastPoint = new THREE.Vector3();
                    this.context.pointIndexes = [];
                }
            }),
            active: this.sm.createState('active', {
                pointMove: (function () {
                    var diff = new THREE.Vector3();
                    return function (point) {
                        diff.subVectors(point.canvas, this.context.lastPoint);
                        var attribute = self.activeImg.obj.geometry.attributes.position;
                        var array = attribute.array;
                        this.context.pointIndexes.forEach(v => {
                            var idx = v.idx * 3;
                            if (v.horizontal) {
                                array[idx] += diff.x / self.camera.zoom;
                            }
                            if (v.vertical) {
                                array[idx + 1] += diff.y / self.camera.zoom;
                            }

                        });
                        this.context.lastPoint.copy(point.canvas);
                        attribute.needsUpdate = true;
                        self.update();
                    }

                })(),
                pointUp() {
                    this.context.changeState(self.smStates.default);
                }
            }),
            idel: this.sm.createState('idel')
        }
        if (element && element instanceof window.HTMLElement) {
            this.element = element;
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
            var mouse = {
                screen: new THREE.Vector3(),
                canvas: new THREE.Vector3(),
                source: new THREE.Vector3(),
            }
            function pointDown(point, target) {
                self.sm.emit('pointDown', point, target);
            }
            function pointMove(point, target) {
                self.sm.emit('pointMove', point, target);
            }
            function pointUp(point, target) {
                self.sm.emit('pointUp', point, target);
            }
            var j_element = $(element)
            for (var item in anchors) {
                anchors[item].on('mousedown', { target: anchors[item] }, (event) => {
                    if (event.cancelable) event.preventDefault();
                    pointDown(SetCoord(convertTouchToMouse(event), mouse), event.data.target);
                });
                anchors[item].on('touchstart', { target: anchors[item] }, (event) => {
                    if (event.cancelable) event.preventDefault();
                    pointDown(SetCoord(convertTouchToMouse(event), mouse), event.data.target);
                });
                //fix because mouse move too fast that loss event
                j_element.on('mousemove', { target: anchors[item] }, (event) => {
                    if (event.cancelable) event.preventDefault();
                    pointMove(SetCoord(convertTouchToMouse(event), mouse), event.data.target);
                });
                anchors[item].on('touchmove', { target: anchors[item] }, (event) => {
                    if (event.cancelable) event.preventDefault();
                    pointMove(SetCoord(convertTouchToMouse(event), mouse), event.data.target);
                });
                anchors[item].on('mouseup', { target: anchors[item] }, (event) => {
                    if (event.cancelable) event.preventDefault();
                    pointUp(SetCoord(convertTouchToMouse(event), mouse), event.data.target);
                });
                anchors[item].on('touchend', { target: anchors[item] }, (event) => {
                    if (event.cancelable) event.preventDefault();
                    pointUp(SetCoord(convertTouchToMouse(event), mouse), event.data.target);
                });
                container.append(anchors[item]);
            }

            $(element).after(container);
            container.width(100);
            container.height(100);
            container.hide();

        }

        var syncPositionAndSize = (function () {
            var boxMax = new THREE.Vector3();
            var boxMin = new THREE.Vector3();
            var center = new THREE.Vector3();
            return function (img) {
                self.position.setFromMatrixPosition(img.obj.matrixWorld);
                // todo boxposition must to multiply modelview and project and convertTo Source
                img.obj.geometry.computeBoundingBox();
                img.obj.geometry.computeBoundingSphere();
                var box = img.obj.geometry.boundingBox;
                boxMax.copy(box.max);
                boxMin.copy(box.min);
                center.copy(img.obj.geometry.boundingSphere.center);
                ConvertScreenToSourceCoord(boxMax.applyMatrix4(img.obj.modelViewMatrix).applyMatrix4(self.camera.projectionMatrix), element);
                ConvertScreenToSourceCoord(boxMin.applyMatrix4(img.obj.modelViewMatrix).applyMatrix4(self.camera.projectionMatrix), element);
                ConvertScreenToSourceCoord(center.applyMatrix4(img.obj.modelViewMatrix).applyMatrix4(self.camera.projectionMatrix), element);
                var width = boxMax.x - boxMin.x;
                var height = boxMax.y -boxMin.y;
                //ConvertCanvasToSourceCoord(self.position, element)
                // container.css('left', self.position.x + center.x);
                // container.css('top', self.position.y - center.y);
                container.css('left', center.x);
                container.css('top', center.y);

                self.shape.setFromMatrixScale(img.obj.matrixWorld);
                container.width(Math.abs(self.shape.x * width));
                container.height(Math.abs(self.shape.y * height));
            }
        })();
        this.active = function (img) {
            if (img && img.obj instanceof THREE.Object3D) {
                this.activeImg = img;
                syncPositionAndSize(img);
                container.show();
            }
        }
        this.update = function (img) {
            if (img && img !== this.activeImg) {
                syncPositionAndSize(img);
                this.activeImg = img;
                return;
            }
            syncPositionAndSize(this.activeImg);

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
        this.viewScale = 1.0;
        this.canvas = canvas;
        this.Scene = new THREE.Scene();
        this.Camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2);
        this.Camera.position.z = 1000;
        this.Camera.lookAt(new THREE.Vector3(0, 0, 0))
        this.Renderer = new THREE.WebGLRenderer({ canvas: canvas });
        this.Renderer.setClearColor(new THREE.Color(0xffffff))
        this.clock = new THREE.Clock();
        this.idCursor = 0;
        this.imgs = { array: [] };
        this.sm = new StateMachine();
        this.smStates = {};
        this.init = function () {
            this.initSm();
            this.initBox();
            window.camera = this.Camera;
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
                            diff.subVectors(point.canvas, this.context.lastPoint).divideScalar(self.Camera.zoom);
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
                    },
                    addLayerLevel()
                    {
                        var idx = self.imgs.array.findIndex(v=>v===this.context.activeImg)
                        if(idx>-1&&idx<self.imgs.array.length-1)
                        {
                            var currentOrder = this.context.activeImg.order;
                            this.context.activeImg.order = self.imgs.array[idx+1].order
                            self.imgs.array[idx+1].order = currentOrder;
                        }
                        self.imgs.needsUpdate = true;
                    },
                    diffLayerLevel()
                    {
                        var idx = self.imgs.array.findIndex(v=>v===this.context.activeImg)
                        if(idx>0)
                        {
                            var currentOrder = this.context.activeImg.order;
                            this.context.activeImg.order = self.imgs.array[idx-1].order
                            self.imgs.array[idx-1].order = currentOrder;
                        }
                        self.imgs.needsUpdate = true;
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
            this.Camera.zoom = 1./this.viewScale;
            this.Camera.updateProjectionMatrix();
            this.Renderer.setSize(width, height , false);
        }
        this.onSizeChange();
        window.addEventListener('resize', this.onSizeChange.bind(this));
        this.Render = function () {
            this.Renderer.render(this.Scene, this.Camera);
        }
        function updateImgs() {
            self.imgs.array.sort((a, b) => a.order - b.order);
            self.imgs.array.forEach(v => {
                v.obj.position.z = v.order;
            })
        }
        this.Logic = function () {
            if (this.imgs.needsUpdate) {
                this.imgs.needsUpdate = false;
                updateImgs();
            }
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
            window.imgs = this.imgs
            if(Img.image.width> this.canvas.width || Img.image.height>this.canvas.height)
            {
                this.viewScale = Math.max(Img.image.width/this.canvas.width,Img.image.height/this.canvas.height);
                this.onSizeChange();
            }
            this.imgs.array.push({ source: Img, obj: mesh, id: this.idCursor++, order: this.imgs.array.length > 0 ? (this.imgs.array[this.imgs.array.length - 1].order + 1) : 1 });
            this.imgs.needsUpdate = true;
            this.Scene.add(mesh);
        }
        this.removeImg = function (id) {
            for (var i = this.imgs.array.length - 1; i > -1; i--) {
                if (this.imgs.array[i].id === id) {
                    this.Scene.remove(this.imgs.array.splice(i, 1)[0].obj);
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
                var img = self.imgs.array.find(v => v.obj === intersects[i].object);
                if (img) {
                    intersectImgs.push(img);
                }
            }
            return intersectImgs;
        }
        function pointUp(point) {
            self.sm.emit('pointUp', point);
            self.emit('pointUp', point);
        }
        function pointMove(point) {
            self.sm.emit('pointMove', point);
            self.emit('pointMove', point);
        }
        function pointDown(point) {
            var intersectImgs = pointTest(point);
            self.sm.emit('pointDown', intersectImgs, point);
            self.emit('pointDown', intersectImgs, point);
        }
        this.canvas.addEventListener('mousedown', function (ev) {
            if (ev.cancelable) ev.preventDefault();
            pointDown(SetCoord(convertTouchToMouse(ev), mouse));
        });
        this.canvas.addEventListener('touchstart', function (ev) {
            if (ev.cancelable) ev.preventDefault();
            pointDown(SetCoord(convertTouchToMouse(ev), mouse));
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
    window.ToolBox = ToolBox;
})(window)