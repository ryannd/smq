import { Box, Button, Heading, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import fetcher from '../../utils/fetcher';
import Game from '~client/components/Game';

const strings = {
  topTracks: 'Top Tracks',
};

const SocketIo: any = ({ user }) => {
  const [socket, setSocket] = useState(null);
  const [gameType, setGameType] = useState('topTracks');
  const [tracks, setTracks] = useState({});
  const [allTracks, setAllTracks] = useState({});
  const [startTime, setStartTime] = useState(5);
  const [gameState, setGameState] = useState('select');
  const [currentSong, setCurrentSong] = useState<any>();
  const [randomRoom, setRandomRoom] = useState(
    (Math.random() + 1).toString(36).substring(7),
  );
  useEffect(() => {
    if (!randomRoom) return;
    if (!user) return;
    const socketIo = io();
    setSocket(socketIo);
    socketIo.emit('joinRoom', {
      id: randomRoom,
      user: {
        name: user.body.display_name,
        pic: user.body.images[0] || null,
        url: user.body.external_urls.spotify,
      },
    });

    socketIo.on('tracks', async (s) => {
      console.log('Recieved tracks.');
      if (s.length > 0) {
        s.forEach((track) => {
          addItem(track);
        });
      }
    });

    socketIo.on('timerStartTick', (s) => {
      setStartTime(s);
    });

    socketIo.on('playerJoined', (s) => {
      console.log(s);
    });
  }, [randomRoom, user]);

  useEffect(() => {
    if (!socket) return;
    socket.off('roundDone');
    socket.off('startAll');
    socket.off('changeSong');

    socket.on('startAll', (s) => {
      setGameState('game');
      getRandomSong();
    });

    socket.on('roundDone', () => {
      setTimeout(() => {
        console.log('TIMEOUT');
        getRandomSong();
      }, 5000);
    });

    socket.on('changeSong', (s) => {
      setCurrentSong(s);
    });
  }, [tracks, socket]);

  const addItem = (item) => {
    if (tracks[item.name] !== undefined) return;
    setTracks((prev) => {
      const newTracks = Object.assign({}, prev);
      newTracks[item.name] = item;
      return newTracks;
    });
    setAllTracks((prev) => {
      const newTracks = Object.assign({}, prev);
      newTracks[item.name] = item;
      return newTracks;
    });
  };

  const selectTopTracks = async () => {
    console.log('Top tracks');
    socket.emit('hostTopTracks', { id: randomRoom });
    setTracks({});
    const data = await fetcher('/api/tracks/top');
    socket.emit('tracks', { id: randomRoom, data });
    setGameType('topTracks');
  };

  const getRandomSong = () => {
    const keys = Object.keys(tracks);
    const index = Math.floor(Math.random() * keys.length);
    const randomKey = keys[index];

    socket.emit('newSong', { song: tracks[randomKey], id: randomRoom });
    setTracks((prev) => {
      const newTracks = Object.assign({}, prev);
      delete newTracks[randomKey];
      return newTracks;
    });
  };

  const startGame = async () => {
    setGameState('prep');
    switch (gameType) {
      case 'topTracks':
        await selectTopTracks();
    }
    socket.emit('startGame', { id: randomRoom });
  };

  const content = () => {
    switch (gameState) {
      case 'select':
        return (
          <Box textAlign="center">
            <Box pb="50px">
              <Heading pb="10px">Host Settings</Heading>
              <Text fontSize="2xl">Current mode: {strings[gameType]}</Text>
            </Box>
            <Box pb="50px">
              <Box pb="10px">
                <Button onClick={() => selectTopTracks()} mr="10px">
                  Top Tracks
                </Button>
                <Button>Select a playlist</Button>
              </Box>
              <Button colorScheme="green" onClick={() => startGame()}>
                Start Game
              </Button>
            </Box>
            <Box>
              <Heading pt="10px">Room Code: {randomRoom}</Heading>
            </Box>
          </Box>
        );
      case 'prep':
        return <Heading>{startTime}</Heading>;
      case 'game':
        return (
          <Game
            currentSong={currentSong}
            allTracks={allTracks}
            socket={socket}
          />
        );
    }
  };

  return <>{content()}</>;
};

export default SocketIo;
