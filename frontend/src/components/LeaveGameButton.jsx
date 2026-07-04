import { useState, useContext } from 'react';
import { GameContext } from '../context/GameContext';
import { AuthContext } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

export default function LeaveGameButton() {
  const [showConfirm, setShowConfirm] = useState(false);
  const { leaveRoom, connected, activeGame } = useContext(GameContext);

  if (!connected || !activeGame) return null;

  return (
    <>
      <button 
        onClick={() => setShowConfirm(true)}
        className="absolute top-3 right-28 z-40 p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all border border-red-500/30 glow-red"
        title="Exit Game"
      >
        <LogOut size={18} />
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-500 mx-auto flex items-center justify-center mb-4">
                <LogOut size={32} />
              </div>
              <h3 className="text-xl font-bold text-white">Leave the current game?</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Leaving now will end your current match.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-px bg-slate-800">
              <button
                onClick={() => setShowConfirm(false)}
                className="py-4 font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowConfirm(false);
                  leaveRoom();
                }}
                className="py-4 font-bold text-red-500 bg-slate-900 hover:bg-slate-800 transition-colors"
              >
                Leave Game
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
