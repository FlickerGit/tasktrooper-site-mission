import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const LawnMowerGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const gameStateRef = useRef({
    mowerX: 50,
    mowerY: 50,
    mowerSize: 40,
    mowerSpeed: 3,
    grass: [] as { x: number; y: number; mowed: boolean }[],
    keys: {} as Record<string, boolean>,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;

    // Initialize grass grid
    const grassSize = 20;
    const grass = [];
    for (let x = 0; x < canvas.width; x += grassSize) {
      for (let y = 0; y < canvas.height; y += grassSize) {
        grass.push({ x, y, mowed: false });
      }
    }
    gameStateRef.current.grass = grass;

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
    const gameLoop = () => {
      const state = gameStateRef.current;

      // Update mower position
      if (state.keys["ArrowUp"] && state.mowerY > 0) {
        state.mowerY -= state.mowerSpeed;
      }
      if (state.keys["ArrowDown"] && state.mowerY < canvas.height - state.mowerSize) {
        state.mowerY += state.mowerSpeed;
      }
      if (state.keys["ArrowLeft"] && state.mowerX > 0) {
        state.mowerX -= state.mowerSpeed;
      }
      if (state.keys["ArrowRight"] && state.mowerX < canvas.width - state.mowerSize) {
        state.mowerX += state.mowerSpeed;
      }

      // Check grass collision
      let mowedCount = 0;
      state.grass.forEach((patch) => {
        if (
          !patch.mowed &&
          state.mowerX < patch.x + grassSize &&
          state.mowerX + state.mowerSize > patch.x &&
          state.mowerY < patch.y + grassSize &&
          state.mowerY + state.mowerSize > patch.y
        ) {
          patch.mowed = true;
          mowedCount++;
        }
      });

      if (mowedCount > 0) {
        setScore((prev) => prev + mowedCount);
      }

      // Draw
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw grass
      state.grass.forEach((patch) => {
        ctx.fillStyle = patch.mowed ? "#2d5016" : "#22c55e";
        ctx.fillRect(patch.x, patch.y, grassSize, grassSize);
      });

      // Draw grid lines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 1;
      for (let x = 0; x <= canvas.width; x += grassSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y <= canvas.height; y += grassSize) {
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

      requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameStarted]);

  const totalGrass = gameStateRef.current.grass.length;
  const progress = totalGrass > 0 ? Math.round((score / totalGrass) * 100) : 0;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Lawn Mower Game</h1>
          <div className="w-32"></div>
        </div>

        {/* Game Stats */}
        <div className="flex justify-between items-center bg-card p-4 rounded-lg border border-border">
          <div>
            <p className="text-sm text-muted-foreground">Grass Mowed</p>
            <p className="text-2xl font-bold text-trooper-green">{score} / {totalGrass}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Progress</p>
            <p className="text-2xl font-bold text-primary">{progress}%</p>
          </div>
          <div className="text-sm text-muted-foreground">
            {!gameStarted && <p>Press arrow keys to start!</p>}
            {gameStarted && progress === 100 && <p className="text-trooper-green font-bold">🎉 Lawn Complete!</p>}
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
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>🎮 Use <strong>Arrow Keys</strong> to move the lawn mower</li>
            <li>🌱 Mow all the bright green grass</li>
            <li>✅ Dark green = mowed grass</li>
            <li>🎯 Goal: Mow 100% of the lawn!</li>
          </ul>
        </div>

        {/* Reset Button */}
        {progress === 100 && (
          <div className="flex justify-center">
            <Button 
              className="bg-gradient-primary hover:opacity-90"
              onClick={() => window.location.reload()}
            >
              Play Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LawnMowerGame;
