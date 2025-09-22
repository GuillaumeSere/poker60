export type Suit = 'S' | 'H' | 'D' | 'C'

export type Rank =
  | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A'

export type Card = `${Rank}${Suit}`

export type Stage = 'preflop' | 'flop' | 'turn' | 'river' | 'showdown'

export type Player = {
  [x: string]: any
  id: string
  name: string
  isHuman: boolean
  chips: number
  hand: Card[]
  hasFolded: boolean
  hasActedThisRound: boolean
  potWon?: number
}

export type GameState = {
  players: Player[]
  dealerIndex: number
  currentPlayerIndex: number
  stage: Stage
  community: Card[]
  deck: Card[]
  pot: number
   lastPotWon: number
  winner: { name: string; hand: Card[] } | null
  startingPot: number
  smallBlind: number
  bigBlind: number
  currentBet: number
  betAmount: number
  revealBots: boolean
  winnerId?: string
  lastWinAmount?: number
  winnerHand: Card[]
}


