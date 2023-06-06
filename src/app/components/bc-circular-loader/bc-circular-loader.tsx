import { CircularProgress } from '@material-ui/core';
import React from 'react';

function BCCircularLoader({ heightValue = '100vh', size= 50 }: any): JSX.Element {
  return (
    <div style={{
      'alignItems': 'center',
      'display': 'flex',
      'height': heightValue,
      'justifyContent': 'center',
    }}>
      <CircularProgress size={size} />
    </div>
  );
}

export default BCCircularLoader;
