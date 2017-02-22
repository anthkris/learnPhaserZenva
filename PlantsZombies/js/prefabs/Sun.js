var Veggies = Veggies || {};

Veggies.Sun = function(state, x, y) {
  Phaser.Sprite.call(this, state.game, x, y, 'sun');

  this.state = state;
  this.game = state.game;
  
  //init physics
  this.game.physics.arcade.enable(this);
  
  this.animations.add('shine', [0,1], 10, true);
  this.play('shine');
  
  //defauults
  this.anchor.setTo(0.5);
  
  //enable ability to collect sun on tab/cick
  this.inputEnabled = true;
  this.input.pixelPerfectClick = true;
  this.events.onInputDown.add(function(){
    this.state.changeSunNum(25);
    
    this.kill();
  }, this);
  
  //sun expiration
  this.sunExpirationTimer = this.game.time.create(false);
  this.reset(x, y);
};

Veggies.Sun.prototype = Object.create(Phaser.Sprite.prototype);
Veggies.Sun.prototype.constructor = Veggies.Sun;

Veggies.Sun.prototype.scheduleExpiration = function(){
  this.sunExpirationTimer.start();
  
  //random expiration time between 2 and 6 seconds
  var expirationTime = 2 + Math.random() * 4;
  
  this.sunExpirationTimer.add(Phaser.Timer.SECOND * expirationTime, function() {
    this.kill();
  }, this)
};

Veggies.Sun.prototype.kill = function() {
  //be sure to handle timers
  this.sunExpirationTimer.stop();
  
  Phaser.Sprite.prototype.kill.call(this);
};

Veggies.Sun.prototype.reset = function(x, y) {
  Phaser.Sprite.prototype.reset.call(this, x, y);
  this.scheduleExpiration();
};