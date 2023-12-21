import React, {useEffect, useState} from 'react';
import {useIsSmallScreen, useScreenWidth, useToday} from '../hooks';
import {DataGrid, GridColDef, GridValueGetterParams} from '@mui/x-data-grid';
import teamsJson from '../data/all_teams.json';
import {
    incrementWeek,
    getWhichWeek,
    FantasyWeek,
    getNextWeek as getFollowingWeek,
} from '../utils/fantasyWeek';
import {
    GAMES_NEXT_WEEK_LABEL,
    REMAINING_GAMES_THIS_WEEK_LABEL,
    TOTAL_GAMES_REMAINING_LABEL,
} from '../consts/strings';
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
    const screenWidth = useScreenWidth();
    const isSmallScreen = useIsSmallScreen();

    useEffect(() => {
        setTeamList(
            teamsJson.map(team => {
                const matchupsPerWeek = new Map<FantasyWeek, number>();
                let remainingGamesThisWeek = 0;
                let gamesNextWeek = 0;
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
                        const currentWeek = getCurrentWeek();

                        if (week === currentWeek && isAfterToday(tmu.date)) {
                            remainingGamesThisWeek += 1;
                        }
                        if (week === getFollowingWeek(currentWeek)) {
                            gamesNextWeek += 1;
                        }
                        incrementWeek(matchupsPerWeek, week);
                        return {opponentId: tmu.opponent.id, date: tmu.date};
                    }),
                    remainingGamesThisWeek: remainingGamesThisWeek,
                    gamesNextWeek: gamesNextWeek,
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
        {
            field: isSmallScreen ? 'abbr' : 'name',
            headerName: 'Name',
        },
        {
            field: 'remainingGamesThisWeek',
            headerName: REMAINING_GAMES_THIS_WEEK_LABEL,
        },
        {
            field: 'gamesNextWeek',
            headerName: GAMES_NEXT_WEEK_LABEL,
        },
        {
            field: 'teamMatchups',
            valueGetter: (params: GridValueGetterParams) => {
                return params.value.length;
            },
            headerName: TOTAL_GAMES_REMAINING_LABEL,
        },
    ];

    return (
        <DataGrid
            rows={teamList}
            columns={columns.map(c => {
                return {
                    ...c,
                    width: isSmallScreen
                        ? screenWidth / columns.length
                        : (screenWidth / columns.length) * 0.8,
                };
            })}
            initialState={{
                pagination: {
                    paginationModel: {
                        page: 0,
                        pageSize: 30,
                    },
                },
            }}
            pageSizeOptions={[5, 10, 30]}
            className="playerTable"
            checkboxSelection
        />
    );
}
