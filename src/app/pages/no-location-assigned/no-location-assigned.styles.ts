import { Theme } from '@material-ui/core/styles';
import {
  fabRoot,
  pageContainer,
  pageContent,
  pageMainContainer,
  topActionBar,
} from 'app/pages/main/main.styles';

export default (theme: Theme): any => ({
  'mainContainer': {
    'display': 'flex',
    'flex': '1 1 100%',
    'overflowX': 'hidden',
    'width': '100%',
    'justify-content': 'center',
    'align-items': 'center',
    'margin-top': '2rem'
  },
});
