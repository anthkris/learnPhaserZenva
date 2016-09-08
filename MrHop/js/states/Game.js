var MrHop = MrHop || {};

MrHop.GameState = {

  init: function() {
    //pool of floor sprites
    this.floorPool = this.add.group();
    
    //gravity
    this.game.physics.arcade.gravity.y = 1000; 
    
    //max jumping distance
    this.maxJumpDistance = 120;
    
    //enable cursor keys
    this.cursors = this.game.input.keyboard.createCursorKeys();
    
    //coin count
    this.myCoins = 0;
  },
  create: function() {

    //hard-code first platform
    this.platform = new MrHop.Platform(this.game, this.floorPool, 12, 0, 200);
    this.add.existing(this.platform);
    
    //create player
    this.player = this.add.sprite(50, 50, 'player');
    this.player.anchor.setTo(0.5);
    this.player.animations.add('running', [0,1,2,3,2,1], 15, true);
    this.game.physics.arcade.enable(this.player);
    
    //change player bounding box
    this.player.body.setSize(38, 60, 0, 0);
    this.player.play('running');
  },   
  update: function() {    
    this.game.physics.arcade.collide(this.player, this.platform);
    
    if(this.cursors.up.isDown || this.game.input.activePointer.isDown){
      this.playerJump();
    } else if (this.cursors.up.isUp || this.game.input.activePointer.isUp) {
      this.isJumping = false;
    }
  },
  render: function(){
    this.game.debug.body(this.player);
    this.game.debug.bodyInfo(this.player, 0, 30);
  },
  playerJump: function(){
    if(this.player.body.touching.down) {
      //starting point of the jump
      this.startJumpY = this.player.y;
      
      //keep track of the fact that you are jumping
      this.isJumping = true;
      this.jumpPeaked = false;
      
      this.player.body.velocity.y = -300;
    } else if (this.isJumping && !this.jumpPeaked){
      var distanceJumped = this.startJumpY - this.player.y;
      if (distanceJumped <= this.maxJumpDistance) {
        this.player.body.velocity.y = -300;
      } else {
        this.jumpPeaked = true;
      }
    }
  }
};
