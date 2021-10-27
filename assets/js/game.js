const cdg = document.getElementById("cdg");
const input = document.getElementById("entry");
const board = document.getElementById("board");

class Game {
    constructor (ishost) {
        this.ishost = (ishost===undefined?false:true);
        this.turn = this.ishost;
        this.board = [];
        this.boot();
    }
    boot () {
        input.value = "";
        this.board = [];
        for (let y = 0; y < 8; y ++) {
            let l = [];
            for (let x = 0; x < 8; x ++) {
                l.push(0);
            }
            this.board.push(l);
        }
    }
    reset () {
        this.turn = this.ishost;
        this.boot();
    }
}