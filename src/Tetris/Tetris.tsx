import {Overlay} from './Overlay'
import React, {useState, useCallback, useEffect, useReducer, useRef} from 'react'
import {createRandomPiece, Piece, Action, Block} from '../models/model'
import {useTetrisMatrix, MatrixState} from './tetris-matrix'
import {Time} from './Time'
import './tetris.css'
/** @jsx jsx */
import {jsx} from '@emotion/core'
import {TetrisPiece} from './TetrisPiece'

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
  switch (action.type) {
    case 'START_NEW_GAME':
      console.log('in start new game action handler')
      return {
        ...state,
        isGameRunning: true,
        isGamePaused: false,
        isGameOver: false,
        timeElapsedSeconds: 0,
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
  /* Persistent time interval */
  let timeInterval = useRef<any>()
  let pieceSequenceNumber = useRef<number>(0)
  const matrixFullCallback = useCallback(() => {
    dispatchGameState({type: 'GAME_OVER'})
    if (timeInterval.current) {
      clearInterval(timeInterval.current)
    }
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

  const addFrontBlockFromQueue = useCallback(() => {
    // debugger
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

    if (timeInterval.current) {
      clearInterval(timeInterval.current)
    }
    timeInterval.current = setInterval(() => {
      dispatchGameState({type: 'UPDATE_TIME'})
    }, 1000)

    dispatchGameState({type: 'START_NEW_GAME'})
    addFrontBlockFromQueue()
  }, [addFrontBlockFromQueue, resetMatrix])

  useEffect(() => {
    console.log('game now running: ' + gameState.isGameRunning)
  }, [gameState.isGameRunning])

  const onKeyDown = useCallback(
    (e: any) => {
      e.preventDefault()
      // console.log('key pressed: ' + e.key)
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        // only handle arrow keys
        if (e.key === 'ArrowLeft') {
          moveCurrentPieceLeft()
        }
        if (e.key === 'ArrowRight') {
          moveCurrentPieceRight()
        }
        if (e.key === 'ArrowDown') {
          moveCurrentPieceDown()
        }
        if (e.key === 'ArrowUp' || e.key === 'space') {
          rotatePiece()
        }
      }
    },
    [moveCurrentPieceDown, moveCurrentPieceLeft, moveCurrentPieceRight, rotatePiece],
  )

  /* start timer to move current piece */
  useEffect(() => {
    const pieceDropInterval = setInterval(() => {
      moveCurrentPieceDown()
    }, 1000)
    return () => {
      clearInterval(pieceDropInterval)
    }
  }, [moveCurrentPieceDown])

  /* add key handler */
  useEffect(() => {
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [onKeyDown])
  useEffect(() => {
    if (state.readyForNewPiece && !state.matrixFull) {
      addFrontBlockFromQueue()
    }
  }, [addFrontBlockFromQueue, state.matrixFull, state.readyForNewPiece])
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
        <div
          css={{
            // border: '1px solid #ccc',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div css={{display: 'flex', flexDirection: 'column-reverse', paddingTop: '1rem'}}>
            {gameState.isGameRunning && randomPiecesQueue && (
              <div>
                <div css={{fontSize: '0.5rem', marginBottom: '1rem'}}>NEXT</div>
                {randomPiecesQueue.map((piece, index) => (
                  <TetrisPiece key={index} piece={piece} />
                ))}
              </div>
            )}
          </div>
          <div css={{display: 'flex', flexDirection: 'column-reverse'}}>
            <button css={{border: '1px solid #ccc', margin: '0.5rem'}}>
              <img src="./assets/noun_restart_170019.svg" width="40" height="32" alt="pause" />
            </button>
            <button css={{border: '1px solid #ccc', margin: '0.5rem'}}>
              <img src="./assets/noun_pause_170042.svg" width="40" height="32" alt="restart" />
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

      <Overlay gameState={gameState} startNewGame={startNewGame} />

      <span style={{fontFamily: 'mono'}}>{JSON.stringify(gameState, null, 2)}</span>
    </div>
  )
}

Tetris.defaultProps = {
  rows: 20,
  columns: 10,
}

export default Tetris
