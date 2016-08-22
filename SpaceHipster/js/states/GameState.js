var SpaceHipster = SpaceHipster || {};

SpaceHipster.GameState = {

  //initiate game settings
  init: function() {
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    
    //Game constants
    this.PLAYER_SPEED = 200;
    this.BULLET_SPEED = -1000;

  },

  //load the game assets before the game starts
  preload: function() {
    this.load.image('space', 'assets/images/space.png');    
    this.load.image('player', 'assets/images/player.png');    
    this.load.image('bullet', 'assets/images/bullet.png');    
    this.load.image('enemyParticle', 'assets/images/enemyParticle.png');    
    this.load.spritesheet('yellowEnemy', 'assets/images/yellow_enemy.png', 50, 46, 3, 1, 1);   
    this.load.spritesheet('redEnemy', 'assets/images/red_enemy.png', 50, 46, 3, 1, 1);   
    this.load.spritesheet('greenEnemy', 'assets/images/green_enemy.png', 50, 46, 3, 1, 1);   

    
  },
  //executed after everything is loaded
  create: function() {
    this.background = this.add.tileSprite(0, 0, this.game.world.width, this.game.world.height, 'space');
    this.background.autoScroll(0, 30);
    
    // Player
    this.player = this.add.sprite(this.game.world.centerX, this.game.world.height - 50, 'player');
    this.player.anchor.setTo(0.5);
    this.game.physics.arcade.enable(this.player);
    this.player.body.collideWorldBounds = true; //player sprite cannot leave the screen
    
    // initiate bullet pool
    this.initBullets();
    this.shootingTimer = this.game.time.events.loop(Phaser.Timer.SECOND/5, this.createPlayerBullet, this);
    
    // enemy
    this.initEnemies();
    
    // load levels
    this.loadLevel();
    
  },
  update: function() {
    this.game.physics.arcade.overlap(this.playerBullets, this.enemies, this.damageEnemy, null, this);
    this.game.physics.arcade.overlap(this.enemyBullets, this.player, this.damagePlayer, null, this);
    
    this.player.body.velocity.x = 0;
    // check that user is touching down
    if (this.game.input.activePointer.isDown) {
      var targetX = this.game.input.activePointer.position.x;
      // check which side is being touched and set direction variable accordingly
      var direction = targetX >= this.game.world.centerX ? 1: -1;
      this.player.body.velocity.x = direction * this.PLAYER_SPEED; 
    }
  },
  initBullets: function() {
    this.playerBullets = this.add.group();
    this.playerBullets.enableBody = true;
  },
  createPlayerBullet: function() {
    var bullet = this.playerBullets.getFirstExists(false);
    if (!bullet) {
      bullet = new SpaceHipster.PlayerBullet(this.game, this.player.x, this.player.top);
      this.playerBullets.add(bullet);
    } else {
      // reset position
      bullet.reset(this.player.x, this.player.top);
    }
    
    // set velocity
    bullet.body.velocity.y = this.BULLET_SPEED;
  },
  initEnemies: function() {
    this.enemies = this.add.group();
//     this.enemies.enableBody = true;
    
    this.enemyBullets = this.add.group();
    this.enemyBullets.enableBody = true;
    
 //   var enemy = new SpaceHipster.Enemy(this.game, 100, 100, 10, 'greenEnemy', this.enemyBullets, 2, 100);
 //   this.enemies.add(enemy);
//     enemy.body.velocity.x = 100;
//     enemy.body.velocity.y = 50;
  },
  damageEnemy: function(bullet, enemy) {
    enemy.damage(1);
    bullet.kill();
  },
  damagePlayer: function(){
    this.player.kill();
    this.game.state.start('GameState');
  },
  createEnemy: function(x, y, health, key, scale, speedX, speedY, shootFreq, bulletVelocity){
  
    var enemy = this.enemies.getFirstExists(false);
   
    if (!enemy) {
      enemy = new SpaceHipster.Enemy(this.game, x, y, health, key, this.enemyBullets, shootFreq, bulletVelocity);
      this.enemies.add(enemy);
    }
    
    enemy.reset(x, y, health, key, scale, speedX, speedY);
  },
  loadLevel: function() {
    
    this.currentEnemyIndex = 0;
    
    this.levelData = {
    "duration": 35,
    "enemies": 
    [
      {
        "time": 1,
        "x": 0.05,
        "health": 6,
        "speedX": 20, 
        "speedY": 50,
        "key": "greenEnemy",
        "scale": 3,
        "shootFreq": 2,
        "bulletVelocity": 100
      },
      {
        "time": 2,
        "x": 0.1,
        "health": 3,
        "speedX": 50, 
        "speedY": 50,
        "key": "greenEnemy",
        "scale": 1,
        "shootFreq": 2,
        "bulletVelocity": 100
      },
      {
        "time": 3,
        "x": 0.1,
        "health": 3,
        "speedX": 50, 
        "speedY": 50,
        "key": "greenEnemy",
        "scale": 1,
        "shootFreq": 2,
        "bulletVelocity": 100
      },
      {
        "time": 4,
        "x": 0.1,
        "health": 3,
        "speedX": 50, 
        "speedY": 50,
        "key": "greenEnemy",
        "scale": 1,
        "shootFreq": 2,
        "bulletVelocity": 100
      }]
    };
    
    this.scheduleNextEnemy();
    
  },
  
  scheduleNextEnemy: function() {
    var nextEnemy = this.levelData.enemies[this.currentEnemyIndex];
    console.log(nextEnemy);
    if (nextEnemy) {
      var nextTime = 1000 * ( nextEnemy.time - (this.currentEnemyIndex === 0 ? 0 : this.levelData.enemies[this.currentEnemyIndex - 1].time));
      
      this.nextEnemyTimer = this.game.time.events.add(nextTime, function() {
        this.createEnemy((nextEnemy.x * this.game.world.width), -100, nextEnemy.health, nextEnemy.key, nextEnemy.scale, nextEnemy.speedX, nextEnemy.speedY, nextEnemy.shootFreq, nextEnemy.bulletVelocity);
        
        this.currentEnemyIndex++;
        this.scheduleNextEnemy();
      }, this);
    }
  }

};