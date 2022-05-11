import axios from 'axios';
import cookieCutter from 'cookie-cutter';

const fetcher = (url) => {
  const jwt = cookieCutter.get('jwt');
  const fetch = axios
    .get(url, { headers: { Authorization: 'Bearer ' + jwt } })
    .then((res) => res.data);
  return fetch;
};

export default fetcher;
