import React, {useState} from 'react';
import './App.css';
import PlayerTable from './components/PlayerTable';
import {
    Box,
    Button,
    Drawer,
    FormControl,
    FormControlLabel,
    Radio,
    RadioGroup,
} from '@mui/material';
import TeamTable from './components/TeamTable';

enum DrawerSelection {
    PlayerTable = 'PlayerTable',
    TeamTable = 'TeamTable',
}

function App() {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerValue, setDrawerValue] = React.useState(
        DrawerSelection.TeamTable
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
                <Box sx={{padding: '20px'}}>
                    <FormControl>
                        <RadioGroup
                            defaultValue={drawerValue}
                            onChange={handleChange}
                        >
                            <FormControlLabel
                                value={DrawerSelection.TeamTable}
                                control={<Radio />}
                                label="Teams"
                            />
                            <FormControlLabel
                                value={DrawerSelection.PlayerTable}
                                control={<Radio />}
                                label="Players"
                            />
                        </RadioGroup>
                    </FormControl>
                </Box>
            </Drawer>
        );
    }

    function parseDrawer() {
        switch (drawerValue) {
            case DrawerSelection.PlayerTable:
                return <PlayerTable />;
            case DrawerSelection.TeamTable:
                return <TeamTable />;
            default:
                return <>oopsies</>;
        }
    }

    return (
        <div className="App">
            {
                <Button
                    variant="text"
                    onClick={() => {
                        setDrawerOpen(true);
                    }}
                >
                    Menu
                </Button>
            }
            {drawerMaybe()}
            {parseDrawer()}
        </div>
    );
}

export default App;
