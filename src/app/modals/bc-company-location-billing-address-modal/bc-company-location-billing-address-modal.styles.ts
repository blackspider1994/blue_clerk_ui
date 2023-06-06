import { Theme } from '@material-ui/core/styles';
import * as CONSTANTS from "../../../constants";

export default (theme: Theme): any => ({
  dialogActions: {
    padding: '25px  40px 25px 0 !important',
    backgroundColor: 'auto'
  },
  dialogContent: {
    borderTop: "1px solid #D0D3DC",
    borderBottom: "1px solid #D0D3DC",
    padding: "44px 30px!important"
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
      padding:"9.5px",
    },
  },
  fullWidth: {
    width: '100%',
    marginBottom: '3px',
  },
});
