import React, {useState} from 'react';
import './App.css';
import PlayerTable from './components/PlayerTable';
import {
    Button,
    Drawer,
    FormControl,
    FormControlLabel,
    Radio,
    RadioGroup,
} from '@mui/material';

enum DrawerSelection {
    PlayerTable = 'PlayerTable',
    TeamTable = 'TeamTable',
}

function App() {
    const [drawerOpen, setDrawerOpen] = useState(true);
    const [drawerValue, setDrawerValue] = React.useState(
        DrawerSelection.PlayerTable
    );

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDrawerValue(
            (event.target as HTMLInputElement).value as DrawerSelection
        );
    };

    function drawerMaybe() {
        return (
            <Drawer
                anchor={'left'}
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
            >
                <FormControl>
                    <RadioGroup
                        defaultValue={DrawerSelection.PlayerTable}
                        onChange={handleChange}
                    >
                        <FormControlLabel
                            value={DrawerSelection.PlayerTable}
                            control={<Radio />}
                            label="Players"
                        />
                        <FormControlLabel
                            value={DrawerSelection.TeamTable}
                            control={<Radio />}
                            label="Teams"
                        />
                    </RadioGroup>
                </FormControl>
            </Drawer>
        );
    }

    function parseDrawer() {
        switch (drawerValue) {
            case DrawerSelection.PlayerTable:
                return <PlayerTable />;
            case DrawerSelection.TeamTable:
                return <>TODO</>;
            default:
                return <>oopsies</>;
        }
    }

    return (
        <div className="App">
            {drawerMaybe()}{' '}
            {
                <Button
                    variant="text"
                    onClick={() => {
                        setDrawerOpen(!drawerOpen);
                    }}
                >
                    Menu
                </Button>
            }
            {parseDrawer()}
        </div>
    );
}

export default App;
