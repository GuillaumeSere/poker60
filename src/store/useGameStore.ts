import { create } from 'zustand'
import type { GameState, Player, Card } from '../game/types'
import { buildDeck, draw, shuffleDeck } from '../game/deck'
import { getBestHandScore } from '../game/evaluate'

type Actions = {
  startHand: () => void
  playerAction: (action: 'check' | 'call' | 'bet' | 'fold', amount?: number) => void
  setBetAmount: (val: number) => void
  setStartingPot: (val: number) => void
}

const initialPlayers = (): Player[] => {
  const bots: Player[] = Array.from({ length: 3 }).map((_, i) => ({
    id: `bot-${i + 1}`,
    name: `Bot ${i + 1}`,
    isHuman: false,
    chips: 1000,
    hand: [] as Card[],
    hasFolded: false,
    hasActedThisRound: false,
    potWon: 0
  }))
  const me: Player = {
    id: 'me',
    name: 'Vous',
    isHuman: true,
    chips: 1000,
    hand: [] as Card[],
    hasFolded: false,
    hasActedThisRound: false,
    potWon: 0
  }
  return [...bots, me]
}

const initialState: GameState = {
  players: initialPlayers(),
  dealerIndex: 0,
  currentPlayerIndex: 1,
  stage: 'preflop',
  community: [] as Card[],
  deck: [] as Card[],
  pot: 0,
  lastPotWon: 0,
  winner: null,
  startingPot: 0,
  smallBlind: 5,
  bigBlind: 10,
  currentBet: 0,
  betAmount: 20,
  revealBots: false,
  winnerId: undefined,
  winnerHand: [] as Card[]
}


