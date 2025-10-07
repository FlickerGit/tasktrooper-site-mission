import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface GrassPatch {
  x: number;
  y: number;
  mowCount: number; // 0 = tall, 1 = medium, 2 = scalped
}

interface Level {
  number: number;
  name: string;
  gridSize: number;
  mowerSpeed: number;
  targetCompletion: number; // percentage of grass that needs to be scalped
}

const LEVELS: Level[] = [
  { number: 1, name: "Training Ground", gridSize: 40, mowerSpeed: 4, targetCompletion: 80 },
  { number: 2, name: "Small Yard", gridSize: 35, mowerSpeed: 4, targetCompletion: 85 },
  { number: 3, name: "Medium Yard", gridSize: 30, mowerSpeed: 3.5, targetCompletion: 85 },
  { number: 4, name: "Large Yard", gridSize: 25, mowerSpeed: 3.5, targetCompletion: 90 },
  { number: 5, name: "Estate Grounds", gridSize: 20, mowerSpeed: 3, targetCompletion: 90 },
  { number: 6, name: "Sports Field", gridSize: 20, mowerSpeed: 3, targetCompletion: 95 },
  { number: 7, name: "Golf Course", gridSize: 15, mowerSpeed: 2.5, targetCompletion: 95 },
  { number: 8, name: "Stadium", gridSize: 15, mowerSpeed: 2.5, targetCompletion: 98 },
  { number: 9, name: "Pro Challenge", gridSize: 12, mowerSpeed: 2, targetCompletion: 98 },
  { number: 10, name: "Master Landscaper", gridSize: 10, mowerSpeed: 2, targetCompletion: 100 },
];

const LawnMowerGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [bladeHeight, setBladeHeight] = useState(3);
  const [gameStarted, setGameStarted] = useState(false);
  const [levelComplete, setLevelComplete] = useState(false);
  const gameStateRef = useRef({
    mowerX: 50,
    mowerY: 50,
    mowerSize: 40,
    grass: [] as GrassPatch[],
    keys: {} as Record<string, boolean>,
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
    gameStateRef.current.mowerX = 50;
    gameStateRef.current.mowerY = 50;

    // Initialize grass grid based on level
    const grass: GrassPatch[] = [];
    for (let x = 0; x < canvas.width; x += level.gridSize) {
      for (let y = 0; y < canvas.height; y += level.gridSize) {
        grass.push({ x, y, mowCount: 0 });
      }
    }
    gameStateRef.current.grass = grass;
    
    toast(`Level ${level.number}: ${level.name}`);
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

    // Game loop
    let animationFrameId: number;
    const gameLoop = () => {
      const state = gameStateRef.current;

      // Update mower position
      if (state.keys["ArrowUp"] && state.mowerY > 0) {
        state.mowerY -= level.mowerSpeed;
      }
      if (state.keys["ArrowDown"] && state.mowerY < canvas.height - state.mowerSize) {
        state.mowerY += level.mowerSpeed;
      }
      if (state.keys["ArrowLeft"] && state.mowerX > 0) {
        state.mowerX -= level.mowerSpeed;
      }
      if (state.keys["ArrowRight"] && state.mowerX < canvas.width - state.mowerSize) {
        state.mowerX += level.mowerSpeed;
      }

      // Check grass collision and mowing
      state.grass.forEach((patch) => {
        if (
          patch.mowCount < 2 &&
          state.mowerX < patch.x + level.gridSize &&
          state.mowerX + state.mowerSize > patch.x &&
          state.mowerY < patch.y + level.gridSize &&
          state.mowerY + state.mowerSize > patch.y
        ) {
          // Blade height determines mowing effectiveness
          // Height 1-2: scalps immediately (2 cuts at once)
          // Height 3: normal (1 cut)
          // Height 4-5: requires 2 passes for each stage
          const cutsPerPass = bladeHeight <= 2 ? 2 : bladeHeight === 3 ? 1 : 0.5;
          
          if (bladeHeight <= 2) {
            patch.mowCount = 2; // Scalp immediately
          } else if (bladeHeight === 3) {
            patch.mowCount = Math.min(2, patch.mowCount + 1);
          } else {
            // Heights 4-5 are less effective
            const rand = Math.random();
            if (rand < 0.3) { // 30% chance to mow per frame
              patch.mowCount = Math.min(2, patch.mowCount + 1);
            }
          }
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

      // Draw grass with 3 states
      state.grass.forEach((patch) => {
        if (patch.mowCount === 0) {
          ctx.fillStyle = "#22c55e"; // Tall grass - bright green
        } else if (patch.mowCount === 1) {
          ctx.fillStyle = "#16a34a"; // Medium grass - medium green
        } else {
          ctx.fillStyle = "#15803d"; // Scalped - dark green
        }
        ctx.fillRect(patch.x, patch.y, level.gridSize, level.gridSize);
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

      // Draw mower
      ctx.fillStyle = "#ef4444";
      ctx.fillRect(state.mowerX, state.mowerY, state.mowerSize, state.mowerSize);
      
      // Mower details
      ctx.fillStyle = "#991b1b";
      ctx.fillRect(state.mowerX + 5, state.mowerY + 5, state.mowerSize - 10, state.mowerSize - 10);
      
      // Mower handle
      ctx.strokeStyle = "#991b1b";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(state.mowerX + state.mowerSize / 2, state.mowerY);
      ctx.lineTo(state.mowerX + state.mowerSize / 2, state.mowerY - 15);
      ctx.stroke();

      // Blade height indicator on mower
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 12px Arial";
      ctx.textAlign = "center";
      ctx.fillText(bladeHeight.toString(), state.mowerX + state.mowerSize / 2, state.mowerY + state.mowerSize / 2 + 4);

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameStarted, currentLevel, bladeHeight, levelComplete]);

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Blade Height Control */}
          <div className="bg-card p-4 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground mb-2">Blade Height</p>
            <div className="flex items-center justify-between gap-3">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => adjustBladeHeight("down")}
                disabled={bladeHeight === 1}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
              <div className="text-center flex-1">
                <p className="text-3xl font-bold text-primary">{bladeHeight}</p>
                <p className="text-xs text-muted-foreground">{bladeHeightNames[bladeHeight]}</p>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => adjustBladeHeight("up")}
                disabled={bladeHeight === 5}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Progress */}
          <div className="bg-card p-4 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">Completion</p>
            <p className="text-3xl font-bold text-trooper-green">{progress}%</p>
            <p className="text-xs text-muted-foreground">{scalpedGrass} / {totalGrass} scalped</p>
          </div>

          {/* Status */}
          <div className="bg-card p-4 rounded-lg border border-border flex items-center justify-center">
            {!gameStarted && <p className="text-sm text-muted-foreground text-center">Press arrow keys to start!</p>}
            {gameStarted && !levelComplete && <p className="text-sm text-primary text-center animate-pulse">Mowing in progress...</p>}
            {levelComplete && <p className="text-lg text-trooper-green font-bold text-center">✅ Level Complete!</p>}
          </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>🎮 Use <strong>Arrow Keys</strong> to move the lawn mower</li>
              <li>🔼🔽 Adjust <strong>Blade Height</strong> using the buttons</li>
              <li>🌱 <span className="text-trooper-green">Bright green</span> = tall grass (unmowed)</li>
              <li>🌿 <span className="text-green-600">Medium green</span> = mowed once</li>
              <li>✅ <span className="text-green-800">Dark green</span> = scalped (goal!)</li>
            </ul>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li><strong>Blade Height 1-2:</strong> Scalps in one pass (fastest)</li>
              <li><strong>Blade Height 3:</strong> Normal mowing (balanced)</li>
              <li><strong>Blade Height 4-5:</strong> Gentle cut (slower)</li>
              <li>⚠️ Each patch can only be mowed <strong>twice maximum</strong></li>
              <li>🎯 Goal: Scalp {level.targetCompletion}% of the lawn!</li>
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
