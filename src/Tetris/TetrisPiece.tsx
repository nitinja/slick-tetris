import React from 'react'
import {Piece, Block} from '../models/model'

interface Props {
  piece: Piece
}

export const TetrisPiece: React.FC<Props> = ({piece}) => {
  return (
    <div style={{marginBottom: 20, textAlign: 'center'}}>
      <div>
        {piece.blocks.map((row: Block[], index) => {
          return (
            <div key={index} style={{display: 'flex', justifyContent: 'center'}}>
              {row.map((block: Block, index) => (
                <div className={block ? `block ${block.color}` : ''} key={index} style={{width: 16, height: 16}}></div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
