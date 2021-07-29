import * as CONSTANTS from './constants';
import * as serviceWorker from './serviceWorker';
import App from './App';
import LogRocket from 'logrocket';
import { Provider } from 'react-redux';
import React from 'react';
import ReactDOM from 'react-dom';
import { SnackbarProvider } from 'notistack';
import store from './store';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import './scss/index.scss';

const THEME = createMuiTheme({
  'palette': {
    'primary': {
      'main': CONSTANTS.PRIMARY_BLUE
    }
  }
});

LogRocket.init('lt4dnt/blueclerk');

ReactDOM.render(
  <MuiThemeProvider theme={THEME}>
    <Provider store={store}>
      <SnackbarProvider
        anchorOrigin={{
          'horizontal': 'right',
          'vertical': 'top'
        }}>
        <App />
      </SnackbarProvider>
    </Provider>
  </MuiThemeProvider>,
  document.getElementById('root')
);

/*
 * If you want your app to work offline and load faster, you can change
 * unregister() to register() below. Note this comes with some pitfalls.
 * Learn more about service workers: https://bit.ly/CRA-PWA
 */
serviceWorker.unregister();
