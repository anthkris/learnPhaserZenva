var ZPlat = ZPlat || {};

//calculate the dimensions of the game so that 100% of the screen is occupied
ZPlat.getGameLandscapeDimensions = function(max_w, max_h){
    //get both width and height of the screen
    //Pixel density in some devices cause these to be incorrect
    var w = window.innerWidth * window.devicePixelRatio;
    var h = window.innerHeight * window.devicePixelRatio;
    
    //get the actual w and h by setting the longer of the two as the width (in landscape)
    var landW = Math.max(w, h);
    var landH = Math.min(w, h);
    
    //check if we need to scale to fit screen width
    if(landW > max_w) {
        var ratioW = max_w / landW;
        landW *= ratioW;
        landH *= ratioW;
    }
    
    //do we need to scale to fit screen height
    if(landH > max_h) {
        var ratioH = max_h / landH;
        landW *= ratioH;
        landH *= ratioH;
    }
    
    return {
        w: landW,
        h: landH
    };
}