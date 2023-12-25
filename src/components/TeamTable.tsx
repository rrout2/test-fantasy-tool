import React, {useContext, useEffect, useState} from 'react';
import {useIsSmallScreen, useScreenWidth, useToday} from '../hooks';
import {
    DataGrid,
    GridColDef,
    GridRowSelectionModel,
    GridValueGetterParams,
} from '@mui/x-data-grid';
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
import {
    SelectedTeamsContext,
    SelectedTeamsModel,
} from '../contexts/SelectedTeamsContext';
import {numericalOperators} from '../utils/gridOperators';
import {Tooltip} from '@mui/material';

type TeamMatchup = {
    opponentId: number;
    date: string;
};
export type Team = {
    name: string;
    id: number;
    teamMatchups: TeamMatchup[];
    abbr: string;
    thisWeekDates: string[];
    nextWeekDates: string[];
};

export default function TeamTable() {
    const today = useToday();
    const [teamList, setTeamList] = useState<Team[]>([]);
    const [numVisibleColumns, setNumVisibleColumns] = useState<number>(4);
    const screenWidth = useScreenWidth();
    const isSmallScreen = useIsSmallScreen();

    const selectedTeamsModel: SelectedTeamsModel =
        useContext(SelectedTeamsContext);
    const [rowSelectionModel, setRowSelectionModel] =
        useState<GridRowSelectionModel>(
            selectedTeamsModel.selectedRows.map(row => row.id)
        );

    useEffect(() => {
        setRowSelectionModel(
            selectedTeamsModel.selectedRows.map(row => row.id)
        );
    }, [selectedTeamsModel.selectedRows]);

    useEffect(() => {
        setTeamList(
            teamsJson.map(team => {
                const matchupsPerWeek = new Map<FantasyWeek, number>();
                let remainingGamesThisWeek = 0;
                const thisWeekDates: string[] = [];
                let gamesNextWeek = 0;
                const nextWeekDates: string[] = [];

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
                            thisWeekDates.push(tmu.date);
                        }
                        if (week === getFollowingWeek(currentWeek)) {
                            gamesNextWeek += 1;
                            nextWeekDates.push(tmu.date);
                        }
                        incrementWeek(matchupsPerWeek, week);
                        return {opponentId: tmu.opponent.id, date: tmu.date};
                    }),
                    remainingGamesThisWeek: remainingGamesThisWeek,
                    gamesNextWeek: gamesNextWeek,
                    thisWeekDates: thisWeekDates.sort(),
                    nextWeekDates: nextWeekDates.sort(),
                };
            })
        );
    }, [today, teamsJson]);

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
            filterOperators: numericalOperators,
            renderCell: params => {
                return (
                    <Tooltip title={params.row.thisWeekDates.join(', ')}>
                        <div style={{width: '100%', textAlign: 'left'}}>
                            {params.value}
                        </div>
                    </Tooltip>
                );
            },
        },
        {
            field: 'gamesNextWeek',
            headerName: GAMES_NEXT_WEEK_LABEL,
            filterOperators: numericalOperators,
            renderCell: params => {
                return (
                    <Tooltip title={params.row.nextWeekDates.join(', ')}>
                        <div style={{width: '100%', textAlign: 'left'}}>
                            {params.value}
                        </div>
                    </Tooltip>
                );
            },
        },
        {
            field: 'teamMatchups',
            valueGetter: (params: GridValueGetterParams) => {
                return params.value.length;
            },
            headerName: TOTAL_GAMES_REMAINING_LABEL,
            filterOperators: numericalOperators,
        },
    ];

    return (
        teamList.length > 0 && (
            <DataGrid
                disableVirtualization
                autoHeight
                rows={teamList}
                columns={columns.map(col => {
                    return {
                        ...col,
                        width: isSmallScreen
                            ? (screenWidth / numVisibleColumns) * 0.875
                            : (screenWidth / numVisibleColumns) * 0.8,
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
                checkboxSelection
                onRowSelectionModelChange={newRowSelectionModel => {
                    const teams = newRowSelectionModel.map(teamId => {
                        return teamList.find(team => team.id === teamId)!;
                    });
                    selectedTeamsModel.selectedRows = teams;
                    setRowSelectionModel(newRowSelectionModel);
                }}
                rowSelectionModel={rowSelectionModel}
                onColumnVisibilityModelChange={vizModel => {
                    setNumVisibleColumns(
                        columns.length -
                            Object.keys(vizModel).filter(
                                column => !vizModel[column]
                            ).length
                    );
                }}
            />
        )
    );
}
