import { getWorkType as fetchWorkType } from 'api/work-type.api';
import { WorkTypeActionType } from './work-type.types';

export const loadingWorkType = () => {
   return {
      type: WorkTypeActionType.GET
   }
}

export const getWorkType = () => {
   return async (dispatch: any) => {
      const workType: any = await fetchWorkType();
      dispatch(setWorkType(workType));
   };
}

export const setWorkType = (workType: any) => {
   return {
      type: WorkTypeActionType.SET,
      payload: workType
   }
}