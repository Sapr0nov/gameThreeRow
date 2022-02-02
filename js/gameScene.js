export default class GameScene extends Phaser.Scene
{
    constructor () {
        super({key: 'gameScene'});
    }


    preload () {
        let width = this.game.canvas.width;
        let height = this.game.canvas.height;

        this.load.atlas('blocks', './img/blocks.png', './img/blocks.json');
        this.load.atlas('energy', './img/energy.png', './img/energy.json');

        this.load.image('board','./img/board.png');
        this.load.image('background', './img/background.jpg');
        this.load.image('bar','./img/bar_empty.png');
        this.load.image('bar-progress','./img/bar_progress.png');
        this.load.image('prize','./img/win.png');
        this.load.image('noprize','./img/fail.png');
        this.load.svg('desk-life', './img/desk_life.svg');
        this.load.svg('desk-score', './img/desk_score.svg');
        
        this.MaxRow = 5;
        this.MaxCol = 7;
        this.baseSize = 64;
        this.speed = 0.2;
        this.victoryScore = 1200;
        this.MaxLife = 20;

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
            this.scene.setVisible(true);
            this.normalize();
            this.gameScore = 0;
            this.bars.forEach((bars, i) => this.resetProgress(i) );
        });
        this.scene.setVisible(false);

    }


    create () {

        this.dropBlocks = [];
        this.enrgiesBlocks = [];
        this.swapBlocks = [];
        this.curAnim = '';
        this.gameScore = 0;
        
        this.input.keyboard.on('keydown', (e) => {
            if (e.key === 't') {
                this.test();
            }
            if (e.key === 'n') {
                this.normalize();
            }
        });

        this.keys = ['block_air','block_arthropoda','block_demon','block_earth','block_fire','block_flash','block_forest','block_ice','block_lindworm','block_water','bomb','tnt'];

        this.energy = this.anims.create({ key: 'energy', delay :0, hideOnComplete: true, frames: this.anims.generateFrameNames('energy', { prefix: 'energy_', end: 15, zeroPad: 4 }), repeat: 0 });
        this.animsBlock = [];
        this.keys.forEach( name => {
            this[name] = this.anims.create({ key: name, frames: this.anims.generateFrameNames('blocks', { prefix: name + '_', end: 0, zeroPad: 4 }), repeat: -1 });
        })
        // Handle form color for stage
        this.animsBlock = [this.block_air, this.block_fire, this.block_water, this.block_forest, this.block_demon, this.tnt, this.bomb];

        this.bg = this.add.image( Math.floor(this.game.scale.baseSize.width / 2), Math.floor(this.game.scale.baseSize.height / 2) ,'background').setScale(this.scale);
        this.deskLife = this.add.image(140 * this.scale, 70 * this.scale, 'desk-life').setScale(this.scale);
        this.deskScore = this.add.image(this.game.scale.baseSize.width - 140 * this.scale, 70 * this.scale, 'desk-score').setScale(-this.scale, this.scale);
        this.lifes = this.add.text(210 * this.scale, 64 * this.scale, '0000', { fontFamily: 'Tahoma, Times, serif', fontSize : '32px' }).setScale(this.scale);
        this.score = this.add.text(this.game.scale.baseSize.width - 230 * this.scale, 64 * this.scale, '0000', { fontFamily: 'Tahoma, Times, serif', fontSize : '32px'}).setScale(this.scale);

        this.lifes.num = this.MaxLife;

        this.lifes.setText(this.lifes.num);
        this.board = this.add.image(0, Math.floor(this.ofsetY - 0.75 * this.baseSize * this.scale), 'board').setScale(this.scale * 0.96);
        this.board.setOrigin(0);
        this.board.setAlpha(0.5);
        this.prize = this.add.image( Math.floor(this.game.scale.baseSize.width / 2), Math.floor(this.game.scale.baseSize.height / 3) ,'prize').setScale(this.scale);
        this.prize.setVisible(false);
        this.noprize = this.add.image( Math.floor(this.game.scale.baseSize.width / 2), Math.floor(this.game.scale.baseSize.height / 3) ,'noprize').setScale(this.scale);
        this.noprize.setVisible(false);

        this.bars = Array(5);
        this.barsProgress = Array(5);

        for (let i = 0; i < 5; i ++) {
            this.bars[i] = this.add.image(10 * this.scale, Math.floor(this.game.scale.baseSize.height / 10 + 50 + 40 * i * this.scale) ,'bar').setScale(this.scale);
            this.barsProgress[i] = this.add.image( 10 * this.scale, Math.floor(this.game.scale.baseSize.height / 10 + 50 + 40 * i * this.scale) ,'bar-progress').setScale(this.scale);
            this.barsPreview = this.add.sprite( 10 * this.scale, Math.floor(this.game.scale.baseSize.height / 10 + 44 + 40 * i * this.scale)).play(this.animsBlock[i]).setScale(this.scale / 3.5);
            this.barsProgress[i].setOrigin(0);
            this.barsPreview.setOrigin(0);
            this.bars[i].setOrigin(0);
        }
   
        for (let curRow = 0; curRow < this.MaxRow; curRow ++) {
            for (let curCol = 0; curCol < this.MaxCol; curCol ++) {
                this.matrix[curRow][curCol] = {};
                [this.matrix[curRow][curCol].block, this.matrix[curRow][curCol].key] = this.newBlock(curRow, curCol);
            }
        }
        
        let lines = this.checkMatches(this.matrix);
        while (lines.length > 0) {
            this.collapse(lines);
            this.spawn();
            lines = this.checkMatches(this.matrix);
        }
        this.normalize();
    }


    update() {
        
        this.deltaTime = new Date().getTime() - this.prevtime;
        this.prevtime += this.deltaTime;

        if (this.curAnim === 'swap' && this.swapBlocks.length === 0) {
            this.onSwapFinished();
            this.curAnim = '';
        }
        if (this.curAnim === 'drop' && this.dropBlocks.length === 0) {
            this.onDropFinished();
            this.curAnim = '';
        }
        if (this.curAnim === 'energy' && this.enrgiesBlocks.length === 0) {
            this.onEnergyFinished();
            this.curAnim = '';
        }

        if (this.curAnim === '') {
            this.isBlocked = false;        
        }

        if ((this.curAnim === '' || this.curAnim === 'swap') && this.swapBlocks.length > 0) {
            this.curAnim = 'swap';
            this.isBlocked = true;
            this.swapAnimation(this.swapBlocks);
        }
        if ((this.curAnim === '' || this.curAnim === 'drop') && this.dropBlocks.length > 0) {
            this.curAnim = 'drop';
            this.isBlocked = true;
            this.dropAnimation(this.dropBlocks);                
        }

        if ((this.curAnim === '' || this.curAnim === 'energy') && this.enrgiesBlocks.length > 0) {
            this.curAnim = 'energy';
            this.isBlocked = true;
            this.energyAnimation(this.enrgiesBlocks);
        }

    }

    /**
     * return Array of  .
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
                };
            })
        }
        console.log(linesH.length, linesV, lines)
        lines.push(...linesH);
        return lines;
    }


    checkPossibleMove () {

    }
    
    
    compareLine (arr1, arr2) {
        let result = -1;
        arr1.forEach((el1, index) => {
            if (result) {
                return;
            }
            arr2.forEach(el2 => 
                {
                    if (el1.block.col === el2.block.col && el1.block.row === el2.block.row ) {
                        result = index;
                        return;
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
                let block = this.add.sprite(element.block.x, element.block.y, 'energy');
                block.play(this.energy);
                block.ttl = 300; 
                this.enrgiesBlocks.push(block);
                let key = this.matrix[element.block.row][element.block.col].key;
                if (key != null) {
                    this.addProgress(key, 5);
                }

                if (line.rand && i === line.rand) {
                    this.matrix[element.block.row][element.block.col].key = (line.length === 4) ? 6 : 5;
                    this.matrix[element.block.row][element.block.col].block.play(this.animsBlock[(line.length === 4) ? 6 : 5])
                }else{
                    // get number of type block
                    this.matrix[element.block.row][element.block.col].key = null;                
                    this.matrix[element.block.row][element.block.col].block.destroy();
                }
            })
        })
    }


    clicked (element) {
        
        if (this.matrix[element.row][element.col].key === 6)  {
            //bomb
            const lines = [];
            [-1, 0, 1].forEach( dx => {
                [-1, 0 , 1].forEach ( dy => {
                    if ((element.row + dx >= 0 && element.row + dx < this.MaxRow) && (element.col + dy >= 0 && element.col + dy < this.MaxCol)) {
                        if (this.matrix[element.row + dx][element.col + dy].key === 5 || this.matrix[element.row + dx][element.col + dy] === 6) //TODO
                        {
                            //check again and big boom
                        }
                        lines.push([this.matrix[element.row + dx][element.col + dy]]);
                    }
                })
                
            })
            this.collapse(lines);
            return;
        }


        if (this.matrix[element.row][element.col].key === 5) {
            //tnt
            const lines = [];
            for (let i = 0; i < this.MaxCol; i ++) {
                if (this.matrix[element.row][i].key === 5 || this.matrix[element.row][i] === 6) //TODO
                {
                    //check again and big boom
                }
                lines.push([this.matrix[element.row][i]]);
            }               
            this.collapse(lines);
            return;
        }

        if (this.firstSelBlock === element) {   
            element.play(this.animsBlock[this.matrix[element.row][element.col].key]);
            this.firstSelBlock = null; 
            return;
        }
        // checked neighborhood
        if ( Math.abs(this.firstSelBlock.row - element.row) + Math.abs(this.firstSelBlock.col - element.col) === 1 ) {
            this.makeSwap(this.firstSelBlock, element);
        }else{
            if (this.firstSelBlock) {
                this.firstSelBlock.play(this.animsBlock[this.matrix[this.firstSelBlock.row][this.firstSelBlock.col].key]);
                this.firstSelBlock = element;    
            }
        }
    }


    makeSwap(el1, el2) {

        let key1 = this.animsBlock[this.matrix[el1.row][el1.col].key];
        let key2 = this.animsBlock[this.matrix[el2.row][el2.col].key];
        this.firstSelBlock = null; 
        if (key1 < 5) { el1.play(key1) }
        if (key2 < 5) { el2.play(key2) }
        
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
        let key = Math.floor(Math.random()*5);
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

            block.stop();
            if (this.firstSelBlock == null) {     
                this.firstSelBlock = block;
             } 
        })
        
        block.on('pointerup', (e) => {
            if (this.isBlocked) return;
            
            // checked click on bomb
            if (this.matrix[block.row][block.col].key > 4 ) {
                this.clicked(block);
            }

            // checked direction of swipe
            if (!this.firstSelBlock) {
                return;
            }
            if (Math.abs((e.upX - e.downX)) < this.step && Math.abs(2*(e.upY - e.downY)) > this.step ) {

                let nextRow = (e.upX < e.downX) ? this.firstSelBlock.row - 1 : this.firstSelBlock.row + 1;
                if (nextRow > this.MaxRow) { return; }
                this.clicked(this.matrix[nextRow][this.firstSelBlock.col].block);
                return;
            }

            if (Math.abs((e.upX - e.downX)) > this.step && Math.abs(2*(e.upY - e.downY)) < this.step ) {

                let nextCol = (e.upY < e.downY) ? this.firstSelBlock.col - 1 : this.firstSelBlock.col + 1;
                if (nextCol > this.MaxRow) { return; }
                this.clicked(this.matrix[this.firstSelBlock.row][nextCol].block);
                return;
            }

            if (this.firstSelBlock != block) {
                this.clicked(block);
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
        if (number > 4 ) {  return; }
        
        let newValue = this.barsProgress[number].value + progress;
        this.barsProgress[number].value = newValue;
        this.barsProgress[number].setScale( newValue / 100 * this.scale, this.scale );
        this.barsProgress[number].x = 20 * this.scale;

        if (newValue > 100) {
            console.log('onFull(number)', number);
            this.gameScore += 100;
            this.barsProgress[number].value = 0;
            this.resetProgress(number);
        }
        
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
        let showCup;

        if (this.gameScore < this.victoryScore && this.lifes.num > 0) {
            return false;
        }

        if (this.gameScore >= this.victoryScore) {
            showCup = this.prize;
        }

        if (this.lifes.num <= 0) {
            showCup = this.noprize;
        }

        this.matrix.forEach(rows => rows.forEach(el => el.block.setVisible(false)));
        this.bg.setAlpha(0.3);
        this.board.setVisible(false);
        this.barsProgress.forEach( bar => { (bar.setVisible(false) ) })
        this.bars.forEach( bar => { (bar.setVisible(false) ) })

        showCup.setVisible(true);
        showCup.setInteractive( { cursor: 'url(img/pointer.png), pointer' });
        showCup.on('pointerdown', () => {
            this.switchScene();
        })
        
        return true;
    }


    switchScene () {
        this.prize.disableInteractive();
        this.prize.setRotation(0.1);
        this.bg.isHide = true;

        this.scene.transition({
            target: 'preLoader',
            duration: 1300,
            init: true,
        })
    }


    dropAnimation(blocks) {
        blocks.forEach( (block, index) => {
            if (block.newY > block.y) {
                block.y += block.dy * this.deltaTime * this.speed;
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
                block.x += block.dx * this.deltaTime * this.speed;
                block.y += block.dy * this.deltaTime * this.speed;
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


    energyAnimation (blocks) {
        blocks.forEach( (block, index) => {
            block.ttl = block.ttl - this.deltaTime * this.speed * 5;
            if (block.ttl < 0) {
                block.destroy();
                blocks.splice(index,1);
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
        this.collapse(this.checkMatches(this.matrix));
    }


    onDropFinished () {
        this.normalize();
        if (this.checkWin()) {
             return;
        };
        if (this.checkMatches(this.matrix)) {
            this.collapse(this.checkMatches(this.matrix));
        }
    }


    onEnergyFinished () {
        this.spawn();
    }


    normalize () {
        this.test();
        for ( let curRow = 0; curRow < this.MaxRow; curRow ++) {
            for ( let curCol = 0; curCol < this.MaxCol; curCol ++) {
                this.matrix[curRow][curCol].block.col = curCol;
                this.matrix[curRow][curCol].block.row = curRow;
                this.matrix[curRow][curCol].block.x = this.ofsetX + this.step * curCol;
                this.matrix[curRow][curCol].block.y = this.ofsetY + this.step * curRow;
                this.matrix[curRow][curCol].block.play(this.animsBlock[this.matrix[curRow][curCol].key]);
            }
        } 

    }


    test () {
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