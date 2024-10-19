import { useState } from 'react'
import './App.css'
import Button from './assets/components/Button'

function App(){
  return (
    <div>
      <Button color = "secondary" onClick={() => console.log('clicked')}>Login</Button>
      </div>
  )
}

export default App
