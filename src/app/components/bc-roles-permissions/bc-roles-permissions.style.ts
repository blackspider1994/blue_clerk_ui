import * as CONSTANTS from '../../../constants';

export default (): any => ({
  'actionsContainer': {
    'display': 'flex',
    'justify-content': 'end',
    'width': '85%'
  },
  'accordionSummary': {
    'height': '64px',
  },
  'card': {
    'border': `1px solid ${CONSTANTS.LIGHT_GREY}`,
    'border-radius': '10px',
    // Overwrite mui styles
    'box-shadow': 'none',
    'width': '85%',
    "&$expanded": {
      'margin': '0',
    }
  },
  'container': {
    'padding': '0 3rem'
  },
  'headerContainer': {
    'display': 'flex',
    'justify-content': 'space-between'
  },
  'cancelBtn': {
    'backgroundColor': CONSTANTS.PRIMARY_WHITE,
    'borderRadius': 8,
    'fontSize': '13px',
    'height': '34px',
    'margin-right': '1rem',
    'padding': '5px 15px',
    'textTransform': 'none'
  },
  'contentContainer': {
    'marginTop': '2rem',
    'display': 'flex',
    'flex-direction': 'column',
    'width': '100%',
    'align-items': 'center',
    'gap': '0.5rem'
  },
  'label': {
    'font-size': '20px'
  },
  'permissions': {
    'display': 'flex',
    'flex-direction': 'column',
    'margin-left': '2rem'
  }
});
