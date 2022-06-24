import Cookies from './Cookies.js';
export default class GameScene extends Phaser.Scene
{
    constructor () {
        super({key: 'gameScene'});
    }

    init(data) {
        this.data = data;
        this.startTimeout = 1500;
        this.MaxRow = (data.MaxRow !== void 0) ? data.MaxRow : 5; 
        this.MaxCol = (data.MaxCol !== void 0) ? data.MaxCol : 7; 
        this.typesBlock = (data.typesBlock !== void 0) ? data.typesBlock : 5; // number different blocks without bombs 
        this.speed = (data.speed !== void 0) ? data.speed : 10; 
        this.victoryScore = (data.victoryScore !== void 0) ? data.victoryScore : 99; 
        this.MaxLife = (data.MaxLife !== void 0) ? data.MaxLife : 20;
        this.winColor = (data.winColor !== void 0) ? data.winColor : 0;
        this.keys = (data.keys !== void 0) ? JSON.parse(data.keys) : ['block_air','block_arthropoda','block_demon','block_earth','block_fire','block_flash','block_forest','block_ice','block_lindworm','block_water','bomb','tnt'];
        this.four = (data.four !== void 0) ? JSON.parse(data.four) : false;
        this.five = (data.five !== void 0) ? JSON.parse(data.five) : false; 
        this.isVictory = () => {return (this.barsProgress[this.winColor].value >= this.victoryScore)}

        if (this.victoryScore > 100) {
            this.victoryScore = 100;
        }

        if (this.four) {
            this.keys.push(this.four);
        }
        if (this.five) {
            this.keys.push(this.five);
        }
    }

    preload () {
        let width = this.game.canvas.width;
        let height = this.game.canvas.height;
        this.load.atlas('blocks', './img/blocks.png', './img/blocks.json');
        this.load.atlas('energy', './img/energy.png', './img/energy.json');

        this.load.image('blockSelect','./img/blockSelect.png');
        this.load.image('board','./img/board.png');
        this.load.image('popup','./img/popup.png');
        this.load.image('btnReply','./img/btn_replay.png');
        this.load.image('btnMenu','./img/btn_menu.png');
        this.load.image('btnNext','./img/btn_play.png');
        this.load.image('background', './img/background.jpg');
        this.load.image('bar','./img/bar_empty.png');
        this.load.image('bar-progress','./img/bar_progress.png');
        this.load.image('prize','./img/win.png');
        this.load.image('noprize','./img/fail.png');
        this.load.svg('desk-life', './img/desk_life.svg',  {width:300, height:138});
        this.load.svg('desk-score', './img/desk_score.svg',  {width:300, height:138});
        
        this.baseSize = 64;

        this.step = width / this.MaxCol;
        this.scale = width / this.game.config.widthOrigin;
        
        this.ofsetY  = height - this.baseSize * this.scale / 2 - width / this.MaxCol * this.MaxRow; 
        this.ofsetX = 10 + this.baseSize * this.scale / 2;
        
        
        this.prevtime = new Date().getTime(); 
        this.deltaTime = 0;
        this.isBlocked = true;
        this.matrix = new Array(this.MaxRow);
        for (let i = 0; i < this.MaxRow; i ++){
            this.matrix[i] = new Array(this.MaxCol).fill();
        }

        this.events.on('transitioncomplete', () => { 
            if (this.scene.settings.visible) { return }
            this.scene.setVisible(true);
            this.normalize();
            this.isBlocked = false;
            this.gameScore = 0;
            this.bars.forEach((bars, i) => this.resetProgress(i) );
        });
        setTimeout(() => { 
            if (this.scene.settings.visible) { return }
            this.scene.setVisible(true);
            this.normalize();
            this.isBlocked = false;
            this.gameScore = 0;
            this.bars.forEach((bars, i) => this.resetProgress(i) );
        }, this.startTimeout);

        this.scene.setVisible(false);

    }


