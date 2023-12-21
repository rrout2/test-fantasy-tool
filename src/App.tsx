import React, {Fragment, useContext, useState} from 'react';
import './App.css';
import PlayerTable from './components/PlayerTable';
import {Button, Drawer, Tab, Tabs} from '@mui/material';
import TeamTable from './components/TeamTable';
import {
    SelectedTeamsContext,
    SelectedTeamsModel,
} from './contexts/SelectedTeamsContext';

function App() {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const selectedTeamsModel: SelectedTeamsModel =
        useContext(SelectedTeamsContext);

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
        return (
            // <Fragment>
            //     {tabValue === 1 && <PlayerTable />}{' '}
            //     {tabValue === 0 && <TeamTable />}
            // </Fragment>
            <Fragment>
                <div hidden={tabValue !== 1} style={{height: 'fit-content'}}>
                    {<PlayerTable />}
                </div>
                <div hidden={tabValue !== 0} style={{height: 'fit-content'}}>
                    {<TeamTable />}
                </div>
            </Fragment>
        );
    }

    function tabGroup() {
        return (
            <>
                <Tabs
                    value={tabValue}
                    onChange={(_: React.SyntheticEvent, newValue: number) => {
                        setTabValue(newValue);
                    }}
                    aria-label="basic tabs example"
                >
                    <Tab label="Teams" />
                    <Tab label="Players" />
                </Tabs>
                {tableElement()}
            </>
        );
    }

    return (
        <div className="App">
            <SelectedTeamsContext.Provider value={selectedTeamsModel}>
                {tabGroup()}
                {settingsMenu()}
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
            </SelectedTeamsContext.Provider>
        </div>
    );
}

export default App;
