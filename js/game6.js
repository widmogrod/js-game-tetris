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
    'shape/collision/manager',
    'shape/collision/strategy/meshcube'
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
    CollisionStrategyMeshCube
) {
    'use strict';

    function SomeGame(canvas) {
        this.renderer = new Renderer(canvas);
        this.collision = new CollisionManager(new CollisionStrategyMeshCube());

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
            ),
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
        this.cube.rotation.y = 45;

        this.meshes = []
        this.meshes.push(this.cube);

        var mesh = new CoordinateMesh(w/2, w/2, w/2);
        // mesh.scale = mesh.scale.scale(50);
        this.meshes.push(mesh);

        this.bigMesh = new CubeMesh(0, 0, 0, GameConfig.BOARD_WIDTH, Color.fromName('green'));
        this.meshes.push(this.bigMesh);

        this.velocity = 1;
        this.direction = new Quaternion(45, new Vector3(0, 1, 0)).multiply(new Vector3(0, 0, -1)).v;

        var self = this;
        this.collision.when(this.cube, this.bigMesh, function(e) {
            e.preventRelease = true;
            self.bigMesh.color = Color.fromName('blue');
        }, function(e) {
            e.preventRelease = true;
            self.bigMesh.color = Color.fromName('green');
        });


        this.distance = 500;
        this.rotation = Vector3.zero();

        Hammer(document)
        .on('drag', function(e) {
            switch(e.gesture.direction) {
                case 'left':
                    self.cube.rotation.y -= e.gesture.velocityX * 10;
                    break;
                case 'right':
                    self.cube.rotation.y += e.gesture.velocityX * 10;
                    break;
                case 'up':
                    self.cube.rotation.x += e.gesture.velocityY * 10;
                    break;
                case 'down':
                    self.cube.rotation.x -= e.gesture.velocityY * 10;
                    break;
            }
        })
        .on('rotate', function(e){
            self.rotation = new Quaternion(e.gesture.rotation, Vector3.forward()).multiply(self.rotation).v;
        })
        .on('pinch', function(e) {
            switch(e.type) {
                case 'pinchin': self.distance += e.gesture.scale  * 100; break;
                case 'pinchout': self.distance -= e.gesture.scale * 100; break;
            }
        })
        .on('drag swipe rotate pinch', function(e) {
            console.log(e.type);
        });
    }

    SomeGame.prototype.captureKeys = function(e) {
        switch(e.keyCode) {
            case 37: e.preventDefault(); this.cube.translation.x -= 10; break; // left
            case 39: e.preventDefault(); this.cube.translation.x += 10; break; // right
            case 38: e.preventDefault(); this.cube.translation = this.cube.translation.add(this.direction.scale(this.velocity * 10)); break; // up
            case 40: e.preventDefault(); this.cube.translation = this.cube.translation.subtract(this.direction.scale(this.velocity * 10)); break; // down
            case 87: e.preventDefault(); this.cube.translation.y += 10; break; // w
            case 83: e.preventDefault(); this.cube.translation.y -= 10; break; // s
        }
    }
    SomeGame.prototype.run = function() {

        this.engine.viewMatrix = Matrix4.lookAtRH(
            new Vector3(0, 0, this.distance),
            this.rotation,
            Vector3.up()
        );

        this.renderer.clean();
        this.engine.render(this.meshes);
        this.topRight.render(this.meshes);
        this.bottomLeft.render(this.meshes);
        this.bottomRight.render(this.meshes);
        this.collision.run();
        this.renderer.render();
        requestAnimationFrame(this.run.bind(this))
    }

    return SomeGame;
})
