import { Theme } from '@material-ui/core/styles';
import { fabRoot, pageContainer, pageContent, pageMainContainer, topActionBar } from 'app/pages/main/main.styles';

export default (theme: Theme): any => ({
	...fabRoot,
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
    'zIndex': '1000'
  }
});
