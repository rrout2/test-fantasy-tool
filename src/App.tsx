import React, {Fragment, useContext, useState} from 'react';
import './App.css';
import PlayerTable from './components/PlayerTable';
import {Tab, Tabs} from '@mui/material';
import TeamTable from './components/TeamTable';
import {
    SelectedTeamsContext,
    SelectedTeamsModel,
} from './contexts/SelectedTeamsContext';

function App() {
    const [tabValue, setTabValue] = useState(0);
    const selectedTeamsModel: SelectedTeamsModel =
        useContext(SelectedTeamsContext);

    function tableElement() {
        return (
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
            </SelectedTeamsContext.Provider>
        </div>
    );
}

export default App;
