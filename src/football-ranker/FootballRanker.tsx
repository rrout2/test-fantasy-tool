import React, {ChangeEvent, useEffect, useMemo, useState} from 'react';
import nflPlayersJson from './nfl_players.json';
import './FootballRanker.css';
import {Button} from '@mui/material';
import {
    MRT_ColumnDef,
    MRT_Row,
    MaterialReactTable,
    useMaterialReactTable,
} from 'material-react-table';

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

    const columns = useMemo<MRT_ColumnDef<PlayerJson>[]>(
        () => [
            {
                accessorFn: row => row.full_name,
                id: 'name',
                header: 'Name',
            },
            {
                accessorFn: row => row.position,
                id: 'pos',
                header: 'Position',
            },
            {
                accessorFn: row => row.years_exp,
                id: 'years',
                header: 'Years Experience',
            },
        ],
        []
    );

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

    function uploadRankings(e: ChangeEvent<HTMLInputElement>) {
        if (!e.target.files) return;

        const fileReader = new FileReader();
        fileReader.readAsText(e.target.files[0], 'UTF-8');
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
            <Button component="label">
                Upload
                <input
                    type="file"
                    hidden
                    onChange={uploadRankings}
                    accept="application/json"
                />
            </Button>
        );
    }

    function rankingComponent() {
        return (
            <MaterialReactTable
                table={useMaterialReactTable({
                    autoResetPageIndex: false,
                    columns,
                    data: rankings,
                    enableRowOrdering: true,
                    enableSorting: false,
                    muiRowDragHandleProps: ({table}) => ({
                        onDragEnd: () => {
                            const {draggingRow, hoveredRow} = table.getState();
                            if (hoveredRow && draggingRow) {
                                rankings.splice(
                                    (hoveredRow as MRT_Row<PlayerJson>).index,
                                    0,
                                    rankings.splice(draggingRow.index, 1)[0]
                                );
                                setRankings([...rankings]);
                            }
                        },
                    }),
                })}
            />
        );
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
