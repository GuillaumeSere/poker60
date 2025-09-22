import type { Card } from './types'

// Valeur des cartes
const rankValue: Record<string, number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
  '8': 8, '9': 9, 'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
}

// Évaluer une main de 5 cartes et retourner un score unique
export function evaluateHand(hand: Card[]): number {
  const counts: Record<number, number> = {}
  const suits: Record<string, number> = {}
  const values = hand.map(c => rankValue[c[0]])
  
  // Comptage des rangs et des couleurs
  values.forEach(v => counts[v] = (counts[v] || 0) + 1)
  hand.forEach(c => suits[c[1]] = (suits[c[1]] || 0) + 1)

  const isFlush = Object.values(suits).some(v => v === 5)
  const sorted = [...values].sort((a, b) => a - b)
  const isStraight = sorted.every((v, i, a) => i === 0 || v === a[i - 1] + 1) || sorted.toString() === '2,3,4,5,14'

  const countsArr = Object.values(counts).sort((a, b) => b - a)
  const highCard = Math.max(...values)

  // Classement des mains : score + valeur de la carte haute
  if (isStraight && isFlush) return 900 + highCard // quinte flush
  if (countsArr[0] === 4) return 800 + highCard     // carré
  if (countsArr[0] === 3 && countsArr[1] === 2) return 700 + highCard // full
  if (isFlush) return 600 + highCard               // flush
  if (isStraight) return 500 + highCard            // straight
  if (countsArr[0] === 3) return 400 + highCard    // brelan
  if (countsArr[0] === 2 && countsArr[1] === 2) return 300 + highCard // deux paires
  if (countsArr[0] === 2) return 200 + highCard    // paire
  return 100 + highCard                             // high card
}

// Retourne le meilleur score parmi toutes les combinaisons de 5 cartes sur 7
export function getBestHandScore(hand: Card[], community: Card[]): number {
  const all = [...hand, ...community]
  let best = 0
  const combinations = getCombinations(all, 5)
  for (const combo of combinations) {
    const score = evaluateHand(combo)
    if (score > best) best = score
  }
  return best
}

// Génère toutes les combinaisons n parmi un tableau
function getCombinations<T>(arr: T[], n: number): T[][] {
  const result: T[][] = []
  const combo: T[] = []

  function backtrack(start: number) {
    if (combo.length === n) {
      result.push([...combo])
      return
    }
    for (let i = start; i < arr.length; i++) {
      combo.push(arr[i])
      backtrack(i + 1)
      combo.pop()
    }
  }

  backtrack(0)
  return result
}




