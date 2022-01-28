export default class mainScene extends Phaser.Scene
{
    constructor () {
        super({key: 'mainScene'});
    }

    preload () {
        let width = this.game.canvas.width;
        let height = this.game.canvas.height;

        this.load.image('background', './img/background.jpg');
        this.load.image('play', './img/play.png');
        this.load.image('cursor', './img/cursor.png');
        
        if (width > height) {
            width = width / 2;
        }
    }

    create () {
        this.prevtime = new Date().getTime(); 
        this.isBlocked = true;        
        this.deltaTime = 0;
        this.gameScore = 0;
        this.alfa = 0.5;
        this.dAlfa = 0.005;

        this.bg = this.add.image(this.game.scale.baseSize.width / 2, Math.floor(this.game.scale.baseSize.height / 2) ,'background');
        this.cursor = this.add.image( this.input.mousePointer.x, this.input.mousePointer.t,'cursor');

        let startBtn = this.add.image(this.game.scale.baseSize.width / 2, Math.floor(this.game.scale.baseSize.height / 2) ,'play');

        this.input.keyboard.on('keydown', (e) => {

            if (e.key === 't') {
                console.log("ну Т");
            }
            if (e.key === 'q') {
                this.scene.play();
            }
        });
        
        startBtn.setInteractive();
        startBtn.on('pointerdown', (e) => {
            this.game.scene.stop('mainScene');
            this.game.scene.start('gameScene');    
     
        })
        startBtn.setScale(0.4,0.4);
        startBtn.setRotation(0.1);
        startBtn.setAlpha(0.9);
        this.bg.setAlpha(0.5);
        this.cursor.setScale(0.1,0.1);        
        this.cursor.setRotation(-0.9);
        this.cursor.setDepth(10);
    }

    update() {
        this.cursor.x = this.input.mousePointer.x;
        this.cursor.y = this.input.mousePointer.y;
        
        this.deltaTime = new Date().getTime() - this.prevtime;
        this.prevtime += this.deltaTime;

        this.bg.setAlpha(this.alfa);
        
        this.alfa += this.dAlfa;
        
        if ( this.alfa >= 0.8 || this.alfa < 0.4 ) {
            this.dAlfa = -this.dAlfa;
        }

        if (this.curAnim === '') {
            this.isBlocked = false;        
        }
    }


    clicked (element) {
        if (this.isBlocked) return;
        
        element.stop();
    }
}