import {Overlay} from './Overlay'
import React, {useState, useCallback, useEffect, useReducer, useRef} from 'react'
import {createRandomPiece, Piece, Action, Block} from '../models/model'
import {useTetrisMatrix, MatrixState} from './tetris-matrix'
import {Time} from './Time'
import './tetris.css'
/** @jsx jsx */
import {jsx} from '@emotion/core'
import {TetrisPiece} from './TetrisPiece'
import PauseImage from '../assets/noun_pause_170042.svg'
import ResumeImage from '../assets/noun_play_170039.svg'
import RestartImage from '../assets/noun_restart_170019.svg'

export const SCORE_MULTIPLICATION_FACTOR = 100

interface TetrisProps {
  rows?: number
  columns?: number
}

interface GameState {
  isGameRunning: boolean
  isGamePaused: boolean
  isGameOver: boolean
  score: number
  timeElapsedSeconds: number
}

const initialGameState = {
  isGameRunning: false,
  isGamePaused: false,
  isGameOver: false,
  score: 0,
  timeElapsedSeconds: 0,
}

const reducer = (state: GameState, action: Action) => {
  //console.debug('handling action: ', action.type)
  switch (action.type) {
    case 'START_NEW_GAME':
      return {
        ...state,
        isGameRunning: true,
        isGamePaused: false,
        isGameOver: false,
        timeElapsedSeconds: 0,
        score: 0,
      }
    case 'PAUSE_GAME':
      return {
        ...state,
        isGameRunning: false,
        isGamePaused: true,
      }
    case 'RESUME_GAME':
      return {
        ...state,
        isGameRunning: true,
        isGamePaused: false,
      }
    case 'GAME_OVER':
      return {
        ...state,
        isGameRunning: false,
        isGamePaused: false,
        isGameOver: true,
      }
    case 'INCREMENT_SCORE_FOR_N_LINES':
      const score = state.score + action.payload * SCORE_MULTIPLICATION_FACTOR
      return {
        ...state,
        score,
      }
    case 'UPDATE_TIME':
      return {
        ...state,
        timeElapsedSeconds: action.payload ? action.payload : state.timeElapsedSeconds + 1,
      }
    default:
      return state
  }
}

