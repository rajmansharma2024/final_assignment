// Character class manages the player sprite, animation, movement, and drawing
class Character {
      constructor(spriteSheet, size, animations, scale = 1) {
        this.spriteSheet = spriteSheet;
        this.size = size;
        this.animations = animations;
        this.scale = scale;
        this.currentAnimation = 1; // down by default
        this.currentFrame = 0;
        this.frameCounter = 0;
        this.frameSpeed = 8;
        this.x = 400;
        this.y = 250;
        this.width = size[0] * scale;
        this.height = size[1] * scale;
        this.speed = 4;
        this.isMoving = false;
        
        // Load character image
        this.image = new Image();
        this.image.src = './assets/images/oct.png';
      }
          // Updates character animation frame if moving
      update() {
        if (this.isMoving) {
          this.frameCounter++;
          if (this.frameCounter >= this.frameSpeed) {
            this.currentFrame = (this.currentFrame + 1) % this.animations[this.currentAnimation].length;
            this.frameCounter = 0;
          }
        } else {
          this.currentFrame = 0;
        }
      }
          // Draw character on canvas based on current frame
      draw(ctx) {
        if (this.image.complete) {
          const frame = this.animations[this.currentAnimation][this.currentFrame];
          ctx.drawImage(
            this.image,
            frame[0], frame[1],
            this.size[0], this.size[1],
            this.x - this.width/2, this.y - this.height/2,
            this.width, this.height
          );
        }
      }
        // Move character based on direction and set correct animation
      move(direction) {
        this.isMoving = true;
        const oldX = this.x;
        const oldY = this.y;

        switch(direction) {
          case 'up':
            this.y -= this.speed;
            this.currentAnimation = 0; // walk up
            break;
          case 'down':
            this.y += this.speed;
            this.currentAnimation = 1; // walk down
            break;
          case 'left':
            this.x -= this.speed;
            this.currentAnimation = 2; // walk left
            break;
          case 'right':
            this.x += this.speed;
            this.currentAnimation = 3; // walk right
            break;
        }

        // Prevent character from leaving canvas boundaries
        if (this.x < this.width/2) this.x = this.width/2;
        if (this.x > canvas.width - this.width/2) this.x = canvas.width - this.width/2;
        if (this.y < this.height/2) this.y = this.height/2;
        if (this.y > canvas.height - this.height/2) this.y = canvas.height - this.height/2;
      }
       // Stop character movement and animation
      stopMoving() {
        this.isMoving = false;
      }
    }
       // Toy class defines floating collectible items with animation stages
    class Toy {
      constructor(canvas) {
        this.canvas = canvas;
        this.reset();
        this.stage = 1;
        this.stageTimer = 0;
        this.stageTime = 5000; // 5 seconds per stage
        this.collected = false;
        
         // Select two random bright colors for visual effect
        this.colors = [
          '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
          '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
        ];
        this.color1 = this.colors[Math.floor(Math.random() * this.colors.length)];
        this.color2 = this.colors[Math.floor(Math.random() * this.colors.length)];
      }
       // Reset toy position and properties
      reset() {
        this.x = Math.random() * (this.canvas.width - 60) + 30;
        this.y = 0;
        // Random destination on canvas
        this.targetX = Math.random() * (this.canvas.width - 60) + 30;
        this.targetY = Math.random() * (this.canvas.height - 60) + 30;
        this.radius = 20;
        this.maxRadius = 20;
        this.opacity = 1;
        this.stage = 1;
        this.stageTimer = 0;
        this.collected = false;
      }
        // Update toy animation depending on stage
      update(deltaTime) {
        this.stageTimer += deltaTime;

        switch(this.stage) {
          case 1: // Moving to target position (thrown into pool)
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 2) {
              this.x += (dx / distance) * 3;
              this.y += (dy / distance) * 3;
            } else {
              this.x = this.targetX;
              this.y = this.targetY;
              this.stage = 2; // Reached destination
              this.stageTimer = 0;
            }
            break;

          case 2: // Stay in place
            if (this.stageTimer >= this.stageTime) {
              this.stage = 3;
              this.stageTimer = 0;
            }
            break;

          case 3: // Slowly sink and disappear
            const progress = this.stageTimer / this.stageTime;
            this.radius = this.maxRadius * (1 - progress);
            this.opacity = 1 - progress;
            
            if (this.stageTimer >= this.stageTime) {
              this.stage = 4;
              this.stageTimer = 0;
            }
            break;

          case 4:  // Wait 1 second then reappear somewhere else
            if (this.stageTimer >= 1000) {
              this.reset();
            }
            break;
        }
      }
      // Draw toy with gradient and shine effect
      draw(ctx) {
        if (this.stage === 4 || this.collected) return;

        ctx.save();
        ctx.globalAlpha = this.opacity;

        // Create radial gradient for reflective surface effect
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.radius
        );
        gradient.addColorStop(0, this.color1);
        gradient.addColorStop(0.7, this.color2);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.8)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

         // Add shiny highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(this.x - this.radius/3, this.y - this.radius/3, this.radius/3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
       // Check if character is close enough to collect toy
      isColliding(character) {
        if (this.stage === 4 || this.collected) return false;
        
        const dx = this.x - character.x;
        const dy = this.y - character.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance < this.radius + Math.min(character.width, character.height) / 3;
      }
    }

    // Set up canvas and game variables
    const canvas = document.getElementById('canvasgame');
    const ctx = canvas.getContext('2d');
    
    // Load audio files
    const startSound = document.getElementById('startSound');
    const endSound = document.getElementById('endSound');
    const successSound = document.getElementById('successSound');
    const failSound = document.getElementById('failSound');

    // Game state variables
    let character;
    let toys = [];
    let gameActive = false;
    let score = 0;
    let timeLeft = 60;
    let gameLoop;
    let lastTime = 0;
    let keys = {};

    // Create the player character with animation frames
    function initCharacter() {
      character = new Character(
        './assets/images/oct.png',
        [49, 41],
        [ // main character set
          [ // walk up track
            [0, 41], [49, 246], [98, 246], [147, 246], [196, 246]
          ],
          [ // walk down track 
            [0, 328], [49, 328], [98, 328], [147, 328], [196, 328]
          ],
          [ // walk left track
            [0, 123], [49, 123], [98, 123], [147, 123], [196, 123]
          ],
          [ // walk right track 
            [0, 205], [49, 205], [98, 205], [147, 205], [196, 205]
          ],
        ],
        1
      );
    }
    // Play sound safely
    function playSound(sound) {
      try {
        sound.currentTime = 0;
        sound.play().catch(e => console.log('Audio play failed:', e));
      } catch (e) {
        console.log('Audio error:', e);
      }
    }
    // Start the game
    function startGame() {
      const duration = parseInt(document.getElementById('gameDuration').value);
      timeLeft = duration;
      score = 0;
      gameActive = true;
      toys = [];

      // Add a few toys to start with
      for (let i = 0; i < 3; i++) {
        toys.push(new Toy(canvas));
      }

      document.getElementById('startButton').classList.add('hidden');
      document.getElementById('restartButton').classList.remove('hidden');
      
      updateDisplay();
      playSound(startSound);
      
      lastTime = performance.now();
      gameLoop = requestAnimationFrame(update);
    }
    // End the game
    function endGame() {
      gameActive = false;
      cancelAnimationFrame(gameLoop);
      
      document.getElementById('startButton').classList.remove('hidden');
      document.getElementById('restartButton').classList.add('hidden');
      
      document.getElementById('finalScore').textContent = `Your final score: ${score}`;
      document.getElementById('gameOverMessage').style.display = 'block';
      
      playSound(endSound);
    }
     // Hide game over message
    function closeGameOver() {
      document.getElementById('gameOverMessage').style.display = 'none';
    }
     // Main game update loop
    function update(currentTime) {
      if (!gameActive) return;

      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      // Update timer
      timeLeft -= deltaTime / 1000;
      if (timeLeft <= 0) {
        timeLeft = 0;
        endGame();
        return;
      }

      // Handle input
      handleInput();

      // Update character
      character.update();

      // Update toys
      toys.forEach(toy => toy.update(deltaTime));

      // Randomly add new toy
      if (Math.random() < 0.002 && toys.length < 6) {
        toys.push(new Toy(canvas));
      }

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw toys
      toys.forEach(toy => toy.draw(ctx));
      
      // Draw character
      character.draw(ctx);

      updateDisplay();
      gameLoop = requestAnimationFrame(update);
    }
    // Move character based on key input
    function handleInput() {
      let moved = false;
      
      if (keys['ArrowUp'] || keys['KeyW']) {
        character.move('up');
        moved = true;
      }
      if (keys['ArrowDown'] || keys['KeyS']) {
        character.move('down');
        moved = true;
      }
      if (keys['ArrowLeft'] || keys['KeyA']) {
        character.move('left');
        moved = true;
      }
      if (keys['ArrowRight'] || keys['KeyD']) {
        character.move('right');
        moved = true;
      }
      
      if (!moved) {
        character.stopMoving();
      }
    }
    // Try to collect toy on space key press
    function collectToy() {
      let collected = false;
      for (let i = toys.length - 1; i >= 0; i--) {
        if (toys[i].isColliding(character) && !toys[i].collected) {
          toys[i].collected = true;
          score++;
          playSound(successSound);
          collected = true;
          
          // Remove collected toy and add new one
          toys.splice(i, 1);
          toys.push(new Toy(canvas));
          break;
        }
      }
      
      if (!collected) {
        // No toy collected, play fail sound
        playSound(failSound);
      }
    }
    // Update score and time display
    function updateDisplay() {
      document.getElementById('scoreDisplay').textContent = score;
      document.getElementById('timeDisplay').textContent = Math.ceil(timeLeft);
    }

    // Keyboard controls
    document.addEventListener('keydown', (e) => {
      keys[e.code] = true;
      
      if (e.code === 'Space' && gameActive) {
        e.preventDefault();
        collectToy();
      }
    });

    document.addEventListener('keyup', (e) => {
      keys[e.code] = false;
    });

    // Create character and draw on load
    initCharacter();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (character) {
      character.draw(ctx);
    }
    // Volume control slider
    document.addEventListener("DOMContentLoaded", function() {
  const volumeSlider = document.getElementById("volumeSlider");
  const audioElements = document.querySelectorAll("audio");

  // Update volume for all audio elements
  volumeSlider.addEventListener("input", function() {
    audioElements.forEach(audio => {
      audio.volume = volumeSlider.value;
    });
  });
});
