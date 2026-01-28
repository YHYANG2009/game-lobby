let score = 0;
let row = 4;
let column = 4;
let board;

window.onload = function(){
    setgame();
}

function restartGame(){
    // reset score
    score = 0;
    document.getElementById('score').innerText = score;

    // clear board
    const boardDiv = document.getElementById('board');
    boardDiv.innerHTML = "";

    // hide gameOver
    const gameOver = document.getElementById('gameOver');
    if(gameOver){
        gameOver.style.display = 'none';
    }

    // 重設
    setgame();
}

function setgame(){
    board = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];

    for(let r = 0; r < row; r++){
        for(let c = 0; c < column; c++){
            let tile = document.createElement('div');
            tile.id = r.toString() + '-' + c.toString();
            let num = board[r][c];
            updateTile(tile, num);
            document.getElementById("board").append(tile);
        }
    }

    document.getElementById("finalScore").innerText = "";

    set_new_tile();
    set_new_tile();
}

function updateTile(tile, num){
    //清空格子
    tile.innerText = "";
    tile.className = "";

    //定義為格子
    tile.classList.add("tile");

    //若不等於0就會有數字，否則為空格子
    if(num > 0){
        if(num > 8192){
            tile.innerText = num;
            tile.classList.add("x8192");
        } else{
            tile.innerText = num;
            tile.classList.add("x" + num);
        }
    }

}

document.addEventListener('keyup', function(event){
    if(event.code === "KeyW" || event.code === "ArrowUp"){
        mergeUp();
    } else if(event.code === "KeyS" || event.code === "ArrowDown"){
        mergeDown();
    } else if(event.code === "KeyA" || event.code === "ArrowLeft"){
        mergeLeft();
    } else if(event.code === "KeyD" || event.code === "ArrowRight"){
        mergeRight();
    } else if(event.code === "KeyR"){
        restartGame();
    }

    document.getElementById("score").innerText = score;

    if(board_is_full() && !if_can_merge()){
        show_game_over();
    }

    // // //for debug
    // if(event.code === "KeyE"){
    //     show_game_over();
    //     console.log("game over");
    // }
})

function show_game_over(){
    let gameOver = document.getElementById("gameOver");
    document.getElementById("finalScore").innerText = score;
    if(gameOver){
        gameOver.style.display = "flex";
    }
}

function if_can_merge(){
    for(let i = 0; i < row; i++){
        for(let j = 1; j < column; j++){
            if(board[i][j] === board[i][j - 1]){
                return true;
            }
            
            if(board[j][i] === board[j - 1][i]){
                return true;
            }
        }
    }

    return false;
}

function clear0(curRow){
    return curRow.filter(num => num !== 0);
}

function slide(curRow){
    //清掉0
    curRow = clear0(curRow);
    
    //檢查是否可以相加
    for(let c = 0; c < curRow.length - 1; c++){
        if(curRow[c] === curRow[c + 1]){
            curRow[c] *= 2;
            curRow[c + 1] = 0;
            score += curRow[c];
        }
    }

    curRow = clear0(curRow);

    while(curRow.length < column){
        curRow.push(0);
    }

    return curRow;
}

function check_if_moved(ori_board, board){
    for(let r = 0; r < row; r++){
        for(let c = 0; c < column; c++){
            if(ori_board[r][c] !== board[r][c]){
                return true;
            }
        }
    }
    return false;
}

function copyBoard(b){
    //map() --> 遍歷陣列中的每一項
    //slice() --> 複製
    return b.map(r => r.slice());
}

// function copyBoard(b){
//     return r.slice();
// }
//這是錯的

//因為這樣只是複製子陣列的記憶體地址
//所以如果改了新陣列裡面的格子，舊陣列還是會被影響

function mergeLeft(){
    //let ori_board = board ---> 錯誤的
    //因為這樣是reference，所以更改board時ori_board也同時會被更改
    //因此無法達到原本預期偵測是否改變的功能
    let ori_board = copyBoard(board);

    for(let r = 0; r < row; r++){
        let curRow = board[r];
        curRow = slide(curRow);
        board[r] = curRow;

        for(let c = 0; c < column; c++){
            let tile = document.getElementById(r.toString() + '-' + c.toString());
            let num = board[r][c];
            updateTile(tile, num);
        }
    }

    if(check_if_moved(ori_board, board)){
        set_new_tile();
    }
}

function mergeRight(){
    let ori_board = copyBoard(board);

    for(let r = 0; r < row; r++){
        let curRow = board[r];
        curRow.reverse();
        curRow = slide(curRow);
        curRow.reverse();
        board[r] = curRow;

        for(let c = 0; c < column; c++){
            let tile = document.getElementById(r.toString() + '-' + c.toString());
            let num = board[r][c];
            updateTile(tile, num);
        }
    }

    if(check_if_moved(ori_board, board)){
        set_new_tile();
    }
}

function mergeUp(){
    let ori_board = copyBoard(board);

    for(let c = 0; c < column; c++){
        let curCol = [];
        for(let r = 0; r < row; r++){
            curCol.push(board[r][c]);
        }
        curCol = slide(curCol);

        for(let r = 0; r < row; r++){
            board[r][c] = curCol[r];
        }

    }

    for(let r = 0; r < row; r++){
        for(let c = 0; c < column; c++){
            let tile = document.getElementById(r.toString() + '-' + c.toString());
            let num = board[r][c];
            updateTile(tile, num);
        }
    }

    if(check_if_moved(ori_board, board)){
        set_new_tile();
    }
}

function mergeDown(){
    let ori_board = copyBoard(board);

    for(let c = 0; c < column; c++){
        let curCol = [];
        for(let r = 0; r < row; r++){
            curCol.push(board[r][c]);
        }

        curCol.reverse();

        curCol = slide(curCol);

        curCol.reverse();

        for(let r = 0; r < row; r++){
            board[r][c] = curCol[r];
        }

    }

    for(let r = 0; r < row; r++){
        for(let c = 0; c < column; c++){
            let tile = document.getElementById(r.toString() + '-' + c.toString());
            let num = board[r][c];
            updateTile(tile, num);
        }
    }

    if(check_if_moved(ori_board, board)){
        set_new_tile();
    }
}

function board_is_full(){
    for(let r = 0; r < row; r++){
        for(let c = 0; c < column; c++){
            if(board[r][c] === 0){
                return false;
            }
        }
    }
    return true;
}

function set_new_tile(){
    if(board_is_full()){
        return;
    }

    let found = false;

    while(!found){
        let r = Math.floor(Math.random() * row);
        let c = Math.floor(Math.random() * column);

        if(board[r][c] === 0){
            if(Math.random() < 0.1){
                found = true;
                board[r][c] = 4;
                let tile = document.getElementById(r.toString() + '-' + c.toString());
                updateTile(tile, 4);
            } else{
                found = true;
                board[r][c] = 2;
                let tile = document.getElementById(r.toString() + '-' + c.toString());
                updateTile(tile, 2);
            }
        }
    }
}