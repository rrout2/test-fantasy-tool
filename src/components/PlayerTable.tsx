import React, {
    DataGrid,
    GridColDef,
    GridValueGetterParams,
} from '@mui/x-data-grid';
import {
    useIsSmallScreen,
    useScreenHeight,
    useScreenWidth,
    useToday,
} from './../hooks';
import {useEffect, useState} from 'react';
import playersJson from '../data/all_players.json';
import {FantasyWeek, getWhichWeek, incrementWeek} from '../utils/fantasyWeek';

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
    teamName: string;
};

export default function PlayerTable() {
    const [playerList, setPlayerList] = useState<Player[]>([]);
    const today = useToday();
    let screenWidth = useScreenWidth();
    const isSmallScreen = useIsSmallScreen();
    if (!isSmallScreen) {
        screenWidth *= 0.8;
    }
    const screenHeight = useScreenHeight();

    useEffect(() => {
        setPlayerList(
            (playersJson as any[]).map(player => {
                const matchupsPerWeek = new Map<FantasyWeek, number>();
                let remainingGamesThisWeek = 0;

                player.matchups.forEach((m: Matchup) => {
                    const week = getWhichWeek(m.date);
                    if (
                        player.name.includes('Adebayo') &&
                        m.date.includes('DEC 2')
                    ) {
                        console.log('woot');
                    }
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
                    teamName: player.team_name,
                };
            })
        );
    }, [today]);

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

    const columns: GridColDef[] = [
        {field: 'teamName', headerName: 'Team', width: screenWidth * 0.2},

        {field: 'name', headerName: 'Name', width: screenWidth * 0.2},
        {
            field: 'numMatchups',
            headerName: '# Remaining Games',
            width: screenWidth * 0.2,
        },
        {
            field: 'remainingGamesThisWeek',
            headerName: '# Remaining Games this week',
            width: screenWidth * 0.2,
        },
        {
            field: '',
            valueGetter: (params: GridValueGetterParams) => {
                return params.row.matchupsPerWeek.get(getWhichWeek(new Date()));
            },
            headerName: '# Games this Week',
            width: screenWidth * 0.2,
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
