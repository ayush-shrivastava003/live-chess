// import { moveMessagePortToContext } from "worker_threads";

const cdg = document.getElementById("cdg");
const input = document.getElementById("entry");
const board = document.getElementById("board");

for (let y = 0; y < 8; y ++) {
    for (let x = 0; x < 8; x ++) {
        const img = document.createElement("img");
        img.style.cssText = "--x:"+x+";--y:"+y+";";
        img.addEventListener("mousedown", function(){game.click(x, y)});
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

function t(x,y){let c=board.children[y*8+x+64];c.className=c.className!==""?"":"sel"}
function d(){game.ishost=true;game.turn=true}
function p(x,y){game.px=x;game.py=y}

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
    game.unpack(board);
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

const session = window.sessionStorage;

socket.on("start", () => {
    if (cdg.open) {
        cdg.close();
    }
})

socket.on("update", () => {
    for (let i = 0; i < 2; i ++) {
        socket.emit("move", game.format());
    }
})

document.getElementById("roomcode").textContent = window.location.pathname.slice(1);

class Game {
    constructor (ishost) {
        this.ishost = (ishost===undefined?false:true);
        this.turn = this.ishost;
        this.imgs = ["EE","WP","WR","WN","WB","WQ","WK","BP","BR","BN","BB","BQ","BK"];
        this.board = [];
        this.kcl = true;
        this.kcr = true;
        this.sel = false;
        this.selc = [0, 0];
        this.px = 0;
        this.py = 0;
        this.store = [];
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
        this.sel = false;
        this.selc = [0, 0];
        this.px = 0;
        this.py = 0;
        this.boot();
        this.loaddef();
        this.display();
    }
    unpack (d) {
        const rows = d.split("|");
        for (let i = 0; i < rows.length; i ++) {
            const row = rows[i].split(",");
            for (let j = 0; j < row.length; j ++) {
                this.board[i][j] = Number(row[j]);
            }
        }
        this.display();
        this.turn = true;
    }
    format () {
        let f = [];
        for (let i = 0; i < this.board.length; i ++) {
            f.push(this.board[i].join(","));
        }
        return f.join("|");
    }
    swap (x1, y1, x2, y2) {
        const v1 = this.board[y2][x2];
        this.board[y2][x2] = this.board[y1][x1];
        this.board[y1][x1] = v1;
        if (this.board[y1][x1] !== 0) {
            this.board[y1][x1] = 0;
        }
        let by = this.ishost?7:0;
        if ((x1 === 0 && y1 === by) || (x2 === 0 && y2 === by)) {
            this.kcl = false;
        }
        if ((x1 === 7 && y1 === by) || (x2 === 7 && y2 === by)) {
            this.kcr = false;
        }
        if ((x1 === 5 && y1 === by) || (x2 === 5 && y2 === by)) {
            this.kcl = false;
            this.kcr = false;
        }
    }
    pawn () {
        let x = this.px;
        let y = this.py;
        let moves = [];
        if (this.ishost) {
            if (y > 0) {
                if (this.board[y-1][x] === 0) {
                    moves.push([x, y-1]);
                    if (y > 1 && this.board[y-2][x] === 0 && y === 6) {
                        moves.push([x, y-2]);
                    }
                }
                if (x > 0) {
                    if (this.board[y-1][x-1] > 6) {
                        moves.push([x-1, y-1]);
                    } else if (this.board[y-1][x+1] === 0 && this.board[y][x+1] === 7) {
                        moves.push([x+1, y-1]);
                    }
                }
                if (x < 7) {
                    if (this.board[y-1][x+1] > 6) {
                        moves.push([x+1, y-1]);
                    } else if (this.board[y-1][x-1] === 0 && this.board[y][x-1] === 7) {
                        moves.push([x-1, y-1]);
                    }
                }
            }
        } else if (y < 7) {
            if (this.board[y+1][x] === 0) {
                moves.push([x, y+1]);
                if (y < 6 && this.board[y+2][x] === 0 & y === 1) {
                    moves.push([x, y+2]);
                }
            }
            if (x > 0) {
                if (this.board[y+1][x-1] > 0 && this.board[y+1][x-1] < 7) {
                    moves.push([x-1, y+1]);
                } else if (this.board[y+1][x+1] === 0 && this.board[y][x+1] === 1) {
                    moves.push([x+1, y+1]);
                }
            }
            if (x < 7) {
                if (this.board[y+1][x+1] > 0 && this.board[y+1][x-1] < 7) {
                    moves.push([x+1, y+1]);
                } else if (this.board[y+1][x-1] === 0 && this.board[y][x-1] === 1) {
                    moves.push([x-1, y+1]);
                }
            }
        }
        for (let i = 0; i < moves.length; i ++) {
            moves[i] = moves[i].join(",");
        }
        return moves;
    }
    rook () {
        let x = this.px;
        let y = this.py;
        let moves = [];
        let sx = x;
        let sy = y;
        for (let i = 0; i < x; i ++) {
            sx -= 1;
            if (this.board[y][sx] !== 0) {
                if ((this.board[y][sx] < 7) !== this.ishost) {
                    moves.push([sx, y]);
                }
                break;
            }
            moves.push([sx, y]);
        }
        sx = x;
        for (let i = 0; i < 7-x; i ++) {
            sx += 1;
            if (this.board[y][sx] !== 0) {
                if ((this.board[y][sx] < 7) !== this.ishost) {
                    moves.push([sx, y]);
                }
                break;
            }
            moves.push([sx, y]);
        }
        for (let i = 0; i < y; i ++) {
            sy -= 1;
            if (this.board[sy][x] !== 0) {
                if ((this.board[sy][x] < 7) !== this.ishost) {
                    moves.push([x, sy]);
                }
                break;
            }
            moves.push([x, sy]);
        }
        sy = y;
        for (let i = 0; i < 7-y; i ++) {
            sy += 1;
            if (this.board[sy][x] !== 0) {
                if ((this.board[sy][x] < 7) !== this.ishost) {
                    moves.push([x, sy]);
                }
                break;
            }
            moves.push([x, sy]);
        }
        for (let i = 0; i < moves.length; i ++) {
            moves[i] = moves[i].join(",");
        }
        return moves;
    }
    knight () {
        let x = this.px;
        let y = this.py;
        let moves = [[x-1, y+2], [x+1, y+2], [x-1, y-2], [x+1, y-2], [x-2, y-1], [x-2, y+1], [x+2, y-1], [x+2, y+1]];
        for (let i = moves.length - 1; i >= 0; i --) {
            let tx = moves[i][0];
            let ty = moves[i][1];
            if (tx < 0 || tx > 7 || ty < 0 || ty > 7) {
                moves.splice(i, 1);
                continue;
            }
            if (this.board[ty][tx] !== 0) {
                if ((this.board[ty][tx] < 7) !== this.ishost) {
                    moves.splice(i, 1);
                    continue;
                }
            }
        }
        for (let i = 0; i < moves.length; i ++) {
            moves[i] = moves[i].join(",");
        }
        return moves;
    }
    bishop () {
        let x = this.px;
        let y = this.py;
        let moves = [];
        let sx = x;
        let sy = y;
        while (true) {
            sx -= 1;
            sy -= 1;
            if (sx < 0 || sy < 0) {
                break;
            }
            if (this.board[sy][sx] !== 0) {
                if ((this.board[sy][sx] < 7) !== this.ishost) {
                    moves.push([sx, sy]);
                }
                break;
            }
            moves.push([sx, sy]);
        }
        console.log(x, y);
        sx = x;
        sy = y;
        while (true) {
            sx += 1;
            sy -= 1;
            if (sx > 7 || sy < 0) {
                break;
            }
            if (this.board[sy][sx] !== 0) {
                if ((this.board[sy][sx] < 7) !== this.ishost) {
                    moves.push([sx, sy]);
                }
                break;
            }
            moves.push([sx, sy]);
        }
        sx = x;
        sy = y;
        while (true) {
            sx -= 1;
            sy += 1;
            if (sx < 0 || sy > 7) {
                break;
            }
            if (this.board[sy][sx] !== 0) {
                if ((this.board[sy][sx] < 7) !== this.ishost) {
                    moves.push([sx, sy]);
                }
                break;
            }
            moves.push([sx, sy]);
        }
        sx = x;
        sy = y;
        while (true) {
            sx += 1;
            sy += 1;
            if (sx > 7 || sy > 7) {
                break;
            }
            if (this.board[sy][sx] !== 0) {
                if ((this.board[sy][sx] < 7) !== this.ishost) {
                    moves.push([sx, sy]);
                }
                break;
            }
            moves.push([sx, sy]);
        }
        for (let i = 0; i < moves.length; i ++) {
            moves[i] = moves[i].join(",");
        }
        return moves;
    }
    queen () {
        let x = this.px;
        let y = this.py;
        let moves = this.rook();
        console.log(moves);
        moves.push(...this.bishop());
        console.log(moves);
        return moves;
    }
    king () {
        let x = this.px;
        let y = this.py;
        let moves = [[x-1, y-1], [x, y-1], [x+1, y-1], [x+1, y], [x+1, y+1], [x, y+1], [x-1, y+1], [x-1, y]];
        for (let i = moves.length - 1; i >= 0; i --) {
            let tx = moves[i][0];
            let ty = moves[i][1];
            if (tx < 0 || tx > 7 || ty < 0 || ty > 7) {
                moves.splice(i, 1);
                continue;
            }
            if (this.board[ty][tx] !== 0) {
                if ((this.board[ty][tx] < 7) === this.ishost) {
                    moves.splice(i, 1);
                    continue;
                }
            }
        }
        y = this.ishost?7:0;
        if (this.kcl) {
            if (this.board[y][1] === 0 && this.board[y][2] === 0 && this.board[y][3] === 0) {
                moves.push([1, y]);
            }
        }
        if (this.kcr) {
            if (this.board[y][5] === 0 && this.board[y][6] === 0) {
                moves.push([6, y]);
            }
        }
        for (let i = 0; i < moves.length; i ++) {
            moves[i] = moves[i].join(",");
        }
        return moves;
    }
    move (mvs) {
        if (!this.turn) {
            return;
        }
        const letters = "abcdefgh";
        let x1 = Number(mvs[1]);
        let y1 = letters.indexOf(mvs[0].toLowerCase());
        let x2 = Number(mvs[3]);
        let y2 = letters.indexOf(mvs[2].toLowerCase());
        if (y1 < 0 || y2 < 0 || x1.toString() === "NaN" || x2.toString === "NaN" || x1 > 7 || x2 > 7) {
            return;
        }
        const iw = this.board[y1][x1] < 7;
        if (this.board[y1][x1] === 0 || iw !== this.ishost) {
            return;
        }
        let v = this.board[y1][x1];
        if (v > 6) {
            v -= 6;
        }
        this.px = x1;
        this.py = y1;
        const moves = (v>3?(v>5?this.king():(v>4?this.queen():this.bishop())):(v<2?this.pawn():(v<3?this.rook():this.knight())));
        const ns = [x2,y2].join(",");
        if (moves.indexOf(ns) < 0) {
            return;
        }
        if (v === 1 || v === 7) {
            if (x2 !== x1) {
                if (this.board[y2][x2] === 0) {
                    this.board[y1][x2] = 0;
                }
            }
        }
        if (v === 6) {
            if (ns === "1,"+y1) {
                this.swap(0, y1, 2, y1);
            } else if (ns === "6,"+y1) {
                this.swap(7, y1, 5, y1);
            }
        } else if (v === 1 && y2 === (this.ishost?0:7)) {
            document.getElementById("promote").showModal();
            this.store = [x1, y1, x2, y2];
            return;
        }
        this.swap(x1, y1, x2, y2);
        this.display();
        socket.emit("move", this.format());
        this.turn = false;
    }
    pcall () {
        this.board[this.store[1]][this.store[0]] = Number(document.getElementById("proin").value)+(this.ishost?0:6);
        this.swap(...this.store);
        this.display();
        socket.emit("move", this.format());
        this.turn = false;
    }
    cmove (x, y) {
        if ((this.board[y][x] < 7 !== this.ishost) || this.board[y][x] === 0) {
            const letters = "abcdefgh";
            this.move(letters[this.selc[1]]+this.selc[0]+letters[y]+x);
        }
        board.children[this.selc[1]*8+this.selc[0]].className = "";
        this.sel = false;
        this.selc = [0, 0];
    }
    click (x, y) {
        if (!this.turn) {
            return;
        }
        if (!this.sel) {
            const col = board.children[y*8+x].src[board.children[y*8+x].src.indexOf(".svg")-2];
            if (col === "E" || col !== (this.ishost?"W":"B")) {
                return;
            }
            this.sel = true;
            this.selc = [x, y];
            board.children[this.selc[1]*8+this.selc[0]].className = "sel";
            return;
        }
        if (this.selc[0] === x && this.selc[1] === y) {
            board.children[this.selc[1]*8+this.selc[0]].className = "";
            this.sel = false;
            this.selc = [0, 0];
            return;
        }
        if (this.board[y][x] === 0) {
            this.cmove(x, y);
            return;
        }
        if ((this.board[y][x] < 7) === this.ishost) {
            board.children[this.selc[1]*8+this.selc[0]].className = "";
            this.sel = false;
            this.selc = [0, 0];
            return;
        }
        this.cmove(x, y);
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

function domove () {
    game.move(input.value);
    input.value = "";
}

input.addEventListener("keyup", (e) => {if(e.code.toString()==="Enter"){domove()}});
document.getElementById("proin").addEventListener("keyup", (e) => {if(e.code.toString()==="Enter"){document.getElementById("prob").click()}});

document.addEventListener("visibilitychange", (e) => {
    if (document.visibilityState === "visible") {
        input.focus();
    }
});

if (session.getItem("washost") === null) {
    session.setItem("washost", game.ishost);
    session.setItem("wasturn", game.ishost);
    session.setItem("ob", game.format());
} else {
    game.ishost = {"true":true,"false":false}[session.getItem("washost")];
    game.turn = {"true":true,"false":false}[session.getItem("wasturn")];
    game.unpack(session.getItem("ob"));
}

window.onbeforeunload = function () {
    session.setItem("washost", game.ishost);
    session.setItem("wasturn", game.turn);
    session.setItem("ob", game.format());
    socket.emit("exec", "console.log('unload')");
}