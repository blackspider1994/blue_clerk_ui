import { DivisionActionType, DivisionState } from '../actions/division/division.types';
import { Reducer } from 'redux';

const initialDivision: DivisionState = {
   loading: true,
   data: [],
   refresh: true,
}

export const DivisionReducer: Reducer<any> = (state = initialDivision, action) => {
   switch (action.type) {
      case DivisionActionType.GET:
         return {
            ...state,
            loading: true,
            data: initialDivision,
         };
      case DivisionActionType.SET:
         return {
            ...state,
            loading: false,
            data: [...action?.payload],
         }
      case DivisionActionType.REFRESH:
         return {
            ...state,
            refresh: action?.refresh
         }
      case DivisionActionType.FAILED:
         return {
            ...state,
            loading: false,
            error: action?.payload,
         }
   }
   return state;
}

