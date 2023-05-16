import { callGetHomeownerByAddress } from 'api/home-owner.api';
import { HomeOwnerType } from './home-owner.types';
export const getHomeOwnerAction = (address: string, subdivision : string) : any => {
    return async (dispatch: any) => {
      if (address !== '') {
        const homeOwner: any = await callGetHomeownerByAddress(address, subdivision);

        if (homeOwner.status === 0) {
          dispatch({ type: HomeOwnerType.FAILED, payload: homeOwner.message});
        } else {
          dispatch(setHomeOwner(homeOwner));
        }
      } else {
        dispatch(setHomeOwner([]))
      }
    };
}

export const setHomeOwner = (homeOwner: any) => {
    return {
      type: HomeOwnerType.SET,
      payload: homeOwner
    }
}