const screen_canvas = document.getElementById('screen_canvas');
const screen_canvas_draw = screen_canvas.getContext('2d');

let handle;

var map = [];
var snake = [[3, 0], [2, 0], [1, 0], [0, 0]];
var direction = "ArrowRight";
var food = [];

var game_settings = {
    "cell_size": [20, 20],
    "cell_number": [10, 10],
    "screen_canvas_color": [100, 100, 100, 1],

    "food_color": [255, 255, 200, 1],
    "snake_head_color": [255, 255, 0, 1],
    "snake_body_color": [255, 0, 255, 1],
}

function apply_settings() {
    /**清空变量 */
    map = [];
    snake = [[3, 0], [2, 0], [1, 0], [0, 0]];
    direction = "ArrowRight";
    food = [];

    /**基础画面设置 */
    screen_canvas.width = game_settings["cell_size"][0] * game_settings["cell_number"][0];
    screen_canvas.height = game_settings["cell_size"][1] * game_settings["cell_number"][1];
    screen_canvas.style.backgroundColor = `rgba(${game_settings["screen_canvas_color"].join(", ")})`;

    /**初始化地图列表 */
    for (let col = 0; col < game_settings["cell_number"][0]; col++) {
        for (let row = 0; row < game_settings["cell_number"][1]; row++) {
            map.push([col, row]);
        }
    }
    
    /**初始化蛇 */
    draw_snake(snake);
    /**初始化食物 */
    food = draw_food();
}

function draw(position, item_name) {
    let cell_width = game_settings["cell_size"][0];
    let cell_height = game_settings["cell_size"][1];

    screen_canvas_draw.fillStyle = `rgba(${game_settings[item_name].join(", ")})`;
    screen_canvas_draw.fillRect(
        position[0]*cell_width, position[1]*cell_height, 
        cell_width, cell_height);
}
function draw_snake(snake) {
    /**绘制蛇头和蛇身 */
    draw(snake[0], "snake_head_color");
    for (let i = 1; i < snake.length; i++) {
        draw(snake[i], "snake_body_color");
    }
}
function draw_food() {
    /**
     * 从地图剩余部分随机找一个点 
     * 如果没有剩余部分了，则置为[-1, -1]
     */
    if (map.length === snake.length) {
        return [-1, -1];
    }
    let rest_map = map.filter(map_cell => {
        return !snake.some(snake_cell => {
            return map_cell[0] === snake_cell[0] && map_cell[1] === snake_cell[1];
        });
    });
    let random_food = rest_map[Math.floor(Math.random() * rest_map.length)];

    draw(random_food, "food_color");
    return random_food;
}

function if_over(food, snake) {
    /**
     * 蛇是否占满整个区域（是否无法生成新的食物）
     * 蛇是否碰壁（蛇头超出单元行列数量）
     * 蛇是否咬到自己（蛇头是否存在于蛇身中间）
     */

    if (food[0] === -1 && food[1] === -1) {
        return [true, "Game Success"];
    }

    if (
        snake[0][0] === -1 || snake[0][0] === game_settings['cell_number'][0] ||
        snake[1][0] === -1 || snake[1][0] === game_settings['cell_number'][1]
        ) {
        return [true, "Game Over"];
    }

    let snake_head = snake[0];
    let snake_body = snake.slice(1);
    for (let i = 1; i < snake_body.length; i ++ ){
        if (snake_head[0] === snake_body[i][0] && snake_head[1] === snake_body[i][1]) {
            return [true, "Game Over"];
        }
    }

    return [false, null];
}

document.addEventListener("keydown", function(event) {
    /** 
     * 状态转移
     *   上下左右
     * 上保否左右
     * 下否保左右
     * 左上下保否
     * 右上下否保
     */
    let next_direction = event.key;
    if (direction === "ArrowUp" || direction === "ArrowDown") {
        if (next_direction === "ArrowLeft" || next_direction === "ArrowRight") {
            direction = next_direction;
        }
    }
    if (direction === "ArrowLeft" || direction === "ArrowRight") {
        if (next_direction === "ArrowUp" || next_direction === "ArrowDown") {
            direction = next_direction;
        }
    }
});

document.getElementById('button_up').addEventListener('click', () => {direction = "ArrowUp"});
document.getElementById('button_down').addEventListener('click', () => {direction = "ArrowDown"});
document.getElementById('button_left').addEventListener('click', () => {direction = "ArrowLeft"});
document.getElementById('button_right').addEventListener('click', () => {direction = "ArrowRight"});
document.getElementById('button_a').addEventListener('click', () => {});
document.getElementById('button_b').addEventListener('click', () => {});

function main_loop() {
    /**
     * 控制蛇的方向 
     * 如果没有人为操作则继续向上一次的方向运动 
     * 如果有人为操作则朝新的方向运动 
     */
    switch (direction) {
        case "ArrowUp":      snake.unshift([snake[0][0], snake[0][1]-1]); break;
        case "ArrowDown":    snake.unshift([snake[0][0], snake[0][1]+1]); break;
        case "ArrowLeft":    snake.unshift([snake[0][0]-1, snake[0][1]]); break;
        case "ArrowRight":   snake.unshift([snake[0][0]+1, snake[0][1]]); break;
        default: break;
    }

    /**
     * 画出蛇当前位置 
     */
    draw_snake(snake);

    /**
     * 如果蛇吃到了食物 则不消除蛇尾 生成新食物
     * 如果蛇没吃到食物 则清除掉蛇尾 不清除食物
     */
    if (snake[0][0] === food[0] && snake[0][1] === food[1]) {
        food = draw_food();
    } else {
        draw(snake.pop(), "screen_canvas_color");
    }

    /**
     * 游戏是否结束判断
     * 蛇是否占满整个区域
     * 蛇是否碰壁
     * 蛇是否咬到自己
     * 则游戏结束
     */
    let game_status = if_over(food, snake)
    // if (game_status[0]) {
    //     alert(game_status[1]);
    //     game();
    // }
}

function game() {
    clearInterval(handle);
    apply_settings();
    handle = setInterval(main_loop, 200);
}

game();