    create () {

        this.dropBlocks = [];
        this.swapBlocks = [];
        this.curAnim = '';
        this.gameScore = 0;
        this.collapseBlocks = new Set();

        this.input.keyboard.on('keydown', (e) => {
            if (e.key === 't') {
                this.test();
            }
            if (e.key === 'n') {
                this.normalize();
            }
        });

        this.cookie = new Cookies();
        this.currScene = this.cookie.getCookie("currScene") ? this.cookie.getCookie("currScene") : 0;

        this.animsBlock = [];
        this.energy = this.anims.create({ key: 'energy', delay :0, hideOnComplete: true, frames: this.anims.generateFrameNames('energy', { prefix: 'energy_', end: 15, zeroPad: 4 }), repeat: 0 });
        this.keys.forEach( name => {
            this[name] = this.anims.create({ key: name, frames: this.anims.generateFrameNames('blocks', { prefix: name + '_', end: 0, zeroPad: 4 }), repeat: -1 });
            this.animsBlock.push(this[name]);
        })

        this.bg = this.add.image( Math.floor(this.game.scale.baseSize.width / 2), Math.floor(this.game.scale.baseSize.height / 2) ,'background').setScale(this.scale);
        this.bg.isHide = false;
        this.bg.dalpha = -0.001;

        this.deskLife = this.add.image(140 * this.scale, 70 * this.scale, 'desk-life').setScale(this.scale);
        this.deskScore = this.add.image(this.game.scale.baseSize.width - 140 * this.scale, 70 * this.scale, 'desk-score').setScale(-this.scale, this.scale);
        this.lifes = this.add.text(210 * this.scale, 64 * this.scale, '0000', { fontFamily: 'Tahoma, Times, serif', fontSize : '32px' }).setScale(this.scale);
        this.score = this.add.text(this.game.scale.baseSize.width - 230 * this.scale, 64 * this.scale, '0000', { fontFamily: 'Tahoma, Times, serif', fontSize : '32px'}).setScale(this.scale);
        this.UI = [this.deskLife, this.deskScore, this.lifes, this.score];

        this.lifes.num = this.MaxLife;

        this.lifes.setText(this.lifes.num);
        this.board = this.add.image(0, Math.floor(this.ofsetY - 0.75 * this.baseSize * this.scale), 'board').setScale(this.scale * 0.96);
        this.board.blockSelect = this.add.image(0, 0, 'blockSelect').setScale(this.scale);
        this.board.blockSelect.setVisible(false);
        this.board.setOrigin(0);
        this.board.setAlpha(0.5);
        this.board.blocks = [];

        this.popupUI = {};
        this.popupUI.elements = [];
        this.popupUI.bg = this.add.image( Math.floor(this.game.scale.baseSize.width / 2), Math.floor(this.game.scale.baseSize.height / 2) ,'popup').setScale(this.scale);
        this.popupUI.prize = this.add.image( Math.floor(this.game.scale.baseSize.width / 2), Math.floor(this.game.scale.baseSize.height / 3) ,'prize').setScale(this.scale);
        this.popupUI.noprize = this.add.image( Math.floor(this.game.scale.baseSize.width / 2), Math.floor(this.game.scale.baseSize.height / 3) ,'noprize').setScale(this.scale);
        this.popupUI.btnReply = this.add.image( Math.floor(this.game.scale.baseSize.width / 2 + 150 * this.scale), Math.floor(this.game.scale.baseSize.height / 3 * 2 + 30 * this.scale) ,'btnReply').setScale(this.scale);
        this.popupUI.btnMenu = this.add.image( Math.floor(this.game.scale.baseSize.width / 2), Math.floor(this.game.scale.baseSize.height / 3 * 2 + 30 * this.scale) ,'btnMenu').setScale(this.scale);
        this.popupUI.btnNext = this.add.image( Math.floor(this.game.scale.baseSize.width / 2 - 150 * this.scale), Math.floor(this.game.scale.baseSize.height / 3 * 2 + 30 * this.scale) ,'btnNext').setScale(this.scale);
        this.popupUI.elements.push(this.popupUI.bg, this.popupUI.prize, this.popupUI.noprize, this.popupUI.btnReply, this.popupUI.btnMenu, this.popupUI.btnNext );
        this.popupUI.elements.forEach(el => el.setVisible(false));

        [this.popupUI.btnReply, this.popupUI.btnMenu, this.popupUI.btnNext].forEach (element => {
            element.setInteractive( { cursor: 'url(img/pointer.png), pointer' } );    
        }) 

        this.popupUI.btnReply.on('pointerdown', () => {
            this.bg.isHide = true;
            this.currScene = (this.currScene > 0) ? this.currScene - 1 : 3;
            this.cookie.setCookie('currScene', this.currScene, {secure: true, 'max-age': 360000});
            this.scene.restart(this.data);
        })
        this.popupUI.btnMenu.on('pointerdown', () => {
            this.switchScene();
        })
        this.popupUI.btnNext.on('pointerdown', () => {
            this.nextScene();
        })

        
        this.bars = Array(parseInt(this.typesBlock));
        this.barsProgress = Array(parseInt(this.typesBlock));
        this.barsPreview = Array(parseInt(this.typesBlock));

        for (let i = 0; i < parseInt(this.typesBlock); i ++) {
            this.bars[i] = this.add.image(10 * this.scale, Math.floor(this.game.scale.baseSize.height / 10 + 50 + 40 * i * this.scale) ,'bar').setScale(this.scale);
            this.barsProgress[i] = this.add.image( 10 * this.scale, Math.floor(this.game.scale.baseSize.height / 10 + 50 + 40 * i * this.scale) ,'bar-progress').setScale(this.scale);
            this.barsPreview[i] = this.add.sprite( 10 * this.scale, Math.floor(this.game.scale.baseSize.height / 10 + 44 + 40 * i * this.scale)).play(this.animsBlock[i]).setScale(this.scale / 3.5);
            this.barsProgress[i].setOrigin(0);
            this.barsPreview[i].setOrigin(0);
            this.bars[i].setOrigin(0);
        }
   
        for (let curRow = 0; curRow < this.MaxRow; curRow ++) {
            for (let curCol = 0; curCol < this.MaxCol; curCol ++) {
                this.matrix[curRow][curCol] = {};
                [this.matrix[curRow][curCol].block, this.matrix[curRow][curCol].key] = this.newBlock(curRow, curCol);
            }
        }

        this.collapseBlocks = new Set(...this.checkMatches(this.matrix));
        while (this.collapseBlocks.size > 0) {
            this.collapse([this.collapseBlocks]);
            this.spawn();
            this.collapseBlocks = new Set(...this.checkMatches(this.matrix));
        }
        this.barsProgress.forEach( bar => { bar.setVisible(false) })
        this.bars.forEach( bar => { bar.setVisible(false) })
        this.barsPreview.forEach( bar => { bar.setVisible(false) })
        
        this.barsProgress[this.winColor].setVisible(true);
        this.bars[this.winColor].setVisible(true);
        this.barsPreview[this.winColor].setVisible(true);
        this.normalize();
    }


