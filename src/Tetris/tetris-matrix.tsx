import {useReducer, useCallback, useRef} from 'react'
import {Piece, Position, Action, Block} from '../models/model'

export interface MatrixState {
  blockMatrix: Block[][]
  currentOutputMatrix: Block[][] | null
  activePiece?: Piece | null
  activePiecePosition: Position
  completedRowsCount: number
  readyForNewPiece: boolean
  matrixFull: boolean
}

const reducer = (state: MatrixState, action: Action): MatrixState => {
  switch (action.type) {
    case 'ADD_PIECE':
      const piece: Piece = action.payload
      const startColumn = Math.floor(state.blockMatrix[0].length / 2) - 1
      const defaultPosition = {row: 0, column: startColumn}
      return {
        ...state,
        activePiece: piece,
        activePiecePosition: defaultPosition,
        readyForNewPiece: false,
        currentOutputMatrix: getCombinedMatrix(state.blockMatrix, piece ? piece.blocks : [], defaultPosition),
      }
    case 'MERGE_PIECE_IN_MATRIX':
      let mergedMatrix = getCombinedMatrix(
        state.blockMatrix,
        state.activePiece ? state.activePiece.blocks : [],
        state.activePiecePosition,
      )
      /* See if there are completed lines and erase those completed lines */
      const completedRows = mergedMatrix.filter(row => row.every(item => item))
      if (completedRows.length) {
        mergedMatrix = eraseCompletedLinesFromMatrix(mergedMatrix)
      }
      return {
        ...state,
        activePiece: null,
        activePiecePosition: {row: 0, column: 0},
        blockMatrix: mergedMatrix,
        currentOutputMatrix: mergedMatrix,
        readyForNewPiece: true,
        completedRowsCount: completedRows.length,
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
    case 'RESET_MATRIX':
      return {
        ...action.payload,
      }
    case 'ROTATE_PIECE':
      // debugger
      const rotatedBlockMatrix = action.payload
      const activePiece = state.activePiece
        ? {
            ...state.activePiece,
            blocks: rotatedBlockMatrix,
            currentRows: rotatedBlockMatrix.length,
            currentColumns: rotatedBlockMatrix[0].length,
          }
        : null
      return {
        ...state,
        activePiece,
        currentOutputMatrix: getCombinedMatrix(state.blockMatrix, rotatedBlockMatrix, state.activePiecePosition),
      }
    default:
      return state
  }
}

const getEmptyMatrix = (rows: number, columns: number): Block[][] => {
  //create empty matrix for Tetris game
  return new Array(rows).fill(new Array(columns).fill(null))
}

const getCombinedMatrix = (containerMatrix: Block[][], childMatrix: Block[][], position: Position): Block[][] => {
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

const eraseCompletedLinesFromMatrix = (containerMatrix: Block[][]): Block[][] => {
  /* get all incomplete lines */
  // debugger
  const incompleteLineMatrix = containerMatrix.filter(row => row.some(item => !item))
  if (incompleteLineMatrix.length < containerMatrix.length) {
    const linesToadd = containerMatrix.length - incompleteLineMatrix.length
    const emptyRows = getEmptyMatrix(linesToadd, incompleteLineMatrix[0].length)

    /* Return merged matrix. Its same as pushing empty lines on the top */
    return emptyRows.concat(incompleteLineMatrix)
  }
  return incompleteLineMatrix
}

const getMatrixCopy = (containerMatrix: Block[][]) => containerMatrix.map(row => row.map(col => col))

/* Custom Hook */

export const useTetrisMatrix = (rows: number = 20, columns: number = 10, matrixFullCallback = () => {}): any => {
  const initialState = useRef({
    blockMatrix: getEmptyMatrix(rows, columns),
    currentOutputMatrix: getEmptyMatrix(rows, columns),
    activePiece: undefined,
    activePiecePosition: {row: 0, column: 0},
    completedRowsCount: 0,
    matrixFull: false,
    readyForNewPiece: false,
  })

  const [state, dispatch] = useReducer(reducer, initialState.current)

  const isThereSpaceForPieceBlock = useCallback(
    (pieceBlock: Block[][], position: Position) => {
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
          if (pieceBlock[pieceRow][pieceCol] && state.blockMatrix[matrixRow][matrixCol]) {
            return false
          }
        }
      }

      return true
    },
    [columns, rows, state.blockMatrix],
  )

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
    }
    return true
  }, [isThereSpaceForPieceBlock, state.activePiece, state.activePiecePosition.column, state.activePiecePosition.row])

  const addPiece = useCallback(
    (piece: Piece) => {
      const isThereSpaceAvailableForNewPiece = (piece: Piece): boolean => {
        const startColumn = piece.currentColumns === 3 || piece.currentColumns === 4 ? 4 : 5
        const endColumn = startColumn + piece.currentColumns
        for (let row = 0; row < piece.currentRows; row++) {
          for (let col = startColumn; col < endColumn; col++) {
            if (state.blockMatrix[row][col]) {
              return false
            }
          }
        }

        return true
      }
      // debugger
      if (isThereSpaceAvailableForNewPiece(piece)) {
        // add keys to block
        piece.blocks.forEach((row: Block[], rowIndex: number) => {
          row.forEach((block: Block, colIndex: number) => {
            if (block) {
              block.key = `${piece.id}-${rowIndex}-${colIndex}`
            }
          })
        })

        dispatch({type: 'ADD_PIECE', payload: piece})
        return
      }
      /* Matrix is full, call the callback */
      dispatch({type: 'MATRIX_FULL', payload: piece})
      matrixFullCallback()
    },
    [matrixFullCallback, state.blockMatrix],
  )

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
      if (state.blockMatrix[row][columnToBeChecked]) {
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
    const columnToBeChecked = state.activePiecePosition.column + state.activePiece.currentColumns - 1
    const pieceRowStart = state.activePiecePosition.row
    const pieceRowEnd = state.activePiecePosition.row + state.activePiece.currentRows - 1
    for (let row = pieceRowStart; row <= pieceRowEnd; row++) {
      if (state.blockMatrix[row][columnToBeChecked]) {
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

  const resetMatrix = () => {
    dispatch({type: 'RESET_MATRIX', payload: initialState.current})
  }

  return [state, addPiece, moveCurrentPieceLeft, moveCurrentPieceRight, moveCurrentPieceDown, rotatePiece, resetMatrix]
}
