var SpaceHipster = SpaceHipster || {};

SpaceHipster.EnemyBullet = function(game, x, y) {
  Phaser.Sprite.call(this, game, x, y, 'bullet'); // create a sprite using predefined key
  
  this.anchor.setTo(0.5);
  
  //Check which sprites are dead
  this.checkWorldBounds = true;
  this.outOfBoundsKill = true;
};

SpaceHipster.EnemyBullet.prototype = Object.create(Phaser.Sprite.prototype); //inherit from Sprite class
SpaceHipster.EnemyBullet.prototype.constructor = SpaceHipster.EnemyBullet; //note which method is the constructor