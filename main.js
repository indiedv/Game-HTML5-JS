//importants objects of canvas
var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");

var ship = {//ship object create
    x: 100,
    y: canvas.height - 100,
    width: 50,
    height: 50,
    counter: 0
};
var game={
    state:'starting'
};
var txtReply={
    counter: -1,
    title: '',
    subtitle: ''
}

var keyboard = {};
var shots = []; // shots array
var shotsEnemies=[];//shots enemies array
var enemies=[];//enemies array

//variables images/background
var gBG,imgShip,imgEnemy,imgShot,imgShotEnemy;
var images=['laserEnemy.png','laserShip.png','ship.png','shipenemy.png','space.jpg'];
//variables sound
var soundShot,soundEnemyShot,deadEnemy,deadShip,endGame;

var preloader;
//functions definitions
function loadMedia() {
    preloader = new PreloadJS();
    preloader.onProgress=loadingProgress;
    load();
}
function load(){
    while(images.length>0){
        var image = images.shift();
        preloader.loadFile(image);
    }
}

function loadingProgress(){
    console.log(parseInt(preloader.progress*100)+"%");
    if(preloader.progress == 1){
        var interval = window.setInterval(frameLoop, 1000 / 55);
        gBG = new Image();
        gBG.src = 'space.jpg';
        imgShip = new Image();
        imgShip.src = 'ship.png';
        imgEnemy = new Image();
        imgEnemy.src = 'shipenemy.png';
        imgShot = new Image();
        imgShot.src = 'laserShip.png';
        imgShotEnemy = new Image();
        imgShotEnemy.src = 'laserEnemy.png';
        soundShot=document.createElement('audio');
        document.body.appendChild(soundShot);
        soundShot.setAttribute('src','laserShip.mp3');
        soundEnemyShot=document.createElement('audio');
        document.body.appendChild(soundEnemyShot);
        soundEnemyShot.setAttribute('src','laserEnemy.mp3');
        deadShip=document.createElement('audio');
        document.body.appendChild(deadShip);
        deadShip.setAttribute('src','shipDead.mp3');
        deadEnemy=document.createElement('audio');
        document.body.appendChild(deadEnemy);
        deadEnemy.setAttribute('src','shipDead.mp3');
        endGame=document.createElement('audio');
        document.body.appendChild(endGame);
        endGame.setAttribute('src','shipDead.mp3');
    }
}

function drawEnemies(){
    for(var i in enemies){
        var enemy = enemies[i];
     //   ctx.save();not required if you have images or sprite to end coding
        if(enemy.state=='alive') ctx.fillStyle = 'red';
        if(enemy.state=='dead') ctx.fillStyle = 'black';
        ctx.drawImage(imgEnemy,enemy.x,enemy.y,enemy.width,enemy.height);
    }
}
function drawBackground() {
    ctx.drawImage(gBG, 0, 0);
}

function drawShip() {
   // ctx.save(); not required if you have images or sprite to end coding
    ctx.drawImage(imgShip,ship.x, ship.y, ship.width, ship.height);
   // ctx.restore();not required if you have images or sprite to end coding
}

function addKeyboardEvents() {
    addEvent(document, "keydown", function(e) {
        //set the pressed key to true
        keyboard[e.keyCode] = true;
    });
    addEvent(document, "keyup", function(e) {
        //we set the key that was no longer pressed to false
        keyboard[e.keyCode] = false;
    });

    function addEvent(element, eventName, funcion) {
        if (element.addEventListener) {
            //All browser
            element.addEventListener(eventName, funcion, false);
        } else if (element.attachEvent) {
            //IE óò
            element.attachEvent(eventName, funcion);
        }
    }
}

function moveShip() {
    //left
    if (keyboard[37]) {
        ship.x -= 7;
        if (ship.x < 0) ship.x = 0;
    }
    //right
    if (keyboard[39]) {
        var limit = canvas.width - ship.width;
        ship.x += 7;
        if (ship.x > limit) ship.x = limit;
    }
    if(keyboard[32]){
        //shot
        if(!keyboard.fire){
            fire();
            keyboard.fire=true;
        }

    }
    else keyboard.fire=false;
    if(ship.state == 'hit'){
        ship.counter++;
        if(ship.counter >= 20){
            ship.counter = 0;
            ship.state = 'dead';
            game.state ='over';
            txtReply.title ='Game Over';
            txtReply.subtitle = 'Press the R key to continue';
            txtReply.counter = 0;
        }
    }
}
function drawShotsEnemies(){
    for(var i in shotsEnemies){
        var shot = shotsEnemies[i];
     //   ctx.save();not required if you have images or sprite to end coding
        ctx.fillStyle = 'yellow';
        ctx.drawImage(imgShotEnemy,shot.x, shot.y, shot.width, shot.height);
       // ctx.restore();not required if you have images or sprite to end coding       

    }

}
function moveShotsEnemies(){
    for(var i in shotsEnemies){
        var shot = shotsEnemies[i];
        shot.y += 3;
    }
    shotsEnemies = shotsEnemies.filter(function(shot){
        return shot.y < canvas.height;
    });
}


