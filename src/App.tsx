import React, {useState} from 'react';
import './App.css';
import PlayerTable from './components/PlayerTable';
import {
    Drawer,
    FormControl,
    FormControlLabel,
    Radio,
    RadioGroup,
} from '@mui/material';

function App() {
    const [drawerOpen, setDrawerOpen] = useState(true);
    const [drawerValue, setDrawerValue] = React.useState('PlayerTable');

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDrawerValue((event.target as HTMLInputElement).value);
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
                        defaultValue="PlayerTable"
                        onChange={handleChange}
                    >
                        <FormControlLabel
                            value="PlayerTable"
                            control={<Radio />}
                            label="Players"
                        />
                        <FormControlLabel
                            value="other"
                            control={<Radio />}
                            label="Other"
                        />
                    </RadioGroup>
                </FormControl>
            </Drawer>
        );
    }

    function parseDrawer() {
        switch (drawerValue) {
            case 'PlayerTable':
                return <PlayerTable />;
            default:
                return <>oopsies</>;
        }
    }

    return (
        <div className="App">
            {drawerMaybe()} {parseDrawer()}
        </div>
    );
}

export default App;
