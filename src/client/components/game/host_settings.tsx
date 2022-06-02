import { Stack, Title, Select, NumberInput, Button, Grid } from '@mantine/core';
import { useState } from 'react';
import PlaylistModal from '../modals/playlist_modal';
import TopTracksModal from '../modals/top_tracks_modal';

const HostSettings = ({ socket, roomId, user, roomData }) => {
  const [mode, setMode] = useState('');
  const [topModal, setTopModal] = useState(false);
  const [playlistModal, setPlaylistModal] = useState(false);
  const [rounds, setRounds] = useState(5);

  const roundCount = (value) => {
    socket.emit('roundCount', { id: roomId, rounds: value });
    setRounds(value);
  };

  const startGame = () => {
    socket.emit('startGame', { id: roomId });
  };

  const changeMode = (value) => {
    switch (value) {
      case 'toptracks':
        setTopModal(true);
        break;
      case 'playlist':
        setPlaylistModal(true);
        break;
    }
  };

  if (!roomId || !socket || !user || !roomData) return;

  return (
    <>
      <Grid.Col xs={12} xl={6}>
        <Stack justify="flex-start" align="center">
          <Title>Host Settings</Title>
          <Select
            label="Game mode"
            value={mode}
            onChange={changeMode}
            data={[
              { value: 'toptracks', label: 'Top Tracks' },
              { value: 'playlist', label: 'Playlist' },
            ]}
          />
          <NumberInput
            label="Number of rounds"
            stepHoldDelay={500}
            stepHoldInterval={100}
            max={30}
            defaultValue={5}
            value={rounds}
            onChange={roundCount}
          />
          {roomData &&
          roomData.numUsers - roomData.numReady - 1 == 0 &&
          mode !== '' &&
          roomData.tracks.length >= rounds ? (
            <Button onClick={startGame}>Start Game</Button>
          ) : (
            ''
          )}
        </Stack>
      </Grid.Col>
      <TopTracksModal
        opened={topModal}
        setOpened={setTopModal}
        setMode={setMode}
        socket={socket}
        id={roomId}
      />
      <PlaylistModal
        opened={playlistModal}
        setOpened={setPlaylistModal}
        setMode={setMode}
        socket={socket}
        id={roomId}
      />
    </>
  );
};

export default HostSettings;