    update() {

        this.deltaTime = new Date().getTime() - this.prevtime;
        this.prevtime += this.deltaTime;
        this.checkStartEvent('swap', this.swapAnimation.bind(this), this.swapBlocks);
        this.checkStartEvent('drop', this.dropAnimation.bind(this), this.dropBlocks);
        this.checkEndEvent('swap', this.onSwapFinished.bind(this), this.swapBlocks);
        this.checkEndEvent('drop', this.onDropFinished.bind(this), this.dropBlocks);

        if (this.isBlocked) {
            this.board.blocks.forEach (block => { block.tint = 0xcccccc; });
        }else{
            this.board.blocks.forEach (block => { block.tint = 0xffffff; });
        }

        this.bgAnimation();
    }


    checkStartEvent (name, callback, arr) {
        if ((this.curAnim === '' || this.curAnim === name) && arr.length > 0) {
            if (this.curAnim === '') {
                this.isBlocked = true;
            }
            this.curAnim = name;
            callback(arr);
        }
    }


    checkEndEvent (name, callback, arr) {
        if (this.curAnim === name && arr.length === 0) {
            callback();
            this.curAnim = '';
        }
    }

    /**
     * return Array of  objects.
     *
     * @param {Array[][]} matrix tested matrix.
     * @return {Array[]} array of {blocks : Sprite, key : Int} (blocks for delete).
     */
    checkMatches (matrix) { 
        const linesV = [];
        const linesH = [];

        // vertical
        for (let curCol = 0; curCol < this.MaxCol; curCol ++) {
            let curKey = matrix[0][curCol].key;
            let line = [matrix[0][curCol]];

            for (let curRow = 1; curRow < this.MaxRow; curRow ++) {
                if (matrix[curRow][curCol].key === curKey) {
                    line.push(matrix[curRow][curCol]);
                }else{
                    if (line.length >= 3) { 
                        linesV.push(line);
                    }
                    line = [];
                    curKey = matrix[curRow][curCol].key;
                    line.push(matrix[curRow][curCol]);
                }

                if (curRow === this.MaxRow-1) {
                    if (line.length >= 3) { 
                        linesV.push(line);
                    }
                    line = [];
                }
            }       
        }

        // horizontal
        for (let curRow = 0; curRow < this.MaxRow; curRow ++) {
            let curKey = matrix[curRow][0].key;
            let line = [matrix[curRow][0]];

            for (let curCol = 1; curCol < this.MaxCol; curCol ++) {

                if (matrix[curRow][curCol].key === curKey) {
                    line.push(matrix[curRow][curCol]);
                }else{
                    if (line.length >= 3) { 
                        linesH.push(line);
                    }
                    line = [];
                    curKey = matrix[curRow][curCol].key;
                    line.push(matrix[curRow][curCol]);
                }

                if (curCol === this.MaxCol-1) {
                    if (line.length >= 3) { 
                        linesH.push(line);
                    }
                    line = [];
                }
            }       
        }

        const lines = [...linesV];
        for (let i = 0; i < linesH.length; i ++) {
            lines.forEach( line => {
                // Attentional return index in match element from FIRST array
                let indexMatch = this.compareLine(linesH[i], line);
                if ( indexMatch > -1 ) {
                    linesH[i].splice(indexMatch, 1);
                    line.push(...linesH[i]);
                    linesH.splice(i, 1);
                }
            })
        }

        lines.push(...linesH);
        return lines;
    }


