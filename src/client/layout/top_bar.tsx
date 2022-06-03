import { Header, Group, Space, Title } from '@mantine/core';
import { BsMusicNoteList } from 'react-icons/bs';
import MenuLoggedIn from '~client/layout/menu_logged_in';
import MenuLoggedOut from './menu_logged_out';

const TopBar = ({ data }) => {
  return (
    <Header height={60} fixed>
      <Group sx={{ height: '100%' }} px={25} position="apart">
        <a href="/">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <BsMusicNoteList />
            <Space w="md" />
            <Title order={3}>SpotifyMusicQuiz</Title>
          </div>
        </a>
        {data ? (
          <MenuLoggedIn name={data.body.display_name} />
        ) : (
          <MenuLoggedOut />
        )}
      </Group>
    </Header>
  );
};

export default TopBar;