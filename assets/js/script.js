const socket = io.connect(window.location.origin, {query: `url=${window.location.href}`})
document.getElementById("cdg").showModal();
const button = document.getElementById('gobtn')
console.log(button)

socket.emit('move', {board: "hello world"})

socket.on('player connect', () => {
    console.log('player connected')
})

socket.on('player disconnect', () => { // handle for when the other player disconnects
    console.log('player disconnected')
})

socket.on('move', (board) => {
    console.log(board)
})

// in case of a merge conflict, import this script in game.html:
// <script src="https://cdn.socket.io/3.1.3/socket.io.min.js" integrity="sha384-cPwlPLvBTa3sKAgddT6krw0cJat7egBga3DJepJyrLl4Q9/5WLra3rrnMcyTyOnh" crossorigin="anonymous"></script>