const cdg = document.getElementById("cdg");
const input = document.getElementById("entry");
const board = document.getElementById("board");

for (let y = 0; y < 8; y ++) {
    for (let x = 0; x < 8; x ++) {
        const img = document.createElement("img");
        img.style.cssText = "--x:"+x+";--y:"+y+";";
        board.appendChild(img);
    }
}

for (let y = 0; y < 8; y ++) {
    for (let x = 0; x < 8; x ++) {
        const col = ((x+y)%2===0?"rgb(235,235,235)":"rgb(55,55,55)");
        const d = document.createElement("div");
        d.style.cssText = "--x:"+x+";--y:"+y+";background:"+col+";z-index:-1;";
        board.appendChild(d);
    }
}

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
        this.imgs = ["E","WP","WR","WN","WB","WQ","WK","BP","BR","BN","BB","BQ","BK"];
        this.board = [];
        this.kcl = true;
        this.kcr = true;
        this.reset();
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
    loaddef () {
        this.board[0] = [8, 9, 10, 11, 12, 10, 9, 8];
        this.board[1] = [7, 7, 7, 7, 7, 7, 7, 7];
        this.board[6] = [1, 1, 1, 1, 1, 1, 1, 1];
        this.board[7] = [2, 3, 4, 5, 6, 4, 3, 2];
    }
    reset () {
        this.turn = this.ishost;
        this.kcl = true;
        this.kcr = true;
        this.boot();
        this.loaddef();
        this.display();
    }
    swap (x1, y1, x2, y2) {
        //
    }
    move (mvs) {
        const letters = "abcdefgh";
        let x1 = Number(mvs[1]);
        let y1 = letters.indexOf(mvs[0].toLowerCase());
        let x2 = Number(mvs[3]);
        let y2 = letters.indexOf(mvs[2].toLowerCase());
        if (y1 < 0 || y2 < 0 || x1.toString() === "NaN" || x2.toString === "NaN" || x1 > 7 || y1 > 7) {
            return;
        }
        const iw = this.board[y1][x1] < 7;
        if (this.board[y1][x1] === 0 || iw !== this.ishost) {
            return;
        }
    }
    display () {
        for (let y = 0; y < 8; y ++) {
            for (let x = 0; x < 8; x ++) {
                board.children[y*8+x].src = "../assets/pieces/"+this.imgs[this.board[y][x]]+".svg";
            }
        }
    }
}

let game = new Game();