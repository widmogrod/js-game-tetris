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
    'collision/strategy/meshcube'
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
        // this.cube.rotation.y = 45;

        this.meshes = []
        this.meshes.push(this.cube);

        var mesh = new CoordinateMesh(-w/2 * 1.2, w/2 * 1.2, 0);
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


        this.selectedMesh = this.cube;

        Hammer(document, {
            prevent_mouseevents: true,
            // release: false,
            drag_lock_to_axis: true
        })
        .on('drag', function(e) {
            e.gesture.preventDefault();
            switch(e.gesture.direction) {
                case 'left':
                    self.selectedMesh.rotation.y -= e.gesture.velocityX * 10;
                    break;
                case 'right':
                    self.selectedMesh.rotation.y += e.gesture.velocityX * 10;
                    break;
                case 'up':
                    self.selectedMesh.rotation.x += e.gesture.velocityY * 10;
                    break;
                case 'down':
                    self.selectedMesh.rotation.x -= e.gesture.velocityY * 10;
                    break;
            }
        })
        // .on('transform', function(e) {
        //     self.selectedMesh.translation.x += e.gesture.deltaX;
        //     self.selectedMesh.translation.y -= e.gesture.deltaY;
        //     // console.log('transform', e)
        // })
        .on('rotate', function(e){
            e.gesture.preventDefault();
            self.selectedMesh.rotation.z -= e.gesture.rotation/10;
        })
        .on('pinchin', function(e) {
            e.gesture.preventDefault();
            self.selectedMesh.transformation.z += e.gesture.scale * 10
        })
        .on('pinchout', function(e) {
            e.gesture.preventDefault();
            self.selectedMesh.transformation.z -= e.gesture.scale * 10
        })
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

        // this.selectedMesh.translation.z = self.distance;
        // this.engine.viewMatrix = Matrix4.lookAtRH(
        //     new Vector3(0, 0, this.distance),
        //     this.rotation,
        //     Vector3.up()
        // );

        this.renderer.clean();
        this.engine.render(this.meshes);
        this.topRight.render(this.meshes);
        this.bottomLeft.render(this.meshes);
        this.bottomRight.render(this.meshes);
        this.collision.run();
        this.renderer.render();
        // requestAnimationFrame(this.run.bind(this))

        setTimeout(this.run.bind(this), 100);
    }

    return SomeGame;
})
