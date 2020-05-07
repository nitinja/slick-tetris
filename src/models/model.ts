export interface Piece {
  type: PieceType
  key: string
  id?: number
  blocks: Block[][]
  description: string
  currentRows: number
  currentColumns: number
}

export interface Position {
  row: number
  column: number
}

export interface Action {
  type: string
  payload?: any
}

export interface Block {
  key?: string
  color: string
  effect?: BlockEffectType
}

export enum BlockEffectType {
  GLOW = '',
  SEMITRANSPARENT = '',
}

/* Color classes */
export const blockColors = ['color-1', 'color-2', 'color-3', 'color-4', 'color-4']

/* Emulated enum for Piece type, since TS does not support object values in enum */
export class PieceType {
  static readonly O_SHAPE = new PieceType('O_SHAPE', 'A square piece', [[1, 1], [1, 1]], 2, 2)
  static readonly T_SHAPE = new PieceType('T_SHAPE', 'A T shaped piece', [[1, 1, 1], [0, 1, 0]], 2, 3)
  static readonly I_SHAPE = new PieceType('I_SHAPE', 'An I shaped piece', [[1], [1], [1], [1]], 4, 1)
  static readonly L_SHAPE = new PieceType('L_SHAPE', 'An L shaped piece', [[1, 0], [1, 0], [1, 1]], 3, 2)
  static readonly J_SHAPE = new PieceType('J_SHAPE', 'An J shaped piece', [[0, 1], [0, 1], [1, 1]], 3, 2)
  static readonly Z_SHAPE = new PieceType('Z_SHAPE', 'An Z shaped piece', [[1, 1, 0], [0, 1, 1]], 2, 3)
  static readonly S_SHAPE = new PieceType('S_SHAPE', 'An S shaped piece', [[0, 1, 1], [1, 1, 0]], 2, 3)

  // private to disallow creating other instances of this type
  private constructor(
    private readonly key: string,
    public readonly description: string,
    public readonly blocks: number[][],
    public readonly rows: number,
    public readonly columns: number,
  ) {}

  toString() {
    return this.key
  }

  getInstance(color: string): Piece {
    return {
      type: this,
      key: this.key,
      description: this.description,
      blocks: this.getBlockPieceFromMatrix(color),
      currentRows: this.rows,
      currentColumns: this.columns,
    }
  }

  private getBlockPieceFromMatrix(color: string): Block[][] {
    return this.blocks.map((row, rowIndex) => {
      return row.map((col, colIndex) => (col ? {color} : (null as any)))
    })
  }

  static values() {
    return [
      PieceType.O_SHAPE,
      PieceType.T_SHAPE,
      PieceType.I_SHAPE,
      PieceType.L_SHAPE,
      PieceType.J_SHAPE,
      PieceType.Z_SHAPE,
      PieceType.S_SHAPE,
    ]
  }
}

export interface Position {
  row: number
  column: number
}

export const createRandomPiece = (): Piece => {
  const randomPieceNumber0IndexBased = Math.floor((Math.random() * 10) % PieceType.values().length)
  const randomColor0IndexBased = Math.floor((Math.random() * 10) % blockColors.length)
  const randomPiece = PieceType.values()[randomPieceNumber0IndexBased].getInstance(blockColors[randomColor0IndexBased])
  return randomPiece
}
