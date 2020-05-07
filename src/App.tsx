import React from 'react'
import './App.css'
import Tetris from './Tetris/Tetris'
/** @jsx jsx */
import {jsx} from '@emotion/core'
import GithubImage from './assets/github.svg'

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
        SLICK TETRIS Beta 0.1{' '}
        <a href="https://github.com/nitinja/slick-tetris">
          <img src={GithubImage} alt="Github Codebase" css={{width: '1rem', height: '1rem', margin: '0 1rem'}}></img>
        </a>
      </div>
      <div css={{flex: 1}}>
        <Tetris rows={20} columns={10}></Tetris>
      </div>
      <div
        css={{
          color: '#ccc',
          backgroundColor: '#eeeeee47',
          fontWeight: 'normal',
          padding: 4,
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <span aria-label="peace" role="img">
          a game by &nbsp;<a href="http://nitinj.com">NJ</a> 🌿
        </span>
      </div>
    </div>
  )
}

export default App
