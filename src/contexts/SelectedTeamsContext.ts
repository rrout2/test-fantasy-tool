import {Team} from '../components/TeamTable';
import {createContext} from 'react';

export class SelectedTeamsModel {
    private _selectedRows: Team[] = [];
    get selectedRows() {
        return this._selectedRows;
    }
    set selectedRows(rows: Team[]) {
        this._selectedRows = rows;
    }
    addRow(...row: Team[]) {
        this._selectedRows.push(...row);
    }
}
export const SelectedTeamsContext = createContext(new SelectedTeamsModel());
