import * as CONSTANTS from '../../../constants';
import { Theme } from '@material-ui/core/styles';
import { NoEncryption } from '@material-ui/icons';
export default (theme: Theme): any => ({
  'bcSideBar': {
    'backgroundColor': CONSTANTS.ADMIN_SIDEBAR_BG,
    '&::-webkit-scrollbar': {
      'display': 'none',
    }
  },
  'hidden' : {
    'display': 'none',
  },
  'bcSideBarCompanyLogo': {
    'width': '100%',
    'height': 70,
    'display': 'flex',
    'justifyContent': 'center',
    'alignItems': 'center',
    'transition': 'all 0.3s 0s ease-in-out',
    'margin': '45px 0 15px',
    '& > img': {
      'height': '100%',
    }
  },
  'bcSidebarBody': {
    'flex': '1',
    '& > ul': {
      'listStyle': 'none',
      'margin': '0',
      'padding': '0',
      '& > li': {
        'margin': '5px 0',
        'position': 'relative',
        'padding': '0 10px',
      }
    },
  },
  'bcSidebarDivider': {
    'width': '100%',
    'height': '3px',
    'backgroundColor': CONSTANTS.PRIMARY_GRAY
  },
  'bcSidebarFooter': {
    'display': 'block',
    'padding': '10px 0',
    '& > ul': {
      'listStyle': 'none',
      'margin': '0',
      'padding': '0',
      '& > li': {
        'padding': '0 10px',
        'position': 'relative',
        '& > button': {
          'width': '100%',
          'padding': '10px 0',
          'display': 'inline-flex',
          'justifyContent': 'center',
          'fontSize': '14px',
          '& > MuiButton-label': {
            'marginLeft': 25,
            'fontWeight': 400
          }
        }
      }
    }
  },
  "flagWarning": {
    "color": "red",
    "fontWeight": 'bold',
    "position": "absolute",
    "left": "10px"
  }
});
