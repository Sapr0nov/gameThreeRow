import Cookies from './Cookies.js';

export default class Chat extends Phaser.Scene
{
    constructor (btn) {
        super({key: 'chat'});
        this.chatBtn = btn;
    }

    create () {
        this.prevtime = new Date().getTime(); 
        this.deltaTime = 0;
        
        this.chatBtn.setInteractive({
            cursor: 'url(img/pointer.png), pointer'
        });

        this.chatBtn.on('pointerdown', () => {
            this.chatEnable = (this.chatEnable) ? false : true;
            // TODO open string and Field
        })

        this.chatBtn.on('pointerover', function() {
            this.setRotation(0.1);
        })

        this.chatBtn.on('pointerout', function() {
            this.setRotation(-0.1);
        })

        const cookie = new Cookies();
        let name = cookie.getCookie("player");
        const canvasWidth = document.querySelector('canvas').clientWidth;
        this.htmlInput = document.createElement("input");
        this.htmlInput.classList.add("mobileInput");
        this.htmlInput.style.width = canvasWidth - 12 + "px";
        this.htmlInput.style.marginLeft = Math.floor( (document.body.clientWidth - canvasWidth ) / 2) +"px";
        document.body.appendChild(this.htmlInput);

        this.htmlInput.addEventListener('keyup', () => {
            if (!this.inputNameActive ) {
                return false;
            }

            this.inputName.text = this.htmlInput.value; 
        })

        this.inputNameActive = false;

    }

    getMsg() {
        console.log('lf msg');
    }
    checkMsg() {
        console.log('new msg!');
    }
}
