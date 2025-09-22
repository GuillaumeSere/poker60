import React, { useMemo } from 'react'
import { Text } from '@react-three/drei'
import { useGameStore } from '../store/useGameStore'
import type { Player } from '../game/types'
import { Html } from '@react-three/drei'

type Parsed = { rank: string; suit: '♠' | '♥' | '♦' | '♣'; color: string }

const parseCard = (label: string): Parsed => {
    const rankCode = label[0]
    const suitCode = label[1]
    const rank = rankCode === 'T' ? '10' : rankCode
    const suit = suitCode === 'S' ? '♠' : suitCode === 'H' ? '♥' : suitCode === 'D' ? '♦' : '♣'
    const color = suit === '♥' || suit === '♦' ? '#dc2626' : '#111827'
    return { rank, suit, color }
}

const pipPositionsForRank = (rank: string): [number, number][] => {
    const X = [-0.18, 0, 0.18]
    const Y = [0.32, 0.16, 0, -0.16, -0.32]
    const center = [0, 0] as [number, number]
    const top = [0, Y[0]] as [number, number]
    const bottom = [0, Y[4]] as [number, number]
    const fourCorners = [
        [X[0], Y[0]],
        [X[2], Y[0]],
        [X[0], Y[4]],
        [X[2], Y[4]],
    ] as [number, number][]
    const middleLR = [
        [X[0], Y[2]],
        [X[2], Y[2]],
    ] as [number, number][]
    const topMid = [0, Y[1]] as [number, number]
    const botMid = [0, Y[3]] as [number, number]

    switch (rank) {
        case 'A':
            return [center]
        case '2':
            return [top, bottom]
        case '3':
            return [top, center, bottom]
        case '4':
            return fourCorners
        case '5':
            return [...fourCorners, center]
        case '6':
            return [...fourCorners, ...middleLR]
        case '7':
            return [...fourCorners, ...middleLR, top]
        case '8':
            return [...fourCorners, ...middleLR, top, bottom]
        case '9':
            return [...fourCorners, ...middleLR, top, bottom, center]
        case '10':
            return [...fourCorners, ...middleLR, topMid, botMid, top, bottom]
        default:
            return []
    }
}

export const CardFace: React.FC<{
    label: string
    position: [number, number, number]
    rotation?: [number, number, number]
    isBack?: boolean
}> = ({ label, position, rotation = [-Math.PI / 2, 0, 0], isBack = false }) => {
    const { rank, suit, color } = parseCard(label)
    const showSuitInCorner = ['A', 'J', 'Q', 'K'].includes(rank);

    return (
        <group position={position} rotation={rotation}>
            {/* Bord */}
            <mesh position={[0, 0, -0.001]}>
                <planeGeometry args={[0.74, 1.04]} />
                <meshStandardMaterial color="#0f172a" side={2} />
            </mesh>

            {/* Face ou dos */}
            <mesh>
                <planeGeometry args={[0.7, 1]} />
                <meshStandardMaterial color={isBack ? '#1d4ed8' : '#f8fafc'} side={2} />
            </mesh>

            {isBack ? (
                // ✅ simplifié : un seul symbole au centre
                <Text
                    position={[0, 0, 0.02]}
                    fontSize={0.2}
                    color="#ffffff"
                    anchorX="center"
                    anchorY="middle"
                >
                    ★
                </Text>
            ) : (
                <>
                    {/* index coin haut-gauche */}
                    <Text
                        position={[-0.31, 0.48, 0.02]}
                        fontSize={0.1}
                        color={color}
                        anchorX="left"
                        anchorY="top"
                    >
                        {rank}{showSuitInCorner ? suit : ''}
                    </Text>

                    {/* index coin bas-droit pivoté */}
                    <group rotation={[0, 0, Math.PI]} position={[0.31, -0.50, 0.01]}>
                        <Text fontSize={0.1} color={color} anchorX="left" anchorY="top">
                            {rank}{showSuitInCorner ? suit : ''}
                        </Text>
                    </group>

                    {/* pips pour cartes numériques */}
                    {['A', '2', '3', '4', '5', '6', '7', '8', '9', '10'].includes(rank) ? (
                        <group>
                            {pipPositionsForRank(rank).map(([x, y], i) => (
                                <Text
                                    key={`pip-${i}`}
                                    position={[x, y, 0.02]}
                                    fontSize={0.10}
                                    color={color}
                                    anchorX="center"
                                    anchorY="middle"
                                >
                                    {suit}
                                </Text>
                            ))}
                        </group>
                    ) : (
                        <Text
                            position={[0, 0, 0.02]}
                            fontSize={0.21}
                            color={color}
                            anchorX="center"
                            anchorY="middle"
                        >
                            {rank}
                        </Text>
                    )}
                </>
            )}
        </group>
    )
}

