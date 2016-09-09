var MrHop = MrHop || {};

MrHop.GameState = {

  init: function() {
    //pool of floor sprites
    this.floorPool = this.add.group();
    
    //pool of platforms
    this.platformPool = this.add.group();
    
    //gravity
    this.game.physics.arcade.gravity.y = 1000; 
    
    //max jumping distance
    this.maxJumpDistance = 120;
    
    //enable cursor keys
    this.cursors = this.game.input.keyboard.createCursorKeys();
    
    //coin count
    this.myCoins = 0;
    
    //level speed
    this.levelSpeed = 200;
  },
  create: function() {
 
    //hard-code first platform
    this.currentPlatform = new MrHop.Platform(this.game, this.floorPool, 12, 0, 200, -this.levelSpeed);
    this.platformPool.add(this.currentPlatform);
    
    this.loadLevel();
    
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
    this.platformPool.forEachAlive(function(platform, index){
      this.game.physics.arcade.collide(this.player, platform);
      
      //check if platform needs to be killed
      if(platform.length && platform.children[platform.length - 1].right < 0) {
        platform.kill();
      }
    }, this);
    
    if (this.player.body.touching.down) {
      this.player.body.velocity.x = this.levelSpeed;
    }
    else {
      this.player.body.velocity.x = 0;
    }
    
    if(this.cursors.up.isDown || this.game.input.activePointer.isDown){
      this.playerJump();
    } else if (this.cursors.up.isUp || this.game.input.activePointer.isUp) {
      this.isJumping = false;
    }
    
    //if the last sprite in the platform group is showing, then create a new platform
    if(this.currentPlatform.length && this.currentPlatform.children[this.currentPlatform.length - 1].right < this.game.world.width) {
      this.createPlatform();
    }
  },
  render: function(){
    //this.game.debug.body(this.player);
    //this.game.debug.bodyInfo(this.player, 0, 30);
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
  },
  loadLevel: function() {
    //this.currIndex = 0;
    this.createPlatform();
  },
  createPlatform: function(){
    var nextPlatformData = this.generateRandomPlatform();
    
     if (nextPlatformData) {
       this.currentPlatform = this.platformPool.getFirstDead();
       if (!this.currentPlatform) {
         this.currentPlatform = new MrHop.Platform(this.game, this.floorPool, nextPlatformData.numTiles, 
                                                 this.game.world.width + nextPlatformData.separation, nextPlatformData.y, -this.levelSpeed);
       } else {
         this.currentPlatform.prepare(nextPlatformData.numTiles, this.game.world.width + nextPlatformData.separation, 
                                      nextPlatformData.y, -this.levelSpeed)
       }
       
       this.platformPool.add(this.currentPlatform);
       this.currIndex++;
     }
  },
  generateRandomPlatform: function(){
    var data = {};
    //generate separation/ distance from prev platform
    var minSeparation = 60;
    var maxSeparation = 200;
    data.separation = minSeparation + Math.random() * (maxSeparation - minSeparation);
    
    //y, in regards to the prev platform
    var minDifY = -120;
    var maxDifY = 120;
    data.y = this.currentPlatform.children[0].y + minDifY + Math.random() * (maxDifY - minDifY);
    //set absolute max and min for platforms to overwrite random gen, if necessary
    data.y = Math.max(150, data.y);
    data.y = Math.min(this.game.world.height - 50, data.y);
    
    //number of tiles
    var minTiles = 1;
    var maxTiles = 5;
    data.numTiles = minTiles + Math.random() * (maxTiles - minTiles);
    
    return data;
  }
}
