import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'
import Login from './Components/Login'
import Signup from './Components/Signup'


function App() {
  return(
    <div>
      <h1>SIGN IN PAGE!! YAAAYY</h1>
      <Signup/>
      <br/>
      <Login/>
    </div>
  );

}

export default App
