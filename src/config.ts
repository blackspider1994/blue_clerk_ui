const config = {
  'FACEBOOK_APP_ID': process.env.REACT_APP_FACEBOOK_APP_ID || '490466604947035',
  'GOOGLE_APP_ID':
    process.env.REACT_APP_GOOGLE_APP_ID ||
    '767956916860-kkqvsqniunrhal5j5gco8njs6d0u7t1i.apps.googleusercontent.com',
  'REACT_APP_GOOGLE_KEY':
    process.env.REACT_APP_GOOGLE_KEY ||
    'AIzaSyAhohptKzKOOndCrj_6R-gIzYUfMQ3Gs-c',
  'apiBaseURL':
    process.env.REACT_APP_API_URL ||
    'https://blueclerk-node-api.deploy.blueclerk.com/api/v1/',
  'apiCustomerURL':
    process.env.REACT_APP_CUSTOMER_API_URL ||
    'https://staging-customer.blueclerk.com/api/v1/',
  'apiV2BaseURL':
    process.env.REACT_APP_API_V2_URL ||
    'https://blueclerk-node-api.deploy.blueclerk.com/api/v2',

  'appBaseURL': process.env.REACT_APP_BASE_URL || 'http://localhost:3000/',
  'customerSocketServer': process.env.REACT_APP_CUSTOMER_SOCKET_URL || 'https://staging-customer.blueclerk.com',
  'quickbooks_clientId': 'ABpcfFS7x9n3cNJQ3eojqsD0hzHV4wFbF9bHyYHzq8G6vC5b2Z',
  'quickbooks_clientSecret': 'W9RXt15hXNzcryKKkHmMxKBCGlRVBMyRJK5V1nO9',
  'socketServer': process.env.REACT_APP_SOCKET_URL || 'https://blueclerk-node-api.deploy.blueclerk.com/'
};

export default config;
