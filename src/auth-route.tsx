import { Action } from 'redux-actions';
import { Dispatch } from 'redux';
import { IAuthInfo } from 'app/models/auth';
import { connect } from 'react-redux';
import { setAuthAction } from 'actions/auth/auth.action';
import React, { useEffect } from 'react';
import { Redirect, Route, RouteComponentProps } from 'react-router-dom';

interface Props {
  token?: string;
  Component: React.FC<RouteComponentProps>;
  path: string;
  exact?: boolean;
  setAuthAction: (authInfo: IAuthInfo) => Action<any>;
}

function AuthRoute({
  token,
  Component,
  path,
  exact = false,
  setAuthAction
}: Props): JSX.Element | null {
  const storageAuth: IAuthInfo = {
    'token': localStorage.getItem('token'),
    'user': JSON.parse(localStorage.getItem('user') || '{}')
  };

  const loginFromStorage = (token === null || token === '') && storageAuth.token !== null && storageAuth.token !== '' && storageAuth.user !== null;

  useEffect(
    () => {
      loginFromStorage && setAuthAction(storageAuth);
    },
    [loginFromStorage, setAuthAction, storageAuth]
  );

  if (loginFromStorage) {
    return null;
  }

  const isAuthed = token !== null && token !== '';
  const message = 'Please log in to view this page';

  return (
    <Route
      exact={exact}
      path={path}
      render={(props: RouteComponentProps) =>
        isAuthed
          ? <Component {...props} />
          : <Redirect
            to={{
              'pathname': '/',
              'state': {
                message,
                'requestedPath': path
              }
            }}
          />

      }
    />
  );
}
const mapStateToProps = (state: {
  auth: {
    token: string;
  };
}) => ({
  'token': state.auth.token
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  'setAuthAction': (authInfo: IAuthInfo) =>
    dispatch(setAuthAction(authInfo))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AuthRoute);
