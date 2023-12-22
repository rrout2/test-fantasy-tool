import {
    GridCellParams,
    GridFilterItem,
    GridFilterOperator,
} from '@mui/x-data-grid';

export const isOneOfOperator: GridFilterOperator = {
    label: 'is one of',
    value: 'isOneOf',
    requiresFilterValue: false,
    getApplyFilterFn: (filterItem: GridFilterItem) => {
        if (!filterItem.field || !filterItem.value || !filterItem.operator) {
            return null;
        }

        if (filterItem.value.length === 0) {
            return null;
        }

        return (params: GridCellParams): boolean => {
            for (const teamName of filterItem.value) {
                if (teamName === params.value) {
                    return true;
                }
            }
            return false;
        };
    },
};
