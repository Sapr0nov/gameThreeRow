export default class gameScene extends Phaser.Scene
{
    constructor () {
        super({key: 'gameScene'});
    }


    preload () {
        let width = this.game.canvas.width;
        let height = this.game.canvas.height;

        this.load.atlas('gems', './img/gems.png', './img/gems.json');
        this.load.atlas('energy', './img/energy.png', './img/energy.json');
        this.load.image('board','./img/board.png');
        this.load.image('background', './img/background.jpg');


        this.MaxRow = 5;
        this.MaxCol = 7;
        this.baseSize = 64;
        this.speed = 0.2;

        this.step = width / this.MaxCol;
        this.scale = width / this.game.config.widthOrigin;
        
        this.ofsetY  = height - 50 - width / this.MaxCol * this.MaxRow; 
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
        });
        this.scene.setVisible(false);

    }


    create () {
        this.firstSelBlock;
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

        this.energy = this.anims.create({ key: 'energy', delay :0, hideOnComplete: true, frames: this.anims.generateFrameNames('energy', { prefix: 'energy_', end: 15, zeroPad: 4 }), repeat: 0 });
        this.diamond = this.anims.create({ key: 'diamond', frames: this.anims.generateFrameNames('gems', { prefix: 'diamond_', end: 15, zeroPad: 4 }), repeat: -1 });
        this.prism = this.anims.create({ key: 'prism', frames: this.anims.generateFrameNames('gems', { prefix: 'prism_', end: 6, zeroPad: 4 }), repeat: -1 });
        this.ruby = this.anims.create({ key: 'ruby', frames: this.anims.generateFrameNames('gems', { prefix: 'ruby_', end: 6, zeroPad: 4 }), repeat: -1 });
        this.square = this.anims.create({ key: 'square', frames: this.anims.generateFrameNames('gems', { prefix: 'square_', end: 14, zeroPad: 4 }), repeat: -1 });
        this.animsBlock = [this.diamond, this.prism, this.ruby, this.square]; 

        this.bg = this.add.image( Math.floor(this.game.scale.baseSize.width / 2), Math.floor(this.game.scale.baseSize.height / 2) ,'background').setScale(this.scale);
        this.board = this.add.image(0, Math.floor(this.ofsetY - 40), 'board').setScale(this.scale * 0.96);
        this.board.setOrigin(0);
        this.board.setAlpha(0.5);
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

    /* return Array of lines > 3 */
    checkMatches (matrix) { 
        const lines = [];
        let line, curKey;
        // vertical
        for (let curCol = 0; curCol < this.MaxCol; curCol ++) {
            curKey = matrix[0][curCol].key;
            line = [];
            line.push(matrix[0][curCol]); 

            for (let curRow = 1; curRow < this.MaxRow; curRow ++) {
                if (matrix[curRow][curCol].key === curKey) {
                    line.push(matrix[curRow][curCol]);
                }else{
                    if (line.length >= 3) { 
                        lines.push(line);
                    }
                    line = [];
                    curKey = matrix[curRow][curCol].key;
                    line.push(matrix[curRow][curCol]);
                }
                if (curRow === this.MaxRow-1) {
                    if (line.length >= 3) { 
                        lines.push(line);
                    }
                    line = [];
                }
            }       
        }

        // horizontal
        for (let curRow = 0; curRow < this.MaxRow; curRow ++) {
            curKey = matrix[curRow][0].key;
            line = [];
            line.push(matrix[curRow][0]); 

            for (let curCol = 1; curCol < this.MaxCol; curCol ++) {

                if (matrix[curRow][curCol].key === curKey) {
                    line.push(matrix[curRow][curCol]);
                }else{
                    if (line.length >= 3) { 
                        lines.push(line);
                    }
                    line = [];
                    curKey = matrix[curRow][curCol].key;
                    line.push(matrix[curRow][curCol]);
                }

                if (curCol === this.MaxCol-1) {
                    if (line.length >= 3) { 
                        lines.push(line);
                    }
                    line = [];
                }
            }       
        }        
        return lines;
    }


    checkPossibleMove () {

    }
    

    collapse(blocks) {
        blocks.forEach(line => {
            line.forEach( element => {
                this.matrix[element.block.row][element.block.col].key = null;

                let block = this.add.sprite(element.block.x, element.block.y, 'energy');
                block.play(this.energy);
                block.ttl = 300; 
                this.enrgiesBlocks.push(block);
                this.matrix[element.block.row][element.block.col].key = null;
                this.matrix[element.block.row][element.block.col].block.destroy();
            })
        })
    }


    clicked (element) {
        if (this.firstSelBlock == element) {   
            element.play(this.animsBlock[this.matrix[element.row][element.col].key]);
            this.firstSelBlock = null; 
            return;
        }
        // проверка что соседи
        if ( Math.abs(this.firstSelBlock.row - element.row) + Math.abs(this.firstSelBlock.col - element.col) === 1 ) {
            this.makeSwap(this.firstSelBlock, element);
        }else{
            this.firstSelBlock.play(this.animsBlock[this.matrix[this.firstSelBlock.row][this.firstSelBlock.col].key]);
            this.firstSelBlock = element;
        }
    }


    makeSwap(el1, el2) {

        this.firstSelBlock = null; 
        el1.play(this.animsBlock[this.matrix[el1.row][el1.col].key]);
        el2.play(this.animsBlock[this.matrix[el2.row][el2.col].key]);
        
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
        let key = Math.floor(Math.random()*4);
        this.x = this.ofsetX + this.step * posCol;
        this.y = this.ofsetY + this.step * posRow;
        let block = this.add.sprite(this.x, this.y, 'gems');
        block.play(this.animsBlock[key]);
        block.col = curCol;
        block.row = curRow;
        block.newX = block.x;
        block.newY = this.ofsetY + this.step * curRow;
        block.dx = posCol - curCol;
        block.dy = posRow - curRow;
        block.setInteractive();
        
        block.on('pointerdown', (e) => {
            if (this.isBlocked) return;

            block.stop();
            if (this.firstSelBlock == null) {     
                this.firstSelBlock = block;
                return;
             } 
        })
        
        block.on('pointerup', (e) => {
            if (this.isBlocked) return;
            
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
            block.setScale(this.scale + 0.2);
        })
        
        block.on('pointerout', () => {
            block.setScale(this.scale);
        })
        
        block.setDisplaySize(this.baseSize * this.scale, this.baseSize * this.scale);
        return [block, key];
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


    energyAnimation(blocks) {
        blocks.forEach( (block, index) => {
            block.ttl = block.ttl - this.deltaTime * this.speed * 5;
            if (block.ttl < 0) {
                block.destroy();
                blocks.splice(index,1);
            }
        })
    }


    copyMatrix(matrix) {
        const result = [];
        for (let i = 0; i < matrix.length; i++) {
            result[i] = [];
            for (let j = 0; j < matrix[i].length; j ++) {
                result[i][j] = matrix[i][j];
            }
        }
        return result;
    }


    onSwapFinished() {
        this.collapse(this.checkMatches(this.matrix));
    }


    onDropFinished() {
        this.normalize();

        if (this.checkMatches(this.matrix)) {
            this.collapse(this.checkMatches(this.matrix));
        }
    }


    onEnergyFinished() {
        this.spawn();
    }


    normalize() {
        for ( let curRow = 0; curRow < this.MaxRow; curRow ++) {
            for ( let curCol = 0; curCol < this.MaxCol; curCol ++) {
                this.matrix[curRow][curCol].block.col = curCol;
                this.matrix[curRow][curCol].block.row = curRow;
                this.matrix[curRow][curCol].block.x = this.ofsetX + this.step * curCol;
                this.matrix[curRow][curCol].block.y = this.ofsetY + this.step * curRow;;
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