'use strict'
import preLoader from './preLoader.js';
import gameScene from './gameScene.js';
import mainScene from './mainScene.js';

document.addEventListener("DOMContentLoaded", function(e) {
    init();
});

let game;

function init() {
    
    const width = document.body.clientWidth;
    const height = document.body.clientHeight;
    let widthCanvas = width;
    console.log('init')
    if (width > 800) {  
        widthCanvas = 800;
    }
    let heightCanvas = (height > width) ? height : Math.floor(width * 5 / 7);

    const configMain = {
        type: Phaser.AUTO,
        width: widthCanvas,
        height: heightCanvas,
        disableContextMenu: true,
        scene: [ preLoader, gameScene ],
        banner: false
    };
    
    game = new Phaser.Game(configMain);
    game.config.gameTitle ="3 row";
    game.config.gameURL ="https:/stacksite.ru/assets/project2/three/";
}