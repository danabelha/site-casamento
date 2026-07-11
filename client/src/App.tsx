//import { useState } from 'react'
//import reactLogo from './assets/react.svg'
//import viteLogo from './assets/vite.svg'
//import heroImg from './assets/hero.png'
import './index.css'
import Home from "./pages/Home"
import { Route } from "wouter"
import Confirmacao from "./pages/Confirmacao";
import AdminPanel from "./pages/AdminPanel";
import { trpc } from "./lib/trpc";

function App() {
  // RC-5.10.2: Silent server pre-warming at the root level
  // This ensures the Render server starts waking up as soon as the visitor opens the site (Home)
  trpc.health.useQuery(undefined, {
    staleTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
  });

  return (
    <>
      <Route path="/" component={Home} />
      <Route path="/confirmacao" component={Confirmacao} />
      <Route path="/admin" component={AdminPanel} />
    </>
  );
}

export default App;
