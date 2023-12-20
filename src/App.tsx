import React, {useState} from 'react';
import './App.css';
import PlayerTable from './components/PlayerTable';
import {Button, Drawer, ToggleButton, ToggleButtonGroup} from '@mui/material';
import TeamTable from './components/TeamTable';

enum Table {
    Player = 'PlayerTable',
    Team = 'TeamTable',
}

function App() {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [toggleValue, setToggleValue] = React.useState(Table.Team);

    function settingsMenu() {
        return (
            <Drawer
                anchor={'left'}
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
            >
                setting maybe??
            </Drawer>
        );
    }

    function tableElement() {
        switch (toggleValue) {
            case Table.Player:
                return <PlayerTable />;
            case Table.Team:
                return <TeamTable />;
            default:
                return <>oopsies</>;
        }
    }

    function toggleGroup() {
        return (
            <ToggleButtonGroup
                value={toggleValue}
                exclusive
                onChange={(_event: React.MouseEvent<HTMLElement>, value) => {
                    setToggleValue(value);
                }}
            >
                <ToggleButton value={Table.Team}>Teams</ToggleButton>
                <ToggleButton value={Table.Player}>Players</ToggleButton>
            </ToggleButtonGroup>
        );
    }

    return (
        <div className="App">
            {toggleGroup()}
            {settingsMenu()}
            {tableElement()}
            {
                <Button
                    variant="text"
                    onClick={() => {
                        setDrawerOpen(true);
                    }}
                >
                    Settings
                </Button>
            }
        </div>
    );
}

export default App;
