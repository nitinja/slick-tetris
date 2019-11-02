import React, {useState, useCallback, useEffect, useReducer, useRef} from 'react'
import {PieceType, createRandomPiece, Piece, Action} from '../models/model'
import {useTetrisMatrix, MatrixState} from './tetris-matrix'

/** @jsx jsx */
import {jsx} from '@emotion/core'
import {TetrisPiece} from './TetrisPiece'

const SCORE_MULTIPLICATION_FACTOR = 100

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
      return {
        ...initialGameState,
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
  const matrixFullCallback = () => {
    dispatchGameState({type: 'GAME_OVER'})
  }

  const [gameState, dispatchGameState] = useReducer(reducer, initialGameState)
  const [state, addPiece, moveCurrentPieceLeft, moveCurrentPieceRight, moveCurrentPieceDown, rotatePiece]: [
    MatrixState,
    (piece: Piece) => void,
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
    const frontPieceFormQueue = randomPiecesQueue.pop()
    if (frontPieceFormQueue) {
      addPiece(frontPieceFormQueue)
      setRandomPiecesQueue([createRandomPiece(), ...randomPiecesQueue])
    }
  }, [addPiece, randomPiecesQueue])

  const startNewGame = () => {
    dispatchGameState({type: 'START_NEW_GAME'})

    dispatchGameState({type: 'UPDATE_TIME', payload: 0})
    if (timeInterval.current) {
      clearInterval(timeInterval.current)
    }
    timeInterval.current = setInterval(() => {
      // console.log('timer ran...')
      dispatchGameState({type: 'UPDATE_TIME'})
    }, 1000)
    addFrontBlockFromQueue()
  }
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
    if (state.readyForNewPiece) {
      addFrontBlockFromQueue()
    }
  }, [addFrontBlockFromQueue, state.readyForNewPiece])
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
            gridGap: 2,
          }}
        >
          {state.currentOutputMatrix &&
            state.currentOutputMatrix.map((row: number[]) =>
              row.map((value, index) => (
                <div
                  css={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: value ? '#ccc' : '#fff',
                  }}
                  key={index}
                >
                  {/* {value} */}
                </div>
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
            {randomPiecesQueue && randomPiecesQueue.map((piece, index) => <TetrisPiece key={index} piece={piece} />)}
            <div css={{fontSize: '0.5rem', marginBottom: '1rem'}}>NEXT</div>
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
        <div css={{fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <img src="./assets/noun_Diamond_170032.svg" width="40" height="22" alt="score" /> {gameState.score}
        </div>
        <div css={{fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          {`${Math.floor(gameState.timeElapsedSeconds / 60)}:${gameState.timeElapsedSeconds % 60}`}
          {/* {gameState.timeElapsedSeconds} */}
        </div>
      </div>
      {!gameState.isGameRunning && (
        <div css={{position: 'absolute', top: 0, left: 0, height: '100%', width: '100%'}}>
          <div
            css={{
              color: '#000',
              display: 'flex',
              height: '100%',
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(179, 179, 179, 0.4)',
            }}
          >
            {gameState.isGameOver ? 'GAME OVER!' : null}
            {!gameState.isGameRunning && !gameState.isGamePaused ? (
              <button onClick={startNewGame} css={{marginBottom: 20, marginTop: 20}}>
                : NEW GAME :
              </button>
            ) : null}
          </div>
        </div>
      )}
      {/* {JSON.stringify(state)} */}
    </div>
  )
}

Tetris.defaultProps = {
  rows: 20,
  columns: 10,
}

export default Tetris
