$(function() {
  var height = $(window).height();
  var width = $(window).width();

  var game = new Phaser.Game(width, height, Phaser.WEBGL, 'phaser-example', {
    preload: preload,
    create: create,
    update: update,
    render: render,
  });
  // game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
  // game.stage.scaleMode = Phaser.ScaleManager.SHOW_ALL; //resize your window to see the stage resize toogame.stage.scale.setShowAll();game.stage.scale.refresh();
  var player;

  if (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    )
  ) {
    // some code..

    let speed = 200;
    gyro.frequency = 10;
    // start gyroscope detection
    gyro.startTracking(o => {
      // updating player velocity
      if (player != undefined) {
        player.body.velocity.setTo(0, 0);

        let amount = Math.min(
          speed,
          Math.max(-speed, speed * Math.floor(o.gamma / 20)),
        );
        player.body.velocity.x = amount;
        player.body.angularVelocity = amount / 2;
      }
      //  player.body.velocity.y += o.beta/20;
    });
  }
  function resizeGame() {
    var height = $(window).height();
    var width = $(window).width();
    game.width = width;
    game.height = height;
    game.stage.bounds.width = width;
    game.stage.bounds.height = height;
    if (game.renderType === Phaser.WEBGL) {
      game.renderer.resize(width, height);
    }
  }

  $(window).resize(function() {
    resizeGame();
  });

  function preload() {
    // game.load.image('bullet', 'invaders/bullet.png');
    game.load.image('bullet', 'invaders/cone.png');
    // game.load.image('enemyBullet', 'invaders/enemy-bullet.png');
    game.load.image('enemyBullet', 'invaders/disc.png');
    game.load.image('drake', 'invaders/trap/drake.png');
    game.load.image('future', 'invaders/trap/future.png');
    game.load.image('nicki', 'invaders/trap/nicki.png');
    game.load.image('quavo', 'invaders/trap/quavo.png');
    game.load.image('takeoff', 'invaders/trap/takeoff.png');
    game.load.image('pump', 'invaders/trap/pump.png');

    game.load.audio('brr', 'invaders/audio/brr.mp3');

    // game.load.audio('gucci_1', 'invaders/audio/gucci_1.ogg');
    game.load.audio('gucci_2', 'invaders/audio/gucci_2.ogg');
    game.load.audio('gucci_3', 'invaders/audio/gucci_3.ogg');
    // game.load.audio('gucci_4', 'invaders/audio/gucci_4.ogg');
    // game.load.audio('gucci_5', 'invaders/audio/gucci_5.ogg');

    // game.load.spritesheet('invader', 'invaders/invader32x32x4.png', 32, 32);
    game.load.image('ship', 'invaders/trap/gucci.png');
    game.load.spritesheet('kaboom', 'invaders/explode.png', 128, 128);
    game.load.image('starfield', 'invaders/starfield.png');
    game.load.image('background', 'invaders/background.png');
  }
  let gucciSound = {};

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

  function showTextAtPoint(data) {
    let font = data.font;
    if (font == undefined) {
      font = '30px Arial';
    }

    text = game.add.text(data.x, data.y, data.text, {
      font: font,
      fill: data.fill,
      align: 'center',
      boundsAlignV: 'middle',
    });
    text.anchor.set(0.5);

    time = 1000;
    game.add
      .tween(text)
      .to({ y: data.y - 40 }, time, Phaser.Easing.Linear.None, true);
    game.add
      .tween(text)
      .to({ alpha: 0 }, time, Phaser.Easing.Linear.None, true);
  }

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

    let bulletHeight = Math.min(game.width, game.height) * 0.1;
    bullets.setAll('width', bulletHeight * 0.6);
    bullets.setAll('height', bulletHeight);

    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);

    gucciSound['1'] = game.add.audio('brr');

    // gucciSound['1'] = game.add.audio('gucci_1');
    gucciSound['2'] = game.add.audio('gucci_2');
    gucciSound['3'] = game.add.audio('gucci_3');
    // gucciSound['4'] = game.add.audio('gucci_4');
    // gucciSound['5'] = game.add.audio('gucci_5');

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
    player = game.add.sprite(game.width / 2, game.height * 0.8, 'ship');
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
    scoreText = game.add.text(10, 10, scoreString + score, {
      font: '34px Arial',
      fill: '#fff',
    });
    scoreText.setShadow(3, 3, 'rgba(0,0,0,0.2)', 2);

    //  Lives
    lives = game.add.group();
    livesText = game.add.text(game.world.width - 120, 10, 'Lives : ', {
      font: '34px Arial',
      fill: '#fff',
    });
    livesText.setShadow(3, 3, 'rgba(0,0,0,0.2)', 2);

    title = game.add.text(
      game.world.width / 2,
      game.world.height - 40,
      'GUCCI PEW',
      {
        font: 'bold 48px Arial',
        fill: '#fff',
        align: 'center',
        boundsAlignV: 'middle',
      },
    );
    title.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
    title.anchor.set(0.5);

    game.add.text(8, game.height - 30, 'by evan bacon @baconbrix', {
      font: '20px Arial',
      fill: '#fff',
      align: 'center',
      boundsAlignV: 'middle',
    });

    game.add.text(game.width - 180, game.height - 30, 'turn the volume up', {
      font: '20px Arial',
      fill: '#fff',
      align: 'right',
      boundsAlignH: 'right',
      boundsAlignV: 'middle',
    });

    //  Text
    stateText = game.add.text(game.world.centerX, game.world.centerY, ' ', {
      font: '84px Arial',
      fill: '#fff',
    });
    stateText.anchor.setTo(0.5, 0.5);
    stateText.visible = false;

    let liveSize = Math.min(game.width, game.height) * 0.06;
    for (var i = 0; i < 3; i++) {
      var ship = lives.create(
        game.world.width - liveSize * (i + 0.5) - 20,
        80,
        'ship',
      );
      ship.anchor.setTo(0.5, 0.5);
      ship.angle = 90;
      ship.alpha = 0.4;
      ship.width = liveSize;
      ship.height = liveSize;
    }

    //  An explosion pool
    explosions = game.add.group();
    explosions.createMultiple(30, 'kaboom');
    explosions.forEach(setupInvader, this);

    //  And some controls to play the game with
    cursors = game.input.keyboard.createCursorKeys();
    fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
  }

  function createAliens() {
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
          [0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0],
          [1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1],
          [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
          [1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1],
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
          [0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0],
          [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
          [0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0],
          [1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1],
          [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
          [1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1],
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
          [0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0],
          [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
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
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [1, 1, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0],
          [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0],
          [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0],
          [1, 1, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [1, 1, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0],
          [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0],
          [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0],
          [1, 1, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [1, 1, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0],
          [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0],
          [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0],
          [1, 1, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [1, 1, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0],
          [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0],
          [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0],
          [1, 1, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
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
          [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
          [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
          [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
          [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
          [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
          [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
          [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
          [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
          [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
          [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
          [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
          [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
          [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
          [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
          [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
          [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
          [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
          [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
          [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
          [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
          [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
          [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
          [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
          [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
          [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
          [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
          [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
          [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
          [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
          [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
          [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
          [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
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
          [0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0],
          [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
          [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
          [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
          [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
          [0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
          [0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0],
          [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
          [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
          [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
          [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
          [0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0],
          [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
          [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
          [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
          [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
          [0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
          [0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0],
          [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
          [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
          [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
          [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
          [0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
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
      let index = Math.floor(Math.random() * length + 0);
      return config[index];
    }

    let config = configGen();
    let invaders = ['future', 'drake', 'nicki', 'quavo', 'takeoff', 'pump'];
    let size = Math.min(game.width, game.height) * 0.08;
    for (var row = 0; row < config.length; row++) {
      let rowVal = config[row];
      for (var col = 0; col < rowVal.length; col++) {
        let colVal = rowVal[col];

        if (colVal == 0) continue;

        let index = Math.floor(Math.random() * invaders.length + 0);

        let texture = invaders[index];
        var alien = aliens.create(col * size, -(row * size), texture);
        alien.width = size;
        alien.height = size;
        alien.anchor.setTo(0.5, 0.5);
        // alien.animations.add('fly', [ 0, 1, 2, 3 ], 20, true);
        game.add.tween(alien).to(
          { angle: 45 },
          2000,
          function(k) {
            return Math.sin(Math.PI * 2 * k);
          },
          true,
          0,
          -1,
        );
        // alien.play('fly');
        alien.body.moves = false;
      }
    }

    let point = game.width / 2 - aliens.width / 2;
    console.log(aliens.width / 2);
    aliens.x = point;
    aliens.y = 50;

    //  All this does is basically start the invaders moving. Notice we're moving the Group they belong to, rather than the invaders directly.
    var tween = game.add
      .tween(aliens)
      .to(
        { x: point + size },
        2000,
        Phaser.Easing.Linear.None,
        true,
        0,
        1000,
        true,
      );

    //  When the tween loops it calls descend
    tween.onLoop.add(descend, this);
  }

  function setupInvader(invader) {
    invader.anchor.x = 0.5;
    invader.anchor.y = 0.5;
    invader.animations.add('kaboom');
  }

  function descend() {
    let size = Math.min(game.width, game.height) * 0.08;

    aliens.y += size;
  }
  function update() {
    //  Scroll the background
    starfield.tilePosition.y += 2;

    if (player.alive) {
      if (player.position.x > game.width) {
        player.position.x = 0;
      } else if (player.position.x < 0) {
        player.position.x = game.width;
      }
      //  Reset the player, then check for movement keys
      player.body.velocity.setTo(0, 0);

      let speed = 200;
      let rotationSpeed = 200;

      if (game.input.pointer1.isDown) {
        fireBullet();
      }

      if (cursors.left.isDown) {
        player.body.angularVelocity = -rotationSpeed / 2;
        player.body.velocity.x = -speed;
      } else if (cursors.right.isDown) {
        player.body.angularVelocity = rotationSpeed / 2;
        player.body.velocity.x = speed;
      } else {
        player.body.angularVelocity = 0;
      }

      //  Firing?
      if (fireButton.isDown) {
        fireBullet();
      }

      if (game.time.now > firingTimer) {
        enemyFires();
      }

      //  Run collision
      game.physics.arcade.overlap(
        bullets,
        aliens,
        collisionHandler,
        null,
        this,
      );
      game.physics.arcade.overlap(
        enemyBullets,
        player,
        enemyHitsPlayer,
        null,
        this,
      );
    }
  }

  function render() {
    // for (var i = 0; i < aliens.length; i++) {
    //   game.debug.body(aliens.children[i]);
    // }
    // for (var i = 0; i < bullets.length; i++) {
    //   game.debug.body(bullets.children[i]);
    // }
    // for (var i = 0; i < enemyBullets.length; i++) {
    //   game.debug.body(enemyBullets.children[i]);
    // }
    // game.debug.body(player);
  }

  textIndex = 0;
  function collisionHandler(bullet, alien) {
    //  When a bullet hits an alien we kill them both
    bullet.kill();
    alien.kill();

    //  Increase the score
    score += 20;
    scoreText.text = scoreString + score;

    let phrases = [
      'IZ GUCCI!',
      'YEAAAHH',
      'BURR',
      'DAYUM',
      'HUUH!',
      'WIZOP!',
      'GUWOP',
    ];
    let index = Math.floor(Math.random() * phrases.length + 0);

    textIndex += 1;

    showTextAtPoint({
      x: player.position.x - 150 + (textIndex % 3) * 150,
      y: player.position.y,
      text: phrases[index],
      fill: '#fff',
    });

    let keys = Object.keys(gucciSound);
    gucciSound['2'].play();
    // gucciSound[keys[Math.floor(Math.random() * keys.length + 0)]].play();
    //
    //  And create an explosion :)
    var explosion = explosions.getFirstExists(false);
    explosion.reset(alien.body.x, alien.body.y);
    explosion.play('kaboom', 30, false, true);

    if (aliens.countLiving() == 0) {
      score += 1000;
      scoreText.text = scoreString + score;

      enemyBullets.callAll('kill', this);
      stateText.text = ' You Won, \n Tap to restart';
      stateText.visible = true;
      stateText.anchor.set(0.5);

      //the "click to restart" handler
      game.input.onTap.addOnce(restart, this);
    }
  }

  function enemyHitsPlayer(player, bullet) {
    bullet.kill();

    live = lives.getFirstAlive();

    if (live) {
      live.kill();
    }

    showTextAtPoint({
      x: player.position.x,
      y: player.position.y,
      text: 'WIZOP',
      fill: '#aa1515',
    });

    //  And create an explosion :)
    var explosion = explosions.getFirstExists(false);
    explosion.reset(player.body.x, player.body.y);
    explosion.play('kaboom', 30, false, true);

    // When the player dies
    if (lives.countLiving() < 1) {
      gucciSound['3'].play();
      player.kill();
      enemyBullets.callAll('kill');
      stateText.text = ' GAME OVER \n Tap to restart';
      stateText.visible = true;
      stateText.anchor.set(0.5);

      //the "click to restart" handler
      game.input.onTap.addOnce(restart, this);
    } else {
      gucciSound['1'].play();
    }
  }

  let allEnemyPhrases = {
    future: ['FUUSH', 'HENDRIX', 'SUPA FUTURE', 'AYY'],
    drake: ['OVO', 'YOUNG MONEY', 'WORST'],
    nicki: ['HO'],
    quavo: ['MAMA', 'MOMMY'],
    takeoff: ['IAINLEFT', 'DO IT LOOK LIKE', 'OFF BAD & BOOJIE'],
    pump: ['GUUCCII', 'ESKETIT'],
  };

  function enemyFires() {
    //  Grab the first bullet we can from the pool
    enemyBullet = enemyBullets.getFirstExists(false);

    livingEnemies.length = 0;

    aliens.forEachAlive(function(alien) {
      // put every living enemy in an array
      livingEnemies.push(alien);
    });

    if (enemyBullet && livingEnemies.length > 0) {
      var random = game.rnd.integerInRange(
        0,
        Math.min(12, livingEnemies.length - 1),
      );

      // randomly select one of them
      var shooter = livingEnemies[random];
      // And fire the bullet from this enemy

      let enemyPhrases = allEnemyPhrases[shooter.key];
      let index = Math.floor(Math.random() * enemyPhrases.length + 0);
      console.log(enemyPhrases[index]);
      showTextAtPoint({
        x: shooter.body.x,
        y: shooter.body.y,
        text: enemyPhrases[index],
        fill: '#aa1515',
        font: '50px Arial',
      });

      enemyBullet.reset(shooter.body.x, shooter.body.y);

      let bulletHeight = Math.min(game.width, game.height) * 0.1;
      let _size = bulletHeight * 0.6;
      enemyBullet.body.setSize(_size, _size);
      enemyBullet.width = enemyBullet.height = _size;
      game.physics.arcade.moveToObject(enemyBullet, player, 120);
      firingTimer = game.time.now + 2000;
    }
  }

  function fireBullet() {
    //  To avoid them being allowed to fire too fast we set a time limit
    if (game.time.now > bulletTime) {
      //  Grab the first bullet we can from the pool
      bullet = bullets.getFirstExists(false);

      if (bullet) {
        //  And fire it
        bullet.reset(player.x, player.y + 8);
        bullet.body.velocity.y = -400;
        bullet.body.setSize(bullet.width * 2, bullet.height * 2);
        bulletTime = game.time.now + 200;
      }
    }
  }

  function resetBullet(bullet) {
    //  Called if the bullet goes out of the screen
    bullet.kill();
  }

  function restart() {
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
