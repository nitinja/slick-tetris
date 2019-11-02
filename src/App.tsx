import React from 'react'
import logo from './logo.svg'
import './App.css'
import Tetris from './Tetris/Tetris'
/** @jsx jsx */
import {jsx} from '@emotion/core'

const App: React.FC = () => {
  return (
    <div
      css={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'hidden',
      }}
    >
      <div
        css={{
          height: 50,
          color: '#CCC',
          fontWeight: 'bold',
          padding: 4,
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        Tetris Game by &nbsp;<a href="http://nitinj.com">Nitin Jadhav</a>
      </div>
      <title>Tetris 0.0.1</title>
      <div css={{flex: 1}}>
        <Tetris rows={20} columns={10}></Tetris>
      </div>
      <div
        css={{
          height: 20,
          color: '#FFF',
          backgroundColor: '#CCC',
          fontWeight: 'bold',
          padding: 4,
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <span aria-label="peace" role="img">
          🌿
        </span>
      </div>
    </div>
  )
}

export default App
