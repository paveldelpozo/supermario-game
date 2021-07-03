/* 
    Created on : 08-feb-2017, 16:23:27
    Author     : paveldelpozo
*/

function Game(canvasId) {
    canvasId = (canvasId === undefined) ? 'canvas' : canvasId;
    
    function getRandom(min, max) {
        return min + (Math.round(Math.random() * (max - min)));
    }

    function rectCollision(object1, object2) {
        return (object1.x < object2.x + object2.width &&
                object1.x + object1.width > object2.x &&
                object1.y < object2.y + object2.height &&
                object1.height + object1.y > object2.y);
    }

    function circleCollision(object1, object2) {
        var circle1 = {
            x: object1.x + (object1.width / 2),
            y: object1.y + (object1.height / 2), 
            radius: (object1.width / 2)
        };
        var circle2 = {
            x: object2.x + (object2.width / 2),
            y: object2.y + (object2.height / 2), 
            radius: (object2.width / 2)
        };

        var dx = circle1.x - circle2.x;
        var dy = circle1.y - circle2.y;
        var distance = Math.sqrt(dx * dx + dy * dy);

        return (distance < circle1.radius + circle2.radius);
    }

    function Player(parent) {
        this._parent = parent;
        this.x = (this._parent.width / 2) - 25;
        this.y = (this._parent.height / 2) - 25;
        this.width = 50;
        this.height = 50;
        this.directionV = 'n';
        this.directionH = 'n';
        this.delta = 10;
        this.imgNormal = new Image();
        this.imgNormal.src = this._parent.assets.player.normal;
        this.imgPower = new Image();
        this.imgPower.src = this._parent.assets.player.power;
        this.power = false;

        return this;
    }

    function Enemy(parent) {
        this._parent = parent;
        this.x = getRandom(0, this._parent.width - 40);
        this.y = getRandom(0, this._parent.height - 40);

        this.width = getRandom(30, 60);
        this.height = this.width;
        this.movement = getRandom(0, 1) === 1 ? 'v' : 'h';
        this.direction = getRandom(0, 1) === 1 ? 'r' : 'l'; //'r';
        this.delta = getRandom(1, 3);
        this.amplitude = getRandom(1, 5);
        this.period = getRandom(20, 50);

        this.img = new Image();
        this.img.src = this._parent.assets.enemies[getRandom(0, this._parent.assets.enemies.length - 1)];

        return this;
    }

    function Item(parent, powerItem) {
        this._parent = parent;
        this.x = getRandom(0, this._parent.canvas.width - 40);
        this.y = getRandom(0, this._parent.canvas.height - 40);
        this.width = 40;
        this.height = 40;

        this.imgNormal = new Image();
        this.imgNormal.src = this._parent.assets.item.normal;

        this.imgPower = new Image();
        this.imgPower.src = this._parent.assets.item.power;

        this.powerItem = powerItem; //(getRandom(0, 20) === 0);

        return this;
    }

    function Enemies() {
        this.list = [];
        this.max = 20;
        this.spawnInterval = 500;
        this.iterator = 0;
        this.dead = 0;

        return this;
    }

    function Items() {
        this.list = [];
        this.max = 20;
        this.spawnInterval = 200;
        this.iterator = 0;
        this.collected = 0;
        this.powerItemTimeout = 10 * 1000;

        return this;
    }
    
    var game = this;
    game.assets = {
        background : 'assets/background.jpg',
        player : {
            normal : 'assets/icons/player.png',
            power : 'assets/icons/player_powered.png' // TODO: Cambiar el icono del jugador cuando tiene poder
        },
        enemies : [
            'assets/icons/enemy_0.png',
            'assets/icons/enemy_1.png',
            'assets/icons/enemy_2.png',
            'assets/icons/enemy_3.png'
        ],
        item : {
            normal : 'assets/icons/coin.png',
            power : 'assets/icons/flower.png'
        }
    };

    game.drawBackground = drawBackground;

    game.movePlayer = movePlayer;
    game.drawPlayer = drawPlayer;

    game.createEnemies = createEnemies;
    game.moveEnemy = moveEnemy;
    game.drawEnemy = drawEnemy;
    game.drawEnemies = drawEnemies;

    game.createItems = createItems;
    game.drawItem = drawItem;
    game.drawItems = drawItems;
    
    game.checkCollisionBetweenPlayerWith = checkCollisionBetweenPlayerWith;
    game.checkCollisionWithEnemies = checkCollisionWithEnemies;
    game.checkCollisionWithItems = checkCollisionWithItems;
    game.checkCollisions = checkCollisions;

    game.drawText = drawText;
    game.drawInfo = drawInfo;
    game.drawGameOver = drawGameOver;
    game.drawGame = drawGame;
    
    game.keyDownHandler = keyDownHandler;
    game.keyUpHandler = keyUpHandler;
    game.windowResizeHandler = windowResizeHandler;
    
    game.start = start;
    game.finish = finish;

    function drawBackground() {
        game.ctx.save();
        game.ctx.clearRect(0, 0, game.canvas.width, game.canvas.height);
        
        // TODO: Si el jugador ha conseguido una planta, pintar un borde de color verde al rededor de la pantalla
        game.ctx.drawImage(game.background.img, 0, 0, game.canvas.width, game.canvas.height);
        if (game.player.power) {
            //game.ctx.strokeStyle('rgb(0, 127, 0)');
            game.ctx.strokeRect(0, 0, game.canvas.width, game.canvas.height);
        }
        
        game.ctx.restore();
    }

    function movePlayer() {
        switch (game.player.directionH) {
            case 'r':
                if (game.player.x + game.player.delta + game.player.width <= game.canvas.width) {
                    game.player.x += game.player.delta;
                } else {
                    game.player.x = game.canvas.width - game.player.width;
                }
                break;
            case 'l':
                if (game.player.x - game.player.delta >= 0) {
                    game.player.x -= game.player.delta;
                } else {
                    game.player.x = 0;
                }
                break;
        }
        
        switch (game.player.directionV) {
            case 'd':
                if (game.player.y + game.player.delta + game.player.height <= game.canvas.height) {
                    game.player.y += game.player.delta;
                } else {
                    game.player.y = game.canvas.height - game.player.height;
                }
                break;
            case 'u':
                if (game.player.y - game.player.delta >= 0) {
                    game.player.y -= game.player.delta;
                } else {
                    game.player.y = 0;
                }
                break;
        }
    }

    function drawPlayer() {
        game.movePlayer();
        if (game.player.power) {
            game.ctx.drawImage(game.player.imgPower, game.player.x, game.player.y, game.player.width, game.player.height);
        } else {
            game.ctx.drawImage(game.player.imgNormal, game.player.x, game.player.y, game.player.width, game.player.height);
        }
    }

    function createEnemies() {
        if (game.enemies.iterator % game.enemies.spawnInterval === 0 && game.enemies.list.length < game.enemies.max) {
            do {
                var enemy = new Enemy(game);
                var collision = game.checkCollisionBetweenPlayerWith(enemy);
            } while(collision);
            
            game.enemies.list.push(enemy);
        }
        game.enemies.iterator++;
    }
    
    function moveEnemy(enemy) {
        var amplitude = enemy.amplitude;
        var period = enemy.period;
        
        var frequencyH = Math.sin(2 * Math.PI * (game.enemies.iterator / period));
        var frequencyV = Math.cos(2 * Math.PI * (game.enemies.iterator / period));
        
        if (enemy.movement === 'h') {
            if (enemy.direction === 'r') {
                if (enemy.x + enemy.delta + enemy.width <= game.canvas.width) {
                    enemy.x += enemy.delta;
                    enemy.y += Math.round(amplitude * frequencyH);
                } else {
                    enemy.direction = 'l';
                }
            } else {
                if (enemy.x - enemy.delta >= 0) {
                    enemy.x -= enemy.delta;
                    enemy.y += Math.round(amplitude * frequencyH);
                } else {
                    enemy.direction = 'r';
                }
            }
        } else {
            if (enemy.direction === 'r') {
                if (enemy.y + enemy.delta + enemy.height <= game.canvas.height) {
                    enemy.y += enemy.delta;
                    enemy.x += Math.round(amplitude * frequencyV);
                } else {
                    enemy.direction = 'l';
                }
            } else {
                if (enemy.y - enemy.delta >= 0) {
                    enemy.y -= enemy.delta;
                    enemy.x += Math.round(amplitude * frequencyV);
                } else {
                    enemy.direction = 'r';
                }
            }
        }
    }

    function drawEnemy(enemy) {
        game.ctx.drawImage(enemy.img, enemy.x, enemy.y, enemy.width, enemy.height);
    }

    function drawEnemies() {
        game.createEnemies();
        for (var e = 0; e < game.enemies.list.length; e++) {
            game.moveEnemy(game.enemies.list[e]);
            game.drawEnemy(game.enemies.list[e]);
        }
    }

    function createItems() {
        if (game.items.iterator % game.items.spawnInterval === 0 && game.items.list.length < game.items.max) {
            var number = getRandom(0, 10);
            var item = new Item(game, (number === 0 && game.enemies.list.length >= 5));
            game.items.list.push(item);
        }
        game.items.iterator++;
    }

    function drawItem(item) {
        if (item.powerItem) {
            game.ctx.drawImage(item.imgPower, item.x, item.y, item.width, item.height);
        } else {
            game.ctx.drawImage(item.imgNormal, item.x, item.y, item.width, item.height);
        }
    }

    function drawItems() {
        for (var i = 0; i < game.items.list.length; i++) {
            game.drawItem(game.items.list[i]);
        }
    }
    
    function checkCollisionBetweenPlayerWith(object) {
        var collision = circleCollision(game.player, object);
        return collision;
    }
    
    function checkCollisionWithEnemies() {
        for (var e = 0; e < game.enemies.list.length; e++) {
            var enemy = game.enemies.list[e];
            if (game.checkCollisionBetweenPlayerWith(enemy)) {
                if (!game.player.power) {
                    if (game.gameStart) {
                        game.gameOver = true;
                    }
                } else {
                    game.enemies.list.splice(e, 1);
                    game.enemies.dead++;
                    if (game.enemies.list.length === 0) {
                        game.gameWin = true;
                    }
                }
            }
        }
    }
    
    function checkCollisionWithItems() {
        for (var i = 0; i < game.items.list.length; i++) {
            var item = game.items.list[i];
            if (game.checkCollisionBetweenPlayerWith(item)) {
                if (item.powerItem) {
                    game.player.power = true;
                    setTimeout(function() {
                        game.player.power = false;
                    }, game.items.powerItemTimeout);
                }
                game.items.list.splice(i, 1);
                game.items.collected++;
            }
        }
    }
    
    function checkCollisions() {
        game.checkCollisionWithEnemies();
        game.checkCollisionWithItems();
    }
    
    function drawText(text, font, fillStyle, x, y) {
        game.ctx.save();
        game.ctx.font = font;
        game.ctx.fillStyle = fillStyle;

        var textMeasure = game.ctx.measureText(text);
        x = (x === 'center') ? Math.round((game.canvas.width / 2) - (textMeasure.width / 2)) : x;

        game.ctx.fillText(text, x, y);
        game.ctx.restore();
    }
    
    function drawInfo() {
        var item = new Item(game, false);
        game.ctx.drawImage(item.imgNormal, 5, 5, 20, 20);
        game.drawText(game.items.collected, '16px sans-serif', 'rgba(0, 0, 0, 0.75)', 30, 22);
        
        if (game.player.power) {
            game.drawText("¡Super Mario!", '24px sans-serif bold', 'rgba(0, 127, 0, 0.75)', 150, 22);
        }
    }
    
    function drawGameOver() {
        if (game.gameOver) {
            game.ctx.fillStyle = 'rgba(127, 0, 0, 0.75)';
        }
        if (game.gameWin) {
            game.ctx.fillStyle = 'rgba(0, 127, 0, 0.75)';
        }
        
        if (game.gameOver) {
            game.ctx.drawImage(game.player.imgNormal, (game.canvas.width - (game.canvas.height * 0.75)) / 2, (game.canvas.height - (game.canvas.height * 0.75)) / 2, game.canvas.height * 0.75, game.canvas.height * 0.75);
            game.ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);
            game.drawText("¡Has perdido!", '48px sans-serif', 'rgba(255, 255, 255, 0.75)', 'center', (game.canvas.height / 2) - 50);
        }
        if (game.gameWin) {
            game.ctx.drawImage(game.player.imgPower, (game.canvas.width - (game.canvas.height * 0.75)) / 2, (game.canvas.height - (game.canvas.height * 0.75)) / 2, game.canvas.height * 0.75, game.canvas.height * 0.75);
            game.ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);
            game.drawText("¡¡Has ganado!!", '48px sans-serif', 'rgba(255, 255, 255, 0.75)', 'center', (game.canvas.height / 2) - 50);
        }
        game.drawText("Has conseguido " + game.items.collected + " monedas.", '24px sans-serif', 'rgba(255, 255, 255, 0.75)', 'center', (game.canvas.height / 2) + 40);
        game.drawText("Has matado " + game.enemies.dead + " mostruos.", '24px sans-serif', 'rgba(255, 255, 255, 0.75)', 'center', (game.canvas.height / 2) + 70);
        
        game.finish();
    }

    function drawGame() {
        game.drawBackground();
        
        game.createItems();
        game.drawItems();
        
        game.drawPlayer();
        
        game.drawEnemies();
        
        game.drawInfo();
        game.checkCollisions();
        
        if (!game.gameOver && !game.gameWin) {
            window.requestAnimationFrame(game.drawGame);
        } else {
            window.requestAnimationFrame(game.drawGameOver);
        }
    }
    
    function keyDownHandler(event) {
        //console.log(event.key);
        switch (event.key) {
            case 'ArrowLeft':
                game.player.directionH = 'l';
                game.gameStart = true;
                break;
            case 'ArrowRight':
                game.player.directionH = 'r';
                game.gameStart = true;
                break;
            case 'ArrowUp':
                game.player.directionV = 'u';
                game.gameStart = true;
                break;
            case 'ArrowDown':
                game.player.directionV = 'd';
                game.gameStart = true;
                break;
        }
    }
    
    function keyUpHandler(event) {
        if (game.player.directionH === 'l' || game.player.directionH === 'r') {
            game.player.directionH = 'n';
        }
        
        if (game.player.directionV === 'u' || game.player.directionV === 'd') {
            game.player.directionV = 'n';
        }
    }
    
    function windowResizeHandler(event) {
        game.canvas.setAttribute("width", window.innerWidth - 5);
        game.canvas.setAttribute("height", window.innerHeight - 5);
    }
    
    function start() {
        game.error = false;

        game.canvas = document.getElementById(canvasId);
        console.dir(window);
        game.canvas.setAttribute("width", window.innerWidth - 5);
        game.canvas.setAttribute("height", window.innerHeight - 5);

        if (game.canvas.getContext) {
            game.ctx = game.canvas.getContext('2d');
        } else {
            game.error = true;
        }

        game.width = game.canvas.width;
        game.height = game.canvas.height;


        game.background = {
            img : new Image()
        };
        game.background.img.src = game.assets.background;

        game.player = new Player(game);
        game.enemies = new Enemies();
        game.items = new Items();

        game.gameOver = false;
        game.gameWin = false;
        game.gameStart = false;

        if (!game.error) {
            window.addEventListener('keydown', game.keyDownHandler);
            window.addEventListener('keyup', game.keyUpHandler);
            window.addEventListener('resize', game.windowResizeHandler);
            window.requestAnimationFrame(game.drawGame);
        }
    }
    
    function finish() {
        window.removeEventListener('keydown', game.keyDownHandler);
        window.removeEventListener('keyup', game.keyUpHandler);
    }
    
    return game;
}

function main() {
    var game = new Game("game");
    game.start();
}

window.addEventListener("load", main);