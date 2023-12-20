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
                settings maybe??
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
                throw new Error(`unrecognized toggle value: '${toggleValue}'`);
        }
    }

    function toggleGroup() {
        return (
            <ToggleButtonGroup
                value={toggleValue}
                exclusive
                onChange={(_, value: Table | null) => {
                    if (!value) return;
                    setToggleValue(value);
                }}
                sx={{padding: '5px'}}
            >
                <ToggleButton value={Table.Team} sx={{padding: '5px'}}>
                    Teams
                </ToggleButton>
                <ToggleButton value={Table.Player} sx={{padding: '5px'}}>
                    Players
                </ToggleButton>
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