    checkPossibleMove () {
        console.log('tips if long pause')
    }
    
    
    compareLine (arr1, arr2) {
        if (!Array.isArray(arr1) || !Array.isArray(arr2)) {
            return; 
        }

        let result = -1;
        arr1.forEach((el1, index) => {
            if (result > 0) {
                return;
            }
            arr2.forEach(el2 => 
                {
                    if (el1.block.col === el2.block.col && el1.block.row === el2.block.row ) {
                        result = index;
                    }
                })
        })
        return result;
    }

    /**
     * return undefined.
     *
     * @param {Array of Sprite} blocks - elements for delete.
     * @return {void 0} undefined.
     */
    collapse (blocks) {
        blocks.forEach(line => {
            if (line.length > 3) {
                line.rand = Math.floor(Math.random()*line.length);
            }
            line.forEach( (element, i ) => {
                if (element.block === void 0) {
                    return;
                }

                let block = this.add.sprite(element.block.x, element.block.y, 'energy');
                block.play(this.energy);
                block.on('animationcomplete', () => {   
                    block.destroy();
                    this.spawn();
                })

                let key = this.matrix[element.block.row][element.block.col].key;
                if (key != null) {
                    this.addProgress(key, 5);
                }

                if (line.rand !== void 0 && i === line.rand) {
                    if (line.length === 4 && this.four ) {
                        this.matrix[element.block.row][element.block.col].key = parseInt(this.typesBlock);
                    }
                    if (line.length > 4 && this.five ) {
                        this.matrix[element.block.row][element.block.col].key = parseInt(this.typesBlock) + 1;
                    }
                    this.matrix[element.block.row][element.block.col].block.play(this.animsBlock[this.matrix[element.block.row][element.block.col].key]);

                }else{
                    // get number of type block
                    this.matrix[element.block.row][element.block.col].key = null;                
                    this.matrix[element.block.row][element.block.col].block.destroy();
                }
            })
        })
        this.collapseBlocks = new Set();
    }