const Tetris: React.FC<TetrisProps> = ({rows = 20, columns = 10}) => {
  /* Piece Id */
  let pieceSequenceNumber = useRef<number>(0)

  /* matrix board Full callback */
  const matrixFullCallback = useCallback(() => {
    dispatchGameState({type: 'GAME_OVER'})
  }, [])

  const [gameState, dispatchGameState] = useReducer(reducer, initialGameState)
  const [
    state,
    addPiece,
    moveCurrentPieceLeft,
    moveCurrentPieceRight,
    moveCurrentPieceDown,
    rotatePiece,
    resetMatrix,
  ]: [
    MatrixState,
    (piece: Piece) => void,
    () => void,
    () => void,
    () => void,
    () => void,
    () => void,
  ] = useTetrisMatrix(rows, columns, matrixFullCallback)

  const [randomPiecesQueue, setRandomPiecesQueue] = useState([
    createRandomPiece(),
    createRandomPiece(),
    createRandomPiece(),
  ])

  const requestNewPiece = useCallback(() => {
    const frontPieceFormQueue = randomPiecesQueue.pop()
    if (frontPieceFormQueue) {
      //assign a unique key to this new piece
      frontPieceFormQueue.id = ++pieceSequenceNumber.current
      addPiece(frontPieceFormQueue)
      setRandomPiecesQueue([createRandomPiece(), ...randomPiecesQueue])
    }
  }, [addPiece, randomPiecesQueue])

  const startNewGame = useCallback(() => {
    // reset tetris matrix to initial state
    resetMatrix()

    dispatchGameState({type: 'START_NEW_GAME'})
  }, [resetMatrix])

  const togglePauseGame = useCallback(() => {
    dispatchGameState({type: gameState.isGamePaused ? 'RESUME_GAME' : 'PAUSE_GAME'})
  }, [gameState.isGamePaused])

  const onKeyDown = useCallback(
    (e: any) => {
      e.preventDefault()
      if (gameState.isGamePaused) {
        return
      }
      // only handle arrow keys
      switch (e.key) {
        case 'ArrowLeft':
          moveCurrentPieceLeft()
          break
        case 'ArrowRight':
          moveCurrentPieceRight()
          break
        case 'ArrowDown':
          moveCurrentPieceDown()
          break
        case 'ArrowUp':
        case 'space':
          rotatePiece()
          break
        default:
          break
      }
    },
    [gameState.isGamePaused, moveCurrentPieceDown, moveCurrentPieceLeft, moveCurrentPieceRight, rotatePiece],
  )

  /* timer to move current piece */
  useEffect(() => {
    if (gameState.isGameRunning) {
      const pieceDropInterval = setInterval(() => {
        moveCurrentPieceDown()
      }, 1000)
      return () => {
        clearInterval(pieceDropInterval)
      }
    }
  }, [gameState.isGameRunning, moveCurrentPieceDown])

  /* timer to update time elapsed */
  useEffect(() => {
    if (gameState.isGameRunning) {
      const timeElapsedUpdatingInterval = setInterval(() => {
        dispatchGameState({type: 'UPDATE_TIME'})
      }, 1000)
      return () => {
        clearInterval(timeElapsedUpdatingInterval)
      }
    }
  }, [gameState.isGameRunning])

  /* add key handler */
  useEffect(() => {
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [onKeyDown])

  useEffect(() => {
    if (state.readyForNewPiece) {
      requestNewPiece()
    }
  }, [requestNewPiece, state.readyForNewPiece])

  useEffect(() => {
    dispatchGameState({type: 'INCREMENT_SCORE_FOR_N_LINES', payload: state.completedRowsCount})
  }, [state.completedRowsCount])

  return (
    <div css={{position: 'relative', height: '40rem', width: '25rem', margin: '0 auto'}}>
      <div
        css={{
          backgroundColor: '#eee',
          border: '4px solid #CCC',
          padding: '0.5rem',
          display: 'grid',
          gridTemplateColumns: 'auto 4rem',
          gridTemplateRows: 'auto 2rem',
          gridGap: 2,
          height: '100%',
          width: '100%',
        }}
      >
        {/* main output matrix area */}
        <div
          css={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
            gridGap: 1,
          }}
        >
          {state.currentOutputMatrix &&
            state.currentOutputMatrix.map((row: Block[], rowIndex) =>
              row.map((block: Block, colIndex) => (
                <div
                  className={`block ${block ? ' active ' + block.color : ''}`}
                  key={block ? block.key : `${rowIndex}-${colIndex}`}
                ></div>
              )),
            )}
        </div>
        {/* upcoming random pieces */}
        <div
          css={{
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div css={{display: 'flex', flexDirection: 'column-reverse', paddingTop: '1rem'}}>
            {(gameState.isGameRunning || gameState.isGamePaused) && (
              <div>
                <div css={{fontSize: '0.5rem', marginBottom: '1rem'}}>NEXT</div>
                {randomPiecesQueue.map((piece, index) => (
                  <TetrisPiece key={index} piece={piece} />
                ))}
              </div>
            )}
          </div>
          {/* restart and pause buttons */}
          <div css={{display: 'flex', flexDirection: 'column-reverse'}}>
            <button
              css={{border: '1px solid #ccc', margin: '0.5rem'}}
              title={gameState.isGamePaused ? 'Resume Game' : 'Pause Game'}
              onClick={togglePauseGame}
            >
              <img
                src={gameState.isGamePaused ? ResumeImage : PauseImage}
                width="40"
                height="32"
                alt={gameState.isGamePaused ? 'Resume Game' : 'Pause Game'}
              />
            </button>
            <button css={{border: '1px solid #ccc', margin: '0.5rem'}} title="Restart Game" onClick={startNewGame}>
              <img src={RestartImage} width="40" height="32" alt="Restart Game" />
            </button>
          </div>
        </div>
        {(gameState.isGameRunning || gameState.isGamePaused) && (
          <div css={{fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <img src="./assets/noun_Diamond_170032.svg" width="40" height="22" alt="score" /> {gameState.score}
          </div>
        )}
        {(gameState.isGameRunning || gameState.isGamePaused) && (
          <Time timeElapsedSeconds={gameState.timeElapsedSeconds} />
        )}
      </div>

      {/* paused block */}
      <div
        hidden={!gameState.isGamePaused}
        css={{
          marginBottom: '1rem',
          position: 'absolute',
          top: '50%',
          left: 'calc(50% - 90px)',
          padding: '1rem',
          background: 'rgba(0,0,0,0.4)',
          color: 'white',
          fontSize: '1rem',
        }}
      >
        PAUSED
      </div>

      {!gameState.isGameRunning && !gameState.isGamePaused && (
        <div>
          <Overlay gameState={gameState} startNewGame={startNewGame} />
        </div>
      )}
    </div>
  )
}

Tetris.defaultProps = {
  rows: 20,
  columns: 10,
}

export default Tetris
