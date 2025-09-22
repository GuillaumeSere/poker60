import React, { useEffect } from 'react'
import { useGameStore } from '../store/useGameStore'
import { NewHandButton } from './NewHandButton'

export const HUD: React.FC = () => {
  const {
    players,
    community,
    pot,
    stage,
    startHand,
    playerAction,
    currentBet,
    betAmount,
    setBetAmount,
    startingPot,
    setStartingPot,
    winnerId,
    lastWinAmount,
    currentPlayerIndex,
  } = useGameStore()

  const me = players.find((p) => p.isHuman)

  useEffect(() => {
    const noCards = (!me || me.hand.length === 0) && community.length === 0
    if (noCards) startHand()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleStart = () => startHand()
  const handleCheck = () => playerAction('check')
  const handleCall = () => playerAction('call')
  const handleFold = () => playerAction('fold')

  return (
    <div className="pointer-events-none fixed inset-0 flex flex-col justify-end p-4 gap-3">
      {/* Liste des joueurs et leurs stacks sur la gauche */}
      <div className="pointer-events-auto absolute top-4 left-4 bg-neutral-900/70 p-3 rounded text-sm">
        {players.map((p, i) => (
          <div
            key={`hud-${p.id}`}
            className={`mb-1 ${
              i === currentPlayerIndex ? 'text-red-400 font-bold' : 'text-neutral-200'
            }`}
          >
            {p.name}: {p.chips}
            {i === currentPlayerIndex && ' ⬅️'}
          </div>
        ))}
      </div>

      {/* Bloc infos pot + sliders */}
      <div
        className="pointer-events-auto self-center rounded bg-neutral-800/80 backdrop-blur px-4 py-2 text-sm"
        aria-live="polite"
        tabIndex={0}
        aria-label="Infos du pot et du board"
      >
        <div className="flex items-center gap-4">
          <span>Pot: {pot}</span>
          <span>Mise actuelle: {currentBet}</span>
          <span>Étape: {stage}</span>
          <span>Board: {community.join(' ') || '-'}</span>
          <span>Votre main: {me?.hand.join(' ') || '-'}</span>
        </div>
        <div className="mt-2 flex items-center gap-3">
          <label className="flex items-center gap-2" aria-label="Pot de départ">
            <span className="text-neutral-300">Pot départ</span>
            <input
              type="range"
              min={0}
              max={200}
              step={5}
              value={startingPot}
              onChange={(e) => setStartingPot(Number(e.target.value))}
              className="accent-emerald-500"
            />
            <span className="w-10 text-right">{startingPot}</span>
          </label>
          <label className="flex items-center gap-2" aria-label="Montant de mise">
            <span className="text-neutral-300">Mise</span>
            <input
              type="range"
              min={0}
              max={200}
              step={5}
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              className="accent-blue-500"
            />
            <span className="w-10 text-right">{betAmount}</span>
          </label>
        </div>
      </div>

      {/* Boutons d'action */}
      <div
        className="pointer-events-auto self-center flex gap-2"
        role="toolbar"
        aria-label="Actions du joueur"
      >
        <button
          onClick={handleStart}
          className="rounded bg-emerald-600 hover:bg-emerald-500 px-3 py-2 text-sm"
        >
          Nouvelle main
        </button>
        <button
          onClick={handleCheck}
          className="rounded bg-neutral-700 hover:bg-neutral-600 px-3 py-2 text-sm"
        >
          Check
        </button>
        <button
          onClick={handleCall}
          className="rounded bg-blue-700 hover:bg-blue-600 px-3 py-2 text-sm"
        >
          Call
        </button>
        <button
          onClick={() => playerAction('bet')}
          className="rounded bg-indigo-700 hover:bg-indigo-600 px-3 py-2 text-sm"
        >
          Bet {betAmount}
        </button>
        <button
          onClick={handleFold}
          className="rounded bg-red-700 hover:bg-red-600 px-3 py-2 text-sm"
        >
          Fold
        </button>
      </div>
      <NewHandButton />

      {/* Message de victoire */}
      {stage === 'showdown' && (
        <div className="pointer-events-auto self-center mt-2 rounded bg-black/70 px-4 py-2 text-sm">
          {winnerId ? (
            <span>
              🏆 {players.find((p) => p.id === winnerId)?.name} remporte le pot de{' '}
             {players.find(p => p.id === winnerId)?.potWon} €
            </span>
          ) : (
            <span>Showdown terminé.</span>
          )}
        </div>
      )}
    </div>
  )
}


