import { Center, Stack, Text } from '@mantine/core';
import UserCard from './user_card';
import FlipMove from 'react-flip-move';

const ScoreCol = ({ roomData, roomId }) => {
  if (!roomData) return;
  return (
    <Center>
      <Stack style={{ width: '100%', height: '100%', textAlign: 'center' }}>
        <Text weight={500}>
          Room Code: {roomId} | Waiting: {roomData.waitingRoom.length}
        </Text>
        {roomData.users && (
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          <FlipMove>
            {Object.keys(roomData.users)
              .map((user) => roomData.users[user])
              .sort((a, b) => b.score - a.score)
              .map((user) => (
                <UserCard user={user} inGame={roomData.inGame} key={user.id} />
              ))}
          </FlipMove>
        )}
      </Stack>
    </Center>
  );
};

export default ScoreCol;
