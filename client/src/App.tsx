//import { useState } from 'react'
//import reactLogo from './assets/react.svg'
//import viteLogo from './assets/vite.svg'
//import heroImg from './assets/hero.png'
import './index.css'
import Home from "./pages/Home"
import { Route } from "wouter"
import Confirmacao from "./pages/Confirmacao";
import AdminPanel from "./pages/AdminPanel";

function App() {
  return (
    <>
      <Route path="/" component={Home} />
      <Route path="/confirmacao" component={Confirmacao} />
      <Route path="/admin" component={AdminPanel} />
    </>
  );
}

export default App;
