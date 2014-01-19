require.config({
    baseUrl: "js",
    paths: {
        hammerjs: '../bower_components/hammerjs/hammer.min'
    }
    ,optimize: "none"
});

require(['game6'], function(TetrisGame) {
    'use strict';

    var tetris, game;

    var ratio = devicePixelRatio = window.devicePixelRatio || 1,
        width = 640,
        height = 640;

    game = document.createElement('canvas');
    game.setAttribute('id', 'board');
    game.width = width * ratio;
    game.height = height * ratio;
    game.style.width = width + 'px';
    game.style.height = height + 'px';
    document.body.appendChild(game);

    // Catch user events
    document.ontouchmove = function(event){
        event.preventDefault();
    }

    tetris = new TetrisGame(game);
    tetris.run();
});
