import * as CONSTANTS from '../../../constants';
import { Theme } from '@material-ui/core/styles';
export default (theme: Theme): any => ({
  'fabRoot': {
    color: 'white',
    width: '100%',
    marginTop: '30px',
    marginBottom: '20px',
    borderRadius: '5px',
  },
  buttons: {
    display: 'flex',
    width: '100%'
  },
  description: {
    fontSize: '18px',
    textAlign: 'center',
    fontWeight: 600,
  }
});
