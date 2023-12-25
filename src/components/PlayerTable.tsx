import React, {DataGrid, GridColDef, GridFilterModel} from '@mui/x-data-grid';
import {
    useIsSmallScreen,
    useScreenHeight,
    useScreenWidth,
    useToday,
} from './../hooks';
import {useContext, useEffect, useState} from 'react';
import playersJson from '../data/all_players.json';
import {FantasyWeek, getWhichWeek, incrementWeek} from '../utils/fantasyWeek';
import {
    LAST_FIVE_AVG_FPTS_LABEL,
    REMAINING_GAMES_THIS_WEEK_LABEL,
    SEASON_AVG_FPTS_LABEL,
    TOTAL_GAMES_REMAINING_LABEL,
} from '../consts/strings';
import {
    SelectedTeamsContext,
    SelectedTeamsModel,
} from '../contexts/SelectedTeamsContext';
import {isOneOfOperator, numericalOperators} from '../utils/gridOperators';
type Team = {name: string; id: number};

type Matchup = {
    opponent: Team;
    date: string;
};

type PyPlayer = {
    matchups: Matchup[];
    team_name: string;
    name: string;
    id: number;
    season_avg_fpts: number;
    last_five_avg_fpts: number;
};

type Player = {
    name: string;
    id: number;
    matchups: Matchup[];
    numMatchups: number;
    matchupsPerWeek: Map<FantasyWeek, number>;
    remainingGamesThisWeek: number;
    teamName: string;
    seasonAvgFpts: number;
    lastFiveAvgFpts: number;
};

export default function PlayerTable() {
    const [playerList, setPlayerList] = useState<Player[]>([]);
    const today = useToday();
    const screenWidth = useScreenWidth();
    const isSmallScreen = useIsSmallScreen();
    const screenHeight = useScreenHeight();
    const [filter, setFilter] = useState<GridFilterModel>({items: []});
    const selectedTeamsModel: SelectedTeamsModel =
        useContext(SelectedTeamsContext);

    useEffect(() => {
        setFilter({
            items: [
                {
                    field: 'teamName',
                    value: selectedTeamsModel.selectedRows.map(
                        team => team.abbr
                    ),
                    operator: 'isOneOf',
                },
            ],
        });
    }, [selectedTeamsModel.selectedRows.length]);

    useEffect(() => {
        setPlayerList(
            (playersJson as PyPlayer[]).map(player => {
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
                    teamName: player.team_name,
                    seasonAvgFpts: player.season_avg_fpts,
                    lastFiveAvgFpts: player.last_five_avg_fpts,
                };
            })
        );
    }, [today, playersJson]);

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
            field: 'teamName',
            headerName: 'Team',
            filterOperators: [isOneOfOperator],
        },

        {field: 'name', headerName: 'Name'},
        {
            field: 'remainingGamesThisWeek',
            headerName: REMAINING_GAMES_THIS_WEEK_LABEL,
        },
        {
            field: 'numMatchups',
            headerName: TOTAL_GAMES_REMAINING_LABEL,
        },
        {
            field: 'seasonAvgFpts',
            headerName: SEASON_AVG_FPTS_LABEL,
            filterOperators: numericalOperators,
        },
        {
            field: 'lastFiveAvgFpts',
            headerName: LAST_FIVE_AVG_FPTS_LABEL,
            filterOperators: numericalOperators,
        },
    ];
    return (
        <DataGrid
            disableVirtualization
            autoHeight
            rows={playerList}
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
                        pageSize: Math.round(screenHeight / 52) - 4,
                    },
                },
            }}
            onFilterModelChange={newFilterModel => {
                setFilter(newFilterModel);
            }}
            filterModel={filter}
            className="playerTable"
        />
    );
}
