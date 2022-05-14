import { Box, Flex, Heading } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import fetcher from '../../utils/fetcher';
import Game from '../../components/Game';
import SocialProfileWithImage from '~client/components/UserCard';

const strings = {
  topTracks: 'Top Tracks',
};

const NonHost: any = ({ user }) => {
  const router = useRouter();
  const [gameType, setGameType] = useState('topTracks');
  const [socket, setSocket] = useState(null);
  const [allTracks, setAllTracks] = useState({});
  const [tracks, setTracks] = useState({});
  const [startTime, setStartTime] = useState(10);
  const [currentSong, setCurrentSong] = useState<any>();
  const [users, setUsers] = useState([]);
  const [gameState, setGameState] = useState('wait');
  const { id } = router.query;

  useEffect(() => {
    const socketIo = io();
    setSocket(socketIo);
    socketIo.on('updateScore', (s) => {
      setUsers((prev) => {
        return [...s];
      });
    });
    socketIo.on('hostDisconnect', () => {
      setGameState('disconnect');
    });
    socketIo.on('userDisconnect', (s) => {
      setUsers((prev) => {
        return [...s];
      });
    });
    socketIo.on('roomDoesNotExist', () => {
      setGameState('notExist');
    });
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.off('roundDone');
    socket.off('startAll');

    socket.on('startAll', (s) => {
      setGameState('game');
    });

    socket.on('changeSong', (s) => {
      setCurrentSong(s);
    });

    socket.on('playerJoined', (s) => {
      setUsers((prev) => {
        return [...s];
      });
    });
  }, [socket]);

  useEffect(() => {
    if (!id) return;
    if (!user) return;
    if (!socket) return;
    socket.emit('joinRoom', {
      id,
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
    socket.on('topTracks', async (s) => {
      console.log('Recieved top tracks message.');
      setGameType('topTracks');
      setTracks({});
      const data = await fetcher('/api/tracks/top');
      data.forEach((track) => {
        addItem(track);
      });
      socket.emit('tracks', { id, data });
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
      setGameState('prep');
      setStartTime(s);
    });

    socket.on('changeSong', (s) => {
      if (s !== null) {
        setGameState('game');

        setCurrentSong(s);
        setTracks((prev) => {
          const newTracks = Object.assign({}, prev);
          delete newTracks[s.name];
          return newTracks;
        });
      }
    });

    socket.on('startAll', (s) => {
      setGameState('game');
    });
  }, [id, user]);

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

  const content = () => {
    switch (gameState) {
      case 'prep':
        return <Heading>{startTime}</Heading>;
      case 'game':
        return (
          <Game
            currentSong={currentSong}
            allTracks={allTracks}
            socket={socket}
            user={user}
            id={id}
          />
        );
      case 'wait':
        return (
          <Box textAlign="center">
            <Heading>Current mode: {strings[gameType]}</Heading>
            <Heading pt="10px">Room Code: {id}</Heading>
          </Box>
        );
      case 'disconnect':
        return <Heading>Host disconnected...</Heading>;
      case 'notExist':
        return <Heading>Room does not exist</Heading>;
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
        {gameState !== 'disconnect' && gameState !== 'notExist' && (
          <Box>
            <Flex
              justifyContent="center"
              alignItems="center"
              mt={10}
              gap={6}
              flexDir={['column', 'column', 'row']}
            >
              {users !== undefined &&
                users.map((user) => {
                  return <SocialProfileWithImage user={user} />;
                })}
            </Flex>
          </Box>
        )}
      </Flex>
    </>
  );
};

export default NonHost;
