import { WorkTypeActionType, WorkTypeState } from '../actions/work-type/work-type.types';
import { Reducer } from 'redux';

const initialWorkType: WorkTypeState = {
   loading: false,
   data: []
}

export const WorkTypeReducer: Reducer<any> = (state = initialWorkType, action) => {
   switch (action.type) {
      case WorkTypeActionType.GET:
         return {
            loading: true,
            data: initialWorkType,
         };
      case WorkTypeActionType.SUCCESS:
         return {
            loading: false,
            data: [...action.payload],
         }
      case WorkTypeActionType.SET:
         return {
            loading: false,
            data: [...action.payload],
         }
      case WorkTypeActionType.FAILED:
         return {
            ...state,
            loading: false,
            error: action.payload,
         }
   }
   return state;
}

