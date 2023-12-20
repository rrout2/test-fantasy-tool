import React, {useEffect, useState} from 'react';
import {DataGrid, GridColDef, GridValueGetterParams} from '@mui/x-data-grid';
import './App.css';
import playersJson from './data/all_players.json';

type team = {name: string; id: number};

type matchup = {
    opponent: team;
    date: string;
};

type playerType = {
    name: string;
    id: number;
    matchups: matchup[];
};

function App() {
    const [playerList, setPlayerList] = useState<playerType[]>([]);

    useEffect(() => {
        setPlayerList(playersJson);
    }, []);

    function getTable() {
        const rows = playerList;
        const columns: GridColDef[] = [{field: 'name', headerName: 'Name'}];
        return (
            <DataGrid
                rows={rows}
                columns={columns}
                initialState={{
                    pagination: {
                        paginationModel: {page: 0, pageSize: 5},
                    },
                }}
                pageSizeOptions={[5, 10]}
                checkboxSelection
            />
        );
    }

    return <div className="App">{getTable()}</div>;
}

export default App;
