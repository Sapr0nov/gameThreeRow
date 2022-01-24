'use strict'

document.addEventListener("DOMContentLoaded", function(e) {
    init();
});


function init() {
    const config = {
        type: Phaser.AUTO,
        parent: 'gameBox',
        width: 800,
        height: 600,
        scene: [ gameScene ]
    };

    const game = new Phaser.Game(config);
}

class gameScene extends Phaser.Scene
{
    constructor () {

        super();
    }

    preload (){

        this.load.atlas('gems', './img/gems.png', './img/gems.json');
        this.matrix = [ [{},{},{},{},{},{},{}],[{},{},{},{},{},{},{}],[{},{},{},{},{},{},{}],[{},{},{},{},{},{},{}],[{},{},{},{},{},{},{}],[{},{},{},{},{},{},{}]];
        this.ofsetX = 180;
        this.ofsetY = 100;
        this.step = 70;
    }

    create () {
        this.firstSelBlock;
        this.isDropping = false;
        this.isSwapping = false;
        this.gameScore = 0;
        //  Each time a new animation is added to the Animation Manager we'll call this function
        //this.anims.on(Phaser.Animations.Events.ADD_ANIMATION, this.addAnimation, this);
        this.diamond = this.anims.create({ key: 'diamond', frames: this.anims.generateFrameNames('gems', { prefix: 'diamond_', end: 15, zeroPad: 4 }), repeat: -1 });
        this.prism = this.anims.create({ key: 'prism', frames: this.anims.generateFrameNames('gems', { prefix: 'prism_', end: 6, zeroPad: 4 }), repeat: -1 });
        this.ruby = this.anims.create({ key: 'ruby', frames: this.anims.generateFrameNames('gems', { prefix: 'ruby_', end: 6, zeroPad: 4 }), repeat: -1 });
        this.square = this.anims.create({ key: 'square', frames: this.anims.generateFrameNames('gems', { prefix: 'square_', end: 14, zeroPad: 4 }), repeat: -1 });
        this.animsBlock = [this.diamond, this.prism, this.ruby, this.square];
        //  Click to add an animation
        
        for (let curRow = 0; curRow < 5; curRow ++) {
            for (let curCol = 0; curCol < 7; curCol ++) {
                let key = Math.floor(Math.random()*4);
                this.matrix[curRow][curCol].key = key;
                this.x = this.ofsetX + this.step * curCol;
                this.y = this.ofsetY + this.step * curRow;
 
                let block = this.add.sprite(this.x, this.y, 'gems');
                block.play(this.animsBlock[key]);
                block.col = curCol;
                block.row = curRow;
                block.setInteractive();
                block.on('pointerdown', () => {
                    this.clicked(block);
                })
                this.matrix[curRow][curCol].block = block;

            }
        }

    }

    /* return Array of lines > 3 */
    checkMatches() { // lookForMatches
        // 1st test on line
        const lines = []; // Array of line
        let line = [];
        let curKey;
        // vertical
        for (let curCol = 0; curCol < 7; curCol ++) {
            curKey = this.matrix[0][curCol].key;
            line = [];
            line.push(this.matrix[0][curCol]); 

            for (let curRow = 1; curRow < 5; curRow ++) {
                if (this.matrix[curRow][curCol].key === curKey) {
                    line.push(this.matrix[curRow][curCol]);
                }else{
                    if (line.length >= 3) {
                        lines.push(line);
                    }else{
                        line = [];
                    }
                    curKey = this.matrix[curRow][curCol].key;
                    line.push(this.matrix[curRow][curCol]);
                }
            }       
        }
        
        for (let curRow = 0; curRow < 5; curRow ++) {
            curKey = this.matrix[curRow][0].key;
            line = [];
            line.push(this.matrix[curRow][0]); 

            for (let curCol = 1; curCol < 7; curCol ++) {
                if (this.matrix[curRow][curCol].key === curKey) {
                    line.push(this.matrix[curRow][curCol]);
                }else{
                    if (line.length >= 3) {
                        lines.push(line);
                    }else{
                        line = [];
                    }
                    curKey = this.matrix[curRow][curCol].key;
                    line.push(this.matrix[curRow][curCol]);
                }
            }       
        }

        if (lines.length > 0) {
            this.collapse(lines);
            return true;
        }

        return false;
    }

    checkPossibleMove () {

    }
    
    collapse(blocks) {
        console.log(blocks);
        blocks.forEach(line => {
            line.forEach( element => {
                this.matrix[element.block.row][element.block.col].key = null;
                this.matrix[element.block.row][element.block.col].block.destroy();
            })
        })
    }

    clicked (element) {
        element.stop();
        if (this.firstSelBlock == null) {     
            this.firstSelBlock = element;
            return;
         // повторный клик на первой фишке    
         } else if (this.firstSelBlock == element) {   
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

    makeSwap(element1, element2, force = 0) {
        //try
        let tmp = this.matrix[element2.row][element2.col].key; 
        this.matrix[element2.row][element2.col].key = this.matrix[element1.row][element1.col].key; 
        this.matrix[element1.row][element1.col].key = tmp; 
        element1.play(this.animsBlock[this.matrix[element1.row][element1.col].key]);
        element2.play(this.animsBlock[this.matrix[element2.row][element2.col].key]);
        this.firstSelBlock = null; 

        if(force || this.checkMatches()) {
            return;
        }else{
            this.makeSwap(element1, element2, 1)
        };
    }
    animateDrop() {
        
    }
}