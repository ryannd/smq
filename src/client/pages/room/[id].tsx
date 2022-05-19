import { Box, Flex, Heading, Text } from '@chakra-ui/react';
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
  const [gameType, setGameType] = useState('');
  const [socket, setSocket] = useState(null);
  const [allTracks, setAllTracks] = useState([]);
  const [startTime, setStartTime] = useState(3);
  const [currentSong, setCurrentSong] = useState<any>();
  const [users, setUsers] = useState([]);
  const [gameState, setGameState] = useState('wait');
  const [playlistTitle, setPlaylistTitle] = useState('');
  const [waitingRoom, setWaitingRoom] = useState([]);
  const { id } = router.query;

  useEffect(() => {
    const socketIo = io();
    setSocket(socketIo);

    socketIo.on('updateRoom', (s) => {
      setUsers((prev) => {
        return [...Object.values(s.users)];
      });
      setAllTracks((prev) => {
        return s.allTrackTitles;
      });
      setWaitingRoom((prev) => {
        return s.waitingRoom;
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
    socketIo.on('topTracks', (s) => {
      setGameType('topTracks');
    });

    socketIo.on('playlist', (s) => {
      setGameType('playlist');
      setPlaylistTitle(s);
    });

    socketIo.on('timerStartTick', (s) => {
      if (gameState !== 'waitround') {
        setGameState('prep');
        setStartTime(s);
      }
    });

    socketIo.on('changeSong', (s) => {
      setCurrentSong(s);
    });

    socketIo.on('startAll', (s) => {
      if (gameState !== 'waitround') {
        setGameState('game');
      }
    });

    socketIo.on('roomInGame', () => {
      setGameState('waitround');
    });
  }, []);

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

    return () => socket.off('joinRoom');
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
      case 'waitround':
        return (
          <Heading>Please wait, you will get in on the next round.</Heading>
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
        {gameState !== 'disconnect' && gameState !== 'notExist' && (
          <Box>
            <Flex
              justifyContent="center"
              alignItems="center"
              mt={5}
              gap={6}
              flexDir={['column', 'column', 'row']}
            >
              {users !== undefined &&
                users.map((user) => {
                  return <SocialProfileWithImage user={user} />;
                })}
            </Flex>
            <Text>
              Room: {randomRoom} | Waiting: {waitingRoom.length}
            </Text>
          </Box>
        )}
      </Flex>
    </>
  );
};

export default NonHost;
