const screen_canvas = document.getElementById('screen_canvas');
const screen_canvas_draw = screen_canvas.getContext('2d');

let handle;

let direction_event;
document.addEventListener("keydown", function(event) {
    direction_event = event.key;
});

class GameSnake {
    constructor() {
        this.map = [];
        this.snake = [[3, 0], [2, 0], [1, 0], [0, 0]];
        this.food = [];

        this.cell_size = [64, 64];
        this.cell_number = [10, 10];

        this.screen_canvas_color = [100, 100, 100, 1];
        this.food_color = [255, 255, 200, 1];
        this.snake_head_color = [255, 255, 0, 1];
        this.snake_body_color = [255, 0, 255, 1];

        this.game_speed = 200;

        this.score = 0;
        this.score_max = this.cell_number[0] * this.cell_number[1] - this.snake.length;

        this.direction = "ArrowRight";
        this.next_direction = "ArrowRight";

        this.init_settings();
    }

    change_direction() {
        /** 
         * 状态转移
         *   上下左右
         * 上保否左右
         * 下否保左右
         * 左上下保否
         * 右上下否保
         */
        
        if (this.direction === "ArrowUp" || this.direction === "ArrowDown") {
            if (direction_event === "ArrowLeft" || direction_event === "ArrowRight") {
                if (this.next_direction === this.direction) {
                    this.next_direction = direction_event;
                }
            }
        }
        if (this.direction === "ArrowLeft" || this.direction === "ArrowRight") {
            if (direction_event === "ArrowUp" || direction_event === "ArrowDown") {
                if (this.next_direction === this.direction) {
                    this.next_direction = direction_event;
                }
            }
        }
    }

    init_settings() {
        /**基础画面设置 */
        screen_canvas.width = this.cell_size[0] * this.cell_number[0];
        screen_canvas.height = this.cell_size[1] * this.cell_number[1];
        screen_canvas.style.backgroundColor = `rgba(${this.screen_canvas_color.join(", ")})`;
    
        /**初始化地图列表 */
        for (let col = 0; col < this.cell_number[0]; col++) {
            for (let row = 0; row < this.cell_number[1]; row++) {
                this.map.push([col, row]);
            }
        }
        
        /**初始化蛇 */
        this.draw_snake(this.snake);
        /**初始化食物 */
        this.food = this.draw_food();
    }
    
    draw(position, item_color) {
        let cell_width = this.cell_size[0];
        let cell_height = this.cell_size[1];
    
        screen_canvas_draw.fillStyle = `rgba(${item_color.join(", ")})`;
        screen_canvas_draw.fillRect(
            position[0]*cell_width, position[1]*cell_height, 
            cell_width, cell_height
        );
    }
    draw_snake(snake) {
        /**绘制蛇头和蛇身 */
        this.draw(snake[0], this.snake_head_color);
        for (let i = 1; i < snake.length; i++) {
            this.draw(snake[i], this.snake_body_color);
        }
    }
    draw_food() {
        /**
         * 从地图剩余部分随机找一个点 
         * 如果没有剩余部分了，则置为[-1, -1]
         */
        if (this.map.length === this.snake.length) {
            return [-1, -1];
        }
        let rest_map = this.map.filter(map_cell => {
            return !this.snake.some(snake_cell => {
                return map_cell[0] === snake_cell[0] && map_cell[1] === snake_cell[1];
            });
        });
        let random_food = rest_map[Math.floor(Math.random() * rest_map.length)];
    
        this.draw(random_food, this.food_color);
        return random_food;
    }
    
    if_over(food, snake) {
        /**
         * 蛇是否占满整个区域（是否无法生成新的食物）
         * 蛇是否碰壁（蛇头超出单元行列数量）
         * 蛇是否咬到自己（蛇头是否存在于蛇身中间）
         */
    
        if (food[0] === -1 && food[1] === -1) {
            return [true, "Game Success\nscore: 100/100"];
        }
    
        if (
            snake[0][0] === -1 || snake[0][0] === this.cell_number[0] ||
            snake[0][1] === -1 || snake[0][1] === this.cell_number[1]
            ) {
            return [true, "Game Over\nscore: " + Math.round(this.score*100/this.score_max) + "/100"];
        }
    
        let snake_head = snake[0];
        let snake_body = snake.slice(1);
        for (let i = 1; i < snake_body.length; i ++ ){
            if (snake_head[0] === snake_body[i][0] && snake_head[1] === snake_body[i][1]) {
                return [true, "Game Over\nscore: " + Math.round(this.score*100/this.score_max) + "/100"];
            }
        }
    
        return [false, null];
    }

    game_loop() {
        /**
         * 控制蛇的方向 
         * 如果没有人为操作则继续向上一次的方向运动 
         * 如果有人为操作则朝新的方向运动 
         */
        this.change_direction();
        switch (this.next_direction) {
            case "ArrowUp":      this.snake.unshift([this.snake[0][0], this.snake[0][1]-1]); break;
            case "ArrowDown":    this.snake.unshift([this.snake[0][0], this.snake[0][1]+1]); break;
            case "ArrowLeft":    this.snake.unshift([this.snake[0][0]-1, this.snake[0][1]]); break;
            case "ArrowRight":   this.snake.unshift([this.snake[0][0]+1, this.snake[0][1]]); break;
            default: break;
        }

        /**
         * 画出蛇当前位置 
         */
        this.draw_snake(this.snake);

        /**
         * 如果蛇吃到了食物 则不消除蛇尾 生成新食物
         * 如果蛇没吃到食物 则清除掉蛇尾 不清除食物
         */
        if (this.snake[0][0] === this.food[0] && this.snake[0][1] === this.food[1]) {
            this.food = this.draw_food();
            this.score += 1;
        } else {
            this.draw(this.snake.pop(), this.screen_canvas_color);
            this.direction = this.next_direction;
        }

        /**
         * 游戏是否结束判断
         * 蛇是否占满整个区域
         * 蛇是否碰壁
         * 蛇是否咬到自己
         * 则游戏结束
         */
        let game_status = this.if_over(this.food, this.snake)
        if (game_status[0]) {
            alert(game_status[1]);
            game();
        }
    }
}

function game() {
    clearInterval(handle);
    const game_snake = new GameSnake();
    handle = setInterval(() => {game_snake.game_loop();}, game_snake.game_speed);
}

game();
