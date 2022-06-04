import { Button, Divider, Menu, useMantineColorScheme } from '@mantine/core';
import { BsMoonStarsFill, BsSunFill } from 'react-icons/bs';
import { RiLogoutBoxFill } from 'react-icons/ri';
import cookieCutter from 'cookie-cutter';

const MenuLoggedIn = ({ name }) => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  const logout = () => {
    cookieCutter.set('jwt', '', { expires: new Date(0) });
    localStorage.clear();
    location.replace('/');
  };

  return (
    <Menu
      control={<Button>{name}</Button>}
      placement="start"
      shadow="xl"
      size="md"
    >
      <Menu.Label>Account</Menu.Label>
      {/* <Menu.Item icon={<RiProfileFill />}>Profile</Menu.Item> */}
      <Menu.Item color="red" icon={<RiLogoutBoxFill />} onClick={logout}>
        Logout
      </Menu.Item>
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
  );
};

export default MenuLoggedIn;
