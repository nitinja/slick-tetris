import React from 'react'
import {SCORE_MULTIPLICATION_FACTOR} from './Tetris'
import {Time} from './Time'

/** @jsx jsx */
import {jsx} from '@emotion/core'

export function Overlay({startNewGame, gameState}: {startNewGame: () => void; gameState: any}) {
  return (
    <div
      css={{
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100%',
        width: '100%',
      }}
    >
      {/* {JSON.stringify(gameState)} */}
      <div
        css={{
          color: '#000',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(179, 179, 179, 0.4)',
        }}
      >
        {gameState.isGameOver ? (
          <div className="game-over">
            <div className="title">GAME OVER!</div>
            <div>Lines Completed: {gameState.score / SCORE_MULTIPLICATION_FACTOR}</div>
            <div>Score: {gameState.score}</div>
            <div>
              Time Played: <Time timeElapsedSeconds={gameState.timeElapsedSeconds} />
            </div>
          </div>
        ) : null}

        <div className="new-game">
          <button
            onClick={startNewGame}
            css={{
              marginBottom: 20,
              marginTop: 20,
            }}
          >
            : NEW GAME :
          </button>
        </div>
      </div>
    </div>
  )
}
