import { fabRoot, pageContainer, pageContent, pageMainContainer, } from 'app/pages/main/main.styles';
import * as CONSTANTS from '../../../../constants';

export default (): any => ({
  ...fabRoot,
  ...pageContent,
  ...pageMainContainer,
  ...pageContainer,

  'mainPane': {
    'borderRadius': '14px',
    'height': '100%',
    'width': '100%',
    'background': 'white',
    'display': 'flex',
    'flex-direction': 'column',
    'align-items': 'center'
  },
  'infoPane': {
    'padding': '20px',
    'width': '90%',
  },
  'buttonPane': {
    'textAlign': 'end',
    'padding': '20px',
    'width': '100%'
  },
  'required': {
    'color': 'gray'
  },
  'asterisk': {
    'color': 'red'
  },
  'cardActionArea': {
    'height': '100%',
  },
  'rolesRow': {
    'padding': '30px',
    'width': '70%',
    'textAlign': 'center',
    'display': 'flex',
    'flexDirection': 'row',
    'justifyContent': 'space-between',
    'margin': 'auto'
  },
  'roundBackground': {
    'backgroundColor': '#00aaff',
    'borderRadius': '50%',
    'color': 'white',
    'height': '28px',
    'width': '28px',
    'marginRight': '30px'
  },
  'accordionSummary': {
    'height': '64px',
  },
  'card': {
    'border': `1px solid ${CONSTANTS.LIGHT_GREY}`,
    'border-radius': '10px',
    // Overwrite mui styles
    'box-shadow': 'none',
    'width': '100%',
    "&$expanded": {
      'margin': '0',
    }
  },
  'contentContainer': {
    'marginTop': '2rem',
    'display': 'flex',
    'flex-direction': 'column',
    'width': '100%',
    'align-items': 'center',
    'gap': '0.5rem'
  },
  'permissions': {
    'display': 'flex',
    'flex-direction': 'column',
    'margin-left': '2rem'
  }
});
