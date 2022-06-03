import { Button, Divider, Menu, useMantineColorScheme } from '@mantine/core';
import { BsMoonStarsFill, BsSunFill } from 'react-icons/bs';
import { RiProfileFill, RiLogoutBoxFill } from 'react-icons/ri';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import GuestModal from '~client/components/modals/guest_modal';

const MenuLoggedOut = () => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [opened, setOpened] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    const localName = localStorage.getItem('guestName');
    if (localName !== null) setName(localName);
  }, []);

  return (
    <>
      <Menu
        control={<Button>Login</Button>}
        placement="start"
        shadow="xl"
        size="md"
      >
        {name !== '' && <Menu.Label>Current guest name: {name}</Menu.Label>}
        <Menu.Item icon={<RiProfileFill />} onClick={() => setOpened(true)}>
          {name !== '' ? 'Change Guest Name' : 'Login as Guest'}
        </Menu.Item>
        <Link href="/api/auth/login">
          <Menu.Item icon={<RiLogoutBoxFill />}>Login with Spotify</Menu.Item>
        </Link>
        <Divider />
        <Menu.Item
          icon={
            colorScheme === 'dark' ? (
              <BsSunFill size={16} />
            ) : (
              <BsMoonStarsFill size={16} />
            )
          }
          onClick={() => toggleColorScheme()}
        >
          Toggle theme
        </Menu.Item>
      </Menu>
      <GuestModal opened={opened} setOpened={setOpened} />
    </>
  );
};

export default MenuLoggedOut;
