export default class MainScene extends Phaser.Scene
{
    constructor () {
        super({key: 'mainScene'});
    }

    preload () {
        this.scale = Math.floor ((1000 * this.game.canvas.width) / this.game.config.widthOrigin) / 1000;
        this.load.image('background', './img/bgMainScene.jpg');
        this.load.image('hero', './img/hero.png');
        this.load.image('animal1', './img/animal1.png');
        this.load.image('animal2', './img/animal2.png');
        this.load.svg('dialog', './img/dialog.svg',  {width: this.game.scale.baseSize.width, height: this.game.scale.baseSize.height / 2});
        
        this.currDialog = 0;
        this.dialogs = ['Привет! Откуда ты?', 'Здравствуйте, \r\n\ я путешественник! \r\n\ из Пандаленда', 'Ты во время,\r\n\ помоги нам собрать\r\n\ воды!', 'Конечно! Вперед!'];
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
        this.dialogText = this.add.text(this.game.scale.baseSize.width / 4, this.game.scale.baseSize.height / 2, this.dialogs[this.currDialog], { fontFamily: 'Tahoma, Times, serif', color: 'black', fontSize : '32px' }).setScale(this.scale);

        this.dialog.on('pointerdown', () => {
            this.currDialog++;
            if (this.currDialog === this.dialogs.length) {
                this.bg.isHide = true;
                this.scene.transition({
                    target: 'gameScene',
                    duration: 1300,
                    launch: true,
                    data: {
                        "MaxRow" : 5,
                        "MaxCol" : 7,
                        "typesBlock" : 5,
                        "speed" : 8,
                        "victoryScore" : 100,
                        "MaxLife" : 16,
                        "winColor" : 2,         // 2 - water
                        "isVicory" : () => { return  (this.barsProgress[this.winColor].value  >= this.victoryScore) }
                
                    }
                })
            }else{
                this.dialog.setScale(this.dialog.scaleX, -this.dialog.scaleY);
                this.dialogText.y = (this.currDialog % 2) ? this.dialogText.y - 100 : this.dialogText.y + 100;
                this.dialogText.text = this.dialogs[this.currDialog];
            }
        })

        this.events.on('transitioncomplete', () => { 
            this.scene.setVisible(true);
        });
        this.scene.setVisible(false);

    }

    update() {

        this.deltaTime = new Date().getTime() - this.prevtime;
        this.prevtime += this.deltaTime;

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