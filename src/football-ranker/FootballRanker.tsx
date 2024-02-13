import React, {ChangeEvent, useEffect, useMemo, useState} from 'react';
import nflPlayersJson from './nfl_players.json';
import './FootballRanker.css';
import {
    Button,
    Typography,
    Switch,
    FormGroup,
    FormControlLabel,
} from '@mui/material';
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

enum Table {
    None = 'no table',
    Rankings = 'rankings table',
    RemainingPlayers = 'remaining players table',
}

export default function FootballRanker() {
    const [rankings, setRankings] = useState<PlayerJson[]>([]);
    const [allPlayers, setAllPlayers] = useState<Map<number, PlayerJson>>(
        new Map()
    );
    const [remainingPlayers, setRemainingPlayers] = useState<PlayerJson[]>([]);
    const [draggingRow, setDraggingRow] = useState<MRT_Row<PlayerJson> | null>(
        null
    );
    const [hoveredRow, setHoveredRow] = useState<MRT_Row<PlayerJson> | null>(
        null
    );
    const [hoveredTable, setHoveredTable] = useState<Table>(Table.None);
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

    const [displayRemainingPlayersTable, setDisplayRemainingPlayersTable] =
        useState(true);

    useEffect(() => {
        loadPlayers();
    }, []);

    const rankingTable = useMaterialReactTable({
        autoResetPageIndex: false,
        columns,
        data: rankings,
        enableRowOrdering: true,
        enableSorting: false,
        renderTopToolbarCustomActions: () => (
            <Typography variant="h5">Rankings</Typography>
        ),
        onDraggingRowChange: setDraggingRow,
        state: {draggingRow},
        muiRowDragHandleProps: ({table}) => ({
            onDragStart: () => {
                setHoveredTable(Table.Rankings);
            },
            onDragEnd: () => {
                // if dragging FROM rankings TO remaining players
                if (hoveredTable === Table.RemainingPlayers) {
                    if (draggingRow) {
                        rankings.splice(draggingRow.index, 1);
                        setRankings([...rankings]);
                        const rowToBeInserted = draggingRow.original;

                        if (!hoveredRow) {
                            setRemainingPlayers(remainingPlayers =>
                                remainingPlayers.length === 0
                                    ? [rowToBeInserted]
                                    : [...remainingPlayers, rowToBeInserted]
                            );
                        } else {
                            remainingPlayers.splice(
                                hoveredRow.index,
                                0,
                                rowToBeInserted
                            );
                            setRemainingPlayers([...remainingPlayers]);
                        }
                    }
                } else if (hoveredTable === Table.Rankings) {
                    // dragging within rankings table
                    const {draggingRow, hoveredRow} = table.getState();
                    if (hoveredRow && draggingRow) {
                        rankings.splice(
                            (hoveredRow as MRT_Row<PlayerJson>).index,
                            0,
                            rankings.splice(draggingRow.index, 1)[0]
                        );
                        setRankings([...rankings]);
                    }
                }

                setHoveredTable(Table.None);
            },
        }),
        muiTablePaperProps: ({table}) => ({
            onDragEnter: () => {
                setHoveredTable(Table.Rankings);
                const {hoveredRow} = table.getState();
                setHoveredRow(hoveredRow as MRT_Row<PlayerJson>);
            },
            sx: {
                outline:
                    hoveredTable === Table.Rankings
                        ? '2px dashed pink'
                        : undefined,
            },
        }),
    });

    const remainingPlayersTable = useMaterialReactTable({
        autoResetPageIndex: false,
        columns,
        data: remainingPlayers,
        enableRowOrdering: true,
        enableSorting: true,
        renderTopToolbarCustomActions: () => (
            <Typography variant="h5">Remaining Players</Typography>
        ),
        onDraggingRowChange: setDraggingRow,
        state: {draggingRow},
        muiRowDragHandleProps: ({table}) => ({
            onDragStart: () => {
                setHoveredTable(Table.RemainingPlayers);
            },
            onDragEnd: () => {
                // if dragging FROM remaining players TO rankings
                if (hoveredTable === Table.Rankings) {
                    if (draggingRow) {
                        remainingPlayers.splice(draggingRow.index, 1);
                        setRemainingPlayers([...remainingPlayers]);
                        const rowToBeInserted = draggingRow.original;

                        if (!hoveredRow) {
                            setRankings(rankings =>
                                rankings.length === 0
                                    ? [rowToBeInserted]
                                    : [...rankings, rowToBeInserted]
                            );
                        } else {
                            rankings.splice(
                                hoveredRow.index,
                                0,
                                rowToBeInserted
                            );
                            setRankings([...rankings]);
                        }
                    }
                } else if (hoveredTable === Table.RemainingPlayers) {
                    const {draggingRow, hoveredRow} = table.getState();
                    if (hoveredRow && draggingRow) {
                        remainingPlayers.splice(
                            (hoveredRow as MRT_Row<PlayerJson>).index,
                            0,
                            remainingPlayers.splice(draggingRow.index, 1)[0]
                        );
                        setRemainingPlayers([...remainingPlayers]);
                    }
                }

                setHoveredTable(Table.None);
            },
        }),
        muiTablePaperProps: ({table}) => ({
            onDragEnter: () => {
                setHoveredTable(Table.RemainingPlayers);
                const {hoveredRow} = table.getState();
                setHoveredRow(hoveredRow as MRT_Row<PlayerJson>);
            },
            sx: {
                outline:
                    hoveredTable === Table.RemainingPlayers
                        ? '2px dashed pink'
                        : undefined,
            },
        }),
    });

    function loadPlayers() {
        const nflPlayers = Object.entries(nflPlayersJson);
        const players = nflPlayers
            .map(p => p[1] as PlayerJson)
            .filter(isFantasyRelevant);
        const mappedPlayers = new Map<number, PlayerJson>();
        players.forEach(player => {
            mappedPlayers.set(player.player_id, player);
        });
        setAllPlayers(mappedPlayers);
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
            const rawPlayerIds = JSON.parse(
                e.target.result as string
            ) as number[];
            const remaining = new Set(allPlayers.values());
            setRankings(
                rawPlayerIds.map(playerId => {
                    const player = allPlayers.get(playerId)!;
                    remaining.delete(player);
                    return player;
                })
            );
            setRemainingPlayers(Array.from(remaining));
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

    function startNewRankings() {
        setRankings([]);
        setRemainingPlayers(Array.from(allPlayers.values()));
    }

    function startNewButton() {
        return <Button onClick={startNewRankings}>Start New</Button>;
    }

    function remainingPlayersToggle() {
        return (
            <FormGroup>
                <FormControlLabel
                    control={
                        <Switch
                            checked={displayRemainingPlayersTable}
                            onChange={(e, checked) =>
                                setDisplayRemainingPlayersTable(checked)
                            }
                        />
                    }
                    label="Remaining Players Table"
                />
            </FormGroup>
        );
    }

    function rankingComponent() {
        return <MaterialReactTable table={rankingTable} />;
    }

    function remainingPlayersComponent() {
        return <MaterialReactTable table={remainingPlayersTable} />;
    }

    return (
        <div className="body">
            <div className="toolbar">
                {downloadButton()}
                {uploadButton()}
                {startNewButton()}
                {remainingPlayersToggle()}
            </div>
            <div className="ranker">
                {rankingComponent()}
                {displayRemainingPlayersTable && remainingPlayersComponent()}
            </div>
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
