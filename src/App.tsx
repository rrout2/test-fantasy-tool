import React, {useEffect, useState} from 'react';
import {DataGrid, GridColDef, GridValueGetterParams} from '@mui/x-data-grid';
import './App.css';
import playersJson from './data/all_players.json';

type Team = {name: string; id: number};

type Matchup = {
    opponent: Team;
    date: string;
};

type Player = {
    name: string;
    id: number;
    matchups: Matchup[];
    numMatchups: number;
    matchupsPerWeek: Map<FantasyWeek, number>;
    remainingGamesThisWeek: number;
};

type FantasyWeek = {
    weekNumber: number;
    startDate: Date;
    endDate: Date;
};

const weeks: FantasyWeek[] = [
    {
        weekNumber: 9,
        startDate: new Date('2023-12-18T00:00:00'),
        endDate: new Date('2023-12-24T23:59:59'),
    },
    {
        weekNumber: 10,
        startDate: new Date('2023-12-25T00:00:00'),
        endDate: new Date('2023-12-31T23:59:59'),
    },
    {
        weekNumber: 11,
        startDate: new Date('2024-01-01T00:00:00'),
        endDate: new Date('2024-01-07T23:59:59'),
    },
    {
        weekNumber: 12,
        startDate: new Date('2024-01-08T00:00:00'),
        endDate: new Date('2024-01-14T23:59:59'),
    },
    {
        weekNumber: 13,
        startDate: new Date('2024-01-15T00:00:00'),
        endDate: new Date('2024-01-21T23:59:59'),
    },
    {
        weekNumber: 14,
        startDate: new Date('2024-01-22T00:00:00'),
        endDate: new Date('2024-01-28T23:59:59'),
    },
    {
        weekNumber: 15,
        startDate: new Date('2024-01-29T00:00:00'),
        endDate: new Date('2024-02-04T23:59:59'),
    },
    {
        weekNumber: 16,
        startDate: new Date('2024-02-05T00:00:00'),
        endDate: new Date('2024-02-11T23:59:59'),
    },
    {
        weekNumber: 17,
        startDate: new Date('2024-02-12T00:00:00'),
        endDate: new Date('2024-02-25T23:59:59'),
    },
    {
        weekNumber: 18,
        startDate: new Date('2024-02-26T00:00:00'),
        endDate: new Date('2024-03-03T23:59:59'),
    },
    {
        weekNumber: 19,
        startDate: new Date('2024-03-04T00:00:00'),
        endDate: new Date('2024-03-10T23:59:59'),
    },
    {
        weekNumber: 20,
        startDate: new Date('2024-03-11T00:00:00'),
        endDate: new Date('2024-03-17T23:59:59'),
    },
    {
        weekNumber: 21,
        startDate: new Date('2024-03-18T00:00:00'),
        endDate: new Date('2024-03-24T23:59:59'),
    },
    {
        weekNumber: 22,
        startDate: new Date('2024-03-25T00:00:00'),
        endDate: new Date('2024-03-31T23:59:59'),
    },
    {
        weekNumber: 23,
        startDate: new Date('2024-04-01T00:00:00'),
        endDate: new Date('2024-04-07T23:59:59'),
    },
    {
        weekNumber: 24,
        startDate: new Date('2024-04-08T00:00:00'),
        endDate: new Date('2024-04-14T23:59:59'),
    },
];

function App() {
    const [playerList, setPlayerList] = useState<Player[]>([]);

    useEffect(() => {
        setPlayerList(
            playersJson.map(p => {
                const matchupsPerWeek = new Map<FantasyWeek, number>();
                let remainingGamesThisWeek = 0;

                p.matchups.forEach((m: Matchup) => {
                    const w = getWhichWeek(m.date);
                    if (!w) {
                        throw new Error(`can't find week for date '${m.date}'`);
                    }
                    if (
                        w === getCurrentWeek() &&
                        new Date(m.date) >= new Date()
                    ) {
                        remainingGamesThisWeek += 1;
                    }
                    const curr = matchupsPerWeek.get(w) ?? 0;
                    matchupsPerWeek.set(w, curr + 1);
                });

                return {
                    ...p,
                    numMatchups: p.matchups.length,
                    matchupsPerWeek: matchupsPerWeek,
                    remainingGamesThisWeek: remainingGamesThisWeek,
                };
            })
        );
    }, []);

    function getCurrentWeek() {
        const today = new Date();
        return getWhichWeek(today);
    }

    function getWhichWeek(date: Date | string): FantasyWeek | undefined {
        let d: Date;
        if (!(date instanceof Date)) {
            d = new Date(date);
        } else {
            d = date;
        }
        return weeks.find(
            (w: FantasyWeek) =>
                d.getTime() <= w.endDate.getTime() &&
                d.getTime() >= w.startDate.getTime()
        );
    }

    function getTable() {
        const rows = playerList;
        const columns: GridColDef[] = [
            {field: 'name', headerName: 'Name', width: 200},
            {
                field: 'numMatchups',
                headerName: '# Remaining Games',
                width: 200,
            },
            {
                field: 'remainingGamesThisWeek',
                headerName: '# Remaining Games this week',
                width: 200,
            },
            {
                field: '',
                valueGetter: (params: GridValueGetterParams) => {
                    return params.row.matchupsPerWeek.get(getCurrentWeek());
                },
                headerName: '# Games this Week',
                width: 200,
            },
        ];
        return (
            <DataGrid
                rows={rows}
                columns={columns}
                initialState={{
                    pagination: {
                        paginationModel: {page: 0, pageSize: 15},
                    },
                }}
                checkboxSelection
            />
        );
    }

    return <div className="App">{getTable()}</div>;
}

export default App;