    bombBoom (block) {
        
        [-1, 0, 1].forEach( dx => {
            [-1, 0 , 1].forEach ( dy => {
                
                // if damage block on field
                if (this.matrix[block.row + dx] === void 0 || this.matrix[block.row + dx][block.col + dy] === void 0) {
                    return;
                }
                
                // not current block and block = bomb
                if ((dx !== 0 && dy !== 0) && this.matrix[block.row + dx][block.col + dy].key === parseInt(this.typesBlock))
                {
                    // block not in Set
                    if (! this.collapseBlocks.has(this.matrix[block.row + dx][block.col + dy])) {
                        this.collapseBlocks.add(this.matrix[block.row + dx][block.col + dy]);
                        this.bombBoom(this.matrix[block.row + dx][block.col + dy].block);
                    }
                }
                // not current block and block = tnt
                if (dx !== 0 && dy !== 0 && this.matrix[block.row + dx][block.col + dy].key === parseInt(this.typesBlock) + 1)
                {
                    // element (block and keys) not in Set
                    if (! this.collapseBlocks.has(this.matrix[block.row + dx][block.col + dy])) {
                        this.collapseBlocks.add(this.matrix[block.row + dx][block.col + dy]);
                        this.tntBoom(this.matrix[block.row + dx][block.col + dy].block);
                    }
                }
                
                this.collapseBlocks.add(this.matrix[block.row + dx][block.col + dy]);
                
            })
            
        })
    }


    tntBoom (block) {

        for (let i = 0; i < this.MaxCol; i ++) {
            if (i !== block.col && this.matrix[block.row][i].key === parseInt(this.typesBlock))
            {
                // block not in Set
                if (! this.collapseBlocks.has(this.matrix[block.row][i])) {
                    this.collapseBlocks.add(this.matrix[block.row][i]);
                    this.bombBoom(this.matrix[block.row][i].block);
                }
            }
            if (i !== block.col && this.matrix[block.row][i] === parseInt(this.typesBlock) + 1)
            {
                // block not in Set
                if (! this.collapseBlocks.has(this.matrix[block.row][i])) {
                    this.collapseBlocks.add(this.matrix[block.row][i]);
                    this.tntBoom(this.matrix[block.row][i].block);
                }
            }
            this.collapseBlocks.add(this.matrix[block.row][i]);
        }
    }


    clicked (element) {

        if (this.matrix[element.row][element.col].key === parseInt(this.typesBlock) )  {
            this.bombBoom(element);
            this.collapse([this.collapseBlocks]);
            return;
        }

        if (this.matrix[element.row][element.col].key === parseInt(this.typesBlock) + 1 ) {
            this.tntBoom(element);
            this.collapse([this.collapseBlocks]);
            return;
        }

        // checked neighborhood
        if ( Math.abs(this.firstSelBlock.row - element.row) + Math.abs(this.firstSelBlock.col - element.col) === 1 ) {
            this.board.blockSelect.setVisible(false);
            this.makeSwap(this.firstSelBlock, element);
            this.firstSelBlock = null;
        }
    }


    makeSwap(el1, el2) {

        let key1 = this.animsBlock[this.matrix[el1.row][el1.col].key];
        let key2 = this.animsBlock[this.matrix[el2.row][el2.col].key];

        if (key1 < parseInt(this.typesBlock) && key2 < parseInt(this.typesBlock)) { 
            el1.play(key1);  
            el2.play(key2);  
        }
        
        [el1.dx, el1.dy, el2.dx, el2.dy] = [(el2.x - el1.x) / 24, (el2.y - el1.y) / 24, (el1.x - el2.x) / 24, (el1.y - el2.y) / 24];
        [el1.newX, el1.newY, el2.newX, el2.newY] = [el2.x, el2.y, el1.x, el1.y];
        [el2.row, el2.col, el1.row, el1.col] = [el1.row, el1.col, el2.row, el2.col];

        let newMatrix = this.copyMatrix(this.matrix);
        [ newMatrix[el1.row][el1.col], newMatrix[el2.row][el2.col] ] = [ newMatrix[el2.row][el2.col], newMatrix[el1.row][el1.col] ];

        if (!this.checkMatches(newMatrix).length ) {
            [el1.returned, el2.returned] = [true, true];
            [el2.row, el2.col, el1.row, el1.col] = [el1.row, el1.col, el2.row, el2.col];

        }else{
            this.matrix = newMatrix;
            this.lifes.num --;
            this.lifes.setText( this.lifes.num );
        }

        this.swapBlocks.push(el1);
        this.swapBlocks.push(el2);
    }


