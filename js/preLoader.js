export default class preLoader extends Phaser.Scene
{
    constructor () {
        super({key: 'preLoader'});
    }

    preload () {
        this.scale = Math.floor ((1000 * this.game.canvas.width) / this.game.config.widthOrigin) / 1000;
        
        this.load.image('background', './img/background.jpg');
        this.load.atlas('earRight', './img/earRight.png', './img/earRight.json');
        this.load.atlas('earLeft', './img/earLeft.png', './img/earLeft.json');
        this.load.image('play', './img/play.png');
        this.isLandscape = false;
    }

    create () {
        this.prevtime = new Date().getTime(); 
        this.isBlocked = true;        
        this.deltaTime = 0;
        this.gameScore = 0;

        this.bg = this.add.image(this.game.scale.baseSize.width / 2, Math.floor(this.game.scale.baseSize.height / 2) ,'background').setScale(this.scale,this.scale);
        this.bg.isHide = false;
        this.bg.dalpha = -0.001;

        this.earRAnim = this.anims.create({ key: 'earRight', frames: this.anims.generateFrameNames('earRight', { prefix: 'earRight_', end: 4, zeroPad: 4 }), repeat: -1 });
        this.earLAnim = this.anims.create({ key: 'earLeft', frames: this.anims.generateFrameNames('earLeft', { prefix: 'earLeft_', end: 4, zeroPad: 4 }), repeat: -1 });
        this.earRAnim.delay = 300;
        this.earRAnim.repeatDelay = 8000;
        this.earRAnim.frameRate = 8;
        this.earLAnim.delay = 300;
        this.earLAnim.repeatDelay = 8000;
        this.earLAnim.frameRate = 8;

        this.earR = this.add.sprite(this.game.scale.baseSize.width * 0.605, Math.floor(this.game.scale.baseSize.height * 0.577) ,'earRight').setScale(this.scale,this.scale);
        this.earL = this.add.sprite(this.game.scale.baseSize.width * 0.937, Math.floor(this.game.scale.baseSize.height * 0.577) ,'earLeft').setScale(this.scale,this.scale);
 
        this.earR.play(this.earRAnim);
        this.earL.play(this.earLAnim);

        this.startBtn = this.add.image(this.game.scale.baseSize.width / 2, Math.floor(this.game.scale.baseSize.height / 3 ) ,'play');
        this.startBtn.setAlpha(1);
        this.startBtn.dScale = 0.0005;

        this.startBtn.setInteractive({
            cursor: 'url(img/pointer.png), pointer'
        });

        this.startBtn.on('pointerdown', () => {
            this.startBtn.disableInteractive();
            this.startBtn.setRotation(0.1);
            this.bg.isHide = true;

            this.scene.transition({
                target: 'gameScene',
                duration: 1300,
                init: true,
            })
        })

        this.startBtn.on('pointerover', function() {
            this.setRotation(0.1);
        })

        this.startBtn.on('pointerout', function() {
            this.setRotation(-0.1);
        })
        
        this.startBtn.setScale(0.4,0.4);
        this.startBtn.setRotation(-0.1);
    }

    update() {

        this.deltaTime = new Date().getTime() - this.prevtime;
        this.prevtime += this.deltaTime;
        
        this.earsAnimation();
        this.bgAnimation();
    }


    bgAnimation() {
        if (this.bg.isHide && this.bg.alpha > 0) {
            this.startBtn.setAlpha(this.startBtn.alpha + this.bg.dalpha * this.deltaTime);
            this.startBtn.setScale(this.startBtn.scale + ( this.startBtn.dScale * this.deltaTime), this.startBtn.scale + ( this.startBtn.dScale * this.deltaTime));
            this.startBtn.setRotation(this.startBtn.rotation + (5 * this.startBtn.dScale * this.deltaTime));
            this.earR.setAlpha(this.bg.alpha + this.bg.dalpha * this.deltaTime);
            this.earL.setAlpha(this.bg.alpha + this.bg.dalpha * this.deltaTime);
            this.bg.setAlpha(this.bg.alpha + this.bg.dalpha * this.deltaTime);
            this.earR.setScale(this.scale + 0.01, this.scale + 0.01);
        }
    }
    
    
    earsAnimation() {
        this.earR.setScale(this.scale, this.scale);
    }
}