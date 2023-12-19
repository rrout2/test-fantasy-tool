import React, {useEffect} from 'react';
// import logo from './logo.svg';
import './App.css';
import {readFileSync} from 'fs';
function App() {
    useEffect(() => {
        readFileSync('players/all_players.json', 'utf-8');
    });
    return (
        <div className="App">
            <header className="App-header">
                <p>
                    Edit <code>src/App.tsx</code> and save to reload.
                </p>
                <a
                    className="App-link"
                    href="https://reactjs.org"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Learn React
                </a>
            </header>
        </div>
    );
}

export default App;
