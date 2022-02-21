'use strict'
import PreLoader from './PreLoader.js';
import GameScene from './GameScene.js';
import MainScene from './MainScene.js';
import  './fullScreenPolyfill.js';

document.addEventListener("DOMContentLoaded", function(e) {
    init();
});

let game;

function init() {
    const widthOrigin = 640;
    const ratioHeight = 1135;

    const width = document.body.clientWidth;
    const height = document.body.clientHeight;    

    let widthCanvas = width;
    let heightCanvas = height;

    if (height * widthOrigin < width * ratioHeight) {
        widthCanvas = Math.floor(height * widthOrigin / ratioHeight);
    }else{
        heightCanvas = Math.floor(width * ratioHeight / widthOrigin );
    }

    const configMain = {
        type: Phaser.AUTO,
        width: widthCanvas,
        height: heightCanvas,
        disableContextMenu: true,
        scene: [ PreLoader, GameScene, MainScene ],
        banner: false
    };
    
    game = new Phaser.Game(configMain);
    game.config.gameTitle ="3 row";
    game.config.widthOrigin = widthOrigin;
    game.config.gameURL ="https:/stacksite.ru/assets/project2/three/";

}