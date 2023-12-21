import React, {useEffect, useState} from 'react';
import {useIsSmallScreen, useScreenWidth, useToday} from '../hooks';
import {FantasyWeek, WEEKS} from './PlayerTable';
import {DataGrid, GridColDef, GridValueGetterParams} from '@mui/x-data-grid';
import teamsJson from '../data/all_teams.json';

type TeamMatchup = {
    opponentId: number;
    date: string;
};
type Team = {
    name: string;
    id: number;
    teamMatchups: TeamMatchup[];
    abbr: string;
};

export default function TeamTable() {
    const today = useToday();
    const [teamList, setTeamList] = useState<Team[]>([]);
    let screenWidth = useScreenWidth();
    const isSmallScreen = useIsSmallScreen();
    if (!isSmallScreen) {
        screenWidth *= 0.8;
    }

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

    useEffect(() => {
        setTeamList(
            teamsJson.map(team => {
                const matchupsPerWeek = new Map<FantasyWeek, number>();
                let remainingGamesThisWeek = 0;
                return {
                    ...team,
                    abbr: team.abbr,
                    teamMatchups: team.team_matchups.map(tmu => {
                        const week = getWhichWeek(tmu.date);
                        if (!week) {
                            throw new Error(
                                `can't find week for date '${tmu.date}'`
                            );
                        }

                        if (
                            week === getCurrentWeek() &&
                            isAfterToday(tmu.date)
                        ) {
                            remainingGamesThisWeek += 1;
                        }
                        incrementWeek(matchupsPerWeek, week);
                        return {opponentId: tmu.opponent.id, date: tmu.date};
                    }),
                    remainingGamesThisWeek: remainingGamesThisWeek,
                };
            })
        );
    }, [today]);

    const columns: GridColDef[] = [
        {
            field: isSmallScreen ? 'abbr' : 'name',
            headerName: 'Name',
            width: screenWidth * 0.25,
        },
        {
            field: 'remainingGamesThisWeek',
            headerName: '# Remaining Games this week',
            width: screenWidth * 0.25,
        },
        {
            field: 'teamMatchups',
            valueGetter: (params: GridValueGetterParams) => {
                return params.value.length;
            },
            headerName: '# Games Remaining',
            width: screenWidth * 0.25,
        },
    ];

    return (
        <DataGrid
            rows={teamList}
            columns={columns}
            initialState={{
                pagination: {
                    paginationModel: {
                        page: 0,
                        pageSize: 30,
                    },
                },
            }}
            className="playerTable"
        />
    );
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
