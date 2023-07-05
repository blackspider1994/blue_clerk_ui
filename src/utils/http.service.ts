import config from 'config';
import { getLocalStorageToken } from './local-storage.service';
import axios, { AxiosRequestConfig, AxiosResponse, CancelTokenSource, Method } from 'axios';

const api = config.apiBaseURL;
const customerApi = config.apiCustomerURL;
// Api v2 URL
const apiV2 = config.apiV2BaseURL;

const fetchToken = (isCustomerAPI = false) => {
  if (isCustomerAPI) {
    return localStorage.getItem('tokenCustomerAPI') || '';
  }
  let token = '';
  if (getLocalStorageToken()) {
    token = getLocalStorageToken();
  }
  return token;
};

/**
 * Make request to the specific config passed by parameter
 * @param request the request to be executed
 * @returns Promise<AxiosResponse<any>>
 */
const makeRequest = (request: AxiosRequestConfig): Promise<AxiosResponse<any>> => {
  return new Promise((resolve, reject) => {
    axios(request)
      .then(res => {
        if (res?.data?.status === 0 && res?.data?.message === 'Session is expired or you are already logged out, please login again') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('tokenCustomerAPI');
          window.location.href = '/';
        } else {
          return resolve(res);
        }
      })
      .catch(err => {
        return reject(err);
      });
  });
};

export default (url: string, type: Method, data?: any, noHeaders?: boolean, enctype = '', cancelTokenSource?: CancelTokenSource, isCustomerAPI = false, queryParams?: any): Promise<AxiosResponse<any>> => {
  let token = '';

  if (!noHeaders) {
    token = fetchToken(isCustomerAPI);
  }

  const request: AxiosRequestConfig = {
    'headers': {},
    'method': type === 'OPTIONS'
      ? 'get'
      : type,
    'url': isCustomerAPI
      ? customerApi + url
      : api + url
  };

  if (type !== 'get') {
    if (type === 'OPTIONS') {
      request.params = data;
    } else {
      request.data = data;
    }
  }

  if (!noHeaders) {
    request.headers = {
      ...request.headers,
      'Authorization': token
    };
  }

  if (cancelTokenSource) {
    request.cancelToken = cancelTokenSource.token;
  }

  //add current division params
  if (queryParams) {
    try {
      request.params = { ...request.params, ...queryParams };
    } catch (error) { }
  }
  return makeRequest(request);
};
/**
 * Build and make request to the api v2
 * @param uri the uri that the resource required
 * @param type the request type (POST, GET, PUT, DELETE)
 * @param data the data that will be sent
 * @param cancelTokenSource
 * @returns Promise<AxiosResponse<any>>
 */
export const requestApiV2 = (uri: string, type: Method, data?: any, cancelTokenSource?: CancelTokenSource, queryParams?: any) => {
  const token = fetchToken(false);
  const request: AxiosRequestConfig = {
    'headers': { 'Authorization': token },
    'method': type === 'OPTIONS'
      ? 'get'
      : type,
    'url': `${apiV2}${uri}`
  };

  if (type !== 'get') {
    if (type === 'OPTIONS') {
      request.params = data;
    } else {
      request.data = data;
    }
  }

  if (cancelTokenSource) {
    request.cancelToken = cancelTokenSource.token;
  }

  //add current division params
  if (queryParams) {
    try {
      request.params = { ...request.params, ...queryParams };
    } catch (error) { }
  }
  return makeRequest(request);
};

/**
 * Download file from specific uri
 * @param uri uri where is located the file
 * @param type type of HTTP method used to download the file
 * @param data extra data to be sent on the request
 * @returns Promise<AxiosResponse<any>>
 */
export const downloadFile = (uri: string, type: Method, data?: any): Promise<AxiosResponse<any>> => {
  const token = fetchToken(false);
  const request: AxiosRequestConfig = {
    'headers': { 'Authorization': token },
    'method': type === 'OPTIONS'
      ? 'get'
      : type,
    'url': `${api}${uri}`,
    responseType: 'blob',
  };
    if (type !== 'get') {
      if (type === 'OPTIONS') {
        request.params = data;
      } else {
        request.data = data;
      }
    }
  return makeRequest(request);
  };

export const pdfRequest = (url: string, type: Method, data?: any, noHeaders?: boolean, enctype = '', cancelTokenSource?: CancelTokenSource, isCustomerAPI = false, queryParams?: any): Promise<AxiosResponse<any>> => {
  let token = '';

  if (!noHeaders) {
    token = fetchToken(isCustomerAPI);
  }

  const request: AxiosRequestConfig = {
    'headers': {},
    'responseType': 'arraybuffer',
    'method': type === 'OPTIONS'
      ? 'get'
      : type,
    'url': isCustomerAPI
      ? customerApi + url
      : api + url
  };

  if (type !== 'get') {
    if (type === 'OPTIONS') {
      request.params = data;
    } else {
      request.data = data;
    }
  }

  if (!noHeaders) {
    request.headers = {
      ...request.headers,
      'Authorization': token
    };
  }

  if (cancelTokenSource) {
    request.cancelToken = cancelTokenSource.token;
  }

  //add current division params
  if (queryParams) {
    try {
      request.params = { ...request.params, ...queryParams };
    } catch (error) { }
  }
  return makeRequest(request);
};
