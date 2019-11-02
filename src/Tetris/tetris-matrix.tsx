import {useEffect, useReducer, useCallback} from 'react'
import {Piece, Position} from '../models/Piece'

export interface MatrixState {
  blockMatrix: number[][]
  currentOutputMatrix: number[][] | null
  activePiece?: Piece | null
  activePiecePosition: Position
  matrixFull: boolean
}

const reducer = (state: MatrixState, action: any): MatrixState => {
  switch (action.type) {
    case 'ADD_PIECE':
      const piece: Piece = action.payload
      const startColumn = Math.floor(state.blockMatrix[0].length / 2) - 1
      const defaultPosition = {row: 0, column: startColumn}
      return {
        ...state,
        activePiece: piece,
        activePiecePosition: defaultPosition,
        currentOutputMatrix: getCombinedMatrix(state.blockMatrix, piece ? piece.blocks : [], defaultPosition),
      }
    case 'MERGE_PIECE_IN_MATRIX':
      console.log('piece merged!')
      return {
        ...state,
        activePiece: null,
        activePiecePosition: {row: 0, column: 0},
        blockMatrix: getCombinedMatrix(
          state.blockMatrix,
          state.activePiece ? state.activePiece.blocks : [],
          state.activePiecePosition,
        ),
      }
    case 'ERASE_COMPLETED_LINES_IN_MATRIX':
      const matrixWithIncompleteLines = eraseCompletedLinesFromMatrix(state.blockMatrix)
      if (!matrixWithIncompleteLines) {
        return state
      }
      return {
        ...state,
        activePiece: null,
        activePiecePosition: {row: 0, column: 0},
        blockMatrix: matrixWithIncompleteLines,
        currentOutputMatrix: matrixWithIncompleteLines,
      }
    case 'MOVE_PIECE_TO_LEFT':
      const activePiecePositionLeft = {row: state.activePiecePosition.row, column: state.activePiecePosition.column - 1}
      return {
        ...state,
        activePiecePosition: activePiecePositionLeft,
        currentOutputMatrix: getCombinedMatrix(
          state.blockMatrix,
          state.activePiece ? state.activePiece.blocks : [],
          activePiecePositionLeft,
        ),
      }
    case 'MOVE_PIECE_TO_RIGHT':
      const activePiecePositionRight = {
        row: state.activePiecePosition.row,
        column: state.activePiecePosition.column + 1,
      }
      return {
        ...state,
        activePiecePosition: activePiecePositionRight,
        currentOutputMatrix: getCombinedMatrix(
          state.blockMatrix,
          state.activePiece ? state.activePiece.blocks : [],
          activePiecePositionRight,
        ),
      }
    case 'MOVE_PIECE_DOWN':
      const activePiecePositionDown = {row: state.activePiecePosition.row + 1, column: state.activePiecePosition.column}
      return {
        ...state,
        activePiecePosition: activePiecePositionDown,
        currentOutputMatrix: getCombinedMatrix(
          state.blockMatrix,
          state.activePiece ? state.activePiece.blocks : [],
          activePiecePositionDown,
        ),
      }
    case 'MATRIX_FULL':
      return {
        ...state,
        activePiece: null,
        matrixFull: true,
      }
    case 'ROTATE_PIECE':
      const rotatedBlockMatrix = action.payload
      return {
        ...state,
        activePiece: state.activePiece ? {...state.activePiece, blocks: rotatedBlockMatrix} : null,
        currentOutputMatrix: getCombinedMatrix(state.blockMatrix, rotatedBlockMatrix, state.activePiecePosition),
      }
    default:
      return state
  }
}

const getEmptyMatrix = (rows: number, columns: number): number[][] => {
  //create empty matrix for Tetris game
  const _blockMatrix = []
  for (let i = 0; i < rows; i++) {
    const rowArray = new Array(columns)
    rowArray.fill(0)
    _blockMatrix.push(rowArray)
  }
  return _blockMatrix
}

