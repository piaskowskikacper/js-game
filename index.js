(function(window){

var Game = {
    init: function(){
        this.c = document.getElementById("game");
        this.c.width = this.c.width;
		this.c.height = this.c.height;
        this.ctx = this.c.getContext("2d");
        
        this.drawBg = new drawBg();

        this.bgSound = new Audio("./resources/bgSound.mp3");
        this.bgSound.muted = false;
        this.bgSound.play();

        this.shotSound = new Audio("./resources/shot.mp3");
        this.shotSound.volume = 0.1;

        this.explosion = new Audio("./resources/explosion.mp3");
        this.explosion.volume = 0.2;

        this.playerTexture = document.getElementById("player");
        this.playerTexture2 = document.getElementById("player2");
        this.enemyTexture = document.getElementById("enemy");
        this.enemyTexture2 = document.getElementById("enemy2");
        this.boom = document.getElementById("boom");


        this.frameNo = 0;
        this.listener();

        this.bulletController = new BulletController(this.c);

        this.player = new Player(this.bulletController);
        this.score = new Score();
        this.lives = new Lives();
        
        this.enemies = [];
        this.enemyIndex = 0;
        this.maxEnemies = 9;
        this.enemiesSpawned = 0;
        
        
        for (var i=0; i<this.maxEnemies; i++){
            new Enemy();
            this.enemiesSpawned += 1;
        }
        
        this.requestAnimationFrame = window.requestAnimationFrame;
        this.loop();
        },


    listener: function(){
        window.addEventListener("keydown", this.buttonDown);
        window.addEventListener("keyup", this.buttonUp);

        Game.bgSound.addEventListener('ended', function(){
             this.currentTime = 0;
             this.play();
        }, false);

    },

    buttonUp: function(event){
		if(event.keyCode === 65){
			Game.player.moveLeft = false;
		}
		if(event.keyCode === 68){
			Game.player.moveRight = false;
		}
        if(event.keyCode === 32){

			Game.player.shot = false;

		}
	},

	buttonDown: function(event){
		if(event.keyCode === 65){
			Game.player.moveLeft = true;
		}
		if(event.keyCode === 68){
			Game.player.moveRight = true;
		}
        if(event.keyCode === 32){
            if(Game.lives.lives > 0){
			    Game.player.shot = true;
            } else {
                Game.init();
            }
		}
	},

    clear: function(){
        this.ctx.clearRect(0, 0, this.c.width, this.c.height);
    },


    loop: function(){ 
        Game.clear();
        //Game.bgImg.render();
        Game.drawBg.render();
        if(Game.lives.lives >= 0){
            Game.lives.draw(Game.ctx);
        } else {
            Game.lives.lives = 0;
            Game.lives.draw(Game.ctx);
        }
        Game.score.draw(Game.ctx);

        if (Game.lives.lives > 0){

            if(Game.enemiesSpawned < Game.maxEnemies){
                Game.enemiesSpawned++;
                setTimeout(function(){
                    new Enemy();
                }, 1000);
            }

            Game.enemies.forEach((enemy) => {
                if(enemy.y >= Game.c.height){
                    const index = Game.enemies.indexOf(enemy);
                    Game.enemies.splice(index, 1); 
                    Game.enemiesSpawned -= 1;    
                    Game.lives.lives -=1;

                } else if (Game.bulletController.collideWith(enemy)) {
                    enemy.explosion();
                    Game.explosion.currentTime = 0;
                    Game.explosion.play()
                    const index = Game.enemies.indexOf(enemy);
                    Game.enemies.splice(index, 1); 
                    Game.enemiesSpawned -= 1;    
                    Game.score.score += 100;   
                } else {
                enemy.draw(Game.ctx);
                enemy.updatePosition();
                }
            });




            


            Game.player.updatePosition();
            Game.player.draw();
            Game.bulletController.draw(Game.ctx);
            Game.frameNo = Game.requestAnimationFrame.call(window, Game.loop);
        }



        if(Game.lives.lives == 0 ){
            Game.bgSound.muted = true;
            Game.ctx.fillStyle = "red";   
            Game.ctx.font = "40px serif ";
            Game.ctx.fillText("GAME OVER", Game.c.width/2-120, Game.c.height/2);
            Game.ctx.font = "20px serif ";
            Game.ctx.fillText("Press SPACE to restart", Game.c.width/2-100, Game.c.height/2+45);
        }

    }

}



    class drawBg {
        constructor() {
            this.bgImage = document.getElementById('background');
            this.x = 0, this.y = -Game.c.width;
            this.render = function () {
                Game.ctx.drawImage(this.bgImage, this.x, this.y += 2);
                if (this.y >= 0) {
                    this.y = -Game.c.height;
                }
            };
        }
    }



    class Player {
        constructor(bulletController) {
            this.width = 50;
            this.height = 50;
            this.x = Game.c.width / 2 - this.width / 2;
            this.y = Game.c.height - this.height;
            this.moveLeft = false;
            this.moveRight = false;
            this.offSet = 8;

            this.bulletController = bulletController;
            this.shot = false;
        }
        updatePosition() {
            if (this.moveLeft && this.x > 0) {
                this.x -= this.offSet;
            }
            
            if (this.moveRight && this.x + this.width < Game.c.width) {
                this.x += this.offSet;
            }
        }
        
        pShoot() {
            if (this.shot) {
                const speed = 9;
                const delay = 25;
                const bulletX = this.x + this.width / 2;
                const bulletY = this.y;
                this.bulletController.shoot(bulletX, bulletY, speed, delay);
            }
        }   
        
        draw() {
            if (Game.frameNo % 15 != 0) { Game.ctx.drawImage(Game.playerTexture, this.x, this.y, this.width, this.height); }
            else { Game.ctx.drawImage(Game.playerTexture2, this.x, this.y, this.width, this.height); }
    
            this.pShoot();
        }
    }



    class Enemy {
        constructor() {
            this.width = 70;
            this.height = 30;
            this.x = Math.floor(Math.random() * (Game.c.width - this.width));
            this.y = Math.abs(Math.floor(Math.random() * (Game.c.height - 360)));
            this.moveLeft = true;
            this.moveRight = false;
            this.offSet = 7;

            Game.enemies[Game.enemyIndex] = this;
            Game.enemyIndex++;
        }
        draw() {
            if (Game.frameNo % 100 != 0) { Game.ctx.drawImage(Game.enemyTexture, this.x, this.y, this.width, this.height); }
            else { Game.ctx.drawImage(Game.enemyTexture2, this.x, this.y, this.width, this.height); }
        }

        explosion(){
            Game.ctx.drawImage(Game.boom, this.x, this.y, this.width, this.height);
        }

        updatePosition() {
            if (this.moveLeft && this.x > 0) {
                this.x -= this.offSet;
                if (this.y <= Game.c.height) {
                    this.y += 0.5;
                }
            }

            if (this.moveRight && this.x + this.width < Game.c.width) {
                this.x += this.offSet;
                if (this.y <= Game.c.height) {
                    this.y += 0.5;
                }
            }

            if (this.x <= 0) {
                this.moveLeft = false;
                this.moveRight = true;

            }

            if (this.x >= Game.c.width - this.width) {
                this.moveRight = false;
                this.moveLeft = true;

            }


        }
    }


    class BulletController {
        bullets = [];
        timerTillNextBullet = 0;
      
        constructor(c) {
          this.c = c;
        }

        sound(){
            Game.shotSound.currentTime = 0;
            Game.shotSound.play();
        }
      
        shoot(x, y, speed, delay) {
          if (this.timerTillNextBullet <= 0) {
            this.bullets.push(new Bullet(x, y, speed));
            this.sound();
            
            this.timerTillNextBullet = delay;
          }
          //console.log(this.bullets.length);
          this.timerTillNextBullet--;
        }
      
        draw(ctx) {
          this.bullets.forEach((bullet) => {
            if (this.isBulletOffScreen(bullet)) {
              const index = this.bullets.indexOf(bullet);
              this.bullets.splice(index, 1);
            }
            bullet.draw(ctx);
            //console.log("shot");
          });
        }
      
        collideWith(sprite) {
          return this.bullets.some((bullet) => {
            if (bullet.collideWith(sprite)) {
              this.bullets.splice(this.bullets.indexOf(bullet), 1);
              return true;
            }
            return false;
          });
        }
      
        isBulletOffScreen(bullet) {
          return bullet.y <= -bullet.height;
        }
    }


    class Bullet {
      
        constructor(x, y, speed) {
          this.x = x;
          this.y = y;
          this.speed = speed;
      
          this.width = 5;
          this.height = 15;
          this.color = "red";
        }
      
        draw(ctx) {
          ctx.fillStyle = this.color;
          this.y -= this.speed;
          ctx.fillRect(this.x, this.y, this.width, this.height);
        }
      
        collideWith(sprite) {
          if (
            this.x < sprite.x + sprite.width &&
            this.x + this.width > sprite.x &&
            this.y < sprite.y + sprite.height &&
            this.y + this.height > sprite.y
          ) {
            return true;
          }
          return false;
        }
    }

    class Score {
        constructor(){
            this.score = 0;
        }

        draw(ctx){
            this.ctx = ctx;
            this.ctx.fillStyle = "green";   
            this.ctx.font = "15px serif ";
            ctx.fillText("Score: "+this.score.toString(), 15, 385);
        }

    }

    class Lives {
        constructor(){
            this.lives = 3;
            this.heartImage = document.getElementById("heart");
        }

        draw(ctx){
            this.ctx = ctx;
            this.ctx.fillStyle = "red";   
            this.ctx.font = "15px serif ";
            ctx.drawImage(this.heartImage, 755, 374);
            ctx.fillText(this.lives.toString(), 775, 385);
        }

    }
      


Game.init();
}(window));