    spawn() {
        for (let curCol = 0; curCol < this.MaxCol; curCol ++) {
            let empties = 0;

            for (let curRow = (this.MaxRow - 1); curRow >= 0; curRow --) {

                if (this.matrix[curRow][curCol].key === null) {
                    empties++;
                }else if (empties) {
                    // shift current block
                    let elementEmpty = this.matrix[curRow + empties][curCol];
                    let elementDonor = this.matrix[curRow][curCol];
                   
                    elementEmpty.key = elementDonor.key;
                    elementEmpty.block = elementDonor.block;
                    elementEmpty.block.newY = elementEmpty.block.y + this.step * empties;
                    elementEmpty.block.row = elementDonor.block.row + empties;
                    elementEmpty.block.dy = empties * 8;
                    elementDonor.key = null;
                    elementDonor.block = null;
                    this.dropBlocks.push(elementEmpty.block);
                }
            }
            // create new blocks
            if (empties) {
                for (let i= 0; i < empties; i ++) {
                    let [block, key] = this.newBlock(i, curCol);
                    block.newY = block.y;
                    block.y = block.y - this.step * (i + 2);
                    block.dy = i + 3;
                    this.matrix[i][curCol].block = block;
                    this.matrix[i][curCol].key = key;
                    this.dropBlocks.push(block);
                }
            }
        }
    }


    newBlock(curRow, curCol, posRow = curRow, posCol = curCol) {
        let key = Math.floor(Math.random() * (parseInt(this.typesBlock)));
        this.x = this.ofsetX + this.step * posCol;
        this.y = this.ofsetY + this.step * posRow;
        let block = this.add.sprite(this.x, this.y, 'blocks');
        block.play(this.animsBlock[key]);
        block.col = curCol;
        block.row = curRow;
        block.newX = block.x;
        block.newY = this.ofsetY + this.step * curRow;
        block.dx = posCol - curCol;
        block.dy = posRow - curRow;
        block.setInteractive();
        
        block.on('pointerdown', () => {
            if (this.isBlocked) return;

            if (this.firstSelBlock && ( (Math.abs(this.firstSelBlock.col - block.col) + Math.abs(this.firstSelBlock.row - block.row)) === 1 ) ) {
                this.clicked(block);
            } else {
                this.firstSelBlock = block;
                [this.board.blockSelect.x, this.board.blockSelect.y] = [this.firstSelBlock.x, this.firstSelBlock.y];
                this.board.blockSelect.setVisible(true);    
            }
        })

        this.board.blocks.push(block);
        
        // if realized under board
        this.board.setInteractive();

        this.board.on('pointerup', (e) => {
            if (this.isBlocked || !this.firstSelBlock) return;
            // checked click on bomb
            if (this.matrix[block.row][block.col].key >= parseInt(this.typesBlock)) {
                this.clicked(block);
                return;
            }

            let newCol = this.firstSelBlock.col;
            let newRow = this.firstSelBlock.row;
            if (Math.abs(e.upX - e.downX) > Math.abs(e.upY - e.downY)) {
                newCol += (e.upX > e.downX) ? 1 : -1;
            }else{
                newRow += (e.upY > e.downY) ? 1 : -1;
            }
            this.clicked(this.matrix[newRow][newCol].block);
            this.firstSelBlock = null;
        })

        // if realized under block
        block.on('pointerup', () => {
            if (this.isBlocked || !this.firstSelBlock) return;
            // checked click on bomb
            if (this.matrix[block.row][block.col].key >= parseInt(this.typesBlock)) {
                this.clicked(block);
                return;
            }
            if (this.firstSelBlock === block) {
                return;
            }
            // checked direction of swipe
            if ( (this.firstSelBlock.row !== block.row) && (this.firstSelBlock.col !== block.col) ) {
                return;
            }
            
            let nextRow = this.firstSelBlock.row;
            let nextCol = this.firstSelBlock.col;

            if (this.firstSelBlock.row === block.row) {
                nextCol += ( this.firstSelBlock.col < block.col ) ? 1 : -1;
            }
            if (this.firstSelBlock.col === block.col) {
                nextRow += ( this.firstSelBlock.row < block.row ) ? 1 : -1;
            }

            if (this.matrix[nextRow]) {
                this.clicked(this.matrix[nextRow][nextCol].block);
                this.board.blockSelect.setVisible(false);
                this.firstSelBlock = null;
            }
        })

        block.on('pointerover', () => {
            block.setScale(this.scale / 1.9);
        })
        
        block.on('pointerout', () => {
            block.setScale(this.scale / 2);
        })
        
        block.setDisplaySize(this.baseSize * this.scale, this.baseSize * this.scale);
        return [block, key];
    }


