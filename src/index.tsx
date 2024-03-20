import React from 'react';
import ReactDOM from 'react-dom/client';
import {HashRouter, Routes, Route} from 'react-router-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import FootballRanker from './football-ranker/components/ranker/FootballRanker';
import Drafter from './football-ranker/components/drafter/Drafter';

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <React.StrictMode>
        <HashRouter basename="/">
            <Routes>
                <Route path="/" element={<App />}></Route>
                <Route
                    path="/football-ranker"
                    element={<FootballRanker />}
                ></Route>
                <Route path="/drafter" element={<Drafter />} />
            </Routes>
        </HashRouter>
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
