import { Stack, Text, Title } from '@mantine/core';

const RoomInfo = ({ roomData, roomId }) => {
  if (!roomData || !roomId) return;
  return (
    <>
      <Stack align="center" justify="flex-start">
        <Title>Room Settings</Title>
        <Text>Room Code: {roomId}</Text>
        {roomData && (
          <>
            <Text>Game mode: {roomData.currentGame.gameMode}</Text>
            <Text>Number of rounds: {roomData.currentGame.rounds}</Text>
            {roomData.currentGame.playlistTitle !== '' && (
              <Text>Playlist Title: {roomData.currentGame.playlistTitle}</Text>
            )}
          </>
        )}
      </Stack>
    </>
  );
};

export default RoomInfo;