    addProgress (number, progress) {
        //bomb
        if (number >= parseInt(this.typesBlock) ) {  return; }
        
        let newValue = this.barsProgress[number].value + progress;

        if (newValue > 100) {
            newValue = 100;

            this.barsPreview[number].setScale(this.scale / 3);
            this.barsPreview[number].setInteractive( { cursor: 'url(img/pointer.png), pointer' } );
            this.barsPreview[number].on('pointerdown', () => {
                this.gameScore += 100;
                this.barsProgress[number].value = 0;
                this.resetProgress(number);
                this.barsPreview[number].disableInteractive();
            })
        }

        this.barsProgress[number].value = newValue;
        this.barsProgress[number].setScale( newValue / 100 * this.scale, this.scale );
        this.barsProgress[number].x = 20 * this.scale;

        this.gameScore += progress;
        
        if (this.gameScore < 10 ) {
            this.score.setText( '000' + this.gameScore );
            
        }else if (this.gameScore < 100 ) {
            this.score.setText( '00' + this.gameScore );

        }else if (this.gameScore < 1000 ) {
            this.score.setText( '0' + this.gameScore );

        } else {
            this.score.setText( '' + this.gameScore );
        }

    }
    
    
    resetProgress (number) {
        this.barsProgress[number].value = 0;
        this.addProgress(number, 0);
    }


    checkWin() {
        let hideCup;
        let hideBtn;
        if (!this.isVictory() && this.lifes.num > 0) {
            return false;
        }

        if (this.isVictory()) {
            this.currScene++;
            if (this.currScene > 3 ) { this.currScene = 1 }
            this.cookie.setCookie('currScene', this.currScene,  {secure: true, 'max-age': 360000});
            hideCup = this.popupUI.noprize;
        }

        if (this.lifes.num <= 0) {
            hideCup = this.popupUI.prize;
            hideBtn = this.popupUI.btnNext;
        }

        this.matrix.forEach(rows => rows.forEach(el => el.block.setVisible(false)));
        this.board.setVisible(false);
        this.barsProgress.forEach( bar => { (bar.setVisible(false) ) })
        this.bars.forEach( bar => { (bar.setVisible(false) ) })

        this.popupUI.elements.forEach(el => { 
            if (el !== hideCup) 
            { 
                el.setVisible(true); 
            }
        });
        hideBtn && hideBtn.setVisible(false);

        return true;
    }


    switchScene () {
        this.bg.isHide = true;
        this.scene.transition({
            target: 'preLoader',
            duration: 1300,
            init: true,
            data: {"delay" : true}
        })
    }


    nextScene () {
        this.bg.isHide = true;
        this.scene.transition({
            target: 'mainScene',
            duration: 1300,
            init: true
        })
    }


