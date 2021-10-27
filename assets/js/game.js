const cdg = document.getElementById("cdg");
const input = document.getElementById("entry");
const board = document.getElementById("board");

cdg.showModal();

const socket = io.connect(window.location.origin, {query: `url=${window.location.href}`})

socket.on('player connect', () => {
    console.log('player connected')
})

socket.on('player disconnect', () => { // handle for when the other player disconnects
    console.log('player disconnected')
    if (!cdg.open) {
        cdg.showModal();
    }
    game = new Game(true);
})

socket.on('move', (board) => {
    console.log(board)
})

socket.on("host", () => {
    game = new Game(true);
})

socket.on("nothost", () => {
    socket.emit("start");
    if (cdg.open) {
        cdg.close();
    }
})

socket.on("start", () => {
    if (cdg.open) {
        cdg.close();
    }
})


document.getElementById("roomcode").textContent = window.location.pathname.slice(1);

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
    move (mvs) {
        const letters = "abcdefgh";
        let x1 = Number(mvs[1]);
        let y1 = letters.indexOf(mvs[0].toLowerCase());
        let x2 = Number(mvs[3]);
        let y2 = letters.indexOf(mvs[2].toLowerCase());
    }
}

let game = new Game();