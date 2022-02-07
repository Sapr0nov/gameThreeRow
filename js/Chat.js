import Cookies from './Cookies.js';

export default class Chat extends Phaser.Scene
{
    constructor (btn) {
        super({key: 'chat'});
        this.chatBtn = btn;
        this.cookies = new Cookies();
    }

    create () {
        
    this.uid = 0;

    if (this.cookies.getCookie('chatID')) {
        this.uid = this.cookies.getCookie('chatID');
        this.name = this.cookies.getCookie('chatName');
        this.jwt = this.cookies.getCookie('jwt');
    }else{
        this.chatInit('Гость');
    }

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
        this.name = this.cookies.getCookie("player");
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


    sendMsg(name, body) {

        const req = new XMLHttpRequest();
        req.open('POST', 'https://chat.stacksite.ru/api/message_create.php', true);
        req.setRequestHeader('accept', 'application/json');
        req.type = 'json';
        req.responseType = 'json';

        let time = new Date().toMysqlFormat();

        let data = '';
        data = '{';
        data = data + '"toType": "' + 0 + '",';
        data = data + '"toId": "' + 0 + '",';
        data = data + '"time": "' + time + '",';
        data = data + '"jwt": "' + this.jwt + '",';
        data = data + '"body": "' + body + '",';
        data = data + '"attach": null}';
        req.send(data);
        req.onreadystatechange = function () {
            if (req.readyState === 4) {
                if (req.status == 200 && req.status < 300) {
                    /* message send ok */
                  
                    return {"time":  time.slice(11), "name": name, "msg" : body }
                }
            }
        }
    }

    updateName() {
        const req = new XMLHttpRequest();
        req.open('POST', 'https://chat.stacksite.ru/api/user_update.php', true);
        req.setRequestHeader('accept', 'application/json');
        req.type = 'json';
        req.responseType = 'json';

        var  data = '{"jwt": "' + this.jwt + '", "firstname": "' + newName + '"}';
        req.send(data);
        req.onreadystatechange = function () {
            if (req.readyState === 4) {
                if (req.status == 200 && req.status < 300) {
                    this.cookies.setCookie('chatName', newName, {secure: true, 'max-age': 36000});
                    this.cookies.setCookie('jwt', req.response['jwt'], {secure: true, 'max-age': 36000});
                }
            }
        }
    }

    getMsg(time) {
        const req = new XMLHttpRequest();
        req.open('POST', 'https://chat.stacksite.ru/api/message_read.php', true);
        req.setRequestHeader('accept', 'application/json');
        req.type = 'json';
        req.responseType = 'json';
        if (this.jwt) {
            time = time.toMysqlFormat();
            let data = JSON.stringify({"jwt": this.jwt,"time": time});
            req.send(data);    
        }
        return req;
    }


    chatInit(name) {
        const req = new XMLHttpRequest();
        req.open('POST', 'https://chat.stacksite.ru/api/user_create.php', true);
        req.setRequestHeader('accept', 'application/json');
        req.type = 'json';
        req.responseType = 'json';

        const data = JSON.stringify({"firstname":name,"email":"guest@guest","password":""});

        req.send(data);
        req.onreadystatechange = () => {
            if (req.readyState === 4) {
                if (req.status == 200 && req.status < 300) {
                    this.uid = req.response['chat'].uid; 

                    this.cookies.setCookie('chatID', this.uid, {secure: true, 'max-age': 36000});
                    this.cookies.setCookie('name', req.response['chat'].name, {secure: true, 'max-age': 36000});
                    this.cookies.setCookie('jwt', req.response['chat'].jwt, {secure: true, 'max-age': 36000});
                    this.uid =  this.cookies.getCookie('chatID');
                    this.name = this.cookies.getCookie('name');
                    this.jwt = this.cookies.getCookie('jwt');
                }
            }
        }
    }
}


/* format Date for SQL */
function twoDigits(d) {
    if(0 <= d && d < 10) return "0" + d.toString();
    if(-10 < d && d < 0) return "-0" + (-1*d).toString();
    return d.toString();
}


Date.prototype.toMysqlFormat = function() {
    return this.getFullYear() + "-" + twoDigits(1 + this.getMonth()) + "-" + twoDigits(this.getDate()) + " " + twoDigits(this.getHours()) + ":" + twoDigits(this.getMinutes()) + ":" + twoDigits(this.getSeconds());
};
