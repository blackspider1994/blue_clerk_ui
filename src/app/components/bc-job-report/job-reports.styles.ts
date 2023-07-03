import { Theme } from '@material-ui/core/styles';
import * as CONSTANTS from '../../../constants';
import styled from 'styled-components';

export default (theme: Theme): any => ({
  'label': {
    'fontSize': '16px !important',
    'marginBottom': '0 !important'
  },
  'mapLocation': {
    'display': 'flex',
    'flexDirection': 'column'
  },
  'mapWrapper': {
    'height': '100%'
  },
  'paper': {
    'color': CONSTANTS.PRIMARY_DARK,
    'padding': '4px 8px'
  },
  'root': {
    'flexGrow': 1
  },
  'subTitle': {
    'fontSize': '14px',
    'fontWeight': 'bold',
    'lineHeight': '10px',
    'textDecorationLine': 'underline',
    'textUnderlineOffset': '5px',
    'letterSpacing': '1px',
    'textTransform': 'uppercase',
    'color': CONSTANTS.GRAY2,
  },

  'noMargin': {
    'display': 'block',
    'marginTop': '0px',
    'paddingRight': '15px'
  },
  'noMarginBottom': {
    'marginBottom': '0px',
  },

  'addMargin': {
    'marginTop': '15px',
    'paddingRight': '15px'
  },

  'mt_24': {
    'marginTop': '24px',
    'paddingRight': '15px'
  },

  'mb_0': {
    'margineBottom': 0
  },

  'mt_0': {
    'marginTop': 0
  },

  'm_0': {
    'margin': 0
  },

  'largeIcon': {
    'fontSize': '100px',
    'backgroundColor': CONSTANTS.PRIMARY_GRAY,
    'borderRadius': '50%',
    'marginTop': '20px',
    'padding': '20px'
  },

  'smallIcon': {
    'backgroundColor': CONSTANTS.PRIMARY_GRAY,
    'borderRadius': '50%',
    'padding': '5px'
  },

  'reportTag': {
    'color': CONSTANTS.PRIMARY_BLUE,
    'fontSize': '22px !important',
    'fontWeight': 'bold',
    'margin': '5px',
  },
  'btn': {
    'float': 'right',
    'display': 'flex',
    'justifyContent': 'flex-end',
    'alignItems': 'center',
    'margin': '-50px 20px 30px 0px'
  },
  'cancelBtn': {
    'textTransform': 'none',
    'padding': '10px 30px 10px 30px',
    'backgroundColor': CONSTANTS.PRIMARY_WHITE
  },
  'invoiceBtn': {
    'textTransform': 'none',
    'backgroundColor': CONSTANTS.PRIMARY_BLUE,
    'color': CONSTANTS.PRIMARY_WHITE,
    'padding': '10px 30px 10px 30px',
    'borderRadius': '30px 30px 30px 30px',
    'margin': '10px',
    '&:hover': {
      'color': `${CONSTANTS.PRIMARY_DARK} !important`
    }
  },
  'iconImage': {
    'width': 'auto',
    'max-width': '120px',
    'height': 'auto',
    'max-height': '120px',
    'display':'inline-block',
    'vertical-align':'middle',
  },
  'imgArea': {
    'display': 'flex',
    'justify-content': 'center',
    'align-items': 'center',
    'height': '120px',
  },
  'backButton': {
    backgroundColor: '#D0D3DC',
    color: '#fff',
  },
  'headerBackground': {
    'padding': '45px 45px 45px 45px',
    'backgroundColor': CONSTANTS.LIGHT_BLUE,
    'borderBottom': `solid 2px ${CONSTANTS.GRAY6}`,
    'borderTopLeftRadius': '25px',
    'borderTopRightRadius': '25px',
  },
  'bodyContainer': {
    'padding': '0px 45px 45px 45px',
  },
  'companyName': {
    'color': CONSTANTS.GRAY2,
    'fontSize': '22px !important',
    'fontWeight': 'bold',
    'margin': 0
  },
  'grayBoldTextM_0': {
    'color': CONSTANTS.GRAY2,
    'fontSize': '14px !important',
    'fontWeight': 'bold',
    'margin': 0
  },
  'grayBoldText': {
    'color': CONSTANTS.GRAY2,
    'fontSize': '14px !important',
    'fontWeight': 'bold',
    'marginTop': 1,
  },
  'grayNormalText': {
    'color': CONSTANTS.GRAY2,
    'fontSize': '14px !important',
    'marginTop': 0,
  },
  'attributeKey': {
    'color': CONSTANTS.GRAY3,
    'fontSize': '14px !important',
    'marginBottom': 5,
    'textTransform': 'uppercase',
  },
  'separator': {
    'height': '2px', 
    'background': CONSTANTS.GRAY6, 
    'borderWidth': '0px', 
    'width': '100%',
    'marginTop': '10px',
    'marginBottom': '10px',
  },
  'rightAlign': {
    'textAlign': 'right'
  },
  'occupiedHouseText': {
    'color': CONSTANTS.OCCUPIED_GREEN,
    'fontSize': '14px !important',
    'fontWeight': 'bold',
    'margin': 0
  },
  'notesTitle': {
    'color': CONSTANTS.GRAY2,
    'fontSize': '18px !important',
    'fontWeight': 'bold',
    'margin': 0
  },
  'notesSubtitle': {
    'color': CONSTANTS.GRAY3,
    'fontSize': '14px !important',
    'marginBottom': 5,
    'textTransform': 'uppercase',
    'textDecorationLine': 'underline',
    'textUnderlineOffset': '5px',
    'letterSpacing': '1px',
  },
  'footerContainer': {
    'padding': '45px 0px 0px 45px',
  },
  'footerText': {
    'color': CONSTANTS.GRAY3,
    'fontSize': '8px !important',
    'textTransform': 'uppercase',
    'letterSpacing': '1px',
  },
  'footerLogo': {
    'width': 'auto',
    'max-width': '30px',
    'height': 'auto',
    'max-height': '30px',
  }
});

export const MainContainer = styled.div`
  display: flex;
  flex: 1 1 100%;
  width: 100%;
  overflow-x: hidden;
  border-radius: 25px;
`;

export const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 100%;
  width: 100%;
  padding-left: 65px;
  padding-right: 65px;
  background-color: ${CONSTANTS.PRIMARY_WHITE};
  margin: 45px 20px 20px 0px;
  border-radius: 25px;
  .no-image {
    height: 100px;
    width: calc(100% - 20px);
    background: ${CONSTANTS.PRIMARY_GRAY};
    display: flex;
    padding: 20px;
    justify-content: center;
    align-items: center;
    text-align: center;
    box-sizing: border-box;
    color: ${CONSTANTS.PRIMARY_DARK_GREY}
  }
  img {
    width: 100%;
    padding-right: 15px;
    box-sizing: border-box;
  }
  p {
    word-break: break-word;
  }
  .lastEmail {
    color:${CONSTANTS.PRIMARY_DARK_GREY};
  }
`;

export const DataContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0px 0px 0px 0px;
  margin: 20px 0px 70px 0px;
  background-color: ${CONSTANTS.PRIMARY_WHITE};
  border: ${CONSTANTS.GRAY6} 4px solid;
  border-radius: 25px;
`;
