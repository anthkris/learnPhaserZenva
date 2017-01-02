var MrHop = MrHop || {};

MrHop.Platform = function(game, floorPool, numTiles, x, y, speed, coinsPool) {
  Phaser.Group.call(this, game);
  this.game = game;
  this.floorPool = floorPool;
  this.coinsPool = coinsPool;
  this.tileSize = 40;
  this.enableBody = true;
  this.prepare(numTiles, x, y, speed);
 
};

MrHop.Platform.prototype = Object.create(Phaser.Group.prototype);
MrHop.Platform.prototype.constructor = MrHop.Platform;
//create new method in order to reposition dead sprites as well as new sprites
//speed passed here so that dead sprites can be revived with new speed
MrHop.Platform.prototype.prepare = function(numTiles, x, y, speed){
  this.alive = true;
  
  var i = 0;
  while(i < numTiles){
    
    var floorTile = this.floorPool.getFirstExists(false);
    if (!floorTile){
      floorTile = new Phaser.Sprite(this.game, x + i * this.tileSize, y, 'floor');
    } else {
      floorTile.reset(x + i * this.tileSize, y);
    }
    this.add(floorTile);
    
    i++;
  }
  //set physics properties
  this.setAll('body.immovable', true);
  this.setAll('body.allowGravity', false);
  this.setAll('body.velocity.x', speed);
  
  this.addCoins(speed);
};

MrHop.Platform.prototype.kill = function(){
  this.alive = false;
  //call the kill method on each individual sprite in the group
  this.callAll('kill');
  var sprites = [];
  
  //send each sprite back to floorPool
  //using sprites array as an intermediary to prevent issue with modifying group while iterating through it.
  this.forEach(function(tile){
    sprites.push(tile);
  });
  
  sprites.forEach(function(tile){
     this.floorPool.add(tile);          
  }, this);
};

MrHop.Platform.prototype.addCoins = function(speed) {
  //create coins in relation to tile position
  var coinsY = 90 + Math.random() * 110;
  var hasCoin;
  this.forEach(function(tile){
    //40% chance of a coin
    hasCoin = Math.random() <= 0.4;
    if (hasCoin){
      var coin = this.coinsPool.getFirstExists(false);
      if (!coin){
        coin = new Phaser.Sprite(this.game, tile.x, tile.y - coinsY, 'coin');
        this.coinsPool.add(coin);
      } else {
        coin.reset(tile.x, tile.y - coinsY);
      }
      coin.body.velocity.x = speed;
      coin.body.allowGravity = false;
    }
  }, this);
};