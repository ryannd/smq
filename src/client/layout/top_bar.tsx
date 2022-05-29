import {
  Header,
  Group,
  ActionIcon,
  useMantineColorScheme,
  Space,
  Button,
} from '@mantine/core';
import Link from 'next/link';
import {
  BsFillMusicPlayerFill,
  BsSunFill,
  BsMoonStarsFill,
} from 'react-icons/bs';
import useSWR from 'swr';
import fetcher from '../utils/fetcher';

const TopBar = () => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const { data, error } = useSWR('/api/user/me', fetcher);
  console.log(data);
  return (
    <Header height={60} fixed>
      <Group sx={{ height: '100%' }} px={20} position="apart">
        <BsFillMusicPlayerFill />
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {data ? (
            <Button>{data.body.display_name}</Button>
          ) : (
            <Link href="/api/auth/login">
              <Button>Login</Button>
            </Link>
          )}
          <Space w="md" />
          <ActionIcon
            variant="light"
            onClick={() => toggleColorScheme()}
            size={30}
          >
            {colorScheme === 'dark' ? (
              <BsSunFill size={16} />
            ) : (
              <BsMoonStarsFill size={16} />
            )}
          </ActionIcon>
        </div>
      </Group>
    </Header>
  );
};

export default TopBar;
