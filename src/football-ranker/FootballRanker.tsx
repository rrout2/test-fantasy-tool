import React, {
    ChangeEvent,
    ChangeEventHandler,
    useEffect,
    useState,
} from 'react';
import nflPlayersJson from './nfl_players.json';
import './FootballRanker.css';
import {Button} from '@mui/material';
import {MuiFileInput} from 'mui-file-input';

type PlayerJson = {
    full_name: string;
    player_id: number;
    position: string;
    years_exp: number;
    active: boolean;
    fantasy_positions: string[];
};

const FANTASY_POSITIONS = new Set(['QB', 'RB', 'WR', 'TE']);

export default function FootballRanker() {
    const [rankings, setRankings] = useState<PlayerJson[]>([]);
    const [players, setPlayers] = useState<Map<number, PlayerJson>>(new Map());
    const [file, setFile] = React.useState<File>();

    useEffect(() => {
        loadPlayers();
    }, []);

    function loadPlayers() {
        const nflPlayers = Object.entries(nflPlayersJson);
        const players = nflPlayers
            .map(p => p[1] as PlayerJson)
            .filter(isFantasyRelevant);
        const mappedPlayers = new Map<number, PlayerJson>();
        players.forEach(player => {
            mappedPlayers.set(player.player_id, player);
        });
        setPlayers(mappedPlayers);
        setRankings(players);
    }

    function downloadRankings() {
        // file object
        const json = JSON.stringify(
            rankings.map(r => r.player_id),
            null,
            4
        );
        const file = new Blob([json], {type: 'application/json'});
        // anchor link
        const element = document.createElement('a');
        element.href = URL.createObjectURL(file);
        element.download = 'Rankings-' + Date.now() + '.json';
        // simulate link click
        document.body.appendChild(element); // Required for this to work in FireFox
        element.click();
    }

    function downloadButton() {
        return <Button onClick={downloadRankings}>Download</Button>;
    }

    function uploadRankings(value: File | null) {
        if (!value) return;

        setFile(value);
        const fileReader = new FileReader();
        fileReader.readAsText(value, 'UTF-8');
        fileReader.onload = e => {
            if (!e.target) return;
            const raw = JSON.parse(e.target.result as string) as number[];
            setRankings(
                raw.map(playerId => {
                    return players.get(playerId)!;
                })
            );
        };
    }

    function uploadButton() {
        return (
            <MuiFileInput
                className="uploadButton"
                value={file}
                onChange={uploadRankings}
                inputProps={{accept: 'application/json'}}
                getInputText={(f: File | null) => {
                    return f ? 'Uploaded' : 'Upload';
                }}
            />
        );
    }

    function playerCard(p: PlayerJson) {
        return (
            <div key={p.player_id} className="playerCard">
                <div>{p.full_name}</div>
                <div>{`${p.position}`}</div>
                <div>{`Year ${p.years_exp + 1}`}</div>
            </div>
        );
    }

    function rankingComponent() {
        return rankings.map(playerCard);
    }

    return (
        <div className="body">
            <div className="toolbar">
                {downloadButton()}
                {uploadButton()}
            </div>
            <div className="ranker">{rankingComponent()}</div>
        </div>
    );
}

function isFantasyRelevant(p: PlayerJson) {
    return (
        p.active &&
        !!p.full_name &&
        !!p.position &&
        FANTASY_POSITIONS.has(p.position)
    );
}
