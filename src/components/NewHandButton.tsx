import React from 'react'
import { useGameStore } from '../store/useGameStore'

export const NewHandButton: React.FC = () => {
  const { stage, startHand } = useGameStore()

  if (stage !== 'showdown') return null // Ne s'affiche que si la partie est terminée

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: 'rgba(0,0,0,0.6)',
      padding: '10px 20px',
      borderRadius: '8px',
      color: 'white',
      fontWeight: 'bold',
      cursor: 'pointer',
      zIndex: 1000
    }}
      onClick={startHand}
    >
      Nouvelle Partie
    </div>
  )
}
