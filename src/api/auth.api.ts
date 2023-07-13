import request from 'utils/http.service';
import { Auth, AuthInfo, ChangePassword } from 'app/models/user';
import axios from 'axios';

const login = async (param: Auth) => {
  let loginData: AuthInfo = {
    'token': null,
    'tokenCustomerAPI': null,
    'user': null
  };

  try {
    const response: any = await request('/login', 'POST', param, false);
    loginData = response.data;


    /*
     * Const responseCustomerAPI: any = await request('/login', 'POST', param, false, undefined, undefined, true);
     * loginData = {...loginData, tokenCustomerAPI: responseCustomerAPI.data.token}
     */
    loginData.tokenCustomerAPI = response.data.token;
  } catch (err) {
    loginData = err.data;
    if (err.response.status >= 400 || err.data.status === 0) {
      throw new Error(err.data.errors ||
        err.data.message ||
        `${err.data['err.user.incorrect']}\nYou have ${err.data.retry} attempts left`);
    } else {
      throw new Error(`Something went wrong`);
    }
  }

  return loginData;
};

export { login };


export const changePassword = async ({ currentPassword, newPassword }:ChangePassword) => {
  try {
    const response: any = await request('/changePassword', 'POST', { currentPassword,
      newPassword }, false);
    return response.data;
  } catch (err) {
    if (err.response.status >= 400 || err.data.status === 0) {
      throw new Error(err.data.errors ||
        err.data.message ||
        `${err.data['err.user.incorrect']}\nYou have ${err.data.retry} attempts left`);
    } else {
      throw new Error(`Something went wrong`);
    }
  }
};
