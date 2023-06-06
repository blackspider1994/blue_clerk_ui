import { Theme } from '@material-ui/core/styles';
import * as CONSTANTS from "../../../constants";
import {LABEL_GREY, PRIMARY_BLUE} from "../../../constants";

export default (theme: Theme): any => ({
  popper: {
    '& li[aria-disabled="true"]': {
      paddingTop: 0,
      paddingBottom: 0,
    },
  },
  dialogActions: {
    padding: '25px  40px 25px 0 !important',
    backgroundColor: 'auto'
  },
  dialogContent: {
    padding: '8px 150px !important',
  },
  modalPreview: {
    backgroundColor: '#EAECF3',
    padding: '35px 200px',
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
  submitButtonDisabled : {
    color: `${CONSTANTS.PRIMARY_WHITE}  !important`,
    backgroundColor: `${CONSTANTS.TABLE_HOVER} !important`,
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
  },
  dialogTitle: {
    textAlign: 'center',
    color: PRIMARY_BLUE,
    marginBottom: 20,
    '& strong': {
      fontSize: 30,
    }
  },
  hqButton: {
    borderStyle: 'dashed',
    borderRadius: 8,
    color: LABEL_GREY,
    textTransform: 'capitalize',
  },
  hqButtonActive: {
    border: `2px solid ${PRIMARY_BLUE}`,
    color: PRIMARY_BLUE,
    backgroundColor: '#E5F7FF',
  },
  billingAddress:{
    marginTop: "43px"
  },
  billingAddressTtitle: {
    padding: '45px 0px 12px 94px',
  },
  inputState: {
    '&& .MuiAutocomplete-inputRoot': {
      padding:"9.5px",
    },
  }
});
