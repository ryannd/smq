import { Button, Center, Space, Title } from '@mantine/core';
import { useEffect, useState } from 'react';
import JoinModal from '~client/components/modals/join_modal';

const Home = ({ user }) => {
  const [hasUser, setHasUser] = useState(false);
  const [join, setJoin] = useState(false);

  useEffect(() => {
    if (user) setHasUser(true);
  }, [user]);

  const clickJoin = () => {
    if (hasUser) {
      setJoin(true);
    } else {
      location.replace('/user/guest');
    }
  };

  return (
    <>
      <Center
        style={{ width: '100%', height: '100%', flexDirection: 'column' }}
      >
        <Title order={1}>Spotify Music Quiz</Title>
        <Space h="xl" />
        <div style={{ display: 'flex' }}>
          <a href={hasUser ? '/game/create' : '/user/guest'}>
            <Button>Host Room</Button>
          </a>
          <Space w="xl" />
          <Button onClick={clickJoin}>Join Room</Button>
        </div>
      </Center>
      <JoinModal opened={join} setOpened={setJoin} />
    </>
  );
};

export default Home;
