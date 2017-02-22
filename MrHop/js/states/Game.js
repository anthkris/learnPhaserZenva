var MrHop = MrHop || {};

MrHop.GameState = {

  init: function() {
    //pool of floor sprites
    this.floorPool = this.add.group();
    
    //pool of platforms
    this.platformPool = this.add.group();
    
    //pool of coins
    this.coinsPool = this.add.group();
    this.coinsPool.enableBody = true;
    
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
    this.currentPlatform = new MrHop.Platform(this.game, this.floorPool, 12, 0, 200, -this.levelSpeed, this.coinsPool);
    this.platformPool.add(this.currentPlatform);
    
    //create moving background
    this.background = this.add.tileSprite(0, 0, this.game.world.width, this.game.world.height, 'background');
    this.background.tileScale.y = 2;
    this.background.autoScroll(-this.levelSpeed/6, 0);
    this.game.world.sendToBack(this.background);
    
    
    //create player
    this.player = this.add.sprite(50, 50, 'player');
    this.player.anchor.setTo(0.5);
    this.player.animations.add('running', [0,1,2,3,2,1], 15, true);
    this.game.physics.arcade.enable(this.player);
    
    //change player bounding box
    this.player.body.setSize(38, 60, 0, 0);
    this.player.play('running');
    
    //create moving water
    this.water = this.add.tileSprite(0, this.game.world.height - 30, this.game.world.width, 30, 'water');
    this.water.autoScroll(this.levelSpeed/2, 0);
    
    this.coinSound = this.add.audio('coin');
    this.gameOverCounter = 0;
    this.loadLevel();
    
    //show number of coins
    var style = {font: '30px Arial', fill: '#fff'};
    this.coinsCountLabel = this.add.text(10, 20, '0', style);
  },   
  update: function() {
    if (this.player.alive) {
      this.platformPool.forEachAlive(function(platform, index) {
        this.game.physics.arcade.collide(this.player, platform);
        
        //check if platform needs to be killed
        if(platform.length && platform.children[platform.length - 1].right < 0) {
          platform.kill();
        }
      }, this);
      
      this.game.physics.arcade.overlap(this.player, this.coinsPool, this.collectCoin, null, this);
      
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
      
      //kill coins that leave the screen
      this.coinsPool.forEachAlive(function(coin){
        if (coin.right <= 0){
          coin.kill();
        }
      }, this);
    }
    
    //check if the player needs to die
    if(this.player.top >= this.game.world.height || this.player.left <= 0) {
      //alpha doesn't work when bitmapData sprite is continuously redrawn
      //so only run gameOver once
      if(this.gameOverCounter <= 0) {
        this.gameOver();
        this.gameOverCounter++;
      }
      
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
                                                 this.game.world.width + nextPlatformData.separation, nextPlatformData.y, -this.levelSpeed, this.coinsPool);
       } else {
         this.currentPlatform.prepare(nextPlatformData.numTiles, this.game.world.width + nextPlatformData.separation, 
                                      nextPlatformData.y, -this.levelSpeed, this.coinsPool)
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
  },
  collectCoin: function(player, coin) {
    //kill coin, update coin count, and play sound
    coin.kill();
    this.myCoins++;
    this.coinSound.play();
    this.coinsCountLabel.text = this.myCoins;
  },
  gameOver: function() {
    this.player.kill();
    this.updateHighScore();
    //game over overlay
    this.overlay = this.game.add.bitmapData(this.game.width, this.game.height);
    this.overlay.ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    this.overlay.ctx.fillRect(0, 0, this.game.width, this.game.height);
    //sprite for the overlay
    this.panel = this.game.add.sprite(0, this.game.height, this.overlay);
    console.log(this.overlay);
    console.log(this.panel);
    //this.panel.alpha = 0.55;
    
    //overlay raising tween animation
    var gameOverPanel = this.game.add.tween(this.panel);
    gameOverPanel.to({y: 0}, 500);
    
    //stop all movement after the overlay reaches the top
    gameOverPanel.onComplete.add(function(){
      this.water.stopScroll();
      this.background.stopScroll();
      
      //Add text to overlay
      
      //Game Over message
      var style = {font: '30px Arial', fill: '#fff'};
      this.add.text(this.game.width/2, this.game.height/2, 'GAME OVER', style).anchor.setTo(0.5);
      
      //High Score show
      style = {font: '20px Arial', fill: '#fff'};
      this.add.text(this.game.width/2, this.game.height/2 + 50, 'High Score: ' + this.highScore, style).anchor.setTo(0.5);
      //Your Score show
      style = {font: '20px Arial', fill: '#fff'};
      this.add.text(this.game.width/2, this.game.height/2 + 80, 'Your Score: ' + this.myCoins, style).anchor.setTo(0.5);
      //How to restart text
      style = {font: '14px Arial', fill: '#fff'};
      this.add.text(this.game.width/2, this.game.height/2 + 120, 'Tap to Play Again', style).anchor.setTo(0.5);
      //Allow tap or click to restart
      this.game.input.onDown.addOnce(this.restart, this);
      
    }, this);
    
    gameOverPanel.start();
  },
  restart: function() {
    this.game.state.start('Game');
  },
  updateHighScore: function() {
    //read from storage first
    this.highScore = localStorage.getItem('highScore');
    
    if(this.highScore === 'undefined') {
      this.highScore = 0;
    }
    
    if(this.highScore < this.myCoins) {
      this.highScore = this.myCoins;
      //save in local storage
      localStorage.setItem('highScore', this.highScore);
    }
    //console.log(this.highScore);
  }
}
