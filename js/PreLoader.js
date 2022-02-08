import Cookies from './Cookies.js';
import Chat from './Chat.js';

export default class PreLoader extends Phaser.Scene
{
    constructor () {
        super({key: 'preLoader'});
    }

    preload () {
        this.scale = Math.floor ((1000 * this.game.canvas.width) / this.game.config.widthOrigin) / 1000;
        
        this.load.image('bg_preloader', './img/bg_preloader.jpg');
        this.load.atlas('earRight', './img/earRight.png', './img/earRight.json');
        this.load.atlas('earLeft', './img/earLeft.png', './img/earLeft.json');
        this.load.image('play', './img/play.png');
        this.load.svg('nameBoard', './img/desk_empty.svg',  {width:300, height:138});

        this.load.image('btn_chat', './img/btn_chat.png');
        this.load.image('btn_send', './img/btn_send.png');
        this.load.image('chat_board', './img/chat_board.png');
        this.load.image('chat_panel', './img/chat_panel.png');
        this.player = {};
    }

    create () {
        this.prevtime = new Date().getTime(); 
        this.isBlocked = true;        
        this.deltaTime = 0;
        this.gameScore = 0;

        this.bg = this.add.image(this.game.scale.baseSize.width / 2, Math.floor(this.game.scale.baseSize.height / 2) ,'bg_preloader').setScale(this.scale);
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

        this.earR = this.add.sprite(this.game.scale.baseSize.width * 0.605, Math.floor(this.game.scale.baseSize.height * 0.577) ,'earRight').setScale(this.scale);
        this.earL = this.add.sprite(this.game.scale.baseSize.width * 0.937, Math.floor(this.game.scale.baseSize.height * 0.577) ,'earLeft').setScale(this.scale);
 
        this.earR.play(this.earRAnim);
        this.earL.play(this.earLAnim);

        this.startBtn = this.add.image(this.game.scale.baseSize.width / 2, Math.floor(this.game.scale.baseSize.height / 3 ) ,'play');
        this.startBtn.setAlpha(1);
        this.startBtn.dScale = 0.0005;

        this.startBtn.setInteractive({ cursor: 'url(img/pointer.png), pointer' });

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

        this.add.text(2, 2, 'version: 0.000.002', { fontFamily: 'Tahoma, Times, serif', color: "#000000", fontSize : '10px' }).setScale(this.scale);

        this.nameBoard = this.add.image(80 * this.scale, 140 * this.scale, 'nameBoard').setScale(this.scale);
        this.nameBoard.setInteractive( { cursor: 'url(img/pointer.png), pointer' } );

        const cookie = new Cookies();
        this.player.name = cookie.getCookie("player");

        if (this.player.name === void 0) { this.player.name = "герой" }
        
        this.inputName = this.add.text(60 * this.scale, 130 * this.scale, this.player.name, { fontFamily: 'Tahoma, Times, serif', fontSize : '32px' }).setScale(this.scale);
        this.inputNameActive = false;
    
        this.htmlInput = document.createElement("input");
        this.htmlInput.classList.add("mobileInput");
        this.htmlInput.style.width = this.game.canvas.width - 12 + "px";
        this.htmlInput.style.marginLeft = Math.floor( (document.body.clientWidth - this.game.canvas.width ) / 2) +"px";
        document.body.appendChild(this.htmlInput);
        // input for chat
        this.htmlInput2 = this.htmlInput.cloneNode(true);
        document.body.appendChild(this.htmlInput2);
        
        this.htmlInput.addEventListener('keyup', () => {
            const regexp = /[^а-яa-zЁ]/ig;
            if (!this.inputNameActive ) {
                return false;
            }
            
            if (this.htmlInput.value.length > 10) {
                this.htmlInput.value = this.htmlInput.value.substring(0, 10);
            } 
            this.htmlInput.value = this.htmlInput.value.replaceAll(regexp,"");
            this.inputName.text = this.htmlInput.value; 
        })
        
        this.input.keyboard.on('keydown', (e) => {

            if (e.key === 'Enter' || e.key === 'Escape') {
                if (this.inputNameActive ) {
                    this.inputNameActive = false;
                    this.htmlInput.style.display = "none";
                    this.inputName.text =  this.htmlInput.value;
                    this.player.name = this.inputName.text;
                    cookie.setCookie('player', this.player.name,  {secure: true, 'max-age': 360000});
                }
                if (this.chat.open) {
                    this.htmlInput2.style.display = "none";
                    this.chatUI.input.text = this.htmlInput2.value;
                    this.chat.sendMsg(this.player.name, this.chatUI.input.text);
                    // send msg THEN clear TODO
                //    this.showHistory(this.htmlInput2.value);
                    this.htmlInput2.value = '';
                    this.chatUI.input.text = this.htmlInput2.value;
                }
            }    
        })

        this.nameBoard.on('pointerdown', () => {
            this.htmlInput.style.display = "block";
            this.htmlInput.click();
            this.htmlInput.focus();
            this.inputNameActive = true;
        })

        this.htmlInput2.addEventListener('keyup', () => {
            if (!this.chat.open) {
                return false;
            }else{
                if (this.htmlInput2.value.length < 20) {
                    this.chatUI.input.text = this.htmlInput2.value; 
                }else{
                    this.chatUI.input.text = "..." + this.htmlInput2.value.substring(this.htmlInput2.value.length - 17, this.htmlInput2.value.lenght);    
                }
            }
        });

        this.chatCamera = this.cameras.add(50 * this.scale, 120 * this.scale, 450 * this.scale, 680 * this.scale);
        this.chatCamera.scrollX = this.game.canvas.width * 2;
//        this.chatCamera.main.setSize(30,10);
        this.fullScr = this.add.image(Math.floor(this.game.canvas.width - 50 * this.scale), 50 * this.scale,'btn_chat').setScale(this.scale * 0.8);
        this.fullScr.setInteractive( { cursor: 'url(img/pointer.png), pointer' } );
        this.fullScr.on('pointerdown', () => {
            if (document.querySelector('canvas').requestFullscreen()) {
                document.querySelector('canvas').requestFullscreen();
            }
        }, false);
        
        
        this.chatUI = {};
        this.chatUI.all = [];
        this.chatUI.chatBtn = this.add.image(Math.floor(this.game.canvas.width - 50 * this.scale), 150 * this.scale,'btn_chat').setScale(this.scale * 0.8);
        this.chatUI.sendBtn = this.add.image(Math.floor(this.game.canvas.width - 150 * this.scale), this.game.canvas.height - 250 * this.scale,'btn_send').setScale(this.scale * 0.8);
        this.chatUI.board = this.add.image(this.game.canvas.width / 2 - 40 * this.scale, this.game.canvas.height / 2 - 85 * this.scale, 'chat_board').setScale(this.scale * 1.5, this.scale * 2);
        this.chatUI.panel = this.add.image(this.game.canvas.width / 2 - 100 * this.scale, this.game.canvas.height - 250 * this.scale, 'chat_panel').setScale(this.scale * 1.5);
        this.chatUI.history = this.add.text(this.game.canvas.width * 2, 160 * this.scale, '_', { fontFamily: 'Tahoma, Times, serif', color: "#714139", fontSize : '28px' }).setScale(this.scale);
        this.chatUI.input = this.add.text(60 * this.scale, this.game.canvas.height - 260 * this.scale, '_', { fontFamily: 'Tahoma, Times, serif', color: "#714139", fontSize : '28px' }).setScale(this.scale);
        this.chatUI.all = [this.chatUI.sendBtn , this.chatUI.board, this.chatUI.panel, this.chatUI.input, this.chatUI.history];
        this.chatUI.all.forEach( el => { el.setVisible(false); })

        this.chatUI.chatBtn.setInteractive( { cursor: 'url(img/pointer.png), pointer' } );
        this.chatUI.chatBtn.on('pointerdown', () => {
            if (this.chat.open) {
                this.chatUI.all.forEach( el => { el.setVisible(false); })
                this.startBtn.setInteractive();
            }else{
                this.chatUI.all.forEach( el => { el.setVisible(true); })    
                this.startBtn.disableInteractive();
            }
            this.chat.open = !this.chat.open;
        })

        this.chatUI.sendBtn.setInteractive( { cursor: 'url(img/pointer.png), pointer' } );
        this.chatUI.sendBtn.on('pointerdown', () => {
            this.htmlInput2.style.display = "none";
            this.chatUI.input.text = this.htmlInput2.value;
            // send msg THEN clear TODO 
            this.showHistory(this.htmlInput2.value);
            let msg = this.htmlInput2.value;
            this.htmlInput2.value = '';
            this.chatUI.input.text = this.htmlInput2.value;
            this.chat.sendMsg(this.player.name, msg);
        })

        this.delay = 0;
        this.chatUI.panel.setInteractive( {cursor: 'url(img/pointer.png), pointer' } );
        this.chatUI.panel.on('pointerdown', () => {
            this.htmlInput2.style.display = "block";
            this.htmlInput2.click();
            this.htmlInput2.focus();
        })

        this.chat = new Chat( this.chatBtn);
        
        this.chat.chatInit(this.player.name);
        this.lastCheck = new Date();
        this.lastCheck.setDate( this.lastCheck.getDate() - 1);
    }
    
