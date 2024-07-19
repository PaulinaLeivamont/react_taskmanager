import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AppProvider from './context/app-provider';
import Dashboard from './views/dashboard';
import Landing from './views/landing';
import Login from './views/login';
import { useEffect } from 'react';
import useApp from './context/use-app';
import './App.css';

const ReadContext = () => {

    const {user} = useApp()

    useEffect(()=>{
        if (user.id === '') localStorage.removeItem('user_data')
        else localStorage.setItem('user_data', JSON.stringify(user))
    },[user])

    return (
        <Router>
            <Routes>
                <Route path="/" element={ <Landing /> } />
                <Route path="/login" element={ <Login  /> } />
                <Route path="/dashboard" element={ <Dashboard /> } />
            </Routes>
        </Router>
    )
}

const App = () => {
    return (
        <AppProvider>
            <ReadContext />
        </AppProvider>
    )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
