import { Theme } from '@material-ui/core/styles';
import * as CONSTANTS from "../../../constants";

export default (theme: Theme): any => ({
  dialogActions: {
    'padding': '15px 24px !important'
  },
  dialogContent: {
    'margin-top': '-35px',
    'padding': '0px 24px !important'
  },
  submitButton: {
    color: CONSTANTS.PRIMARY_WHITE,
    backgroundColor: `${CONSTANTS.TABLE_ACTION_BUTTON} !important`,
    borderColor: CONSTANTS.TABLE_ACTION_BUTTON,
    '&:hover': {
      backgroundColor: `${CONSTANTS.TABLE_ACTION_BUTTON_HOVER} !important`,
      borderColor: CONSTANTS.TABLE_ACTION_BUTTON_HOVER,
    },
    minWidth: '110px !important',
    height: '34px',
    fontSize: '16px !important',
    padding: '0 12px',
    textTransform: 'none',
  },
  inputState: {
    '&& .MuiAutocomplete-inputRoot': {
      padding:"1.5px",
    },
  },
  'logoimg': {
    'width': '17%'
  },
});
