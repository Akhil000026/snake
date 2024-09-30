// src/main.js
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 800,
    parent: 'game-container',
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

function preload() {
    // Assets will be loaded here
}

function create() {
    // Initialize game objects here
}

function update(time, delta) {
    // Game loop logic here
}
// src/main.js (continued)

function preload() {
    // Load board image
    this.load.image('board', 'assets/images/board.png');

    // Load player tokens
    this.load.image('token_red', 'assets/images/token_red.png');
    this.load.image('token_blue', 'assets/images/token_blue.png');

    // Load dice images
    this.load.spritesheet('dice', 'assets/sprites/dice.png', { frameWidth: 64, frameHeight: 64 });

    // Load any other assets as needed
}
// src/main.js (continued)

function create() {
    // Add the board image
    this.add.image(400, 400, 'board');

    // Initialize players
    this.players = [
        {
            name: 'Player 1',
            token: this.add.image(50, 750, 'token_red').setScale(0.5),
            position: 0
        },
        {
            name: 'Player 2',
            token: this.add.image(100, 750, 'token_blue').setScale(0.5),
            position: 0
        }
    ];

    // Initialize snakes and ladders (positions)
    this.snakes = {
        16: 6,
        47: 26,
        49: 11,
        56: 53,
        62: 19,
        64: 60,
        87: 24,
        93: 73,
        95: 75,
        98: 78
    };

    this.ladders = {
        1: 38,
        4: 14,
        9: 31,
        21: 42,
        28: 84,
        36: 44,
        51: 67,
        71: 91,
        80: 100
    };

    // Current player index
    this.currentPlayer = 0;

    // Add UI elements like dice and buttons here
    setupDice(this);
    setupRollButton(this);
}
// src/main.js (continued)

function setupDice(scene) {
    // Add dice sprite (initially showing face 1)
    scene.dice = scene.add.sprite(700, 100, 'dice').setInteractive();

    // Create an animation for rolling dice
    scene.anims.create({
        key: 'roll',
        frames: scene.anims.generateFrameNumbers('dice', { start: 0, end: 5 }),
        frameRate: 10,
        repeat: 0
    });
}

function setupRollButton(scene) {
    // Create a roll button
    scene.rollButton = scene.add.text(700, 200, 'Roll Dice', { fontSize: '32px', fill: '#000' })
        .setInteractive()
        .on('pointerdown', () => {
            rollDice(scene);
        });
}
// src/main.js (continued)

function rollDice(scene) {
    // Disable roll button to prevent multiple clicks
    scene.rollButton.disableInteractive();

    // Play roll animation
    scene.dice.play('roll');

    // After animation completes, set the dice to a random face
    scene.anims.once('animationcomplete', () => {
        const diceValue = Phaser.Math.Between(1, 6);
        scene.dice.setFrame(diceValue - 1);
        movePlayer(scene, diceValue);
        // Re-enable the roll button after the player's move is complete
    });
}
// src/main.js (continued)

function movePlayer(scene, diceValue) {
    const player = scene.players[scene.currentPlayer];
    let newPosition = player.position + diceValue;

    if (newPosition > 100) {
        newPosition = 100 - (newPosition - 100); // Bounce back if exceeding 100
    }

    // Check for snakes or ladders
    if (scene.snakes[newPosition]) {
        scene.time.delayedCall(500, () => {
            newPosition = scene.snakes[newPosition];
            scene.players[scene.currentPlayer].token.setPosition(getCoordinates(newPosition));
            scene.time.delayedCall(500, () => {
                player.position = newPosition;
                checkWin(scene);
            });
        });
    } else if (scene.ladders[newPosition]) {
        scene.time.delayedCall(500, () => {
            newPosition = scene.ladders[newPosition];
            scene.players[scene.currentPlayer].token.setPosition(getCoordinates(newPosition));
            scene.time.delayedCall(500, () => {
                player.position = newPosition;
                checkWin(scene);
            });
        });
    } else {
        // Move to the new position
        scene.tweens.add({
            targets: player.token,
            x: getCoordinates(newPosition).x,
            y: getCoordinates(newPosition).y,
            duration: 500,
            onComplete: () => {
                player.position = newPosition;
                checkWin(scene);
            }
        });
    }
}
// src/main.js (continued)

function getCoordinates(position) {
    const cols = 10;
    const rows = 10;
    const cellSize = 80; // Assuming 800x800 board with 10x10 grid
    let x, y;

    const row = Math.floor((position - 1) / cols);
    const col = (position - 1) % cols;

    // Determine row direction (left-to-right or right-to-left)
    if (row % 2 === 0) {
        x = col * cellSize + cellSize / 2;
    } else {
        x = (cols - col - 1) * cellSize + cellSize / 2;
    }

    y = 800 - ((row + 1) * cellSize - cellSize / 2);

    return { x, y };
}
// src/main.js (continued)

function checkWin(scene) {
    const player = scene.players[scene.currentPlayer];
    if (player.position === 100) {
        scene.add.text(400, 400, `${player.name} Wins!`, { fontSize: '48px', fill: '#ff0000' })
            .setOrigin(0.5);
        scene.rollButton.disableInteractive();
        return;
    }

    // Switch to the next player
    scene.currentPlayer = (scene.currentPlayer + 1) % scene.players.length;
    scene.add.text(400, 50, `${scene.players[scene.currentPlayer].name}'s Turn`, { fontSize: '32px', fill: '#000' })
        .setOrigin(0.5)
        .setName('turnText');

    // Remove previous turnText if exists
    const existingText = scene.children.getByName('turnText');
    if (existingText) {
        existingText.destroy();
    }
}
// src/main.js (continued)

