import type { Card, Rank, Suit } from './types'

const suits: Suit[] = ['S', 'H', 'D', 'C']
const ranks: Rank[] = ['2','3','4','5','6','7','8','9','T','J','Q','K','A']

export const buildDeck = (): Card[] => {
  const deck: Card[] = []
  for (const suit of suits) {
    for (const rank of ranks) {
      if (!deck.some(card => card === `${rank}${suit}`)) {
        deck.push(`${rank}${suit}` as Card)
      }
    }
  }
  return deck
}

export const shuffleDeck = (deck: Card[]): Card[] => {
  const copy = deck.slice()
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export const draw = (deck: Card[], count: number): { drawn: Card[]; rest: Card[] } => {
  return { drawn: deck.slice(0, count), rest: deck.slice(count) }
}




