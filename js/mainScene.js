export default class mainScene extends Phaser.Scene
{
    constructor () {
        super({key: 'mainScene'});
    }

    preload () {
        this.load.image('background', './img/bg.jpg');
        this.load.image('play', './img/play.png');
    }

    create () {
        this.prevtime = new Date().getTime(); 
        this.isBlocked = true;        
        this.deltaTime = 0;
        this.gameScore = 0;
        this.alfa = 0.5;
        this.dAlfa = 0.0005;
        this.isBgHide = false; 

        this.bg = this.add.image(this.game.scale.baseSize.width / 2, Math.floor(this.game.scale.baseSize.height / 2) ,'background');
        let startBtn = this.add.image(this.game.scale.baseSize.width / 2, Math.floor(this.game.scale.baseSize.height / 2) ,'play');
  
        startBtn.setInteractive({
            cursor: 'url(../img/pointer.png), pointer'
        });

        startBtn.on('pointerdown', (pointer, gameObject) => {
            startBtn.disableInteractive();
            startBtn.setRotation(0.1);
            startBtn.setAlpha(0.9);
            this.isBgHide = true;

            this.scene.transition({
                target: 'gameScene',
                duration: 1300,
                init: true,
            })
        })

        startBtn.on('pointerover', function() {
            this.setRotation(0.3);
            this.setAlpha(1);
        })

        startBtn.on('pointerout', function() {
            this.setRotation(0.1);
            this.setAlpha(0.9);
        })
        
        startBtn.setScale(0.4,0.4);
        startBtn.setRotation(0.1);
        startBtn.setAlpha(0.9);
        this.bg.setAlpha(0.5);
    }

    update() {

        this.deltaTime = new Date().getTime() - this.prevtime;
        this.prevtime += this.deltaTime;

        this.bgAnimation();
    }

    bgAnimation() {
        this.bg.setAlpha(this.alfa);        
        this.alfa = (this.alfa <= 0) ? 0 : this.alfa + this.dAlfa * this.deltaTime;
        if (this.isBgHide) {
            this.dAlfa = (this.dAlfa > 0) ? -this.dAlfa : this.dAlfa;
        }
        if ( !this.isBgHide && (this.alfa >= 0.8 || this.alfa < 0.4) ) {
            this.dAlfa = -this.dAlfa;
        }
    }
}