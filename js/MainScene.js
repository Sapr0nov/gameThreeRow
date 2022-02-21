import Cookies from './Cookies.js';
import INIfile from './INIfile.js';
export default class MainScene extends Phaser.Scene
{
    constructor () {
        super({key: 'mainScene'});
    }

    
    async init (data) {
        this.loaded = false;
        this.cookie = new Cookies();
        this.currScene = this.cookie.getCookie("currScene")? this.cookie.getCookie("currScene")  : 0;
        this.cookie.setCookie('currScene', this.currScene,  {secure: true, 'max-age': 360000});
        this.ini = new INIfile();

        let pathINIfile ="../stages/" +  this.currScene + ".ini"

        let response = await fetch(pathINIfile);
        if (response.ok) {
            this.loaded = true;
            let data = await response.text();
            this.ini.data = this.ini.parseINIString(data) 
            this.stage = this.ini.data.stage;
            this.dialogs = (this.ini.data.dialogs !== void 0) ? JSON.parse('{ "dialog" : ' + this.ini.data.dialogs.dialog + '}').dialog : ['Как насчет \n случайного раунда?', 'Поехали!'];
        } else {
            console.warn(response)
        }
    }


    preload () {
        this.scale = Math.floor ((1000 * this.game.canvas.width) / this.game.config.widthOrigin) / 1000;
        this.load.image('background', './img/bgMainScene.jpg');
        this.load.image('hero', './img/hero.png');
        this.load.image('animal1', './img/animal1.png');
        this.load.image('animal2', './img/animal2.png');
        this.load.svg('dialog', './img/dialog.svg',  {width: this.game.scale.baseSize.width * 1.2, height: this.game.scale.baseSize.height });
        
        this.currDialog = 0;
    }


    create () {
        this.prevtime = new Date().getTime(); 
        this.isBlocked = true;        
        this.deltaTime = 0;

        this.bg = this.add.image(this.game.scale.baseSize.width / 2, Math.floor(this.game.scale.baseSize.height / 2) ,'background').setScale(this.scale);
        this.bg.isHide = false;
        this.bg.dalpha = -0.001;

        this.animal1 = this.add.image(this.game.scale.baseSize.width, Math.floor(this.game.scale.baseSize.height / 4 * 3) ,'animal1');
        this.animal2 = this.add.image(this.game.scale.baseSize.width / 4 - 20, Math.floor(this.game.scale.baseSize.height / 5) ,'animal2');
        this.hero = this.add.image(this.game.scale.baseSize.width / 7, Math.floor(this.game.scale.baseSize.height / 5 * 4) ,'hero');
  
        this.hero.setScale(this.scale * 0.7);
        this.animal1.setScale(this.scale * 0.8);
        this.animal2.setScale(this.scale * 0.45);
        this.dialog = this.add.image(this.game.scale.baseSize.width / 2, this.game.scale.baseSize.height / 2, 'dialog').setScale(this.scale, -this.scale);
        this.dialog.setInteractive( { cursor: 'url(img/pointer.png), pointer' } );

        this.dialog.on('pointerdown', () => {
            this.currDialog++;
            if (this.currDialog === this.dialogs.length) {
                this.bg.isHide = true;
                this.scene.transition({
                    target: 'gameScene',
                    duration: 1300,
                    launch: true,
                    data: this.stage
                })
            }else{
                this.dialog.setScale(this.dialog.scaleX, -this.dialog.scaleY);
                this.dialogText.y = (this.currDialog % 2) ? this.dialogText.y - 100 : this.dialogText.y + 100;
                this.dialogText.text = this.dialogs[this.currDialog];
            }
        })

        this.events.on('transitioncomplete', () => { 
            if (this.loaded) {
                this.scene.setVisible(true);
            }
        });
        this.scene.setVisible(false);
    }


    update() {

        this.deltaTime = new Date().getTime() - this.prevtime;
        this.prevtime += this.deltaTime;

        if (this.loaded) {
            this.dialogText = this.add.text(this.game.scale.baseSize.width / 5, this.game.scale.baseSize.height / 2, this.dialogs[this.currDialog], { fontFamily: 'Tahoma, Times, serif', color: 'black', fontSize : '32px' }).setScale(this.scale);
            this.scene.setVisible(true);
            this.loaded =false;
        }

        this.bgAnimation();
    }


    bgAnimation() {
        if (this.bg.isHide && this.bg.alpha > 0) {
            this.bg.setAlpha(this.bg.alpha + this.bg.dalpha * this.deltaTime);
            this.hero.setAlpha(this.bg.alpha + this.bg.dalpha * this.deltaTime);
            this.animal1.setAlpha(this.bg.alpha + this.bg.dalpha * this.deltaTime);
            this.animal2.setAlpha(this.bg.alpha + this.bg.dalpha * this.deltaTime);
            this.dialog.setAlpha(this.bg.alpha + this.bg.dalpha * this.deltaTime);
            this.dialogText.setAlpha(this.bg.alpha + this.bg.dalpha * this.deltaTime);
        }
    }
}