export const useGameStore = create<GameState & Actions>()((set, get) => {
  const getNextActivePlayerIndex = (from: number, players: Player[]): number => {
    let next = (from + 1) % players.length
    while (players[next].hasFolded) {
      next = (next + 1) % players.length
    }
    return next
  }

  const getStageMultiplier = (stage: GameState['stage']): number => {
    switch (stage) {
      case 'preflop': return 1
      case 'flop': return 1.2
      case 'turn': return 1.5
      case 'river': return 2
      default: return 1
    }
  }

  const playBot = (botIdx: number) => {
    const players = get().players.slice()
    const bot = players[botIdx]
    if (!bot || bot.isHuman || bot.hasFolded) return

    const score = getBestHandScore(bot.hand, get().community)
    const stageMultiplier = getStageMultiplier(get().stage)
    const baseBet = Math.min(bot.chips, Math.floor(get().betAmount * stageMultiplier))

    if (get().currentBet === 0) {
      if (score >= 300) {
        bot.chips -= baseBet
        set({ pot: get().pot + baseBet, currentBet: baseBet })
      }
    } else {
      const toCall = get().currentBet
      if (score >= 200) {
        const pay = Math.min(bot.chips, toCall)
        bot.chips -= pay
        set({ pot: get().pot + pay })
      } else {
        if (Math.random() < 0.7) bot.hasFolded = true
      }
    }

    bot.hasActedThisRound = true
    set({ players })

    const nextIdx = getNextActivePlayerIndex(botIdx, players)
    set({ currentPlayerIndex: nextIdx })

    const nextPlayer = players[nextIdx]
    if (!nextPlayer.isHuman && !nextPlayer.hasFolded) {
      setTimeout(() => playBot(nextIdx), 300)
    }
  }

  const advanceStage = () => {
    const players = get().players.slice()
    let { deck, community, stage } = get()

    if (stage === 'preflop') {
      const d = draw(deck, 3)
      set({ community: [...community, ...d.drawn], deck: d.rest, stage: 'flop', currentBet: 0 })
    } else if (stage === 'flop') {
      const d = draw(deck, 1)
      set({ community: [...community, ...d.drawn], deck: d.rest, stage: 'turn', currentBet: 0 })
    } else if (stage === 'turn') {
      const d = draw(deck, 1)
      set({ community: [...community, ...d.drawn], deck: d.rest, stage: 'river', currentBet: 0 })
    } else if (stage === 'river') {
      // ✅ Showdown
      let bestScore = -1
      let winners: Player[] = []
      for (const p of players) {
        if (p.hasFolded) continue
        const score = getBestHandScore(p.hand, community)
        if (score > bestScore) {
          bestScore = score
          winners = [p]
        } else if (score === bestScore) {
          winners.push(p)
        }
      }

      const pot = get().pot
      const split = Math.floor(pot / winners.length)
      winners.forEach(w => {
        w.chips += split
        w.potWon = split
      })

      set({
        stage: 'showdown',
        revealBots: true,
        winnerId: winners.length === 1 ? winners[0].id : undefined,
        winnerHand: winners.length === 1 ? winners[0].hand : [],
        pot: 0,
        players
      })
    }

    set({ players: players.map(p => ({ ...p, hasActedThisRound: false })) })
  }

  return {
    ...initialState,

    startHand: () => {
      let deck = shuffleDeck(buildDeck())
      const players = get().players.map(p => ({
        ...p,
        hand: [] as Card[],
        hasFolded: false,
        hasActedThisRound: false,
        potWon: 0
      }))

      // 🔄 Tourner le dealer à chaque main
      const dealerIdx = (get().dealerIndex + 1) % players.length
      const sbIdx = (dealerIdx + 1) % players.length
      const bbIdx = (dealerIdx + 2) % players.length

      // Distribuer 2 cartes
      for (let r = 0; r < 2; r++) {
        for (let i = 0; i < players.length; i++) {
          const d = draw(deck, 1)
          players[i].hand.push(d.drawn[0])
          deck = d.rest
        }
      }

      // Blinds
      players[sbIdx].chips -= get().smallBlind
      players[bbIdx].chips -= get().bigBlind
      const pot = get().smallBlind + get().bigBlind
      const firstIdx = (bbIdx + 1) % players.length

      set({
        players,
        deck,
        community: [] as Card[],
        stage: 'preflop',
        pot,
        currentBet: get().bigBlind,
        currentPlayerIndex: firstIdx,
        revealBots: false,
        winnerId: undefined,
        winnerHand: [],
        dealerIndex: dealerIdx
      })

      const current = players[firstIdx]
      if (!current.isHuman) setTimeout(() => playBot(firstIdx), 0)
    },

    setBetAmount: (val) => set({ betAmount: Math.max(0, Math.floor(val)) }),
    setStartingPot: (val) => set({ startingPot: Math.max(0, Math.floor(val)) }),

    playerAction: (action, amount = 0) => {
      const state = get()
      const players = state.players.slice()
      const currentPlayer = players[state.currentPlayerIndex]
      if (!currentPlayer || currentPlayer.hasFolded) return

      if (currentPlayer.isHuman) {
        if (action === 'fold') currentPlayer.hasFolded = true
        if (action === 'bet') {
          const bet = amount && amount > 0 ? amount : state.betAmount
          currentPlayer.chips -= bet
          set({ pot: state.pot + bet, currentBet: bet })
        }
        if (action === 'call') {
          const toCall = state.currentBet
          const pay = Math.min(currentPlayer.chips, toCall)
          currentPlayer.chips -= pay
          set({ pot: state.pot + pay })
        }
        currentPlayer.hasActedThisRound = true
        set({ players })
      }

      const nextIdx = getNextActivePlayerIndex(state.currentPlayerIndex, players)
      set({ currentPlayerIndex: nextIdx })

      const nextPlayer = players[nextIdx]
      if (!nextPlayer.isHuman && !nextPlayer.hasFolded) {
        setTimeout(() => playBot(nextIdx), 300)
      }

      const allActedOrFolded = players.every(p => p.hasFolded || p.hasActedThisRound)
      if (allActedOrFolded) advanceStage()
    }
  }
})












