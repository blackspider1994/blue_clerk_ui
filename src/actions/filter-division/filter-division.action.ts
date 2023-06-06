import { DivisionParams } from "app/models/division"
import { IDivision, types } from "./fiter-division.types"

export const setCurrentDivision = (division: IDivision) => {
    return async (dispatch: any) => {
        if ((division.workTypeId || division.locationId) && division.name != "All") {
            dispatch(setDivisionUrlParams(`${division.locationId}${division.workTypeId ? "/" + division.workTypeId : ""}`));
        }else{
            dispatch(setDivisionUrlParams(""))
        }

        dispatch({
            payload: division,
            type: types.SET_CURRENT_LOCATION
        })
    }
}

export const setDivisionParams = (division: DivisionParams) => {
    return {
        payload: division,
        type: types.SET_DIVISION_PARAMS
    }
}

export const setIsDivisionFeatureActivated = (value: boolean) => {
    return {
        payload: value,
        type: types.SET_IS_DIVISION_ACTIVATED
    }
}
export const setDivisionUrlParams = (value:string) => {
    return {
        payload: value,
        type: types.SET_DIVISION_URL_PARAMS
    }
}

export const callSelectDivisionModal = (value:boolean) => {
    return {
        payload: value,
        type: types.CALL_SELECT_DIVISION_MODAL
    }
}