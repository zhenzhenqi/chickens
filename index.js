var me, repeller;
var vel_me = 0;
var vel_chicken = 0;
var fences, chickens;
var SCENE_W = 600;
var SCENE_H = 530;
var counter = 0; //dead chicken counter
var dangerDist = 50; //distance from human where chicken turns its direction
var r, g, b;
var meDied, started = false;

var captions = ["Now, Chicken catches you", "Game Over. Chicken Wins."];
var updateSpritesActived = false;



var data = null;


function preload() {

        data = loadJSON("data.json");

}

function setup() {
    var game = createCanvas(400, 600);
    game.parent('p5Container');

    //initial background color
    r = data.stage1.background.red;
    g = data.stage1.background.green;
    b = data.stage1.background.blue;

    me = createSprite(width / 2, height / 2 - 30); //create sprite at location 600, 300, width 50, height 100
    me.addAnimation("stand", data.stage1.player.stand);
    me.addAnimation("walk", data.stage1.player.walk[0], data.stage1.player.walk[1]);
    me.addAnimation("front", data.stage1.player.front[0], data.stage1.player.front[1]);
    me.addAnimation("back", data.stage1.player.back[0], data.stage1.player.back[1]);
    me.scale = 0.7;

    repeller = createSprite(me.position.x, me.position.y, 300, 300);
    repeller.visible = false;


    chickens = new Group();
    for (var i = 0; i < 20; i++) {
        //create a sprite and add the 3 animations
        var chicken = createSprite(random(0, SCENE_W), random(0, SCENE_H));
        chicken.addAnimation("walk", data.stage1.enemy.walk[0], data.stage1.enemy.walk[1] );
        chicken.addAnimation("front",  data.stage1.enemy.front[0],  data.stage1.enemy.front[1]);
        chicken.addAnimation("back",  data.stage1.enemy.back[0],  data.stage1.enemy.back[1]);
        chicken.velocity.x = random(data.stage1.enemy_speed - 1, data.stage1.enemy_speed + 2);
        chicken.velocity.y = 0;
        chickens.add(chicken);
    }

    fences = new Group();
    //create some background for visual reference
    for (var i = 28; i < SCENE_W; i += 80) {
        //create a sprite and add the 3 animations
        var fence_top = createSprite(i, -28);

        var fence_bottom = createSprite(i, SCENE_H + 28);
        fence_top.addAnimation("normal", data.setup.fence.horizontal);
        fence_bottom.addAnimation("normal", data.setup.fence.horizontal);
        fences.add(fence_top);
        fences.add(fence_bottom);
    }

    for (var i = 30; i < SCENE_H; i += 80) {
        //create a sprite and add the 3 animations
        var fence_left = createSprite(-28, i);
        var fence_right = createSprite(SCENE_W + 28, i);
        fence_left.addAnimation("normal", data.setup.fence.vertical);
        fence_right.addAnimation("normal", data.setup.fence.vertical);
        fences.add(fence_left);
        fences.add(fence_right);
    }

    updateSprites(false);

} //end of setup

