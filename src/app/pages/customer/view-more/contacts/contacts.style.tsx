import { Theme } from '@material-ui/core/styles';
import { swipe_wrapper, dataContainer, fabRoot, pageContainer, pageContent, pageMainContainer, topActionBar } from 'app/pages/main/main.styles';
export default (theme: Theme): any => ({
  ...fabRoot,
  ...pageContent,
  ...pageMainContainer,
  ...pageContainer,
  ...topActionBar,
  ...dataContainer,
  ...swipe_wrapper,
  'addButtonArea': {
    // 'display': 'flex',
    // 'justifyContent': 'flex-end',
    // 'padding': '12px 30px 5px 0',
    'position': 'absolute',
    'right': '0',
    'zIndex': '120',
  },
  'smsStatusCell': {
    'display': 'flex',
  },
  'smsStatusText': {
    'display': 'flex',
    'alignItems': 'center',
    'paddingLeft': '10px',
  }
});
