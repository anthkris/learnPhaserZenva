var Veggies = Veggies || {};

Veggies.Plant = function(state, x, y, data) {
  //data object will define the key of the plant image to be shown
  Phaser.Sprite.call(this, state.game, x, y, data.plantAsset);
  
  this.state = state;
  this.game = state.game;
  this.bullets = state.bullets;
  this.suns - state.suns;
  
  this.anchor.setTo(0.5);
  
  //init physics body
  this.game.physics.arcade.enable(this);
  this.body.immovable = true;
  
  //create timers
  this.shootingTimer = this.game.time.create(false);
  this.producingTimer = this.game.time.create(false);
  
  this.reset(x, y, data);
};

Veggies.Plant.prototype = Object.create(Phaser.Sprite.prototype);
Veggies.Plant.prototype.constructor = Veggies.Plant;
Veggies.Plant.prototype.reset = function(x, y, data) {
  Phaser.Sprite.prototype.reset.call(this, x, y, data.health);
  
  //change the image of the plant
  this.loadTexture(data.plantAsset);
  
  //create an animation, if any was passed
  this.animationName = null;
  if (data.animationFrames) {
    this.animationName = data.plantAsset + 'Anim';
    this.animations.add(this.animationName, data.animationFrames, 6, false);
  }
  
  //save properties
  this.isShooter = data.isShooter;
  this.isSunProducer = data.isSunProducer;
  
  //if plant is a shooter, then set up shooting timer
  if (this.isShooter) {
    this.shootingTimer.start();
    this.scheduleShooting();
  }
  
  //if plant is a sun producer, then set up productiontimer
  if (this.isSunProducer) {
    this.producingTimer.start();
    this.scheduleProduction();
  }
};
Veggies.Plant.prototype.kill = function() {
  Phaser.Sprite.prototype.kill.call(this);
  
  //stop timers once plant is killed
  this.shootingTimer.stop();
  this.producingTimer.stop();
};
Veggies.Plant.prototype.scheduleShooting = function() {
  this.shoot();
  
  //plants shoot once per second (could be a parameter)
  this.shootingTimer.add(Phaser.Timer.SECOND, this.scheduleShooting, this);
};
Veggies.Plant.prototype.scheduleProduction = function() {
  //create random sun
  this.produceSun();
  
  //plants produce once every 5 seconds (could be a parameter)
  this.producingTimer.add(Phaser.Timer.SECOND * 5, this.scheduleProduction, this);
};
Veggies.Plant.prototype.produceSun = function() {
  //place the sun in a random location near the plant
  var diffX = -40 + Math.random() * 80;
  var diffY = -40 + Math.random() * 80;
  
  this.state.createSun(this.x + diffX, this.y + diffY);
};
Veggies.Plant.prototype.shoot = function() {
  //check if there is an animation; if so play it
  if(this.animations.getAnimation(this.animationName)) {
    this.play(this.animationName);
  }
  
  //y location of the bullet (hardcoded to the approximate area of the plant mouth)
  var y = this.y - 10;
  //look for a dead element
  var newElement = this.bullets.getFirstDead();
  
  //if there are no dead ones, create a new one
  if (!newElement) {
    newElement = new Veggies.Bullet(this, this.x, y);
    this.bullets.add(newElement);
  } else {
    newElement.reset(this.x, y);
  }
  
  //set the velocity
  newElement.body.velocity.x = 100;
}