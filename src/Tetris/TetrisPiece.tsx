import React from 'react'
import {Piece} from '../models/model'

interface Props {
  piece: Piece
}

export const TetrisPiece: React.FC<Props> = ({piece}) => {
  return (
    <div style={{marginBottom: 20, textAlign: 'center'}}>
      <div>
        {piece.blocks.map((row, index) => {
          return (
            <div key={index} style={{display: 'flex', justifyContent: 'center'}}>
              {row.map((value, index) => (
                <div key={index} style={{width: 16, height: 16, backgroundColor: value ? '#ccc' : 'transparent'}}></div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