const getCombinedMatrix = (containerMatrix: number[][], childMatrix: number[][], position: Position): number[][] => {
  const pieceMatrixRows = childMatrix.length,
    pieceMatrixColumns = childMatrix[0].length

  const _containerMatrix = getMatrixCopy(containerMatrix)
  for (let pieceRow = 0; pieceRow < pieceMatrixRows; pieceRow++) {
    for (let pieceCol = 0; pieceCol < pieceMatrixColumns; pieceCol++) {
      _containerMatrix[position.row + pieceRow][position.column + pieceCol] =
        childMatrix[pieceRow][pieceCol] || _containerMatrix[position.row + pieceRow][position.column + pieceCol]
    }
  }
  return _containerMatrix
}

const eraseCompletedLinesFromMatrix = (containerMatrix: number[][]): number[][] | null => {
  const completedRows = containerMatrix.filter(row => row.every(item => item === 1))
  if (!completedRows.length) {
    return null
  }

  /* create a copy */
  //  let _containerMatrix = getMatrixCopy(containerMatrix)

  /* get all incomplete lines */
  const emptyRows = getEmptyMatrix(completedRows.length, completedRows[0].length)
  const uncomlpetedMatrix = containerMatrix.filter(row => row.some(item => item === 0))

  /* Return merged matrix. Its same as pushing empty lines on the top */
  return emptyRows.concat(uncomlpetedMatrix)
}

const getMatrixCopy = (containerMatrix: number[][]) => containerMatrix.map(row => row.map(col => col))

/* Custom Hook */

