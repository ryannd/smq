import { Button, Center, Space, Title } from '@mantine/core';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const Home = ({ user }) => {
  const [hasUser, setHasUser] = useState(false);

  useEffect(() => {
    if (user) setHasUser(true);
  }, [user]);

  return (
    <Center style={{ width: '100%', height: '100%', flexDirection: 'column' }}>
      <Title order={1}>Spotify Music Quiz</Title>
      <Space h="xl" />
      <div style={{ display: 'flex' }}>
        <Link href={hasUser ? '/game/create' : '/user/guest'}>
          <Button>Host Room</Button>
        </Link>
        <Space w="xl" />
        <Button>Join Room</Button>
      </div>
    </Center>
  );
};

export default Home;
