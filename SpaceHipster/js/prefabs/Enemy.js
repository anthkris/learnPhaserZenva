var SpaceHipster = SpaceHipster || {};

SpaceHipster.Enemy = function(game, x, y, key, health, enemyBullets) {
  Phaser.Sprite.call(this, game, x, y, key); //create a sprite using a variable key
  
  this.animations.add('getHit', [0, 1, 2, 1, 0], 25, false);
  this.anchor.setTo(0.5);
  this.health = health;
  
  this.enemyBullets = enemyBullets;
};

SpaceHipster.Enemy.prototype = Object.create(Phaser.Sprite.prototype); //inherit from Sprite class
SpaceHipster.Enemy.prototype.constructor = SpaceHipster.Enemy; //note which method is the constructor