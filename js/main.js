'use strict'
import mainScene from './mainScene.js';
import gameScene from './gameScene.js';

document.addEventListener("DOMContentLoaded", function(e) {
    init();
});
    

let activeScene = 'preloader';
let game;

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

    const configMain = {
        type: Phaser.AUTO,
        width: widthCanvas,
        height: heightCanvas,
        disableContextMenu: true,
        scene: [ mainScene, gameScene ],
        banner: false
    };
    
    game = new Phaser.Game(configMain);
    game.config.gameTitle ="3 row";
    game.config.gameURL ="https:/stacksite.ru/assets/project2/three/";
}