function updateEnemies(){
    function addShotsEnemies(enemy){
        return{
            x:enemy.x,
            y:enemy.y,
            width:10,
            height:33,
            counter:0

        }
    }
    
    if(game.state=='starting'){
        for(i=0;i<10;i++){
            enemies.push({
                x:10 + (i*50),
                y:10,
                height: 40,
                width: 40,
                state: 'alive',
                counter : 0
            })
        }
        game.state='playing';

    }
    for(var i in enemies){
        var enemy = enemies[i];
        if(!enemy) continue;
        if(enemy && enemy.state=='alive'){
            enemy.counter++;
            enemy.x += Math.sin(enemy.counter * Math.PI/90)*5;

            if(aleatory(0,enemies.length*10)==4){
                soundEnemyShot.pause();
                soundEnemyShot.currentTime = 0;
                soundEnemyShot.play();
                shotsEnemies.push(addShotsEnemies(enemy));

            }

        }
        if(enemy && enemy.state=='hit'){
            enemy.counter++;
            if(enemy.counter>=20){
                enemy.state ='dead';
                enemy.counter=0;
            }
        }
    }
    enemies=enemies.filter(function(enemy){
        if (enemy && enemy.state !='dead') return true;
        return false;

    })
}

function moveShots() {
    for (var i in shots) {
        var shot = shots[i];
        shot.y -= 2;
    }
    shots = shots.filter(function(shot) {
        return shot.y > 0;
    });
}

function fire() {
    //soundShot.pause();
    soundShot.currentTime = 0;
    soundShot.play();
    shots.push({
        x: ship.x + 20,
        y: ship.y - 10,
        width: 10,
        height: 30,
    });
}

function drawShots() {
    //ctx.save();not required if you have images or sprite to end coding
    for (var i in shots) {
        var shot = shots[i];
        ctx.drawImage(imgShot,shot.x, shot.y, shot.width, shot.height);
    }
    //ctx.restore();not required if you have images or sprite to end coding
}
function drawText(){
    if(txtReply.counter == -1) return;
    var alpha = txtReply.counter/50.0;
    if(alpha>1){
        for(var i in enemies){
            delete enemies[i];
        }
    }
    ctx.save();
    ctx.globalAlpha = alpha;
    if(game.state == 'over'){
        ctx.fillStyle= 'white';
        ctx.font = 'Bold 40pt Arial';
        ctx.fillText(txtReply.title, 140,200);
        ctx.font = '14pt Arial';
        ctx.fillText(txtReply.subtitle, 190,250);
    }
    if(game.state == 'victory'){
        ctx.fillStyle= 'white';
        ctx.font = 'Bold 40pt Arial';
        ctx.fillText(txtReply.title, 140,200);
        ctx.font = '14pt Arial';
        ctx.fillText(txtReply.subtitle, 190,250);
    }

}
function updateStateGame(){
    if(game.state == 'playing' && enemies.length == 0){
        game.state = 'victory';
        txtReply.title = 'You beat the enemies';
        txtReply.subtitle = 'press R key to restart';
        txtReply.counter = 0;
    }
    if(txtReply.counter >= 0){
        txtReply.counter++;
    }
    if((game.state == 'over' || game.state == 'victory') && keyboard[82]){
        game.state = 'starting';
        ship.state ='alive';
        txtReply.counter = -1
    }
}


function hit(a,b){//collision algorithm
    var hit=false;
    if(b.x + b.width >= a.x && b.x < a.x + a.width){
        if(b.y + b.height >= a.y && b.y < a.y + a.height){
            hit=true;
        }
    }
    if(b.x <= a.x && b.x + b.with >= a.x + a.width){
        if(b.y <= a.y && b.y + b.height >= a.y + a.height){
            hit=true;
        }

    }
    if(a.x <= b.x && a.x + a.with >= b.x + b.width){
        if(a.y <= a.y && a.y + a.height >= b.y + b.height){
            hit=true;
        }
    }
        return hit;
    }
    function verifyContact(){
        for(var i in shots){
            var shot = shots[i];
            for(j in enemies){
                var enemy = enemies[j];
                if (hit(shot,enemy)){
                    deadEnemy.pause();
                    deadEnemy.currentTime = 0;
                    deadEnemy.play();
                    enemy.state='hit';
                    enemy.counter=0;

                }
            }
        }
        if(ship.state=='hit' || ship.state=='dead') return;
        for( var i in shotsEnemies){
            var shot = shotsEnemies[i];
            if(hit(shot,ship)){
                   // deadEnemy.pause();
                    //deadEnemy.currentTime = 0;
                    deadShip.play();
                ship.state = 'hit';

            }
        }

    }

function aleatory(lower,higher){
    var odds = (higher - lower);
    var a = Math.random()*odds;
    a = Math.floor(a);
    return parseInt(lower)+a;
}

function frameLoop() {
    updateStateGame(); 
    moveShip();
    updateEnemies();
    moveShots();
    moveShotsEnemies();
    drawBackground();
    verifyContact();
    drawEnemies();
    drawShotsEnemies();
    drawShots();
    drawText();
    drawShip();
    
}

//functions execute

window.addEventListener ('load',init);
function init(){
    loadMedia();
    addKeyboardEvents();
}
