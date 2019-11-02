import React, {useState, useCallback, useEffect} from 'react'
import {PieceType, createRandomPiece, Piece} from '../models/Piece'
import {useTetrisMatrix, MatrixState} from './tetris-matrix'

/** @jsx jsx */
import {jsx} from '@emotion/core'
import {TetrisPiece} from './TetrisPiece'

interface TetrisProps {
  rows?: number
  columns?: number
}

const Tetris: React.FC<TetrisProps> = ({rows = 20, columns = 10}) => {
  const activePieceMergedCallback = () => {
    addFrontBlockFromQueue()
  }
  const [state, addPiece, moveCurrentPieceLeft, moveCurrentPieceRight, moveCurrentPieceDown, rotatePiece]: [
    MatrixState,
    (piece: Piece) => void,
    () => void,
    () => void,
    () => void,
    () => void,
  ] = useTetrisMatrix(rows, columns, activePieceMergedCallback)

  const [randomPiecesQueue, setRandomPiecesQueue] = useState([
    createRandomPiece(),
    createRandomPiece(),
    createRandomPiece(),
  ])

  const addFrontBlockFromQueue = () => {
    const frontPieceFormQueue = randomPiecesQueue.pop()
    if (frontPieceFormQueue) {
      addPiece(frontPieceFormQueue)
      setRandomPiecesQueue([createRandomPiece(), ...randomPiecesQueue])
    }
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

  /* add key handler */
  useEffect(() => {
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [onKeyDown])

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
        <div css={{border: '1px solid #ccc', textAlign: 'center'}}>
          <button onClick={addFrontBlockFromQueue} css={{marginBottom: 20, marginTop: 20}}>
            Start
          </button>
          <div css={{display: 'flex', flexDirection: 'column-reverse'}}>
            {randomPiecesQueue && randomPiecesQueue.map((piece, index) => <TetrisPiece key={index} piece={piece} />)}
          </div>
        </div>
        <div css={{border: '1px solid #ccc'}}>Score</div>
        <div css={{border: '1px solid #ccc'}}>Time</div>
      </div>
      {state.matrixFull && (
        <div css={{position: 'absolute', top: 0, left: 0, height: '100%', width: '100%'}}>
          <div
            css={{
              color: '#000',
              display: 'flex',
              height: '100%',
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            GAME OVER!
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
