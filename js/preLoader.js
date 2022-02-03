import Cookies from './Cookies.js';

export default class PreLoader extends Phaser.Scene
{
    constructor () {
        super({key: 'reLoader'});
    }

    preload () {
        this.scale = Math.floor ((1000 * this.game.canvas.width) / this.game.config.widthOrigin) / 1000;
        
        this.load.image('bg_preloader', './img/bg_preloader.jpg');
        this.load.atlas('earRight', './img/earRight.png', './img/earRight.json');
        this.load.atlas('earLeft', './img/earLeft.png', './img/earLeft.json');
        this.load.image('play', './img/play.png');
        this.load.svg('nameBoard', './img/desk_empty.svg');
        this.isLandscape = false;
    }

    create () {
        this.prevtime = new Date().getTime(); 
        this.isBlocked = true;        
        this.deltaTime = 0;
        this.gameScore = 0;

        this.bg = this.add.image(this.game.scale.baseSize.width / 2, Math.floor(this.game.scale.baseSize.height / 2) ,'bg_preloader').setScale(this.scale,this.scale);
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

        this.nameBoard = this.add.image(100, 100, 'nameBoard').setScale(this.scale);
        this.nameBoard.setInteractive( { cursor: 'url(img/pointer.png), pointer' } );
        const cookie = new Cookies();
        let name =  cookie.getCookie("player");
        if (name === '') { name = "герой" };
        this.inputName = this.add.text(85, 90, name, { fontFamily: 'Tahoma, Times, serif', fontSize : '32px' }).setScale(this.scale);
        this.htmlInput = document.createElement("input");
        this.htmlInput.style.display = "none";
        document.body.appendChild(this.htmlInput);

        this.inputNameActive = false;
        this.input.keyboard.on('keydown', (e) => {
            
            const regexp = /[а-яa-zЁ]/i;
            
            if (!this.inputNameActive ) {
                return false;
            }

            if (e.key === 'Backspace') {
                if (this.inputName.text.length === 1 ) {
                    this.inputName.setText('_');
                }else {
                    this.inputName.setText(this.inputName.text.substring(0,this.inputName.text.length-1));
                }
            };

            if (e.key === 'Enter' || e.key === 'Escape') {
                this.inputNameActive = false;
                cookie.setCookie('player', this.inputName.text,  {secure: true, 'max-age': 360000});
            }

            if (this.inputName.text.length > 10 || e.key.length > 1 || !regexp.test(e.key)) {
                return;
            }

            if (this.inputName.text === '_') {
                this.inputName.text = '';
            }
            this.inputName.setText(this.inputName.text + e.key);
        })

        this.nameBoard.on('pointerup', () => {
            this.htmlInput.focus();
            this.inputNameActive = true;
            // show btn ok  for  this.inputNameActive false

        })

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