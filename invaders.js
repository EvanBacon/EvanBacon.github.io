

$(function() {
  var height = $(window).height();
  var width = $(window).width();

  var game = new Phaser.Game(width, height , Phaser.WEBGL, 'phaser-example', { preload: preload, create: create, update: update, render: render });
  // game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
  // game.stage.scaleMode = Phaser.ScaleManager.SHOW_ALL; //resize your window to see the stage resize toogame.stage.scale.setShowAll();game.stage.scale.refresh();


  function resizeGame() {
    var height = $(window).height();
    var width = $(window).width();
    game.width = width;
    game.height = height;
    game.stage.bounds.width = width;
    game.stage.bounds.height = height;
    if (game.renderType === Phaser.WEBGL){
      game.renderer.resize(width, height);
    }
  }


  $(window).resize(function() {
    resizeGame();
  });

  function preload() {

    // game.load.image('bullet', 'invaders/bullet.png');
    game.load.image('bullet', 'invaders/cone.png');
    game.load.image('enemyBullet', 'invaders/enemy-bullet.png');
    game.load.image('invader', 'invaders/drake.png');

    // game.load.spritesheet('invader', 'invaders/invader32x32x4.png', 32, 32);
    game.load.image('ship', 'invaders/gucci.png');
    game.load.spritesheet('kaboom', 'invaders/explode.png', 128, 128);
    game.load.image('starfield', 'invaders/starfield.png');
    game.load.image('background', 'invaders/background.png');

  }

  var player;
  var aliens;
  var bullets;
  var bulletTime = 0;
  var cursors;
  var fireButton;
  var explosions;
  var starfield;
  var score = 0;
  var scoreString = '';
  var scoreText;
  var lives;
  var enemyBullet;
  var firingTimer = 0;
  var stateText;
  var livingEnemies = [];

  function create() {

    game.physics.startSystem(Phaser.Physics.ARCADE);
    var height = $(window).height();
    var width = $(window).width();


    //  The scrolling starfield background
    starfield = game.add.tileSprite(0, 0, width, height, 'starfield');

    //  Our bullet group
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(30, 'bullet');
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 1);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);

    // The enemy's bullets
    enemyBullets = game.add.group();
    enemyBullets.enableBody = true;
    enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
    enemyBullets.createMultiple(30, 'enemyBullet');
    enemyBullets.setAll('anchor.x', 0.5);
    enemyBullets.setAll('anchor.y', 1);
    enemyBullets.setAll('outOfBoundsKill', true);
    enemyBullets.setAll('checkWorldBounds', true);

    //  The hero!
    player = game.add.sprite(game.width/2, game.height * 0.8, 'ship');
    player.width = Math.min(game.width, game.height) * 0.1;
    player.height = player.width;
    player.anchor.setTo(0.5, 0.5);
    game.physics.enable(player, Phaser.Physics.ARCADE);

    //  The baddies!
    aliens = game.add.group();
    aliens.enableBody = true;
    aliens.physicsBodyType = Phaser.Physics.ARCADE;

    createAliens();

    //  The score
    scoreString = 'Score : ';
    scoreText = game.add.text(10, 10, scoreString + score, { font: '34px Arial', fill: '#fff' });

    //  Lives
    lives = game.add.group();
    game.add.text(game.world.width - 120, 10, 'Lives : ', { font: '34px Arial', fill: '#fff' });

    //  Text
    stateText = game.add.text(game.world.centerX,game.world.centerY,' ', { font: '84px Arial', fill: '#fff' });
    stateText.anchor.setTo(0.5, 0.5);
    stateText.visible = false;

    for (var i = 0; i < 3; i++)
    {
      var ship = lives.create(game.world.width - 100 + (30 * i), 60, 'ship');
      ship.anchor.setTo(0.5, 0.5);
      ship.angle = 90;
      ship.alpha = 0.4;
    }

    //  An explosion pool
    explosions = game.add.group();
    explosions.createMultiple(30, 'kaboom');
    explosions.forEach(setupInvader, this);

    //  And some controls to play the game with
    cursors = game.input.keyboard.createCursorKeys();
    fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

  }

  function createAliens () {

    function configGen() {

      let config = [
        [
          [0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0],
          [1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1],
          [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
          [1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1],
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
          [0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0],
          [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
        ],
        [
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [1, 1, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0],
          [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0],
          [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0],
          [1, 1, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ],
        [
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        ],
        [
              [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
              [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
              [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
              [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
              [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
              [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
              [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
              [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
            ],
            [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ],
        [
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ],
      ];

      let length = config.length - 1;
      let index = Math.floor((Math.random() * length) + 0);
      return config[index];
    }

    let config = configGen();

    let size =  Math.min(game.width, game.height) * 0.08;
    for (var row = 0; row < config.length; row++)
    {
      let rowVal = config[row];
      for (var col = 0; col < rowVal.length; col++)
      {
        let colVal = rowVal[col];

        if (colVal == 0) continue;
        var alien = aliens.create(col * size, row * size, 'invader');
        alien.width = size;
        alien.height = size;
        alien.anchor.setTo(0.5, 0.5);
        // alien.animations.add('fly', [ 0, 1, 2, 3 ], 20, true);
        game.add.tween(alien).to({ angle: 45 }, 2000, function(k) {                return Math.sin(Math.PI * 2 * k);            }, true, 0, -1);
        // alien.play('fly');
        alien.body.moves = false;
      }
    }

    let point = (game.width / 2) - (aliens.width/2);
    console.log(aliens.width/2);
    aliens.x = point;
    aliens.y = 50;

    //  All this does is basically start the invaders moving. Notice we're moving the Group they belong to, rather than the invaders directly.
    var tween = game.add.tween(aliens).to( { x: point + size }, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);

    //  When the tween loops it calls descend
    tween.onLoop.add(descend, this);
  }

  function setupInvader (invader) {

    invader.anchor.x = 0.5;
    invader.anchor.y = 0.5;
    invader.animations.add('kaboom');

  }

  function descend() {

    aliens.y += 10;

  }
  function update() {

    //  Scroll the background
    starfield.tilePosition.y += 2;

    if (player.alive)
    {
      //  Reset the player, then check for movement keys
      player.body.velocity.setTo(0, 0);

      let speed = 200;
      let rotationSpeed = 200;

      if (game.input.pointer1.isDown) {
        if (game.input.pointer1.x < game.width/2) {
          player.body.velocity.x = -speed;
          player.body.angularVelocity = -rotationSpeed;
        } else if (game.input.pointer1.x > game.width/2) {
          player.body.angularVelocity = rotationSpeed;

          player.body.velocity.x = speed;
        } else {
          player.body.angularVelocity = 0;
        }
      } else {
        player.body.angularVelocity = 0;

      }

      if (cursors.left.isDown)
      {
        player.body.velocity.x = -speed;
      }
      else if (cursors.right.isDown)
      {
        player.body.velocity.x = speed;
      }

      //  Firing?
      if (fireButton.isDown)
      {
        fireBullet();
      }

      if (game.time.now > firingTimer)
      {
        enemyFires();
      }

      //  Run collision
      game.physics.arcade.overlap(bullets, aliens, collisionHandler, null, this);
      game.physics.arcade.overlap(enemyBullets, player, enemyHitsPlayer, null, this);
    }

  }

  function render() {

    // for (var i = 0; i < aliens.length; i++)
    // {
    //     game.debug.body(aliens.children[i]);
    // }

  }

  function collisionHandler (bullet, alien) {

    //  When a bullet hits an alien we kill them both
    bullet.kill();
    alien.kill();

    //  Increase the score
    score += 20;
    scoreText.text = scoreString + score;

    //  And create an explosion :)
    var explosion = explosions.getFirstExists(false);
    explosion.reset(alien.body.x, alien.body.y);
    explosion.play('kaboom', 30, false, true);

    if (aliens.countLiving() == 0)
    {
      score += 1000;
      scoreText.text = scoreString + score;

      enemyBullets.callAll('kill',this);
      stateText.text = " You Won, \n Tap to restart";
      stateText.visible = true;

      //the "click to restart" handler
      game.input.onTap.addOnce(restart,this);
    }

  }

  function enemyHitsPlayer (player,bullet) {

    bullet.kill();

    live = lives.getFirstAlive();

    if (live)
    {
      live.kill();
    }

    //  And create an explosion :)
    var explosion = explosions.getFirstExists(false);
    explosion.reset(player.body.x, player.body.y);
    explosion.play('kaboom', 30, false, true);

    // When the player dies
    if (lives.countLiving() < 1)
    {
      player.kill();
      enemyBullets.callAll('kill');

      stateText.text=" GAME OVER \n Tap to restart";
      stateText.visible = true;

      //the "click to restart" handler
      game.input.onTap.addOnce(restart,this);
    }

  }

  function enemyFires () {

    //  Grab the first bullet we can from the pool
    enemyBullet = enemyBullets.getFirstExists(false);

    livingEnemies.length=0;

    aliens.forEachAlive(function(alien){

      // put every living enemy in an array
      livingEnemies.push(alien);
    });


    if (enemyBullet && livingEnemies.length > 0)
    {

      var random=game.rnd.integerInRange(0,livingEnemies.length-1);

      // randomly select one of them
      var shooter=livingEnemies[random];
      // And fire the bullet from this enemy
      enemyBullet.reset(shooter.body.x, shooter.body.y);

      game.physics.arcade.moveToObject(enemyBullet,player,120);
      firingTimer = game.time.now + 2000;
    }

  }

  function fireBullet () {

    //  To avoid them being allowed to fire too fast we set a time limit
    if (game.time.now > bulletTime)
    {
      //  Grab the first bullet we can from the pool
      bullet = bullets.getFirstExists(false);

      if (bullet)
      {
        //  And fire it
        bullet.reset(player.x, player.y + 8);
        bullet.body.velocity.y = -400;
        bulletTime = game.time.now + 200;
      }
    }

  }

  function resetBullet (bullet) {

    //  Called if the bullet goes out of the screen
    bullet.kill();

  }

  function restart () {

    //  A new level starts

    //resets the life count
    lives.callAll('revive');
    //  And brings the aliens back from the dead :)
    aliens.removeAll();
    createAliens();

    //revives the player
    player.revive();
    //hides the text
    stateText.visible = false;

  }
});
