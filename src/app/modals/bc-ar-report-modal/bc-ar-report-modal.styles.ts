import { Theme } from '@material-ui/core/styles';
import * as CONSTANTS from "../../../constants";

export default (theme: Theme): any => ({
  dialogActions: {
    padding: '25px  40px 25px 0 !important',
    backgroundColor: 'auto'
  },
  dialogContent: {
    padding: '8px 50px !important',
  },
  titleDiv: {
    display: 'flex',
    marginTop: 20,
    marginBottom: 20,
  },
  title: {
    fontWeight: 'bold',
    marginLeft: 10,
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
  closeButton: {
    color: '#4F4F4F',
    borderColor: '#4F4F4F',
    width: '110px !important',
    height: '34px',
    fontSize: '16px !important',
    padding: '0 12px',
    textTransform:'none',
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
  voidButton : {
    color: `${CONSTANTS.PRIMARY_WHITE}  !important`,
    backgroundColor: `${CONSTANTS.ERROR_RED} !important`,
    '&:hover': {
      backgroundColor: `${CONSTANTS.PRIMARY_RED} !important`,
      borderColor: CONSTANTS.PRIMARY_RED,
    },
  },
  submitButtonDisabled : {
    color: `${CONSTANTS.PRIMARY_WHITE}  !important`,
    backgroundColor: `${CONSTANTS.TABLE_HOVER} !important`,
  },
  voidPaymentButtonDisabled : {
    color: `${CONSTANTS.PRIMARY_WHITE}  !important`,
    backgroundColor: `${CONSTANTS.PRIMARY_RED} !important`,
  },
  formField: {
    margin: theme.spacing(1),
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  fullWidth: {
    width: '100%',
    marginBottom: '3px',
  },
  grey4 : {
    color: '#BDBDBD',
  }
});
