var ZPlat = ZPlat || {};
//Assuming each game is 20 tiles long by 10 tiles tall (each tile is 35 by 35px)
ZPlat.dim = ZPlat.getGameLandscapeDimensions(700, 350);
ZPlat.game = new Phaser.Game(ZPlat.dim.w, ZPlat.dim.h, Phaser.AUTO);

ZPlat.game.state.add('Boot', ZPlat.BootState); 
ZPlat.game.state.add('Preload', ZPlat.PreloadState); 
ZPlat.game.state.add('Game', ZPlat.GameState);

ZPlat.game.state.start('Boot'); 