function draw() {
    //keypad control for human
    if (keyIsDown(RIGHT_ARROW)) {
        me.changeAnimation('walk');
        me.mirrorX(1);
        me.velocity.x = vel_me;
        me.velocity.y = 0;
    } else if (keyIsDown(LEFT_ARROW)) {
        me.changeAnimation('walk');
        me.mirrorX(-1);
        me.velocity.x = -vel_me;
        me.velocity.y = 0;
    } else if (keyIsDown(UP_ARROW)) {
        me.changeAnimation('back');
        me.velocity.x = 0;
        me.velocity.y = -vel_me;
    } else if (keyIsDown(DOWN_ARROW)) {
        me.changeAnimation('front');
        me.velocity.x = 0;
        me.velocity.y = vel_me;
    } else {
        me.changeAnimation('stand');
        me.velocity.x = 0;
        me.velocity.y = 0;
    }

    //map chicken animation to current direction
    for (var i = 0; i < chickens.length; i++) {
        //link chicken velocity to animation
        if (chickens[i].velocity.x == 0 && chickens[i].velocity.y != 0) {
            if (chickens[i].velocity.y > 0) {
                chickens[i].changeAnimation("front");
            } else {
                chickens[i].changeAnimation("back");
            }
        } else {
            //chicken walking towards right
            if (chickens[i].velocity.x > 0) {
                chickens[i].changeAnimation("walk");
                chickens[i].mirrorX(1);
                //chicken walking towards left
            } else {
                chickens[i].changeAnimation("walk");
                chickens[i].mirrorX(-1);
            }
        }
    }

    //chicken and human collide fences
    chickens.collide(fences, reverseDir);
    me.collide(fences);

    
    //map all sprites based on y position
    for (var i = 0; i < allSprites.length; i++) {
        allSprites[i].depth = allSprites[i].position.y;
    }

    /***draw all game elements***/
    background(r, g, b);

    camera.on();
    noStroke();
    fill(0, 0, 0, 60);
    ellipse(me.position.x, me.position.y + 50, 50, 20);
    fill(0, 0, 0, 40);
    for (var i = 0; i < chickens.length; i++) {
        ellipse(chickens[i].position.x, chickens[i].position.y + 30, 45, 18);
    }
    drawSprites();

    ////////////////////switch game stage////////////////////////
    if (started) {
        $("#caption").hide();
        $("#chicken").show();

        if (!updateSpritesActived) {
            updateSprites(true);
            updateSpritesActived = true;
        }
    }
    if (chickens.length > 1) { //man chase chicken
        //print number of chicken caught
        vel_me = data.stage1.player_speed;
        document.getElementById('chicken').innerHTML = counter + " chickens caught ";
        camera.position.x = me.position.x;
        camera.position.y = me.position.y;

        repeller.position.y = me.position.y;
        repeller.position.x = me.position.x;

        repeller.overlap(chickens, turn);
        me.overlap(chickens, die_chickens);

    } else { //chicken chase man
        document.getElementById("chicken").innerHTML = captions[0];
        vel_me = data.stage2.player_speed;
        vel_chicken = data.stage2.player_speed;
        if (!meDied) {
            camera.position.x = me.position.x;
            camera.position.y = me.position.y;
            repeller.remove();
            chickens.collide(me, die_me);
            r = data.stage2.background.red;
            g = data.stage2.background.green;
            b = data.stage2.background.blue;
            vel_me = 10;

            for (var i = 0; i < chickens.length; i++) {

                var absX = abs(me.position.x - chickens[i].position.x);
                var absY = abs(me.position.y - chickens[i].position.y);
                var dirX = (me.position.x - chickens[i].position.x) / absX;
                var dirY = (me.position.y - chickens[i].position.y) / absY;

                if (absX > absY) {
                    chickens[i].velocity.x = dirX * vel_chicken;
                    chickens[i].velocity.y = 0;
                } else {

                    chickens[i].velocity.x = 0;
                    chickens[i].velocity.y = dirY * vel_chicken;
                }
            }
            chickens.overlap(me, die_me);

        } else {
            //game over
            $("#chicken").hide();
            $("#caption").show();
            $("#caption").css("background-color", "transparent");
            document.getElementById("caption").innerHTML = captions[1];

            r = data.gameOver.background.red;
            g = data.gameOver.background.green;
            b = data.gameOver.background.blue;

            //chicken walks around
            camera.position.x = width / 2;
            camera.position.y = height / 2;
        }
    }

}

function resumeGame() {
    $("#caption").show();
    updateSprites(false);
}

function die_chickens(collector, collected) {
    collected.remove();
    counter++;
}

function die_me(collector, collected) {
    collected.remove();
    meDied = true;
}

function turn(collector, collected) {
    if (millis() - collected.timer >= 500) {
        var temp = collected.velocity.x;
        collected.velocity.x = collected.velocity.y;
        collected.velocity.y = temp;
        collected.setTimer();
    }
}

function reverseDir(collector, collected) {
    collector.velocity.x = -collector.velocity.x;
    collector.velocity.y = -collector.velocity.y;
}

function mouseClicked() {
    started = true;
}