    dropAnimation(blocks) {
        blocks.forEach( (block, index) => {
            if (block.newY > block.y) {
                block.y += block.dy * this.deltaTime / this.speed;
            }else{
                block.y = Math.floor(block.newY);
                blocks.splice(index,1);
            }
        })
    }


    swapAnimation(blocks) {
        blocks.forEach( (block, index) => {
            /* normalize coords */
            let signX = (block.dx) ? block.dx / Math.abs(block.dx) : 1;
            let signY = (block.dy) ? block.dy / Math.abs(block.dy) : 1;

            // motion
            if (block.x * signX < block.newX * signX || block.y * signY < block.newY * signY) {
                block.x += block.dx * this.deltaTime / this.speed;
                block.y += block.dy * this.deltaTime / this.speed;
            }else{
              [block.x, block.y] = [block.newX, block.newY];

                if (block.returned) {
                    block.returned = false;
                    [block.dx, block.dy] = [-block.dx, -block.dy];
                    [block.newX, block.newY] = [block.x + 24 * block.dx, block.y +  24 * block.dy];
                }else{
                    blocks.splice(index,1);
                }
            }
        })
    }


    copyMatrix (matrix) {
        const result = [];
        for (let i = 0; i < matrix.length; i++) {
            result[i] = [];
            for (let j = 0; j < matrix[i].length; j ++) {
                result[i][j] = matrix[i][j];
            }
        }
        return result;
    }


    onSwapFinished () {
        const mathes = this.checkMatches(this.matrix);
        if (mathes.length === 0) {
            this.isBlocked = false;
        }else{
            this.collapse(mathes);
        }
    }


    onDropFinished () {
        if (this.checkWin()) {
             return;
        }

        const mathes = this.checkMatches(this.matrix);

        if (mathes.length === 0) {
            this.isBlocked = false;
        }else{
            this.collapse(mathes);
        }
    }

    
    bgAnimation() {
        if (this.bg.isHide && this.bg.alpha > 0) {
            this.bg.setAlpha(this.bg.alpha + this.bg.dalpha * this.deltaTime);
            this.popupUI.elements.forEach(el => { el.setAlpha(this.bg.alpha) })
            this.board.blocks.forEach(el => { el.setAlpha(this.bg.alpha) })
            this.bars.forEach(el => { el.setAlpha(this.bg.alpha) })
            this.barsProgress.forEach(el => { el.setAlpha(this.bg.alpha) })
            this.barsPreview.forEach(el => { el.setAlpha(this.bg.alpha) })
            this.UI.forEach(el => { el.setAlpha(this.bg.alpha) })
        }
    }


    normalize () {

        for ( let curRow = 0; curRow < this.MaxRow; curRow ++) {
            for ( let curCol = 0; curCol < this.MaxCol; curCol ++) {
                if (this.matrix[curRow][curCol] && this.matrix[curRow][curCol].block) {
                    this.matrix[curRow][curCol].block.col = curCol;
                    this.matrix[curRow][curCol].block.row = curRow;
                    this.matrix[curRow][curCol].block.x = this.ofsetX + this.step * curCol;
                    this.matrix[curRow][curCol].block.y = this.ofsetY + this.step * curRow;
                    this.matrix[curRow][curCol].block.play(this.animsBlock[this.matrix[curRow][curCol].key]);
                }
            }    
        }
    }


    test () {
        this.isBlocked = false;
        this.barsProgress[this.winColor].value = 100;
        let res = [], res2 = [];
        let res3 = [], res4 = [];
        for (let curRow = 0; curRow < this.MaxRow; curRow ++) {
            res[curRow] = [];res2[curRow] = [];
            res3[curRow] = [];res4[curRow] = [];
            for (let curCol = 0; curCol < this.MaxCol; curCol ++) {
                res[curRow][curCol] = this.matrix[curRow][curCol].key;
                res2[curRow][curCol] = this.matrix[curRow][curCol].block;
                res3[curRow][curCol] = this.matrix[curRow][curCol].block.row;
                res4[curRow][curCol] = this.matrix[curRow][curCol].block.col;    
            }
        }
        console.log(res);
        console.log(res2);
        console.log(res3);
        console.log(res4);
    }
}
