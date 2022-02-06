import Cookies from './Cookies.js';

export default class Chat extends Phaser.Scene
{
    constructor (btn) {
        super({key: 'chat'});
        this.chatBtn = btn;
    }

    create () {
        
    this.uid = 0;

    this.time = new Date();
    this.time.setDate(this.time.getDate() - 1);
    this.time = this.time.toMysqlFormat();

    if (getCookie('chatID')) {
        this.uid = getCookie('chatID');
        this.name = getCookie('chatName');
        this.jwt = getCookie('jwt');
    }else{
        chatInit();
    }

    setInterval(() => {
        getMsg();
    }, 2500);


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
        this.name = cookie.getCookie("player");
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

    /* format Date for SQL */
    twoDigits(d) {
        if(0 <= d && d < 10) return "0" + d.toString();
        if(-10 < d && d < 0) return "-0" + (-1*d).toString();
        return d.toString();
    }


    sendMsg(name, body) {

        const req = new XMLHttpRequest();
        req.open('POST', '/api/message_create.php', true);
        req.setRequestHeader('accept', 'application/json');
        req.type = 'json';
        req.responseType = 'json';

        this.time = new Date().toMysqlFormat();

        let data = '';
        data = '{';
        data = data + '"toType": "' + 0 + '",';
        data = data + '"toId": "' + 0 + '",';
        data = data + '"time": "' + time + '",';
        data = data + '"jwt": "' + jwt + '",';
        data = data + '"body": "' + body + '",';
        data = data + '"attach": null}';

        document.getElementById('chatArea__answer--msg').value = '';
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
        req.open('POST', '/api/user_update.php', true);
        req.setRequestHeader('accept', 'application/json');
        req.type = 'json';
        req.responseType = 'json';

        this.time = new Date().toMysqlFormat();

        var  data = '{"jwt": "' + this.jwt + '", "firstname": "' + newName + '"}';
        req.send(data);
        req.onreadystatechange = function () {
            if (req.readyState === 4) {
                if (req.status == 200 && req.status < 300) {
                    setCookie('chatName', newName, {secure: true, 'max-age': 36000});
                    setCookie('jwt', req.response['jwt'], {secure: true, 'max-age': 36000});
                }
            }
        }
    }

    getMsg() {
    
        const req = new XMLHttpRequest();
        req.open('POST', '/api/message_read.php', true);
        req.setRequestHeader('accept', 'application/json');
        req.type = 'json';
        req.responseType = 'json';

        let data = JSON.stringify({"jwt": jwt,"time": time});

        this.time = new Date().toMysqlFormat();

        req.send(data);
        req.onreadystatechange = function () {
            if (req.readyState === 4) {
                if (req.status == 200 && req.status < 300) {
                    var arrMsg = req.response['messages'];  
                    
                    if (Array.isArray(arrMsg) && arrMsg.length > 0) {
                        arrMsg.forEach(function(msg) {
                            var newBlock = document.createElement("div");
                            newBlock.classList.add('chatArea__history--msg');

                            newBlock.innerHTML =  "<p>" + msg.time.slice(11) + "</p><p>" + msg.firstname + "</p><p>" + msg.body + "</p>";
                            document.getElementById('chatArea__history').appendChild(newBlock);
                            scrollBottom();
                        });                
                    }
                }
            }
        }
    }

    getCookie(name) {
        let matches = document.cookie.match(new RegExp(
            "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    }

    setCookie(name, value, options = {}) {

        options = {
        path: '/',
        // при необходимости добавьте другие значения по умолчанию
        ...options
        };

        if (options.expires instanceof Date) {
        options.expires = options.expires.toUTCString();
        }

        let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);

        for (let optionKey in options) {
        updatedCookie += "; " + optionKey;
        let optionValue = options[optionKey];
        if (optionValue !== true) {
            updatedCookie += "=" + optionValue;
        }
        }

        document.cookie = updatedCookie;
    }

    deleteCookie(name) {
    setCookie(name, "", {
        'max-age': -1
    })
    }

    chatInit() {
        const req = new XMLHttpRequest();
        req.open('POST', '/api/user_create.php', true);
        req.setRequestHeader('accept', 'application/json');
        req.type = 'json';
        req.responseType = 'json';

        const data = JSON.stringify({"firstname":"Гость","email":"guest@guest","password":""});

        this.time = new Date().toMysqlFormat();

        req.send(data);
        req.onreadystatechange = function () {
            if (req.readyState === 4) {
                if (req.status == 200 && req.status < 300) {
                    this.uid = req.response['chat'].uid;  
                    setCookie('chatID', this.uid, {secure: true, 'max-age': 36000});
                    setCookie('chatName', req.response['chat'].name, {secure: true, 'max-age': 36000});
                    setCookie('jwt', req.response['chat'].jwt, {secure: true, 'max-age': 36000});
                    this.uid = getCookie('chatID');
                    this.name = getCookie('chatName');
                    this.jwt = getCookie('jwt');
                }
            }
        }
    }
}


Date.prototype.toMysqlFormat = function() {
    return this.getFullYear() + "-" + twoDigits(1 + this.getMonth()) + "-" + twoDigits(this.getDate()) + " " + twoDigits(this.getHours()) + ":" + twoDigits(this.getMinutes()) + ":" + twoDigits(this.getSeconds());
};
