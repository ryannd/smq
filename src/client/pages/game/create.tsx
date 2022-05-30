import {
  Button,
  Center,
  Grid,
  Input,
  InputWrapper,
  Modal,
  NumberInput,
  Select,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { io } from 'socket.io-client';
import { useEffect, useState } from 'react';
import { BsGlobe } from 'react-icons/bs';
import { SocketRoom } from '~client/globals/types';

const Create = ({ user }) => {
  const [mode, setMode] = useState('');
  const [topModal, setTopModal] = useState(false);
  const [playlistModal, setPlaylistModal] = useState(false);
  const [rounds, setRounds] = useState(5);
  const [socket, setSocket] = useState(null);
  const [roomData, setRoomData] = useState<SocketRoom>();
  const [randomRoom] = useState((Math.random() + 1).toString(36).substring(7));

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

  useEffect(() => {
    const socketIo = io();
    setSocket(socketIo);

    socketIo.on('updateRoom', (data) => {
      setRoomData({ ...data });
    });

    return () => {
      socketIo.off('updateRoom');
    };
  }, []);

  useEffect(() => {
    if (!randomRoom || !socket || !user) return;

    socket.emit('hostJoinRoom', {
      id: randomRoom,
      user,
    });

    return () => {
      socket.off('hostJoinRoom');
    };
  }, [randomRoom, socket, user]);

  const startGame = () => {
    socket.emit('startGame', { id: randomRoom });
  };

  const roundCount = (value) => {
    socket.emit('roundCount', { id: randomRoom, rounds: value });
    setRounds(value);
  };

  return (
    <>
      <Center
        style={{ width: '100%', height: '100%', flexDirection: 'column' }}
      >
        <Grid style={{ width: '50%' }} justify="center">
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
          <Grid.Col xs={12} xl={6}>
            <Stack align="center" justify="flex-start">
              <Title>Room Settings</Title>
              {roomData && (
                <>
                  <Text>Game mode: {roomData.currentGame.gameMode}</Text>
                  <Text>Number of rounds: {roomData.currentGame.rounds}</Text>
                  {roomData.currentGame.playlistTitle !== '' && (
                    <Text>
                      Playlist Title: {roomData.currentGame.playlistTitle}
                    </Text>
                  )}
                </>
              )}
            </Stack>
          </Grid.Col>
        </Grid>
      </Center>
      <TopTracksModal
        opened={topModal}
        setOpened={setTopModal}
        setMode={setMode}
        socket={socket}
        id={randomRoom}
      />
      <PlaylistModal
        opened={playlistModal}
        setOpened={setPlaylistModal}
        setMode={setMode}
        socket={socket}
        id={randomRoom}
      />
    </>
  );
};

const TopTracksModal = ({ opened, setOpened, setMode, socket, id }) => {
  const [range, setRange] = useState('long_term');
  const [limit, setLimit] = useState(5);

  const emitMode = () => {
    socket.emit('hostTopTracks', { range, limit, id });
    setMode('toptracks');
    setOpened(false);
  };
  if (!id || !socket) return;
  return (
    <>
      <Modal
        centered
        closeOnClickOutside={false}
        size="sm"
        opened={opened}
        onClose={() => setOpened(false)}
        title={<Title order={2}>Top Track Settings</Title>}
        padding="xl"
      >
        <Stack align="center">
          <NumberInput
            style={{ width: '100%' }}
            label="Number of tracks per user"
            stepHoldDelay={500}
            stepHoldInterval={100}
            max={30}
            defaultValue={5}
            value={limit}
            onChange={setLimit}
          />
          <Select
            label="Time range"
            style={{ width: '100%' }}
            value={range}
            onChange={setRange}
            data={[
              { value: 'long_term', label: 'Long Term' },
              { value: 'medium_term', label: 'Medium Term' },
              { value: 'short_term', label: 'Short Term' },
            ]}
          />
          <Button style={{ width: '100%' }} onClick={emitMode}>
            Set
          </Button>
        </Stack>
      </Modal>
    </>
  );
};

const PlaylistModal = ({ opened, setOpened, setMode, id, socket }) => {
  const [url, setUrl] = useState('');
  const [valid, setValid] = useState(true);

  const emitMode = async () => {
    try {
      const urlObj = new URL(url);
      const playlist = urlObj.pathname.split('/');
      if (urlObj.hostname === 'open.spotify.com' && playlist[2] !== undefined) {
        socket.emit('hostPlaylist', {
          id,
          playlistId: playlist[2],
        });
        setValid(true);
        setMode('playlist');
        setOpened(false);
      } else {
        setValid(false);
      }
    } catch {
      setValid(false);
    }
  };

  if (!id || !socket) return;
  return (
    <>
      <Modal
        centered
        closeOnClickOutside={false}
        size="sm"
        opened={opened}
        onClose={() => setOpened(false)}
        title={<Title order={2}>Playlist Settings</Title>}
        padding="xl"
      >
        <Stack align="center">
          <InputWrapper
            label="Enter a playlist url"
            required
            error={
              !valid == true &&
              "Must enter Spotify playlist url ('open.spotify.com')"
            }
            style={{ width: '100%' }}
          >
            <Input
              icon={<BsGlobe />}
              placeholder="Playlist url..."
              onChange={(event) => setUrl(event.target.value)}
              invalid={!valid}
              style={{ width: '100%' }}
            />
          </InputWrapper>
          <Button style={{ width: '100%' }} onClick={emitMode}>
            Set
          </Button>
        </Stack>
      </Modal>
    </>
  );
};

export default Create;