// Modify movePlayer function to include smooth movement
function movePlayer(scene, diceValue) {
    const player = scene.players[scene.currentPlayer];
    let newPosition = player.position + diceValue;

    if (newPosition > 100) {
        newPosition = 100 - (newPosition - 100);
    }

    // Animate movement step by step
    const moveSteps = diceValue;
    let stepsCompleted = 0;

    const moveInterval = scene.time.addEvent({
        delay: 300,
        repeat: moveSteps - 1,
        callback: () => {
            stepsCompleted++;
            player.position += 1;
            player.token.setPosition(getCoordinates(player.position).x, getCoordinates(player.position).y);
            if (player.position === 100) {
                scene.time.removeEvent(moveInterval);
                checkWin(scene);
            }
        }
    });

    moveInterval.setCallback(() => {
        // After movement, check for snakes or ladders
        checkSnakesAndLadders(scene);
    });
}

function checkSnakesAndLadders(scene) {
    const player = scene.players[scene.currentPlayer];
    let newPosition = player.position;

    if (scene.snakes[newPosition] || scene.ladders[newPosition]) {
        if (scene.snakes[newPosition]) {
            newPosition = scene.snakes[newPosition];
            // Play snake slide animation or sound
        } else if (scene.ladders[newPosition]) {
            newPosition = scene.ladders[newPosition];
            // Play ladder climb animation or sound
        }

        scene.tweens.add({
            targets: player.token,
            x: getCoordinates(newPosition).x,
            y: getCoordinates(newPosition).y,
            duration: 500,
            onComplete: () => {
                player.position = newPosition;
                checkWin(scene);
            }
        });
    } else {
        // No snake or ladder
        checkWin(scene);
    }
}
// src/main.js (continued)

function checkSnakesAndLadders(scene) {
    const player = scene.players[scene.currentPlayer];
    let newPosition = player.position;

    if (scene.snakes[newPosition]) {
        newPosition = scene.snakes[newPosition];
        // Optionally, add animations or sounds
        scene.tweens.add({
            targets: player.token,
            x: getCoordinates(newPosition).x,
            y: getCoordinates(newPosition).y,
            duration: 500,
            onComplete: () => {
                player.position = newPosition;
                checkWin(scene);
            }
        });
    } else if (scene.ladders[newPosition]) {
        newPosition = scene.ladders[newPosition];
        // Optionally, add animations or sounds
        scene.tweens.add({
            targets: player.token,
            x: getCoordinates(newPosition).x,
            y: getCoordinates(newPosition).y,
            duration: 500,
            onComplete: () => {
                player.position = newPosition;
                checkWin(scene);
            }
        });
    } else {
        checkWin(scene);
    }
}
// src/main.js (continued)

function setupDice(scene) {
    scene.dice = scene.add.sprite(700, 100, 'dice').setInteractive();

    // Handle click on dice to roll
    scene.dice.on('pointerdown', () => {
        rollDice(scene);
    });

    // Create roll animation
    scene.anims.create({
        key: 'roll',
        frames: scene.anims.generateFrameNumbers('dice', { start: 0, end: 5 }),
        frameRate: 10,
        repeat: 0
    });
}
// src/main.js (continued)

function switchTurn(scene) {
    scene.currentPlayer = (scene.currentPlayer + 1) % scene.players.length;
    updateTurnDisplay(scene);
}

function updateTurnDisplay(scene) {
    // Remove existing turn text
    const existingText = scene.children.getByName('turnText');
    if (existingText) {
        existingText.destroy();
    }

    // Display current player's turn
    scene.add.text(400, 50, `${scene.players[scene.currentPlayer].name}'s Turn`, { fontSize: '32px', fill: '#000' })
        .setOrigin(0.5)
        .setName('turnText');
}

function checkWin(scene) {
    const player = scene.players[scene.currentPlayer];
    if (player.position === 100) {
        scene.add.text(400, 400, `${player.name} Wins!`, { fontSize: '48px', fill: '#ff0000' })
            .setOrigin(0.5);
        scene.rollButton.disableInteractive();
    } else {
        switchTurn(scene);
    }
}
// src/main.js (continued)

function setupUI(scene) {
    // Display current turn
    scene.turnText = scene.add.text(400, 50, `${scene.players[scene.currentPlayer].name}'s Turn`, { fontSize: '32px', fill: '#000' })
        .setOrigin(0.5);

    // Display players' positions
    scene.players.forEach((player, index) => {
        scene.add.text(700, 300 + index * 50, `${player.name}: ${player.position}`, { fontSize: '24px', fill: '#000' })
            .setName(`player${index}Text`);
    });
}

function updatePlayerPositions(scene) {
    scene.players.forEach((player, index) => {
        const playerText = scene.children.getByName(`player${index}Text`);
        if (playerText) {
            playerText.setText(`${player.name}: ${player.position}`);
        }
    });
}
// src/main.js (continued)

function create() {
    // Existing setup code...

    setupDice(this);
    setupRollButton(this);
    setupUI(this);
}
// After updating player's position
updatePlayerPositions(scene);
