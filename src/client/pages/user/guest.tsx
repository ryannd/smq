import { Button, Center, Space, Title } from '@mantine/core';
import Link from 'next/link';
import { useState } from 'react';
import GuestModal from '~client/components/modals/guest_modal';

const Guest = () => {
  const [opened, setOpened] = useState(false);

  return (
    <>
      <Center
        style={{ width: '100%', height: '100%', flexDirection: 'column' }}
      >
        <Title order={1}>You are not logged in.</Title>
        <Space h="xl" />
        <div style={{ display: 'flex' }}>
          <Button onClick={() => setOpened(true)}>Login as Guest</Button>
          <Space w="xl" />
          <Link href="/api/auth/login">
            <Button>Login with Spotify</Button>
          </Link>
        </div>
      </Center>
      <GuestModal setOpened={setOpened} opened={opened} />
    </>
  );
};

export default Guest;
