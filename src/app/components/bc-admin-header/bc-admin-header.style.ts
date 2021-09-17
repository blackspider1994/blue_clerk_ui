import * as CONSTANTS from '../../../constants';
import { Theme } from '@material-ui/core/styles';
import { PRIMARY_GRAY } from "../../../constants";
export default (theme: Theme): any => ({
  'bcHeader': {
    'height': `${CONSTANTS.ADMIN_HEADER_HEIGHT}px`,
    'box-shadow': '0px 2px 2px rgba(0, 0, 0, 0.15)',
    'justifyContent': 'center',
    'alignItems': 'center',
    'flex-direction': 'row',
    'padding': '0 40px',
    '& > .bcNavMenu': {
      'flex': '0 0 auto',
      'display': 'flex',
      'align-items': 'center',
      'justify-content': 'flex-start',
    }
  },
  'bcTopBar': {
    'display': 'flex',
    'height': '100%',
    'paddingLeft': '0',
    'paddingRight': '0',
    'width': '100%'
  },
  'bcHeaderToolBar': {
    'min-height': `${CONSTANTS.ADMIN_HEADER_HEIGHT}px`
  },
  'bcAdminHeaderLogo': {
    'flex': `0 0 auto`,
    'overflow': 'hidden',
    '& > img': {
      width: '100%',
      height: '25px'
    }
  },
  'bcAdminHeaderNav': {
    '@media(min-width: 1280px)': {
      'display': 'flex'
    },
    'height': '100%',
    'listStyle': 'none',
    'padding': '0',
    'margin': '0',
  },
  'bcAdminHeaderNavItem': {
    '& > a': {
      'color': `${CONSTANTS.PRIMARY_DARK}`,
      'fontStyle': 'normal',
      'fontSize': '14px',
      'lineHeight': '14px',
      'height': '100%',
      'justifyContent': 'center',
      'textDecoration': 'none',
      'display': 'block',
      'padding': '10px',
    },
    'width': '100%',
    'border': `2px solid ${CONSTANTS.PRIMARY_WHITE}`,
    'border-radius': '20px',
    '&:hover': {
      'border': `2px solid ${CONSTANTS.PRIMARY_BLUE}`,
      '& > a': {
        'color': `${CONSTANTS.PRIMARY_BLUE}`,
      }
    },
    'marginRight': '10px'
  },
  'bcAdminHeaderNavItemActive': {
    'border': `2px solid ${CONSTANTS.PRIMARY_BLUE}`,
    '& > a': {
      'color': `${CONSTANTS.PRIMARY_BLUE}`,
    }
  },
  'bcAdminPopperClose': {
    'display': 'none !important',
    'pointerEvents': 'none'
  },
  'bcAdminPopperNav': {
    '@media(max-width: 767px)': {
      '& > div': {
        'boxShadow': 'none !important',
        'marginBottom': '5px !important',
        'marginLeft': '1.5rem',
        'marginRight': '1.5rem',
        'marginTop': '0px !important',
        'padding': '0px !important',
        'transition': 'none !important'
      },
      'left': 'unset !important',
      'position': 'static !important',
      'top': 'unset !important',
      'transform': 'none !important',
      'willChange': 'none !important'
    }
  },
  'bcAdminPopperResponsive': {
    '@media(max-width: 767px)': {
      'backgroundColor': 'transparent',
      'border': '0',
      'boxShadow': 'none',
      'color': 'black',
      'float': 'none',
      'marginTop': '0',
      'position': 'static',
      'width': 'auto',
      'zIndex': '1640'
    },
    'zIndex': '1200'
  },
  'bcAdminDropdown': {
    'backgroundClip': 'padding-box',
    'backgroundColor': CONSTANTS.PRIMARY_WHITE,
    'border': '0',
    'borderRadius': '3px',
    'boxShadow': '0 2px 5px 0 rgba(0, 0, 0, 0.26)',
    'fontSize': '14px',
    'listStyle': 'none',
    'margin': '2px 0 0',
    'minWidth': '160px',
    'padding': '5px 0',
    'textAlign': 'left',
    'top': '100%',
    'zIndex': '1000'
  },
  'bcAdminDropdownItem': {
    '-webkit-font-smoothing': 'subpixel-antialiased',
    'borderRadius': '2px',
    'color': CONSTANTS.PRIMARY_DARK,
    'display': 'block',
    'fontSize': '15px',
    'fontWeight': '400',
    'height': '100%',
    'margin': '0 5px',
    'padding': '10px 20px',
    'perspective': '1000px',
    'position': 'relative',
    'whiteSpace': 'nowrap',
    'zIndex': '0'
  },
  'bcAdminHeaderTools': {
    'alignItems': 'center',
    'display': 'flex',
    'flex': '0 0 200px',
    'justifyContent': 'flex-end',
    'listStyle': 'none',
    'marginLeft': 'auto',
    '& svg': {
      'height': '1.1em',
      'width': '1.1em'
    },
    [theme.breakpoints.down('xs')]: {
      flex: '0 0 100px'
    }
  },
  'bcAdminBell': {
    'alignItems': 'center',
    'display': 'flex',
    'flex': '0 0 20px',
    'justifyContent': 'flex-end',
    'listStyle': 'none',
    'marginLeft': '20px'
  },
  'bcAdminNotificationCnt': {
    '& > span ': {
      'right': 'auto'
    }
  },
  'bcAdminHeaderToolsButton': {
    'borderRadius': '50%',
    'margin': '0 4px',
    'minWidth': 'unset'
  },
  'toolbarToggleButton': {
    'position': 'absolute',
    'left': -15,
    'height': CONSTANTS.ADMIN_HEADER_HEIGHT,
    'display': 'flex',
    'justifyContent': 'center',
    'alignItems': 'center',
  },
  'bcHeaderToggleButton': {
    'backgroundColor': CONSTANTS.PRIMARY_GRAY,
  }
});