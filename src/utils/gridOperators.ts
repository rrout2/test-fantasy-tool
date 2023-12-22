import {
    GridCellParams,
    GridFilterInputMultipleValue,
    GridFilterInputValue,
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
    InputComponent: GridFilterInputMultipleValue,
};

export const betweenOperator: GridFilterOperator = {
    label: 'is between',
    value: 'isBetween',
    requiresFilterValue: false,
    getApplyFilterFn: (filterItem: GridFilterItem) => {
        if (!filterItem.field || !filterItem.value || !filterItem.operator) {
            return null;
        }

        if (filterItem.value.length !== 2) {
            return null;
        }

        return (params: GridCellParams): boolean => {
            const bottom = filterItem.value[0];
            const top = filterItem.value[1];
            return (
                bottom <= Number(params.value) && top >= Number(params.value)
            );
        };
    },
    InputComponent: GridFilterInputMultipleValue,
};

export const ltOperator: GridFilterOperator = {
    label: 'less than',
    value: 'lt',
    requiresFilterValue: false,
    getApplyFilterFn: (filterItem: GridFilterItem) => {
        if (!filterItem.field || !filterItem.value || !filterItem.operator) {
            return null;
        }

        return (params: GridCellParams): boolean => {
            return Number(filterItem.value) > Number(params.value);
        };
    },
    InputComponent: GridFilterInputValue,
};

export const gtOperator: GridFilterOperator = {
    label: 'greater than',
    value: 'gt',
    requiresFilterValue: false,
    getApplyFilterFn: (filterItem: GridFilterItem) => {
        if (!filterItem.field || !filterItem.value || !filterItem.operator) {
            return null;
        }

        return (params: GridCellParams): boolean => {
            return Number(filterItem.value) < Number(params.value);
        };
    },
    InputComponent: GridFilterInputValue,
};

export const eqOperator: GridFilterOperator = {
    label: 'equal to',
    value: 'eq',
    requiresFilterValue: false,
    getApplyFilterFn: (filterItem: GridFilterItem) => {
        if (!filterItem.field || !filterItem.value || !filterItem.operator) {
            return null;
        }

        return (params: GridCellParams): boolean => {
            return Number(filterItem.value) === Number(params.value);
        };
    },
    InputComponent: GridFilterInputValue,
};

export const numericalOperators = [
    betweenOperator,
    ltOperator,
    gtOperator,
    eqOperator,
];
