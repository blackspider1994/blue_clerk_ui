import { Record } from 'immutable';
import { handleActions } from 'redux-actions';

import { closeModalAction, openModalAction, setModalDataAction } from 'actions/bc-modal/bc-modal.action';

const initialState = Record({
  'data': null,
  'open': false,
  'type': null,
  // Flag to force refresh
  'refresh': false,
})();

export default handleActions(
  {
    [openModalAction.toString()]: (state, action) =>
      state
        .setIn(['open'], true),

    [closeModalAction.toString()]: (state, action) => {
      return state
        .setIn(['open'], false);
    },
    [setModalDataAction.toString()]: (state, action) =>
      state
        .setIn(['type'], action.payload.type)
        .setIn(['data'], Record(action.payload.data)())
        .setIn(['refresh'], action.payload.refresh)
  },
  initialState
);
