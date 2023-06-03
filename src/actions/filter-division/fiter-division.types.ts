import { DivisionParams } from "app/models/division";

export const types = {
    'SET_CURRENT_LOCATION': 'set-current-location',
    'SET_DIVISION_PARAMS': 'set-division-params',
    "SET_IS_DIVISION_ACTIVATED": "set-is-division-feature-activated",
    "SET_DIVISION_URL_PARAMS": "set-division-url-params",
    "CALL_SELECT_DIVISION_MODAL": "call-select-division-modal"
}

export interface ICurrentDivision{
    locationId?: string;
    workTypeId?: string;
    name?: string;
    employeeId?: string;
}

export interface IDivision{
    address?: IDivisionAddress;
    locationId?: string;
    workTypeId?: string;
    name?: string;
    key?: string;
    employeeId?: string;
}

export interface IDivisionAddress {
    coordinates?: {
        lat: number;
        lng: number;
    };
    street?: string;
    unit?: string;
    city?: string;
    state?: string;
    zipCode?: string;
}

export interface ISelectedDivision{
    data?: IDivision;
    params?: DivisionParams;
    urlParams?: string;
    isDivisionFeatureActivated?: boolean;
    openSelectDivisionModal?: boolean;
}
