let board;
let row = 6;
let column = 5;
let pos_r = 0;
let pos_c = 0;

let wordlist = [];
let guesslist = [];
let ans = "";

let gameOver = false;

async function LoadWordlist(datasourse) {
    //try --> 如果發生錯誤就會到catch裡面
    //如果正常就不會進catch
    try{
        console.log("Loading wordlist...");

        const response = await fetch(datasourse);
        //手動進入catch告訴他檔案錯了
        if (!response.ok) {
            throw new Error('讀取失敗');
        }

        //變成一坨字串
        const textData = await response.text();
        //trim刪除所有看不到的字元(ex: tab, space, enter...)
        return textData.split("\n").map(word => word.trim());
    } catch (error) {
        console.error(error);
    }
}

function select_ans(){
    let randomIndex = Math.floor(Math.random() * wordlist.length);
    console.log(wordlist[randomIndex]);
    return wordlist[randomIndex];
}

window.onload = async function(){
    wordlist = await LoadWordlist('Wordlist.txt');
    guesslist = await LoadWordlist('Guesslist.txt');
    initialize();
}

function initialize(){
    board = [
        ['_', '_', '_', '_', '_'],
        ['_', '_', '_', '_', '_'],
        ['_', '_', '_', '_', '_'],
        ['_', '_', '_', '_', '_'],
        ['_', '_', '_', '_', '_'],
        ['_', '_', '_', '_', '_'],
    ];

    ans = select_ans();

    for(let r = 0; r < row; r++){
        for(let c = 0; c < column; c++){
            let tile = document.createElement('div');
            tile.id = r.toString() + '-' + c.toString();
            let text = board[r][c];
            updateTile(tile, text);
            document.getElementById("board").append(tile);
        }
    }

    const gameOver_text = document.getElementById('gameOver');
    if(gameOver_text){
        gameOver_text.style.display = 'none';
    }
}

function updateTile(tile, text){
    tile.innerText = "";
    tile.className = "";

    tile.classList.add("tile");
    if(text === '_'){
        return;
    } else  {
        tile.innerText = text.toUpperCase();
        tile.classList.add("not_check");
    }
}

document.addEventListener("keyup", function(event){
    if(event.code === "Slash" && gameOver){
        restart_game();

        console.log("Reset");
    }

    if (gameOver) return;

    if (event.code.startsWith('Key') && pos_c < 5) {
        // 只要字母，不在乎輸入法
        const letter = event.code.replace('Key', '').toUpperCase();
        board[pos_r][pos_c] = letter;
        let tile = document.getElementById(pos_r.toString() + "-" + pos_c.toString());
        updateTile(tile, letter);
        pos_c += 1;
        console.log(letter);
    } else if(event.code === "Backspace" && pos_c > 0){
        pos_c -= 1;
        board[pos_r][pos_c] = '_';
        let tile = document.getElementById(pos_r.toString() + "-" + pos_c.toString());
        updateTile(tile, '_');
        console.log("Backspace");
    } else if(event.code === "Enter" && pos_c === 5){
        if(if_repeated()){
            showRepeated();
            return;
        }
        let cur_row = board[pos_r].slice();
        let guess = cur_row.join("");
        
        if(!wordlist.includes(guess) && !guesslist.includes(guess)){
            showNotInWordlist();
            return;
        }

        let result = check_ans(guess);

        for(let c = 0; c < column; c++){
            let tile = document.getElementById(pos_r.toString() + "-" + c.toString());
            if(result[c] === '2'){
                tile.classList.replace("not_check", "correct");
            } else if(result[c] === '1'){
                tile.classList.replace("not_check", "exsist");
            } else {
                tile.classList.replace("not_check", "wrong");
            }
        }

        pos_r += 1;
        pos_c = 0;

        //check if game over:
        //1. 6 row
        //2. correct ans

        if(all_correct(result)){
            gameOver = true;
        } else if(pos_r === row){
            gameOver = true;
        }

        console.log("Enter");

        if(gameOver){
            show_game_over();
        }
    }
})

function if_repeated(){
    for(let r = 0; r < pos_r; r++){
        if(board[r].join('') === board[pos_r].join('')){
            return true;
        }
    }
    return false;
}

function show_game_over(){
    document.getElementById("the_ans").innerText = ans.toLowerCase();
    let gameOverElem = document.getElementById("gameOver");
    if(gameOverElem) gameOverElem.style.display = "flex";
}

function showNotInWordlist(){
    let container = document.getElementById('not_in_wordlist_container');
    let message = document.getElementById('not_in_wordlist');
    if(!container || !message) return;
    container.style.display = 'block';
    message.style.display = 'block';
    setTimeout(()=>{ container.style.display = 'none'; }, 1500);
}

function showRepeated(){
    let container = document.getElementById('repeated-container');
    let message = document.getElementById('repeated');
    if(!container || !message) return;
    container.style.display = 'block';
    message.style.display = 'block';
    setTimeout(()=>{ container.style.display = 'none'; }, 1500);
}

function restart_game(){
    board = [
        ['_', '_', '_', '_', '_'],
        ['_', '_', '_', '_', '_'],
        ['_', '_', '_', '_', '_'],
        ['_', '_', '_', '_', '_'],
        ['_', '_', '_', '_', '_'],
        ['_', '_', '_', '_', '_'],
    ];

    gameOver = false;
    ans = select_ans();

    for(let r = 0; r < row; r++){
        for(let c = 0; c < column; c++){
            let tile = document.getElementById(r.toString() + '-' + c.toString());
            let text = board[r][c];
            updateTile(tile, text);
        }
    }

    pos_r = 0;
    pos_c = 0;

    const gameOver_text = document.getElementById('gameOver');
    if(gameOver_text){
        gameOver_text.style.display = 'none';
    }
}

function all_correct(result){
    for(let i = 0; i < 5; i++){
        if(result[i] !== "2"){
            return false;
        }
    }
    return true;
}

function check_ans(cur_row){
    // 0 = Grey
    // 1 = Yellow
    // 2 = Green
    let guess_c = ['0','0','0','0','0'];

    let ans_used = [false,false,false,false,false];
    let guess_used = [false,false,false,false,false];

    // check green (correct position)
    for(let i = 0; i < 5; i++){
        if(cur_row[i] === ans[i]){
            guess_c[i] = '2';
            ans_used[i] = true;
            guess_used[i] = true;
        }
    }

    // check yellow (exists elsewhere)
    for(let j = 0; j < 5; j++){
        if(guess_used[j]) continue;
        for(let i = 0; i < 5; i++){
            if(ans_used[i]) continue;
            
            if(cur_row[j] === ans[i]){
                guess_c[j] = '1';
                ans_used[i] = true;
                guess_used[j] = true;
                break;
            }
        }
    }

    return guess_c;
    
}
