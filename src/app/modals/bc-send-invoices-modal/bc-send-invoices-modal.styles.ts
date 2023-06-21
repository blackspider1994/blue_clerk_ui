import { Theme } from '@material-ui/core/styles';
import * as CONSTANTS from "../../../constants";
export default (theme: Theme): any => ({
  searchIcon: {
    color: '#D0D3DC',
    marginLeft: 5,
  },
  dialogContent: {
    padding: '0 30px !important',
    maxHeight: '40vh',
    overflowY: 'auto !important',
  },
  datePicker: {
    backgroundColor: 'white',
    height: 42,
    marginLeft: 12,
  },
  dialogActions: {
    padding: '25px  40px 25px 0 !important',
    backgroundColor: 'auto'
  },
  modalPreview: {
    backgroundColor: '#EAECF3',
    padding: '35px 50px',
    margin: '0 0 15px 0',
  },
  previewCaption: {
    color: '#828282',
    marginBottom: '10px',
    textTransform:'uppercase',
  },
  previewCaption2: {
    color: '#828282',
    marginBottom: '5px',
  },
  previewText: {
    color: '#4F4F4F',
  },
  previewTextSm: {
    color: '#4F4F4F',
    marginBottom: '5px',
  },
  checkbox: {
    padding: '0 10px 0 0',
  },
  invoiceCheckboxTopPadding: {
    paddingTop: '2.5em !important',
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
    textTransform:'none',
  },
  submitButtonDisabled : {
    color: `${CONSTANTS.PRIMARY_WHITE}  !important`,
    backgroundColor: `${CONSTANTS.TABLE_HOVER} !important`,
  },
});
