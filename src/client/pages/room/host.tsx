import { Box, Button, Flex, Heading, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import fetcher from '../../utils/fetcher';
import Game from '../../components/Game';
import SocialProfileWithImage from '~client/components/UserCard';

const strings = {
  topTracks: 'Top Tracks',
};

const Host: any = ({ user }) => {
  const [socket, setSocket] = useState(null);
  const [gameType, setGameType] = useState('topTracks');
  const [tracks, setTracks] = useState({});
  const [allTracks, setAllTracks] = useState({});
  const [startTime, setStartTime] = useState(5);
  const [gameState, setGameState] = useState('select');
  const [currentSong, setCurrentSong] = useState<any>();
  const [users, setUsers] = useState([]);
  const [randomRoom, setRandomRoom] = useState(
    (Math.random() + 1).toString(36).substring(7),
  );

  useEffect(() => {
    const socketIo = io();
    setSocket(socketIo);
    socketIo.on('updateScore', (s) => {
      setUsers((prev) => {
        return [...s];
      });
    });
  }, []);

  useEffect(() => {
    if (!randomRoom) return;
    if (!user) return;
    if (!socket) return;
    socket.emit('hostJoinRoom', {
      id: randomRoom,
      user: {
        name: user.body.display_name,
        pic: user.body.images[0] || undefined,
        url: user.body.external_urls.spotify,
        id: user.body.id,
      },
    });

    socket.emit('updateScore', (s) => {
      setUsers((prev) => {
        return [...s];
      });
    });

    socket.on('tracks', async (s) => {
      console.log('Recieved tracks.');
      if (s.length > 0) {
        s.forEach((track) => {
          addItem(track);
        });
      }
    });

    socket.on('timerStartTick', (s) => {
      setStartTime(s);
    });

    socket.on('playerJoined', (s) => {
      console.log(s);
      if (s.length > users.length) {
        setUsers((prev) => {
          return [...s];
        });
      }
    });
  }, [randomRoom, user, socket]);

  useEffect(() => {
    if (!socket) return;
    socket.off('startAll');
    socket.off('changeSong');
    socket.off('roundDone');

    socket.on('startAll', (s) => {
      setGameState('game');
      const next = getRandomSong();
      socket.emit('newSong', { song: next, id: randomRoom });
    });

    socket.on('roundDone', () => {
      setTimeout(() => {
        const next = getRandomSong();
        socket.emit('newSong', { song: next, id: randomRoom });
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
    const nextSong = tracks[randomKey];
    setTracks((prev) => {
      const newTracks = Object.assign({}, prev);
      delete newTracks[randomKey];
      return newTracks;
    });
    return nextSong;
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
            user={user}
            id={randomRoom}
          />
        );
    }
  };

  return (
    <>
      <Flex
        textAlign="center"
        height="100%"
        flexDir="column"
        justifyContent="space-between"
      >
        {content()}
        <Box>
          <Flex justifyContent="center" alignItems="center" mt={10} gap={6}>
            {users !== undefined &&
              users.map((user) => {
                return <SocialProfileWithImage user={user} />;
              })}
          </Flex>
        </Box>
      </Flex>
    </>
  );
};

export default Host;
