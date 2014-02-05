define([
    'hammerjs',
    'shape/renderer/renderer',
    'shape/render',
    'shape/viewport',
    'math/matrix4',
    'math/vector3',
    'math/quaternion',
    'shape/mesh/cube',
    'shape/mesh/coordinate',
    'shape/color',
    'game/config',
    'collision/manager',
    'collision/strategy/triangle',
    'state'
],
function(
    Hammer,
    Renderer,
    ShapeRender,
    Viewport,
    Matrix4,
    Vector3,
    Quaternion,
    CubeMesh,
    CoordinateMesh,
    Color,
    GameConfig,
    CollisionManager,
    CollisionStrategyTriangle,
    StateMachine
) {
    'use strict';

    function SomeGame(canvas) {
        this.renderer = new Renderer(canvas);
        this.collision = new CollisionManager(new CollisionStrategyTriangle());

        var w = canvas.width;
        var h = canvas.height;

        var viewportMain = new Viewport(0, 0, w/2, h/2);
        this.engine = new ShapeRender(
            viewportMain,
            this.renderer,
            Matrix4.lookAtRH(
                new Vector3(0, 0, 500),
                Vector3.zero(),
                Vector3.up()
            ).multiply(Matrix4.rotationX(45)).multiply(Matrix4.rotationZ(45)).multiply(Matrix4.rotationY(45)),
            Matrix4.perspectiveProjection(viewportMain.width, viewportMain.height, 90)
        );

        var viewportMain = new Viewport(w/2, 0, w/2, h/2);
        this.topRight = new ShapeRender(
            viewportMain,
            this.renderer,
            Matrix4.lookAtRH(
                new Vector3(0, 0, 500),
                Vector3.zero(),
                Vector3.up()
            ).multiply(Matrix4.rotationX(90)),
            Matrix4.perspectiveProjection(viewportMain.width, viewportMain.height, 90)
        );

        var viewportMain = new Viewport(w/2, w/2, w/2, h/2);
        this.bottomRight = new ShapeRender(
            viewportMain,
            this.renderer,
            Matrix4.lookAtRH(
                new Vector3(0, 0, 500),
                Vector3.zero(),
                Vector3.up()
            ).multiply(Matrix4.rotationY(90)),
            Matrix4.perspectiveProjection(viewportMain.width, viewportMain.height, 90)
        );

        var viewportMain = new Viewport(0, w/2, w/2, h/2);
        this.bottomLeft = new ShapeRender(
            viewportMain,
            this.renderer,
            Matrix4.lookAtRH(
                new Vector3(0, 0, 500),
                Vector3.zero(),
                Vector3.up()
            ),
            Matrix4.perspectiveProjection(viewportMain.width, viewportMain.height, 90)
        );

        document.addEventListener("keydown", this.captureKeys.bind(this), false);

        this.cube = new CubeMesh(0, 0, GameConfig.BOARD_EDGE + GameConfig.CUBE_FIELD_SIZE, GameConfig.CUBE_FIELD_SIZE, Color.fromName('red'));

        this.meshes = []
        this.meshes.push(this.cube);

        var mesh = new CoordinateMesh(-w/2 * 1.2, w/2 * 1.2, 0);
        this.meshes.push(mesh);

        this.bigMesh = new CubeMesh(0, 0, 0, GameConfig.BOARD_WIDTH, Color.fromName('green'));
        this.meshes.push(this.bigMesh);
        this.collision.push(this.bigMesh)

        this.velocity = 1;
        this.direction = new Vector3(0, 0, -1);
        this.rotation = new Vector3(0, 1, 0);

        Hammer(document, {
            release: false,
            drag_lock_to_axis: true
        })
        .on('drag', function(e) {
            e.gesture.preventDefault();
            switch(e.gesture.direction) {
                case 'left': this.sm.trigger('press.left'); break;
                case 'right': this.sm.trigger('press.right'); break;
                case 'up': this.sm.trigger('press.up'); break;
                case 'down': this.sm.trigger('press.down'); break;
            }
        }.bind(this));


        this.sm = new StateMachine({
            'forward' : {
                'ray.hit': 'climbing',
                'ray.miss': 'falling',
                // 'press.left': 'left',
                'press.right': 'right'
            },
            'falling': {
                // 'ray.hit': 'climbing',
                'ray.miss': 'falling',
                'press.left': 'left',
                'press.right': 'right',
                'press.up': 'up',
                'press.down': 'down'
            },
            'climbing': {
                // 'ray.hit': 'climbing',
                'ray.miss': 'falling',
                'press.left': 'left',
                'press.right': 'right'
            },
            'up': {
                'ray.miss': 'falling',
                'press.left': 'left',
                'press.right': 'right'
            },
            'down': {
                'ray.miss': 'falling',
                'press.left': 'left',
                'press.right': 'right'
            },
            'left': {
                'ray.miss': 'falling',
                'press.up': 'up',
                'press.down': 'down'
            },
            'right': {
                'ray.miss': 'falling',
                'press.up': 'up',
                'press.down': 'down'
            }
        });

        this.sm.on('enter:right', function(e){
            var cross = this.direction.cross(this.rotation);
            this.direction = new Quaternion(-90, cross).multiply(this.direction).v;
            this.rotation = new Quaternion(-90, cross).multiply(this.rotation).v;
        }.bind(this))
        this.sm.on('enter:left', function(e){
            var cross = this.direction.cross(this.rotation);
            this.direction = new Quaternion(90, cross).multiply(this.direction).v;
            this.rotation = new Quaternion(90, cross).multiply(this.rotation).v;
        }.bind(this));
        this.sm.on('enter:up', function(e, from){
            // console.log('up', from)
            var sign = from === 'left' ? -1 : 1;
            var cross = this.direction.cross(this.rotation);
            this.direction = new Quaternion(sign * 90, cross).multiply(this.direction).v;
            this.rotation = new Quaternion(sign * 90, cross).multiply(this.rotation).v;
        }.bind(this));
        this.sm.on('enter:down', function(e, from){
            // console.log('down', from)
            var sign = from === 'left' ? 1 : -1;
            var cross = this.direction.cross(this.rotation);
            this.direction = new Quaternion(sign * 90, cross).multiply(this.direction).v;
            this.rotation = new Quaternion(sign * 90, cross).multiply(this.rotation).v;
        }.bind(this));
        this.sm.on('enter:falling', function(e){
            this.direction = new Quaternion(90, this.rotation).multiply(this.direction).v
        }.bind(this));
        this.sm.on('enter:climbing', function(e){
            this.direction = new Quaternion(-90, this.rotation).multiply(this.direction).v
        }.bind(this));
    }

    SomeGame.prototype.captureKeys = function(e) {
        switch(e.keyCode) {
            case 37: e.preventDefault(); this.sm.trigger('press.left'); break; // left
            case 39: e.preventDefault(); this.sm.trigger('press.right'); break; // right
            case 38: e.preventDefault(); this.sm.trigger('press.up'); break; // up
            case 40: e.preventDefault(); this.sm.trigger('press.down'); break; // down
        }
    }
    SomeGame.prototype.doCollision = function() {
        this.cube.translation = this.cube.translation.add(this.direction.scale(this.velocity * 10))

        var self = this;
        var from = this.cube.translation;
        var toGroundDirection = new Quaternion(45, this.rotation).multiply(this.direction).v;

        this.collision.raycast(from, toGroundDirection, 15, function() {
            self.sm.trigger('ray.hit');
            self.bigMesh.color = Color.fromName('blue');
        }, function() {
            self.sm.trigger('ray.miss')
            self.bigMesh.color = Color.fromName('green');
        });

        this.renderer.drawCline(
            this.engine.project(from),
            this.engine.project(from.add(toGroundDirection.scale(37)))
        );
    }
    SomeGame.prototype.run = function() {
        this.renderer.clean();
        this.engine.render(this.meshes);
        this.doCollision();
        this.topRight.render(this.meshes);
        this.bottomLeft.render(this.meshes);
        this.bottomRight.render(this.meshes);
        this.renderer.render();

        setTimeout(this.run.bind(this), 100);
    }

    return SomeGame;
})