    update() {
        this.deltaTime = new Date().getTime() - this.prevtime;
        this.prevtime += this.deltaTime;
        
        this.delay += this.deltaTime;
        if (this.delay > 3000) {
            this.delay = 0;
            this.checkMsg(this.lastCheck);
        }

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


    checkMsg(lastCheck) {
        let req = this.chat.getMsg(lastCheck);
        let newTime = new Date();
        req.onreadystatechange = () => {
            if (req.readyState === 4) {
                if (req.status == 200 && req.status < 300) {
                    const arrMsg = req.response['messages'];  
                    if (Array.isArray(arrMsg) && arrMsg.length > 0) {
                        arrMsg.forEach (msg => {
                            this.showHistory(msg);
                            this.lastCheck = newTime;
                        })
                    }
                }
            }
        }
    }


    showHistory(msg) {
        this.chatUI.history.height = 400;
        this.chatCamera.setVisible(false);
        if (this.chat.open) {
            this.chatCamera.setVisible(true);
            console.log(msg);
            let time = msg.time.split(" ")[1].substring(0,5);
            let addString = "[" + time + "] " + msg.firstname + ": " + msg.body + " \r\n";
            let result = "";

            if (addString.length > 27) {
                for (let i = 0; i <= Math.floor(addString.length / 27); i ++) {
                    result += addString.substring(27 * i, 27 * (i + 1) ) + "\r\n";
                }
            }else{
                result = addString + " \r\n";;
            }
            this.chatUI.history.text += result;

            if (this.chatUI.history.text.length > 11000) {
                this.chatCamera.scrollY = 0;
                this.chatUI.history.text = "\r\n";
            }
            
            this.chatCamera.scrollY = this.chatUI.history.text.match(/[\r\n]/g).length * 11.75 - 375;
        }
    }
}