import { Theme } from '@material-ui/core/styles';
import { dataContainer, fabRoot,emailButton, pageContainer, pageContent, pageMainContainer, topActionBar } from 'app/pages/main/main.styles';
import {GRAY5, GRAY6, PRIMARY_BLUE, PRIMARY_GREEN} from "../../../../constants";

export default (theme: Theme): any => ({
  ...fabRoot,
  ...emailButton,
  ...pageContent,
  ...pageMainContainer,
  ...pageContainer,
  ...topActionBar,
  'addButtonArea': {
    'display': 'flex',
    'justifyContent': 'flex-end',
    'padding': '12px 30px 5px 0',
    'position': 'absolute',
    'right': '0',
    'zIndex': '1'
  },
  currencySign: {
    'position': 'relative',
    'top': '-1px',
  },
  noLeftMargin: {
    marginLeft: '0 !important',
  },
  syncButton: {
    position: 'absolute',
    right: 30,
    textTransform: 'capitalize',
    borderRadius: 8,
    borderColor: GRAY5,
    boxShadow: `0 3px ${GRAY5}`,
    zIndex: 1000,
    // '&& :active' : {
    //   backgroundColor: PRIMARY_GREEN,
    //   color: 'white',
    // }
  },
  disabledButton: {
    backgroundColor: GRAY6,
    boxShadow: `0 0`,
  },
  buttonIcon: {
    color: PRIMARY_GREEN,
  },
  buttonIconDisabled: {
    color: GRAY5,
  },
  reminderText: {
    color: PRIMARY_BLUE,
    fontWeight: 'bold',
  }
});
