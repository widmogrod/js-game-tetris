define(function(){
    'use strict';

    function CollisionStrategyInterface() {}

    CollisionStrategyInterface.prototype.isCollision = function(one, two) {}
    CollisionStrategyInterface.prototype.raycast = function(origin, target, object) {}

    return CollisionStrategyInterface;
})
