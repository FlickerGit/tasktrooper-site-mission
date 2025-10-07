import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface GrassPatch {
  x: number;
  y: number;
  mowCount: number; // 0 = tall, 1 = medium, 2 = scalped
  lastMowTime: number;
}

interface PowerUp {
  x: number;
  y: number;
  type: "time" | "fuel" | "speed";
  collected: boolean;
}

interface Obstacle {
  x: number;
  y: number;
  type: "gnome" | "dog" | "sprinkler" | "rock";
}

interface Level {
  number: number;
  name: string;
  gridSize: number;
  mowerSpeed: number;
  targetCompletion: number;
  timeLimit: number; // seconds
  regrowthSpeed: number; // milliseconds before grass regrows
  obstacleCount: number;
  powerUpCount: number;
}

const LEVELS: Level[] = [
  { number: 1, name: "Training Ground", gridSize: 40, mowerSpeed: 2.5, targetCompletion: 80, timeLimit: 90, regrowthSpeed: 15000, obstacleCount: 2, powerUpCount: 3 },
  { number: 2, name: "Small Yard", gridSize: 35, mowerSpeed: 2.5, targetCompletion: 85, timeLimit: 80, regrowthSpeed: 12000, obstacleCount: 3, powerUpCount: 3 },
  { number: 3, name: "Medium Yard", gridSize: 30, mowerSpeed: 2.2, targetCompletion: 85, timeLimit: 75, regrowthSpeed: 10000, obstacleCount: 4, powerUpCount: 2 },
  { number: 4, name: "Large Yard", gridSize: 25, mowerSpeed: 2.2, targetCompletion: 90, timeLimit: 70, regrowthSpeed: 9000, obstacleCount: 5, powerUpCount: 2 },
  { number: 5, name: "Estate Grounds", gridSize: 20, mowerSpeed: 2, targetCompletion: 90, timeLimit: 65, regrowthSpeed: 8000, obstacleCount: 6, powerUpCount: 2 },
  { number: 6, name: "Sports Field", gridSize: 20, mowerSpeed: 2, targetCompletion: 95, timeLimit: 60, regrowthSpeed: 7000, obstacleCount: 7, powerUpCount: 1 },
  { number: 7, name: "Golf Course", gridSize: 15, mowerSpeed: 1.8, targetCompletion: 95, timeLimit: 55, regrowthSpeed: 6000, obstacleCount: 8, powerUpCount: 1 },
  { number: 8, name: "Stadium", gridSize: 15, mowerSpeed: 1.8, targetCompletion: 98, timeLimit: 50, regrowthSpeed: 5000, obstacleCount: 9, powerUpCount: 1 },
  { number: 9, name: "Pro Challenge", gridSize: 12, mowerSpeed: 1.5, targetCompletion: 98, timeLimit: 45, regrowthSpeed: 4000, obstacleCount: 10, powerUpCount: 1 },
  { number: 10, name: "Master Landscaper", gridSize: 10, mowerSpeed: 1.5, targetCompletion: 100, timeLimit: 40, regrowthSpeed: 3000, obstacleCount: 12, powerUpCount: 1 },
];

const LawnMowerGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [bladeHeight, setBladeHeight] = useState(3);
  const [gameStarted, setGameStarted] = useState(false);
  const [levelComplete, setLevelComplete] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [fuel, setFuel] = useState(100);
  const [score, setScore] = useState(0);
  const [speedBoostActive, setSpeedBoostActive] = useState(false);
  const gameStateRef = useRef({
    mowerX: 50,
    mowerY: 50,
    mowerSize: 40,
    grass: [] as GrassPatch[],
    powerUps: [] as PowerUp[],
    obstacles: [] as Obstacle[],
    keys: {} as Record<string, boolean>,
    currentSpeed: 1,
    startTime: 0,
  });

  const level = LEVELS[currentLevel - 1];

  // Initialize level
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;

    // Reset game state
    setGameStarted(false);
    setLevelComplete(false);
    setTimeRemaining(level.timeLimit);
    setFuel(100);
    setScore(0);
    setSpeedBoostActive(false);
    gameStateRef.current.mowerX = 50;
    gameStateRef.current.mowerY = 50;
    gameStateRef.current.currentSpeed = 1;
    gameStateRef.current.startTime = Date.now();

    // Initialize grass grid based on level
    const grass: GrassPatch[] = [];
    for (let x = 0; x < canvas.width; x += level.gridSize) {
      for (let y = 0; y < canvas.height; y += level.gridSize) {
        grass.push({ x, y, mowCount: 0, lastMowTime: 0 });
      }
    }
    gameStateRef.current.grass = grass;

    // Initialize obstacles
    const obstacles: Obstacle[] = [];
    const obstacleTypes: Obstacle["type"][] = ["gnome", "dog", "sprinkler", "rock"];
    for (let i = 0; i < level.obstacleCount; i++) {
      const randomX = Math.floor(Math.random() * (canvas.width - 100)) + 50;
      const randomY = Math.floor(Math.random() * (canvas.height - 100)) + 50;
      obstacles.push({
        x: randomX,
        y: randomY,
        type: obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)]
      });
    }
    gameStateRef.current.obstacles = obstacles;

    // Initialize power-ups
    const powerUps: PowerUp[] = [];
    const powerUpTypes: PowerUp["type"][] = ["time", "fuel", "speed"];
    for (let i = 0; i < level.powerUpCount; i++) {
      const randomX = Math.floor(Math.random() * (canvas.width - 100)) + 50;
      const randomY = Math.floor(Math.random() * (canvas.height - 100)) + 50;
      powerUps.push({
        x: randomX,
        y: randomY,
        type: powerUpTypes[i % powerUpTypes.length],
        collected: false
      });
    }
    gameStateRef.current.powerUps = powerUps;
    
    toast(`Level ${level.number}: ${level.name} - ${level.timeLimit}s`);
  }, [currentLevel]);

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Keyboard controls
    const handleKeyDown = (e: KeyboardEvent) => {
      gameStateRef.current.keys[e.key] = true;
      if (!gameStarted && (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "ArrowLeft" || e.key === "ArrowRight")) {
        setGameStarted(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      gameStateRef.current.keys[e.key] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Timer countdown
    let timerInterval: number;
    if (gameStarted && !levelComplete) {
      timerInterval = window.setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 0) {
            toast.error("Time's up! Level failed.");
            setLevelComplete(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    // Game loop
    let animationFrameId: number;
    const gameLoop = () => {
      const state = gameStateRef.current;

      if (!gameStarted) {
        animationFrameId = requestAnimationFrame(gameLoop);
        return;
      }

      // Update mower position with speed multiplier
      const currentSpeed = level.mowerSpeed * state.currentSpeed;
      if (state.keys["ArrowUp"] && state.mowerY > 0) {
        state.mowerY -= currentSpeed;
        setFuel(prev => Math.max(0, prev - 0.05));
      }
      if (state.keys["ArrowDown"] && state.mowerY < canvas.height - state.mowerSize) {
        state.mowerY += currentSpeed;
        setFuel(prev => Math.max(0, prev - 0.05));
      }
      if (state.keys["ArrowLeft"] && state.mowerX > 0) {
        state.mowerX -= currentSpeed;
        setFuel(prev => Math.max(0, prev - 0.05));
      }
      if (state.keys["ArrowRight"] && state.mowerX < canvas.width - state.mowerSize) {
        state.mowerX += currentSpeed;
        setFuel(prev => Math.max(0, prev - 0.05));
      }

      // Check fuel
      if (fuel <= 0) {
        toast.error("Out of fuel! Level failed.");
        setLevelComplete(true);
        setGameStarted(false);
      }

      // Grass regrowth
      const currentTime = Date.now();
      state.grass.forEach((patch) => {
        if (patch.mowCount > 0 && currentTime - patch.lastMowTime > level.regrowthSpeed) {
          patch.mowCount = Math.max(0, patch.mowCount - 1);
          patch.lastMowTime = currentTime;
        }
      });

      // Check grass collision and mowing
      state.grass.forEach((patch) => {
        if (
          patch.mowCount < 2 &&
          state.mowerX < patch.x + level.gridSize &&
          state.mowerX + state.mowerSize > patch.x &&
          state.mowerY < patch.y + level.gridSize &&
          state.mowerY + state.mowerSize > patch.y
        ) {
          const previousMowCount = patch.mowCount;
          
          if (bladeHeight <= 2) {
            patch.mowCount = 2;
          } else if (bladeHeight === 3) {
            patch.mowCount = Math.min(2, patch.mowCount + 1);
          } else {
            const rand = Math.random();
            if (rand < 0.3) {
              patch.mowCount = Math.min(2, patch.mowCount + 1);
            }
          }
          
          if (patch.mowCount > previousMowCount) {
            patch.lastMowTime = currentTime;
            setScore(prev => prev + (patch.mowCount === 2 ? 10 : 5));
          }
        }
      });

      // Check power-up collision
      state.powerUps.forEach((powerUp) => {
        if (
          !powerUp.collected &&
          state.mowerX < powerUp.x + 30 &&
          state.mowerX + state.mowerSize > powerUp.x &&
          state.mowerY < powerUp.y + 30 &&
          state.mowerY + state.mowerSize > powerUp.y
        ) {
          powerUp.collected = true;
          
          if (powerUp.type === "time") {
            setTimeRemaining(prev => prev + 15);
            toast.success("+15 seconds!");
          } else if (powerUp.type === "fuel") {
            setFuel(prev => Math.min(100, prev + 30));
            toast.success("+30 fuel!");
          } else if (powerUp.type === "speed") {
            state.currentSpeed = 1.5;
            setSpeedBoostActive(true);
            toast.success("Speed boost activated!");
            setTimeout(() => {
              state.currentSpeed = 1;
              setSpeedBoostActive(false);
            }, 5000);
          }
        }
      });

      // Check obstacle collision
      state.obstacles.forEach((obstacle) => {
        if (
          state.mowerX < obstacle.x + 30 &&
          state.mowerX + state.mowerSize > obstacle.x &&
          state.mowerY < obstacle.y + 30 &&
          state.mowerY + state.mowerSize > obstacle.y
        ) {
          // Slow down or push back slightly
          state.currentSpeed = Math.max(0.3, state.currentSpeed - 0.1);
          setFuel(prev => Math.max(0, prev - 0.2));
        }
      });

      // Check level completion
      const scalpedCount = state.grass.filter(p => p.mowCount === 2).length;
      const completionPercent = (scalpedCount / state.grass.length) * 100;
      
      if (!levelComplete && completionPercent >= level.targetCompletion) {
        setLevelComplete(true);
        if (currentLevel < LEVELS.length) {
          toast.success(`Level ${level.number} Complete! 🎉`);
        } else {
          toast.success("🏆 All Levels Complete! You're a Master Landscaper!");
        }
      }

      // Draw
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw grass with 3 states and texture
      state.grass.forEach((patch) => {
        if (patch.mowCount === 0) {
          // Tall grass - bright green with gradient
          const gradient = ctx.createLinearGradient(patch.x, patch.y, patch.x, patch.y + level.gridSize);
          gradient.addColorStop(0, "#4ade80");
          gradient.addColorStop(1, "#22c55e");
          ctx.fillStyle = gradient;
        } else if (patch.mowCount === 1) {
          // Medium grass - medium green
          const gradient = ctx.createLinearGradient(patch.x, patch.y, patch.x, patch.y + level.gridSize);
          gradient.addColorStop(0, "#22c55e");
          gradient.addColorStop(1, "#16a34a");
          ctx.fillStyle = gradient;
        } else {
          // Scalped - dark green with stripes
          const gradient = ctx.createLinearGradient(patch.x, patch.y, patch.x, patch.y + level.gridSize);
          gradient.addColorStop(0, "#16a34a");
          gradient.addColorStop(1, "#15803d");
          ctx.fillStyle = gradient;
        }
        ctx.fillRect(patch.x, patch.y, level.gridSize, level.gridSize);
        
        // Add grass texture
        if (patch.mowCount === 0) {
          ctx.strokeStyle = "rgba(34, 197, 94, 0.3)";
          ctx.lineWidth = 1;
          for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(patch.x + (i * level.gridSize / 3), patch.y);
            ctx.lineTo(patch.x + (i * level.gridSize / 3), patch.y + level.gridSize);
            ctx.stroke();
          }
        }
      });

      // Draw obstacles with shadows and better design
      state.obstacles.forEach((obstacle) => {
        // Shadow
        ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
        ctx.fillRect(obstacle.x + 2, obstacle.y + 32, 36, 4);
        
        // Obstacle base
        const gradient = ctx.createRadialGradient(obstacle.x + 20, obstacle.y + 20, 5, obstacle.x + 20, obstacle.y + 20, 25);
        if (obstacle.type === "rock") {
          gradient.addColorStop(0, "#a8a29e");
          gradient.addColorStop(1, "#57534e");
        } else if (obstacle.type === "gnome") {
          gradient.addColorStop(0, "#fca5a5");
          gradient.addColorStop(1, "#dc2626");
        } else if (obstacle.type === "dog") {
          gradient.addColorStop(0, "#fde68a");
          gradient.addColorStop(1, "#d97706");
        } else {
          gradient.addColorStop(0, "#93c5fd");
          gradient.addColorStop(1, "#3b82f6");
        }
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(obstacle.x + 20, obstacle.y + 20, 20, 0, Math.PI * 2);
        ctx.fill();
        
        // Border
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Emoji
        ctx.fillStyle = "#ffffff";
        ctx.font = "24px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const emoji = obstacle.type === "rock" ? "🪨" : obstacle.type === "gnome" ? "🧙" : obstacle.type === "dog" ? "🐕" : "💦";
        ctx.fillText(emoji, obstacle.x + 20, obstacle.y + 20);
      });

      // Draw power-ups with glow effect
      state.powerUps.forEach((powerUp) => {
        if (!powerUp.collected) {
          // Glow effect
          ctx.shadowBlur = 15;
          ctx.shadowColor = powerUp.type === "time" ? "#10b981" : powerUp.type === "fuel" ? "#f59e0b" : "#8b5cf6";
          
          // Power-up base
          const gradient = ctx.createRadialGradient(powerUp.x + 20, powerUp.y + 20, 5, powerUp.x + 20, powerUp.y + 20, 25);
          if (powerUp.type === "time") {
            gradient.addColorStop(0, "#6ee7b7");
            gradient.addColorStop(1, "#10b981");
          } else if (powerUp.type === "fuel") {
            gradient.addColorStop(0, "#fcd34d");
            gradient.addColorStop(1, "#f59e0b");
          } else {
            gradient.addColorStop(0, "#c4b5fd");
            gradient.addColorStop(1, "#8b5cf6");
          }
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(powerUp.x + 20, powerUp.y + 20, 20, 0, Math.PI * 2);
          ctx.fill();
          
          // Border
          ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
          ctx.lineWidth = 2;
          ctx.stroke();
          
          ctx.shadowBlur = 0;
          
          // Emoji
          ctx.fillStyle = "#ffffff";
          ctx.font = "24px Arial";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          const emoji = powerUp.type === "time" ? "⏰" : powerUp.type === "fuel" ? "⛽" : "⚡";
          ctx.fillText(emoji, powerUp.x + 20, powerUp.y + 20);
        }
      });

      // Draw grid lines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 1;
      for (let x = 0; x <= canvas.width; x += level.gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y <= canvas.height; y += level.gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw mower with realistic design
      // Shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      ctx.fillRect(state.mowerX + 2, state.mowerY + state.mowerSize + 2, state.mowerSize, 6);
      
      // Mower body - gradient for depth
      const mowerGradient = ctx.createLinearGradient(
        state.mowerX, 
        state.mowerY, 
        state.mowerX, 
        state.mowerY + state.mowerSize
      );
      mowerGradient.addColorStop(0, "#f87171");
      mowerGradient.addColorStop(0.5, "#ef4444");
      mowerGradient.addColorStop(1, "#dc2626");
      ctx.fillStyle = mowerGradient;
      ctx.fillRect(state.mowerX, state.mowerY, state.mowerSize, state.mowerSize);
      
      // Mower deck (darker center)
      ctx.fillStyle = "#991b1b";
      ctx.fillRect(state.mowerX + 5, state.mowerY + 5, state.mowerSize - 10, state.mowerSize - 10);
      
      // Wheels
      ctx.fillStyle = "#1f2937";
      ctx.beginPath();
      ctx.arc(state.mowerX + 8, state.mowerY + 8, 5, 0, Math.PI * 2);
      ctx.arc(state.mowerX + state.mowerSize - 8, state.mowerY + 8, 5, 0, Math.PI * 2);
      ctx.arc(state.mowerX + 8, state.mowerY + state.mowerSize - 8, 5, 0, Math.PI * 2);
      ctx.arc(state.mowerX + state.mowerSize - 8, state.mowerY + state.mowerSize - 8, 5, 0, Math.PI * 2);
      ctx.fill();
      
      // Mower handle
      ctx.strokeStyle = "#374151";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(state.mowerX + state.mowerSize / 2, state.mowerY + 5);
      ctx.lineTo(state.mowerX + state.mowerSize / 2, state.mowerY - 15);
      ctx.stroke();
      
      // Handle grip
      ctx.fillStyle = "#4b5563";
      ctx.fillRect(state.mowerX + state.mowerSize / 2 - 8, state.mowerY - 18, 16, 6);

      // Blade height indicator on mower
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 14px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(bladeHeight.toString(), state.mowerX + state.mowerSize / 2, state.mowerY + state.mowerSize / 2);
      
      // Speed boost indicator
      if (speedBoostActive) {
        ctx.strokeStyle = "#a855f7";
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(state.mowerX - 3, state.mowerY - 3, state.mowerSize + 6, state.mowerSize + 6);
        ctx.setLineDash([]);
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      cancelAnimationFrame(animationFrameId);
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [gameStarted, currentLevel, bladeHeight, levelComplete, fuel]);

  const totalGrass = gameStateRef.current.grass.length;
  const scalpedGrass = gameStateRef.current.grass.filter(p => p.mowCount === 2).length;
  const progress = totalGrass > 0 ? Math.round((scalpedGrass / totalGrass) * 100) : 0;

  const adjustBladeHeight = (direction: "up" | "down") => {
    setBladeHeight(prev => {
      const newHeight = direction === "up" ? Math.min(5, prev + 1) : Math.max(1, prev - 1);
      const heightNames = ["", "Scalp", "Low", "Normal", "High", "Very High"];
      toast(`Blade Height: ${newHeight} - ${heightNames[newHeight]}`);
      return newHeight;
    });
  };

  const nextLevel = () => {
    if (currentLevel < LEVELS.length) {
      setCurrentLevel(prev => prev + 1);
      setBladeHeight(3); // Reset to normal
    }
  };

  const resetLevel = () => {
    setCurrentLevel(1);
    setBladeHeight(3);
  };

  const bladeHeightNames = ["", "Scalp (Fast)", "Low", "Normal", "High", "Very High (Slow)"];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 md:p-8">
      <div className="max-w-5xl w-full space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Level {level.number}: {level.name}</h1>
            <p className="text-sm text-muted-foreground">Target: {level.targetCompletion}% scalped</p>
          </div>
          <div className="w-24"></div>
        </div>

        {/* Game Controls & Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {/* Time */}
          <div className="bg-card p-4 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">Time</p>
            <p className="text-3xl font-bold text-primary">{timeRemaining}s</p>
          </div>

          {/* Fuel */}
          <div className="bg-card p-4 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">Fuel</p>
            <p className="text-3xl font-bold text-amber-500">{Math.round(fuel)}%</p>
          </div>

          {/* Score */}
          <div className="bg-card p-4 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">Score</p>
            <p className="text-3xl font-bold text-trooper-green">{score}</p>
          </div>

          {/* Progress */}
          <div className="bg-card p-4 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">Progress</p>
            <p className="text-3xl font-bold text-trooper-green">{progress}%</p>
          </div>

          {/* Blade Height Control */}
          <div className="bg-card p-4 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground mb-2">Blade</p>
            <div className="flex items-center justify-between gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => adjustBladeHeight("down")}
                disabled={bladeHeight === 1}
                className="h-8 w-8 p-0"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
              <div className="text-center flex-1">
                <p className="text-2xl font-bold text-primary">{bladeHeight}</p>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => adjustBladeHeight("up")}
                disabled={bladeHeight === 5}
                className="h-8 w-8 p-0"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Status & Boosts */}
        <div className="bg-card p-4 rounded-lg border border-border flex items-center justify-between">
          <div>
            {!gameStarted && <p className="text-sm text-muted-foreground">Press arrow keys to start!</p>}
            {gameStarted && !levelComplete && <p className="text-sm text-primary animate-pulse">Mowing in progress...</p>}
            {levelComplete && <p className="text-lg text-trooper-green font-bold">✅ Level Complete!</p>}
          </div>
          {speedBoostActive && <p className="text-sm text-purple-500 font-bold animate-pulse">⚡ SPEED BOOST ACTIVE</p>}
        </div>

        {/* Game Canvas */}
        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            className="border-4 border-trooper-green rounded-lg shadow-elegant bg-card"
          />
        </div>

        {/* Instructions */}
        <div className="bg-card p-4 rounded-lg border border-border">
          <h2 className="text-lg font-semibold text-foreground mb-2">How to Play</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>🎮 Use <strong>Arrow Keys</strong> to move</li>
              <li>⏰ Complete before time runs out</li>
              <li>⛽ Manage your fuel carefully</li>
              <li>🌱 Grass regrows over time - be efficient!</li>
              <li>🎯 Target: {level.targetCompletion}% scalped</li>
            </ul>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li><strong>Power-ups:</strong></li>
              <li>⏰ Clock = +15 seconds</li>
              <li>⛽ Gas can = +30 fuel</li>
              <li>⚡ Lightning = speed boost (5s)</li>
            </ul>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li><strong>Obstacles slow you down:</strong></li>
              <li>🧙 Garden gnomes</li>
              <li>🐕 Dogs running around</li>
              <li>💦 Sprinklers</li>
              <li>🪨 Rocks</li>
            </ul>
          </div>
        </div>

        {/* Level Navigation */}
        {levelComplete && (
          <div className="flex justify-center gap-4">
            {currentLevel < LEVELS.length && (
              <Button 
                className="bg-gradient-primary hover:opacity-90"
                onClick={nextLevel}
              >
                Next Level →
              </Button>
            )}
            <Button 
              variant="outline"
              onClick={resetLevel}
            >
              Restart from Level 1
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LawnMowerGame;
