import { Theme } from '@material-ui/core/styles';
import * as CONSTANTS from "../../../constants";
export default (theme: Theme): any => ({
  lastContent: {
    marginTop: -10,
    marginBottom: 35,
  },
  actionsList: {
    margin: '4px 0 4px 4px',
    padding: 0,
  },
  'dialogActions': {
    'padding': '15px 24px !important'
  },
  'dialogContent': {
    'padding': '8px 24px !important',
    'flexGrow': '1',
    'display': 'flex',
    'alignItems': 'center'
  },
  'formWrapper': {
    'display': 'flex',
    'flexDirection': 'column',
    'height': '100% !important',
  },
  'fabRoot': {
    'color': '#fff',
    'fontSize': '.775rem',
    'height': '34px',
    'padding': '0 12px',
    'textTransform': 'capitalize'
  },
  'label': {
    'fontSize': '16px !important',
    'marginBottom': '0 !important',
    'color': '#000000 !important'
  },
  'formGroup': {
    'margin': '1rem 0',
  },
  'uploadImageNoData': {
    'alignSelf': 'center',
    'height': '219px',
    'width': '236px',
    'background': '#FFFFFF',
    'boxSizing': 'border-box',
    'borderRadius': '6px',
    'background-size': '100% 100%',
    'position': 'relative',
  },
  'historyContainer': {
    'marginTop': '1rem'
  },
  'tableContainer': {
    'maxHeight': '30rem',
  },
  'deleteButton': {
    'background': '#C00707 !important',
    // 'borderRadius': '30px',
    'minWidth': '130px !important',
    'fontSize': '16px !important',
    'padding': '0 12px',
    'height': '34px',
    'color': CONSTANTS.PRIMARY_WHITE,
    'textTransform': 'capitalize',
    'marginRight': '1.5rem',
  },
  popper: {
    '& li[aria-disabled="true"]': {
      paddingTop: 0,
      paddingBottom: 0,
    }
  },
  'dialogActionsConfirmation': {
    'margin-top': '55px',
    'padding': '28px 44px !important',
    'border-top': '1px solid #D0D3DC'
  },
  'cancelButton': {
    'background': CONSTANTS.PRIMARY_WHITE,
    'color': CONSTANTS.INVOICE_HEADING,
    'fontStyle': 'normal',
    'fontWeight': 'normal',
    'fontSize': '14px',
    'lineHeight': '27px',
    'border': '1px solid #4F4F4F',
    'border-radius': '8px',
    'textTransform': 'none'
  },
  'proceedButton': {
    'color': CONSTANTS.PRIMARY_WHITE,
    'fontStyle': 'normal',
    'fontWeight': 'normal',
    'fontSize': '14px',
    'lineHeight': '30px',
    'border-radius': '8px',
    'textTransform': 'none',
    'width': '160px'
  },
  relative: {
    position: 'relative',
    marginBottom: "2px!important"
  },
  addJobTypeButton: {
    width: '100%',
    border: '1px dashed #BDBDBD',
    borderRadius: 8,
    textTransform: 'none',
  },
  removeJobTypeButton: {
    position: 'absolute',
    top: 12,
  },
});
