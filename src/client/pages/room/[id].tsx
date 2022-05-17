import { Box, Flex, Heading } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import Game from '../../components/Game';
import SocialProfileWithImage from '~client/components/UserCard';

const strings = {
  topTracks: 'Top Tracks',
};

const NonHost: any = ({ user }) => {
  const router = useRouter();
  const [gameType, setGameType] = useState('topTracks');
  const [socket, setSocket] = useState(null);
  const [allTracks, setAllTracks] = useState([]);
  const [tracks, setTracks] = useState({});
  const [startTime, setStartTime] = useState(10);
  const [currentSong, setCurrentSong] = useState<any>();
  const [users, setUsers] = useState([]);
  const [gameState, setGameState] = useState('wait');
  const [playlistTitle, setPlaylistTitle] = useState('');
  const { id } = router.query;

  useEffect(() => {
    const socketIo = io();
    setSocket(socketIo);

    socketIo.on('updateRoom', (s) => {
      setUsers((prev) => {
        return [...Object.values(s.users)];
      });
      setTracks((prev) => {
        return [...s.tracks];
      });
      setAllTracks((prev) => {
        return s.allTrackTitles;
      });
    });

    socketIo.on('newGame', (s) => {
      setGameState('wait');
    });
    socketIo.on('hostDisconnect', () => {
      setGameState('disconnect');
    });
    socketIo.on('roomDoesNotExist', () => {
      setGameState('notExist');
    });
    socketIo.on('endGame', (s) => {
      setGameState('end');
    });
  }, []);

  useEffect(() => {
    if (!socket) return;
  }, [socket]);

  useEffect(() => {
    if (!id) return;
    if (!user) return;
    if (!socket) return;
    socket.off('playlist');
    socket.off('tracks');
    socket.off('roundDone');
    socket.off('startAll');

    socket.emit('joinRoom', {
      id,
      user: {
        name: user.body.display_name,
        pic: user.body.images[0] || undefined,
        url: user.body.external_urls.spotify,
        id: user.body.id,
      },
    });

    socket.on('topTracks', async (s) => {
      console.log('Recieved top tracks message.');
      setGameType('topTracks');
    });

    socket.on('playlist', (s) => {
      setGameType('playlist');
      setPlaylistTitle(s);
      console.log(s);
    });

    socket.on('timerStartTick', (s) => {
      setGameState('prep');
      setStartTime(s);
    });

    socket.on('changeSong', (s) => {
      setGameState('game');
      setCurrentSong(s);
    });

    socket.on('startAll', (s) => {
      setGameState('game');
    });

    socket.on('startAll', (s) => {
      setGameState('game');
    });

    socket.on('changeSong', (s) => {
      setCurrentSong(s);
    });
  }, [id, user]);

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
            {gameType === 'playlist' && <Heading>{playlistTitle}</Heading>}
            <Heading pt="10px">Room Code: {id}</Heading>
          </Box>
        );
      case 'end':
        return;
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
