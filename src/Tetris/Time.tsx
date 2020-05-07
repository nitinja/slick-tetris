import React from 'react'
/** @jsx jsx */
import {jsx} from '@emotion/core'

export const Time: React.FC<{timeElapsedSeconds: number}> = ({timeElapsedSeconds}) => {
  const minutes = Math.floor(timeElapsedSeconds / 60)
  const seconds = timeElapsedSeconds % 60
  return (
    <div
      css={{
        fontSize: '0.8rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {`${minutes}:${seconds}`} M
    </div>
  )
}
