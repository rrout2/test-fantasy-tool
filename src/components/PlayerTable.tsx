import React, {
    DataGrid,
    GridColDef,
    GridValueGetterParams,
} from '@mui/x-data-grid';
import {useScreenHeight, useScreenWidth} from './../hooks';
import {useEffect, useState} from 'react';
import playersJson from '../data/all_players.json';

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

export type FantasyWeek = {
    weekNumber: number;
    startDate: Date;
    endDate: Date;
};

export const WEEKS: FantasyWeek[] = [
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

export const MOBILE_BREAKPOINT = 700;

export default function PlayerTable() {
    const [playerList, setPlayerList] = useState<Player[]>([]);
    const [today] = useState(new Date());
    let screenWidth = useScreenWidth();
    if (screenWidth >= MOBILE_BREAKPOINT) {
        screenWidth *= 0.8;
    }
    const screenHeight = useScreenHeight();

    useEffect(() => {
        setPlayerList(
            playersJson.map(player => {
                const matchupsPerWeek = new Map<FantasyWeek, number>();
                let remainingGamesThisWeek = 0;

                player.matchups.forEach((m: Matchup) => {
                    const week = getWhichWeek(m.date);
                    if (!week) {
                        throw new Error(`can't find week for date '${m.date}'`);
                    }

                    if (week === getCurrentWeek() && isAfterToday(m.date)) {
                        remainingGamesThisWeek += 1;
                    }
                    incrementWeek(matchupsPerWeek, week);
                });

                return {
                    ...player,
                    numMatchups: player.matchups.length,
                    matchupsPerWeek: matchupsPerWeek,
                    remainingGamesThisWeek: remainingGamesThisWeek,
                };
            })
        );
    }, []);

    function incrementWeek(mpw: Map<FantasyWeek, number>, week: FantasyWeek) {
        mpw.set(week, (mpw.get(week) ?? 0) + 1);
    }

    function getCurrentWeek() {
        return getWhichWeek(today);
    }

    function isAfterToday(date: Date | string) {
        let d: Date;
        if (!(date instanceof Date)) {
            d = new Date(date);
        } else {
            d = date;
        }

        return d.getTime() >= today.getTime();
    }

    function getWhichWeek(date: Date | string): FantasyWeek | undefined {
        let d: Date;
        if (!(date instanceof Date)) {
            d = new Date(date);
        } else {
            d = date;
        }
        return WEEKS.find(
            (w: FantasyWeek) =>
                d.getTime() <= w.endDate.getTime() &&
                d.getTime() >= w.startDate.getTime()
        );
    }

    const columns: GridColDef[] = [
        {field: 'name', headerName: 'Name', width: screenWidth * 0.25},
        {
            field: 'numMatchups',
            headerName: '# Remaining Games',
            width: screenWidth * 0.25,
        },
        {
            field: 'remainingGamesThisWeek',
            headerName: '# Remaining Games this week',
            width: screenWidth * 0.25,
        },
        {
            field: '',
            valueGetter: (params: GridValueGetterParams) => {
                return params.row.matchupsPerWeek.get(getWhichWeek(new Date()));
            },
            headerName: '# Games this Week',
            width: screenWidth * 0.25,
        },
    ];
    return (
        <DataGrid
            rows={playerList}
            columns={columns}
            initialState={{
                pagination: {
                    paginationModel: {
                        page: 0,
                        pageSize: Math.round(screenHeight / 52) - 4,
                    },
                },
            }}
            className="playerTable"
        />
    );
}
