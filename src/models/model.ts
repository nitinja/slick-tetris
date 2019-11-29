export interface Piece {
  type: PieceType
  key: string
  blocks: number[][]
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
  key: string
  color: BlockColor
  effect: BlockEffectType
}

export enum BlockEffectType {
  GLOW = '',
  SEMITRANSPARENT = '',
}

export enum BlockColor {
  GREEN = '',
  RED = '',
  YELLOW = '',
}

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

  getInstance() {
    return {
      type: this,
      key: this.key,
      description: this.description,
      blocks: this.blocks.map(row => row.map(col => col)),
      currentRows: this.rows,
      currentColumns: this.columns,
    }
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
  const randomPiece = PieceType.values()[randomPieceNumber0IndexBased].getInstance()
  return randomPiece
}
