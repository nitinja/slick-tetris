import React from 'react'
export function Time({timeElapsedSeconds}: {timeElapsedSeconds: number}) {
  return (
    <div
      css={{
        fontSize: '0.8rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {`${Math.floor(timeElapsedSeconds / 60)}:${timeElapsedSeconds % 60}`}
    </div>
  )
}
