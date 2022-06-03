import { Button, Stack, Text, Title } from '@mantine/core';
import { useState } from 'react';

const RoomInfo = ({ roomData, roomId, host, ready }) => {
  const [disableBtn, setDisableBtn] = useState(false);
  if (!roomData || !roomId) return;

  const click = () => {
    setDisableBtn(true);
    ready();
  };

  return (
    <>
      <Stack align="center" justify="flex-start">
        <Title>Room Settings</Title>
        <Text>Room Code: {roomId}</Text>
        {roomData.currentGame && (
          <>
            <Text>Game mode: {roomData.currentGame.gameMode}</Text>
            {roomData.currentGame.playlistTitle !== '' && (
              <Text>Playlist Title: {roomData.currentGame.playlistTitle}</Text>
            )}
            <Text>Number of rounds: {roomData.currentGame.rounds}</Text>
          </>
        )}
        {!host && (
          <Button
            onClick={click}
            disabled={disableBtn}
            style={{ width: '100%', marginTop: '25px' }}
          >
            Ready
          </Button>
        )}
      </Stack>
    </>
  );
};

export default RoomInfo;
