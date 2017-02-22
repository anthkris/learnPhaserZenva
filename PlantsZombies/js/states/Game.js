var Veggies = Veggies || {};

Veggies.GameState = {

  init: function(currentLevel) {    
    //keep track of the current level
    this.currentLevel = currentLevel ? currentLevel : 'level1';

    //no gravity in a top-down game
    this.game.physics.arcade.gravity.y = 0;    
    
    //init constants
    this.HOUSE_X = 60;
    this.SUN_FREQUENCY = 5;
    this.SUN_VELOCITY = 50;
  },
  create: function() {
    this.background = this.add.sprite(0, 0, 'background');

    //group for game objects
    this.bullets = this.add.group();
    this.plants = this.add.group();
    this.zombies = this.add.group();
    this.suns = this.add.group();
    
    //player stats
    this.numSuns = 100;
    
    //create user interface
    this.createGui();
    
    var plantData = {
      plantAsset: 'plant',
      health: 10,
      animationFrames: [1, 2, 1, 0],
      isShooter: true,
      //isSunProducer: true
    };
    
    var zombieData = {
      asset: 'zombie',
      health: 10,
      animationFrames: [0, 1, 2, 1],
      attack: 0.1,
      velocity: -10
    };
    
    this.zombie = new Veggies.Zombie(this, 200, 100, zombieData);
    this.zombies.add(this.zombie);
    this.hitSound = this.add.audio('hit');
    
    this.plant = new Veggies.Plant(this, 100, 100, plantData);
    this.plants.add(this.plant);
    
    this.bullet = new Veggies.Bullet(this, 100, 200);
    this.bullets.add(this.bullet);
    
    //create new suns with the specified frequency
    this.sunGenerationTimer = this.game.time.create(false);
    this.sunGenerationTimer.start();
    this.scheduleSunGeneration();
  },   
  update: function() {    
    this.game.physics.arcade.collide(this.plants, this.zombies, this.attackPlant, null, this);
    this.game.physics.arcade.collide(this.bullets, this.zombies, this.hitZombie, null, this);
    this.zombies.forEachAlive(function(zombie){
      //zombies need to keep their velocity
      zombie.body.velocity.x = zombie.defaultVelocity;
      
      //if one of them reaches the house, it's game over
      if (zombie.x <= this.HOUSE_X) {
        this.gameOver();
      }
    }, this);
  },
  attackPlant: function(plant, zombie) {
    plant.damage(zombie.attack);
    //console.log('zombie attack');
  },
  createPlant: function(x, y, data) {
    //look for a dead element
    var newElement = this.plants.getFirstDead();
    
    //if there are no dead ones, create a new one
    if (!newElement) {
      newElement = new Veggies.Plant(this, x, y, data);
      this.plants.add(newElement);
    } else {
      newElement.reset(x, y, data);
    }
    
    return newElement;
  },
  createZombie: function(x, y, data) {
    //look for a dead element
    var newElement = this.zombies.getFirstDead();
    
    //if there are no dead ones, create a new one
    if (!newElement) {
      newElement = new Veggies.Zombie(this, x, y, data);
      this.zombies.add(newElement);
    } else {
      newElement.reset(x, y, data);
    }
    
    return newElement;
  },
  gameOver: function() {
    this.game.state.start('Game');
  },
  createGui: function() {
    //show sun stats
    var sun = this.add.sprite(10, this.game.height - 20, 'sun');
    sun.anchor.setTo(0.5);
    sun.scale.setTo(0.5);
    
    var style = {font: '14px Arial', fill: '#fff'};
    this.sunLabel = this.add.text(22, this.game.height - 28, '', style);
    this.updateStats();
    
    //show the button bar
    this.buttonData = JSON.parse(this.game.cache.getText('buttonData'));
    
    //buttons
    this.buttons = this.add.group();
    var button;
    this.buttonData.forEach(function(element, index){
      button = new Phaser.Button(this.game, 80 + index * 40, this.game.height - 35, element.btnAsset, this.clickButton, this);
      this.buttons.add(button);
      
      //pass the data to the button
      button.plantData = element;
    }, this);
    
    this.plantLabel = this.add.text(300, this.game.height - 28, '', style);
  },
  updateStats: function() {
    this.sunLabel.text = this.numSuns;
  },
  changeSunNum: function(amount) {
    this.numSuns += amount;
    this.updateStats();
  },
  scheduleSunGeneration: function() {
    this.sunGenerationTimer.add(Phaser.Timer.SECOND * this.SUN_FREQUENCY, function() {
      this.generateRandomSun();
      this.scheduleSunGeneration();
    }, this);
  },
  generateRandomSun: function() {
    //position
    var y = -20;
    var x = 40 + 420 * Math.random();
    
    //sun object
    var sun = this.createSun(x, y);
    
    //falling velocity
    sun.body.velocity.y = this.SUN_VELOCITY;
  },
  createSun: function(x, y) {
    //look for a dead element
    var newElement = this.suns.getFirstDead();
    
    //if there are no dead ones, create a new one
    if (!newElement) {
      newElement = new Veggies.Sun(this, x, y);
      this.suns.add(newElement);
    } else {
      newElement.reset(x, y);
    }
    
    return newElement;
  },
  hitZombie: function (bullet, zombie) {
    bullet.kill();
    zombie.damage(5);
    this.hitSound.play();
  },
  clickButton: function(button) {
    if(!button.selected) {
      this.clearSelection();
      this.plantLabel.text = 'Cost: ' + button.plantData.cost;
      //check if player can afford
      if (this.numSuns >= button.plantData.cost) {
        button.selected = true;
        button.alpha = 0.5;
        this.currentSelection = button.plantData;
      } else {
        this.plantLabel.text += '- Too expensive!';
      }
    } else {
      this.clearSelection();
    }
  },
  clearSelection: function() {
    this.currentSelection = null;
    this.plantLabel.text = '';
    this.buttons.forEach(function(button) {
      button.alpha = 1;
      button.selected = false;
    }, this);
  }
};
