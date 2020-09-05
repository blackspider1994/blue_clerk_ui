import Config from 'config';
import { apiUrls } from 'utils/constants';

export const getJobs = async () => {
  const response = await fetch(
    Config.apiBaseURL + apiUrls.getJobs,
    {
      'headers': {
        'Accept': 'application/json',
        'Authorization': localStorage.getItem('token') as string,
        'Content-Type': 'application/json'
      },
      'method': 'POST'
    }
  );
  return await response.json();
}
