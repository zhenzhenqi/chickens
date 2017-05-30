var me, repeller;
var vel_me = 3;
var vel_chicken = 5;
var fences, chickens;
var SCENE_W = 600;
var SCENE_H = 530;
var counter = 0; //dead chicken counter
var dangerDist = 50; //distance from human where chicken turns its direction
var r, g, b;
var meDied = false;


//function preload() {
//    bff = loadAnimation("assets/asterisk_explode0001.png", "assets/asterisk_explode0011.png");
//}

function setup() {
    var game = createCanvas(400, 600);
    game.parent('p5Container');

    //initial background color
    r = 58;
    g = 207;
    b = 201;

    me = createSprite(width / 2, height / 2 - 30); //create sprite at location 600, 300, width 50, height 100
    me.addAnimation("stand", "assets/yw_front.png");
    me.addAnimation("walk", "assets/yw_walk1.png", "assets/yw_walk2.png");
    me.addAnimation("front", "assets/yw_front1.png", "assets/yw_front2.png");
    me.addAnimation("back", "assets/yw_back1.png", "assets/yw_back2.png");
    me.scale = 0.7;

    repeller = createSprite(me.position.x, me.position.y, 300, 300);
    repeller.visible = false;


    chickens = new Group();
    for (var i = 0; i < 20; i++) {
        //create a sprite and add the 3 animations
        var chicken = createSprite(random(0, SCENE_W), random(0, SCENE_H));
        chicken.addAnimation("walk", "assets/chicken_walk1.png", "assets/chicken_walk2.png");
        chicken.addAnimation("front", "assets/chicken_front1.png", "assets/chicken_front2.png");
        chicken.addAnimation("back", "assets/chicken_back1.png", "assets/chicken_back2.png");
        chicken.velocity.x = random(vel_chicken - 1, vel_chicken + 2);
        chicken.velocity.y = 0;
        chickens.add(chicken);
    }

    fences = new Group();
    //create some background for visual reference
    for (var i = 28; i < SCENE_W; i += 80) {
        //create a sprite and add the 3 animations
        var fence_top = createSprite(i, -28);

        var fence_bottom = createSprite(i, SCENE_H + 28);
        fence_top.addAnimation("normal", "assets/fence_hori.png");
        fence_bottom.addAnimation("normal", "assets/fence_hori.png");
        fences.add(fence_top);
        fences.add(fence_bottom);
    }

    for (var i = 30; i < SCENE_H; i += 80) {
        //create a sprite and add the 3 animations
        var fence_left = createSprite(-28, i);
        var fence_right = createSprite(SCENE_W + 28, i);
        fence_left.addAnimation("normal", "assets/fence_verti.png");
        fence_right.addAnimation("normal", "assets/fence_verti.png");
        fences.add(fence_left);
        fences.add(fence_right);
    }
}

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

    //switch game stage
    if (chickens.length > 1) {
        //man chase chicken
        camera.position.x = me.position.x;
        camera.position.y = me.position.y;

        repeller.position.y = me.position.y;
        repeller.position.x = me.position.x;

        repeller.overlap(chickens, turn);
        me.overlap(chickens, die_chickens);

    } else {
        //chicken chase man
        if (!meDied) {
            camera.position.x = me.position.x;
            camera.position.y = me.position.y;
            repeller.remove();
            chickens.collide(me, die_me);

            r = 200;
            g = 0;
            b = 200;
            vel_me = 10;
            
            for (var i = 0; i < chickens.length; i++) {
             
                var absX = abs(me.position.x - chickens[i].position.x);
                var absY = abs(me.position.y - chickens[i].position.y);
                var dirX = (me.position.x - chickens[i].position.x)/absX;
                var dirY = (me.position.y - chickens[i].position.y)/absY;
                
                if(absX > absY){
                    chickens[i].velocity.x = dirX * vel_chicken;
                    chickens[i].velocity.y = 0;
                }else{
                    
                    chickens[i].velocity.x = 0;
                    chickens[i].velocity.y = dirY * vel_chicken;
                    document.getElementById('debug').innerHTML =chickens[i].velocity.x + " "+ chickens[i].velocity.y; 
                }
            }
            chickens.overlap(me, die_me);

        } else {
            r = 10;
            g = 10;
            b = 10;

            //chicken walks around
            camera.position.x = width / 2;
            camera.position.y = height / 2;
        }
    }


    //print number of chicken caught
    document.getElementById('chicken').innerHTML = counter + " chickens caught ";

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