export const useTetrisMatrix = (rows: number, columns: number, activePieceMergedCallback: () => void): any => {
  const initialState: MatrixState = {
    blockMatrix: getEmptyMatrix(rows, columns),
    currentOutputMatrix: getEmptyMatrix(rows, columns),
    activePiece: undefined,
    activePiecePosition: {row: 0, column: 0},
    matrixFull: false,
  }

  const [state, dispatch] = useReducer(reducer, initialState)

  const isThereSpaceForPieceBlock = useCallback(
    (pieceBlock: number[][], position: Position) => {
      if (!pieceBlock) {
        return false
      }

      const pieceRows = pieceBlock.length
      const pieceCols = pieceBlock[0].length
      if (position.column + pieceCols > columns || position.row + pieceRows > rows) {
        // pieceBlocks are exceeding or going outside of main block matrix
        return
      }

      for (let matrixRow = position.row, pieceRow = 0; matrixRow < position.row + pieceRows; matrixRow++, pieceRow++) {
        for (
          let matrixCol = position.column, pieceCol = 0;
          matrixCol < position.column + pieceCols;
          matrixCol++, pieceCol++
        ) {
          if (pieceBlock[pieceRow][pieceCol] !== 0 && state.blockMatrix[matrixRow][matrixCol] !== 0) {
            return false
          }
        }
      }

      return true
    },
    [columns, rows, state.blockMatrix],
  )

  // const isThereSpaceForPieceBlock = useCallback((pieceBlock: number[][], position: {row: number, column: number}) => {
  //   if (!state.activePiece || state.activePiecePosition.row + state.activePiece.currentRows >= rows) {
  //     return false
  //   }
  //   const rowToBeChecked = state.blockMatrix[state.activePiecePosition.row + state.activePiece.currentRows]
  //   const lastRowOfPiece = state.activePiece.blocks[state.activePiece.blocks.length - 1]

  //   const pieceColumnStartIndex = state.activePiecePosition.column
  //   const pieceColumnEndIndex = state.activePiecePosition.column + state.activePiece.currentColumns

  //   const isSpaceAvailableBelow = rowToBeChecked
  //     .slice(pieceColumnStartIndex, pieceColumnEndIndex)
  //     .every((value, index) => lastRowOfPiece[index] === 0 || value !== 1)

  //   return isSpaceAvailableBelow
  // }, [rows, state.activePiece, state.activePiecePosition.column, state.activePiecePosition.row, state.blockMatrix])

  const moveCurrentPieceDown = useCallback((): boolean => {
    /* If this is last row, or if there is no space below for this piece, return false i.e. fail*/
    if (!state.activePiece) {
      return false
    }

    const newDesiredPosition: Position = {
      row: state.activePiecePosition.row + 1,
      column: state.activePiecePosition.column,
    }
    if (isThereSpaceForPieceBlock(state.activePiece.blocks, newDesiredPosition)) {
      /* there is space available. Move piece down 1 line */
      dispatch({type: 'MOVE_PIECE_DOWN'})
    } else {
      /* If there is no space left below, combine piece with blockMatrix */
      dispatch({type: 'MERGE_PIECE_IN_MATRIX'})
      dispatch({type: 'ERASE_COMPLETED_LINES_IN_MATRIX'})

      if (activePieceMergedCallback) {
        activePieceMergedCallback()
      }
      /* See if there are completed lines and erase those completed lines */
    }
    return true
  }, [
    activePieceMergedCallback,
    isThereSpaceForPieceBlock,
    state.activePiece,
    state.activePiecePosition.column,
    state.activePiecePosition.row,
  ])

  /* start timer to move current piece */
  useEffect(() => {
    const pieceDropInterval = setInterval(() => {
      moveCurrentPieceDown()
    }, 1000)
    return () => {
      clearInterval(pieceDropInterval)
    }
  }, [moveCurrentPieceDown])

  const addPiece = (piece: Piece) => {
    if (isThereSpaceAvailableForNewPiece(piece)) {
      dispatch({type: 'ADD_PIECE', payload: piece})
      return
    }
    dispatch({type: 'MATRIX_FULL', payload: piece})
  }

  const isThereSpaceAvailableForNewPiece = (piece: Piece): boolean => {
    const startColumn = piece.currentColumns === 3 || piece.currentColumns === 4 ? 4 : 5
    const endColumn = startColumn + piece.currentColumns
    for (let row = 0; row < piece.currentRows; row++) {
      for (let col = startColumn; col < endColumn; col++) {
        if (state.blockMatrix[row][col] === 1) {
          return false
        }
      }
    }

    return true
  }

  /* Is there a space for any given piece at given position in matrix? */
  // const isThereSpaceAvailableForPiece = (piece: Piece): boolean => {
  //   const startColumn = piece.currentColumns
  //   const endColumn = startColumn + piece.currentColumns
  //   for (let row = 0; row < piece.currentRows; row++) {
  //     for (let col = startColumn; col < endColumn; col++) {
  //       if (state.blockMatrix[row][col] === 1) {
  //         return false
  //       }
  //     }
  //   }

  //   return true
  // }

  const moveCurrentPieceLeft = () => {
    /* If this is first column, return false i.e. fail*/
    if (!state.activePiece || state.activePiecePosition.column === 0) {
      return false
    }
    // check if there is a space to left for this piece
    const columnToBeChecked = state.activePiecePosition.column - 1
    const pieceRowStart = state.activePiecePosition.row
    const pieceRowEnd = state.activePiecePosition.row + state.activePiece.currentRows - 1
    for (let row = pieceRowStart; row <= pieceRowEnd; row++) {
      if (state.blockMatrix[row][columnToBeChecked] === 1) {
        return false
      }
    }
    /* there is space available. Move piece to left 1 column */
    dispatch({type: 'MOVE_PIECE_TO_LEFT'})
  }

  const moveCurrentPieceRight = () => {
    /* If this is last column, return false i.e. fail*/
    if (!state.activePiece || state.activePiecePosition.column + state.activePiece.currentColumns >= columns) {
      return false
    }
    // check if there is a space to right for this piece
    const columnToBeChecked = state.activePiecePosition.column + state.activePiece.currentColumns
    const pieceRowStart = state.activePiecePosition.row
    const pieceRowEnd = state.activePiecePosition.row + state.activePiece.currentRows - 1
    for (let row = pieceRowStart; row <= pieceRowEnd; row++) {
      if (state.blockMatrix[row][columnToBeChecked] === 1) {
        return false
      }
    }

    /* there is space available. Move piece to right 1 column */
    dispatch({type: 'MOVE_PIECE_TO_RIGHT'})
  }

  const rotatePiece = () => {
    if (!state.activePiece) {
      return false
    }

    const matrix = state.activePiece.blocks || []
    // find a transpose of block matrix
    const rotatedBlockMatrix = matrix[0].map((val, index) => matrix.map(row => row[index]).reverse())

    //check if there is a space for rotated piece
    if (isThereSpaceForPieceBlock(rotatedBlockMatrix, state.activePiecePosition)) {
      dispatch({type: 'ROTATE_PIECE', payload: rotatedBlockMatrix})
    }
  }

  return [state, addPiece, moveCurrentPieceLeft, moveCurrentPieceRight, moveCurrentPieceDown, rotatePiece]
}