export const CardsScene: React.FC = () => {
    const { players, community, revealBots, pot, currentPlayerIndex, winnerId, winnerHand, stage } =
        useGameStore()
    const me = players.find((p: Player) => p.isHuman)
    const bots = players.filter((p: Player) => !p.isHuman)

    const communityPositions = useMemo<[number, number, number][]>(() => {
        const step = 0.8
        const baseX = -1.6
        return Array.from({ length: 5 }).map(
            (_, i) => [baseX + i * step, 0.32, 0] as [number, number, number]
        )
    }, [])

    const myCardPositions = useMemo<[number, number, number][]>(() => [
        [-0.5, 0.33, 2.2],
        [0.5, 0.33, 2.2],
    ], [])

    const botSeats = useMemo<([number, number, number][])[]>(() => [
        [
            [-0.5, 0.33, -2.3],
            [0.5, 0.33, -2.3],
        ],
        [
            [-4.8, 0.33, 0],
            [-3.9, 0.33, 0],
        ],
        [
            [3.9, 0.33, 0],
            [4.8, 0.33, 0],
        ],
    ], [])

    // 🔹 Trouver le joueur gagnant
    const winner = winnerId ? players.find(p => p.id === winnerId) : undefined

    return (
        <>
            {/* 🎴 Scène 3D */}
            <group>
                {/* Pot au centre */}
                <Text
                    position={[0, 0.7, 0]}
                    fontSize={0.28}
                    color="#fbbf24"
                    anchorX="center"
                    anchorY="middle"
                >
                    Pot: {pot}
                </Text>

                {/* Cartes du board */}
                {community.map((c, i) => (
                    <CardFace key={`board-${i}-${c}`} label={c} position={communityPositions[i]} />
                ))}

                {/* Cartes du joueur humain */}
                {me?.hand?.map((c, i) => (
                    <CardFace key={`me-${i}-${c}`} label={c} position={myCardPositions[i]} />
                ))}

                {/* Nom du joueur humain + flèche si c’est son tour */}
                {me && (
                    <>
                        <Text
                            position={[0, 0.36, 2.6]}
                            fontSize={0.18}
                            color="#e5e7eb"
                            anchorX="center"
                            anchorY="middle"
                        >
                            {me.name}
                        </Text>

                        {players[currentPlayerIndex]?.id === me.id && (
                            <Text
                                key="arrow-me"
                                position={[0, 0.7, 2.6]}
                                fontSize={0.22}
                                color="#f87171"
                                anchorX="center"
                                anchorY="middle"
                            >
                                🔺
                            </Text>
                        )}
                    </>
                )}

                {/* Bots */}
                {bots.map((b, bi) => (
                    <group key={`bot-${b.id}`}>
                        {b.hand.map((c, i) => {
                            const seat = botSeats[bi] || botSeats[0]
                            const pos = seat[i] || seat[0]
                            return (
                                <CardFace
                                    key={`bot-${b.id}-card-${i}-${c}`}
                                    label={c}
                                    position={pos}
                                    isBack={!revealBots}
                                />
                            )
                        })}

                        {(() => {
                            const seat = botSeats[bi] || botSeats[0]
                            const midX = (seat[0][0] + seat[1][0]) / 2
                            const midZ = (seat[0][2] + seat[1][2]) / 2
                            const labelZOffset = bi === 0 ? -0.4 : 0.0

                            return (
                                <>
                                    <Text
                                        key={`bot-name-${b.id}`}
                                        position={[midX, 0.36, midZ + labelZOffset]}
                                        fontSize={0.16}
                                        color="#e5e7eb"
                                        anchorX="center"
                                        anchorY="middle"
                                    >
                                        {b.name}
                                    </Text>

                                    {players[currentPlayerIndex]?.id === b.id && (
                                        <Text
                                            key={`bot-arrow-${b.id}`}
                                            position={[midX, 0.6, midZ + labelZOffset]}
                                            fontSize={0.22}
                                            color="#f87171"
                                            anchorX="center"
                                            anchorY="middle"
                                        >
                                            🔺
                                        </Text>
                                    )}
                                </>
                            )
                        })()}
                    </group>
                ))}
            </group>

            {/* 🎉 Bannière de victoire en overlay 2D */}
            {stage === 'showdown' && winnerId && (
                <Html fullscreen>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="bg-black/70 text-white rounded-xl p-6 shadow-lg flex flex-col items-center">
                            <h2 className="text-2xl font-bold mb-3">
                                {`🏆 ${players.find(p => p.id === winnerId)?.name} gagne avec ${winnerHand.join(' ')}`}
                            </h2>

                            <div className="flex gap-4 mb-2">
                                {winnerHand.map((c, i) => (
                                    <div
                                        key={`winner-card-${i}-${c}`}
                                        className="w-16 h-24 flex items-center justify-center bg-white text-black rounded-md shadow"
                                    >
                                        {c}
                                    </div>
                                ))}
                            </div>

                            <p className="text-sm opacity-80">Partie terminée</p>
                        </div>
                    </div>
                </Html>
            )}
        </>
    )
}


