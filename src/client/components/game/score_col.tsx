import { Center, Stack } from '@mantine/core';
import UserCard from './user_card';

const ScoreCol = ({ roomData }) => {
  if (!roomData) return;
  return (
    <Center>
      <Stack style={{ width: '100%', height: '100%' }}>
        {roomData.users &&
          Object.keys(roomData.users)
            .map((user) => roomData.users[user])
            .sort((a, b) => b.score - a.score)
            .map((user) => <UserCard user={user} inGame={roomData.inGame} />)}
      </Stack>
    </Center>
  );
};

export default ScoreCol;
