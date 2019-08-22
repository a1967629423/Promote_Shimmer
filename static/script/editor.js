const THREE = require('three');
const checkerboader = require('./require/shader/checkerboard').checkerboard;
(function (window) {
    function SetCoord(point, screenCoord, canvas) {
        var clientX = point.clientX;
        var clientY = point.clientY;
        screenCoord.source.x = clientX;
        screenCoord.source.y = clientY;
        screenCoord.canvas.x = (clientX-(canvas?canvas.offsetLeft:0)) - (canvas ? canvas.width : window.innerWidth) / 2;
        screenCoord.canvas.y = -(clientY - (canvas?canvas.offsetTop:0)) + (canvas ? canvas.height : window.innerHeight) / 2;
        screenCoord.screen.x = ((clientX-(canvas?canvas.offsetLeft:0)) / (canvas ? canvas.width : window.innerWidth)) * 2 - 1;
        screenCoord.screen.y = -((clientY - (canvas?canvas.offsetTop:0))  / (canvas ? canvas.height : window.innerHeight)) * 2 + 1;
        return screenCoord;

    }
    function ConvertScreenToSourceCoord(screen, canvas) {
        screen.x = (screen.x + 1) / 2 * (canvas ? canvas.width : window.innerWidth) + (canvas? canvas.offsetLeft:0);
        screen.y = -(screen.y - 1) / 2 * (canvas ? canvas.height : window.innerHeight) + (canvas? canvas.offsetTop:0);
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
        var layers = [head, first, second, third];
        /*
        *before active 与 inactive接收 对象，其中包含 elem(外层cell(jquery)) rule(当前rule) event(当前事件
        *(可阻止当前窗口动画,与激活设置))其中 before 必须异步 Rules内不可使用_elem(记录cell) _actived(记录激活状态) _layer(当前处在的层)
        */
        var generateIconHtml = function (iconName, text) {
            return `<i class='fa fa-${iconName} fa-lg'></i><div>${text ? text : ''}</div>`
        }
        async function preventAll(data) {
            data.event.preventStateChange();
            data.event.preventBoxAnimat();
        }
        async function activeIcon(data) {
            return data.elem.addClass('active')
        }
        async function inactiveIcon(data) {
            return data.elem.removeClass('active')
        }
        function _closeAllNextRules(elem) {
            var rules = elem.nextRules;
            if (rules) {
                for (var item in rules) {
                    var rule = rules[item]
                    if (rule._actived) {

                        self.cellClick({ data: { rule: rules[item] } });
                        if (!rule.inactiveBefore.some(v => v === closeAllNextRules))
                            _closeAllNextRules(rule);
                    }
                }
            }
        }
        function closeAllNextRules(data) {
            return new Promise((res) => {
                _closeAllNextRules(data.rule);
                res();
            })
        }
        this.Rules = {
            open: {
                icon: `<i class="fa fa-angle-up fa-lg"></i>`,
                activeBefore: [],
                active(data) {
                    data.elem.children('i.fa').removeClass('fa-angle-up').addClass('fa-angle-down');
                },
                inactiveBefore: [closeAllNextRules],
                inactive(data) {
                    data.elem.children('i.fa').removeClass('fa-angle-down').addClass('fa-angle-up');
                },
                init(elem) {
                    elem.css('width', '80%');
                    elem.css('textAlign', 'center');
                },
                nextRules: {
                    layer: {
                        icon: generateIconHtml('th-list', '图层'),
                        activeBefore: [activeIcon],
                        inactiveBefore: [inactiveIcon],
                        nextRules: {
                            addImg: {
                                icon: `${generateIconHtml('plus-square', '添加')}<input type="file" hidden accept="image/*">`,
                                activeBefore: [preventAll],
                                active(data) {
                                },
                                inactiveBefore: [preventAll],
                                init(elem) {
                                    var input = elem.children('input');
                                    elem.on('click', function () { input[0].click() });
                                    input.on('change', { elem: input }, this.filechange);
                                },
                                filechange(event) {
                                    var input = event.data.elem;
                                    var file = input[0].files[0]
                                    var imgUrl = window.URL.createObjectURL(file);
                                    (new THREE.TextureLoader()).load(imgUrl, function (img) {
                                        img.magFilter = img.minFilter = THREE.LinearFilter;
                                        editor.addImg(img);
                                        window.URL.revokeObjectURL(imgUrl);
                                    });
                                }

                            },
                            layerLevelAdd: {
                                icon: generateIconHtml('plus', '层级+1'),
                                activeBefore: [preventAll],
                                inactiveBefore: [preventAll],
                                active(data) {
                                    editor.sm.emit('addLayerLevel')
                                },
                            },
                            layerLevelDiff: {
                                icon: generateIconHtml('minus', '层级-1'),
                                activeBefore: [preventAll],
                                inactiveBefore: [preventAll],
                                active(data) {
                                    editor.sm.emit('diffLayerLevel')
                                },
                            }
                        }
                    },
                    canvas: {
                        icon: generateIconHtml('square-o', '画布'),
                        activeBefore: [activeIcon],
                        inactiveBefore: [inactiveIcon],
                        nextRules: {
                            RangeSet: {
                                icon: `
                                ${generateIconHtml('arrows', '尺寸调节')}
                                <div class="editor-toolbox-range-input">
                                    宽:<input type="number" class="width">
                                    高:<input type="number" class="height">
                                    <div class="btn btn-small change-size">修改</div>
                                </div>`,
                                activeBefore: [preventAll],
                                init(elem) {
                                    elem.addClass('flex-row');
                                    elem.addClass('disable-shine');
                                    elem.find('.change-size').on('click', { elem }, this.submit);
                                },
                                submit(event) {
                                    var elem = event.data.elem;
                                    var height = Number.parseInt(elem.find('.height').val()) ;
                                    var width = Number.parseInt(elem.find('.width').val()) ;
                                    if (!Number.isInteger(height) || !Number.isInteger(width)) return;
                                    height = Number.parseInt(height);
                                    width = Number.parseInt(width);
                                    editor.setCanvasRange(width, height);
                                },
                                show(elem) {
                                    var { height, width } = editor.getCanvasRange();
                                    elem.find('.height').val(height);
                                    elem.find('.width').val(width);
                                }
                            }
                        }
                    },
                    save: {
                        icon: generateIconHtml('floppy-o', '保存'),
                        activeBefore: [activeIcon],
                        inactiveBefore: [inactiveIcon],
                        nextRules: {
                            jpg: {
                                icon: generateIconHtml('file-image-o', 'jpg'),
                                activeBefore: [preventAll],
                                active() {
                                    editor.saveImage("image/jpeg")
                                }
                            },
                            png: {
                                icon: generateIconHtml('file-image-o', 'png'),
                                activeBefore: [preventAll],
                                active() {
                                    editor.saveImage()
                                }
                            }
                        }
                    }
                }
            }
        }

        this.init = function () {
            this.initRouter();
        }
        var template = $('<div class="editor-toolbox-cell">');
        this.generateLayout = function (layer, rules) {
            for (var item in rules) {
                var rule = rules[item]
                var cell = null
                if (rule._elem) {
                    cell = rule._elem;
                }
                else {
                    cell = template.clone();
                    var iconText = rule.icon;
                    if (iconText && typeof iconText === 'string') {
                        var icon = $(iconText);
                        cell.append(icon);
                    }
                    cell.on('click', { rule }, this.cellClick);
                    if (rule.init && typeof rule.init === 'function') {
                        rule.init(cell);
                    }
                }
                if (rule.show && typeof rule.show === 'function')
                    rule.show(cell);
                layer.append(cell);
                rule._elem = cell;
                rule._layer = layer;
            }
        }
        this.recycleLayerout = function (rules) {
            for (var item in rules) {
                var rule = rules[item];
                if (rule._elem) {
                    rule._elem.detach();
                }
                rule._layer = null;
                rule._actived = false;
            }
        }
        this.cellClick = async function (_event) {
            var rule = _event.data.rule;
            var promisearray = []
            var event = {
                preventStateChange() {
                    this._canChangeState = false;
                },
                preventBoxAnimat() {
                    this._canBoxAnimat = false;
                },
                _canChangeState: true,
                _canBoxAnimat: true
            }
            var parma = { elem: rule._elem, rule, event };
            var nextIdx = layers.findIndex(v => v === rule._layer) + 1;
            nextIdx = nextIdx < layers.length - 1 ? nextIdx : -1;
            if (rule._actived) {
                var inactiveBefore = rule.inactiveBefore;
                var inactiveAfter = rule.inactiveAfter;
                var inactive = rule.inactive;
                if (inactiveBefore && inactiveBefore instanceof Array) {

                    promisearray = inactiveBefore.map(v => typeof v === 'function' ? v(parma) : null);

                }
                await Promise.all(promisearray)
                if (inactive && typeof inactive === 'function')
                    inactive({ elem: rule._elem, rule, event });
                if (inactiveAfter && inactiveAfter instanceof Array) {
                    promisearray = inactiveAfter.map(v => typeof v === 'function' ? v(parma) : null);
                }
                if (event._canChangeState) {
                    rule._actived = !rule._actived;
                    if (rule._layer && rule._layer.activedRule === rule) {
                        rule._layer.activedRule = null;
                    }
                }
                if (event._canBoxAnimat && nextIdx > -1) {
                    self.recycleLayerout(rule.nextRules);
                    layers[nextIdx].addClass('hidden');
                }
                await Promise.all(promisearray)
            }
            else {
                var active = rule.active;
                var activeBefore = rule.activeBefore;
                var activeAfter = rule.activeAfter;
                if (activeBefore && activeBefore instanceof Array) {
                    promisearray = activeBefore.map(v => typeof v === 'function' ? v(parma) : null);
                }
                await Promise.all(promisearray)
                if (active && typeof active === 'function')
                    active(parma)
                if (activeAfter && activeAfter instanceof Array) {
                    promisearray = activeAfter.map(v => typeof v === 'function' ? v(parma) : null);
                }
                if (event._canChangeState) {
                    rule._actived = !rule._actived;
                    if (rule._layer && rule._layer.activedRule) {
                        await self.cellClick({ data: { rule: rule._layer.activedRule } });
                    }
                    rule._layer.activedRule = rule;
                }
                if (nextIdx > -1) {
                    if (event._canBoxAnimat && rule.nextRules) {
                        layers[nextIdx].removeClass('hidden');
                        self.generateLayout(layers[nextIdx], rule.nextRules);
                    }
                }
                await Promise.all(promisearray)
            }

        }
        this.initRouter = function () {
            this.generateLayout(head, this.Rules);
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
                var height = boxMax.y - boxMin.y;
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
        var _pause = false;
        this.viewScale = 1.0;
        this.canvas = canvas;
        this.offCanvas = document.createElement('canvas');
        this.offCanvasCtx = this.offCanvas.getContext('2d');
        this.Scene = new THREE.Scene();
        this.Camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2);
        this.Camera.position.z = 1000;
        this.Camera.lookAt(new THREE.Vector3(0, 0, 0))
        this.Renderer = new THREE.WebGLRenderer({ canvas: canvas, preserveDrawingBuffer: true });
        this.Renderer.setClearColor(new THREE.Color(0xffffff))
        this.clock = new THREE.Clock();
        this.idCursor = 0;
        this.imgs = { array: [] };
        this.sm = new StateMachine();
        this.smStates = {};
        this.size = new THREE.Vector2(canvas.offsetWidth,canvas.offsetHeight);
        this.init = function () {
            this.initSm();
            this.initBox();
            this.initOffCanvas();
            this.initBackground();
            window.camera = this.Camera;
        }
        this.pause = function () {
            _pause = true;
        }
        this.resume = function () {
            _pause = false;
        }
        this.initBox = function () {
            this.editorBox = new EditorBox(this.canvas, this.Camera);
        }
        this.initOffCanvas = function(){
            this.offCanvas.hidden = true;
        }
        this.initBackground = function(){
            this.background = new checkerboader();
            this.background.position.z = -10;
            window.background = this.background;
            this.Scene.add(this.background);
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
                    addLayerLevel() {
                        var idx = self.imgs.array.findIndex(v => v === this.context.activeImg)
                        if (idx > -1 && idx < self.imgs.array.length - 1) {
                            var currentOrder = this.context.activeImg.order;
                            this.context.activeImg.order = self.imgs.array[idx + 1].order
                            self.imgs.array[idx + 1].order = currentOrder;
                        }
                        self.imgs.needsUpdate = true;
                    },
                    diffLayerLevel() {
                        var idx = self.imgs.array.findIndex(v => v === this.context.activeImg)
                        if (idx > 0) {
                            var currentOrder = this.context.activeImg.order;
                            this.context.activeImg.order = self.imgs.array[idx - 1].order
                            self.imgs.array[idx - 1].order = currentOrder;
                        }
                        self.imgs.needsUpdate = true;
                    }
                })

            }
        }
        this.onSizeChange = function () {
            var parent = canvas.parentElement;
            var heightPercent =  (this.size.y/this.size.x * parent.offsetWidth)/parent.offsetHeight*100;
            canvas.style.height = heightPercent+"%";
            this.RenderSizeSet();
        }
        this.RenderSizeSet = function()
        {
            var width = canvas.offsetWidth;
            var height = canvas.offsetHeight;
            this.Camera.left = width / -2;
            this.Camera.right = width / 2;
            this.Camera.top = height / 2;
            this.Camera.bottom = height / -2;
            this.Camera.zoom = 1. / this.viewScale;
            this.Camera.updateProjectionMatrix();
            this.Renderer.setSize(width, height, false);
        }
        this.setCanvasRange = function (width, height) {
            //todo
            this.size.x = width;
            this.size.y = height;
            this.onSizeChange();
        }
        this.getCanvasRange = function () {
            //todo
            return { width: this.size.x, height: this.size.y };
        }
        var fixtype = function (type) {
            type = type.toLocaleLowerCase().replace(/jpg/i, 'jpeg');
            var r = type.match(/png|jpeg|bmp|gif/)[0];
            return 'image/' + r;
        }
        function downloadIamge(url, name) {
            // 生成一个a元素
            var a = document.createElement('a')
            // 创建一个单击事件
            var event = new MouseEvent('click')

            // 将a的download属性设置为我们想要下载的图片名称，若name不存在则使用‘下载图片名称’作为默认名称
            a.download = name || '保存'
            // 将生成的URL设置为a.href属性
            //a.href = fixtype(url)
            a.href = url;
            // 触发a的单击事件
            a.dispatchEvent(event)
        }
        
        this.saveImage = (function(){
            var currentSize = new THREE.Vector2();
            return function (type) {
                this.pause();
                this.background.visible = false;
                this.Renderer.getSize(currentSize);
                this.offCanvas.height = this.size.y;
                this.offCanvas.width = this.size.x;
                this.Renderer.setSize(this.size.x,this.size.y,false);
                this.Render();
                this.offCanvasCtx.drawImage(this.canvas,0,0);
                this.offCanvas.toBlob((blob)=>{
                    var imgurl =window.URL.createObjectURL(blob) 
                    downloadIamge(imgurl);
                    console.log(imgurl);
                    this.background.visible = true;
                    this.Renderer.setSize(currentSize.x,currentSize.y,false);
                    this.resume();
                    window.URL.revokeObjectURL(blob);
                },type)
    
            }
        })()
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
            if (!_pause) {
                self.Render();
                self.Logic();
            }
            requestAnimationFrame(self.Frame)
        }
        this.addImg = function (Img) {
            var planeGeometry = new THREE.PlaneBufferGeometry(Img.image.width, Img.image.height);
            var basicMaterial = new THREE.MeshBasicMaterial({ map: Img, side: THREE.DoubleSide });
            var mesh = new THREE.Mesh(planeGeometry, basicMaterial);
            window.imgs = this.imgs
            if (Img.image.width > this.canvas.width || Img.image.height > this.canvas.height) {
                this.viewScale = Math.max(Img.image.width / this.canvas.width, Img.image.height / this.canvas.height);
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
            pointDown(SetCoord(convertTouchToMouse(ev), mouse,this));
        });
        this.canvas.addEventListener('touchstart', function (ev) {
            if (ev.cancelable) ev.preventDefault();
            pointDown(SetCoord(convertTouchToMouse(ev), mouse,this));
        });
        this.canvas.addEventListener('mousemove', function (ev) {
            if (ev.cancelable) ev.preventDefault();
            pointMove(SetCoord(convertTouchToMouse(ev), mouse,this));
        });
        this.canvas.addEventListener('touchmove', function (ev) {
            if (ev.cancelable) ev.preventDefault();
            if (ev.touches.length < 2) {
                pointMove(SetCoord(convertTouchToMouse(ev), mouse,this));
            }
        });
        this.canvas.addEventListener('mouseup', function (ev) {
            if (ev.cancelable) ev.preventDefault();
            pointUp(SetCoord(convertTouchToMouse(ev), mouse,this));
        });
        this.canvas.addEventListener('touchend', function (ev) {
            if (ev.cancelable) ev.preventDefault();
            pointUp(SetCoord(convertTouchToMouse(ev), mouse,this));
        })
        this.init();
        this.Frame();


    }
    PictureEditor.prototype = Object.create(EventBase.prototype);
    PictureEditor.prototype.constructor = PictureEditor;
    window.PictureEditor = PictureEditor;
    window.ToolBox = ToolBox;
})(window)