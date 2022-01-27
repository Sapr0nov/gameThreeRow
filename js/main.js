'use strict'
import gameScene from './gameScene.js';

document.addEventListener("DOMContentLoaded", function(e) {
    init();
});

var game;
function init() {
    const width = document.body.clientWidth;
    const height = document.body.clientHeight;
    let widthCanvas, heightCanvas;
    
    widthCanvas = width;
    heightCanvas = Math.floor(width * 5 / 7);
    
    if (width > 800) {  
        widthCanvas = 800;
        heightCanvas = 800 * 5 / 7;
    }

    if (height > width) {
        heightCanvas = height;
    }
    
    const config = {
        type: Phaser.AUTO,
        width: widthCanvas,
        height: heightCanvas,
        disableContextMenu: true,
        scene: [ gameScene ],
        banner: false
    };

     game = new Phaser.Game(config);
     game.config.gameTitle ="3 row";
     game.config.gameURL ="https:/stacksite.ru/assets/project2/three/";

}
