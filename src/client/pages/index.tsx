import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import cookieCutter from 'cookie-cutter';
const Home: NextPage = () => {
  const [jwt, setJwt] = useState('');
  useEffect(() => {
    const token = cookieCutter.get('jwt');
    setJwt(token);
  }, []);
  return <h1>{jwt}</h1>;
};

export default Home;
