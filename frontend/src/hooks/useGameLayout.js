import { useEffect } from 'react';

export default function useGameLayout() {
  useEffect(() => {
    // Add game-mode class to body to hide global layout
    document.body.classList.add('game-mode');

    return () => {
      // Remove it when leaving the game component
      document.body.classList.remove('game-mode');
    };
  }, []);
}
