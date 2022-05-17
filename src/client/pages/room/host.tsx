import {
  Box,
  Button,
  Flex,
  Heading,
  NumberInput,
  NumberInputField,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import Game from '../../components/Game';
import SocialProfileWithImage from '~client/components/UserCard';
import PlaylistModal from '~client/components/PlaylistModal';

const strings = {
  topTracks: 'Top Tracks',
  playlist: 'Playlist',
};

const Host: any = ({ user }) => {
  const [socket, setSocket] = useState(null);
  const [gameType, setGameType] = useState('topTracks');
  const [tracks, setTracks] = useState([]);
  const [allTracks, setAllTracks] = useState([]);
  const [startTime, setStartTime] = useState(5);
  const [gameState, setGameState] = useState('select');
  const [currentSong, setCurrentSong] = useState<any>();
  const [users, setUsers] = useState([]);
  const [randomRoom, setRandomRoom] = useState(
    (Math.random() + 1).toString(36).substring(7),
  );
  const [hideSkip, setHideSkip] = useState(false);
  const [playlistTitle, setPlaylistTitle] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [rounds, setRounds] = useState(0);

  useEffect(() => {
    const socketIo = io();

    setSocket(socketIo);
    socketIo.on('updateRoom', (s) => {
      console.log(s);
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

    socketIo.on('playlist', (s) => {
      setGameType('playlist');
      setPlaylistTitle(s);
    });

    socketIo.on('endGame', (s) => {
      setGameState('end');
    });

    socketIo.on('newGame', (s) => {
      setStartTime(5);
      setHideSkip(false);
      setRounds(0);
      setGameState('select');
    });

    socketIo.on('timerStartTick', (s) => {
      setStartTime(s);
    });
  }, []);

  useEffect(() => {
    if (!randomRoom) return;
    if (!user) return;
    if (!socket) return;
    socket.off('playerJoined');
    socket.off('tracks');
    socket.off('hostJoinRoom');

    socket.emit('hostJoinRoom', {
      id: randomRoom,
      user: {
        name: user.body.display_name,
        pic: user.body.images[0] || undefined,
        url: user.body.external_urls.spotify,
        id: user.body.id,
      },
    });
  }, [randomRoom, user, socket]);

  useEffect(() => {
    if (!socket) return;
    socket.off('startAll');
    socket.off('changeSong');

    socket.on('startAll', (s) => {
      setGameState('game');
      socket.emit('newSong', { id: randomRoom });
    });

    socket.on('changeSong', (s) => {
      setCurrentSong(s);
    });
  }, [randomRoom, socket]);

  useEffect(() => {
    if (!randomRoom) return;
    if (!socket) return;
    socket.on('roundDone', () => {
      setHideSkip(true);
      setTimeout(() => {
        if (rounds - 1 > 0) {
          socket.emit('newSong', { id: randomRoom });
          setHideSkip(false);
        } else {
          socket.emit('endGame', { id: randomRoom });
        }
      }, 5000);
      console.log(rounds);
      setRounds((prev) => prev - 1);
    });
    return () => socket.off('roundDone');
  }, [randomRoom, socket, rounds]);

  const selectTopTracks = () => {
    socket.emit('hostTopTracks', { id: randomRoom });
    setGameType('topTracks');
  };

  const startGame = async () => {
    setGameState('prep');
    socket.emit('startGame', { id: randomRoom });
  };

  const skipSong = () => {
    socket.emit('hostSkip', { id: randomRoom });
  };

  const startNewGame = () => {
    socket.emit('newGame', { id: randomRoom });
  };

  const content = () => {
    switch (gameState) {
      case 'select':
        return (
          <Box textAlign="center">
            <Box pb="50px">
              <Heading pb="10px">Host Settings</Heading>
              <Text fontSize="2xl">Current mode: {strings[gameType]}</Text>
              {gameType === 'playlist' && <Text>{playlistTitle}</Text>}
            </Box>
            <Box pb="50px">
              <Box pb="10px">
                <Button onClick={() => selectTopTracks()} mr="10px">
                  Top Tracks
                </Button>
                <Button onClick={onOpen}>Select a playlist</Button>
              </Box>
              <Flex>
                <NumberInput
                  maxW="100px"
                  mr="2rem"
                  value={rounds}
                  onChange={(value) => setRounds(parseInt(value))}
                  max={tracks.length + 1}
                >
                  <NumberInputField />
                </NumberInput>
                <Slider
                  flex="1"
                  focusThumbOnChange={false}
                  value={rounds}
                  onChange={(value) => setRounds(value)}
                  max={tracks.length + 1}
                >
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb fontSize="sm" boxSize="32px" children={rounds} />
                </Slider>
              </Flex>
              {tracks.length > 0 && (
                <Button colorScheme="green" onClick={() => startGame()}>
                  Start Game
                </Button>
              )}
            </Box>
            <Box>
              <Heading suppressHydrationWarning pt="10px">
                Room Code: {randomRoom}
              </Heading>
            </Box>
          </Box>
        );
      case 'prep':
        return <Heading>{startTime}</Heading>;
      case 'game':
        return (
          <>
            {!hideSkip && (
              <Button onClick={() => skipSong()} mb="10px" colorScheme="red">
                Skip
              </Button>
            )}
            <Game
              currentSong={currentSong}
              allTracks={allTracks}
              socket={socket}
              user={user}
              id={randomRoom}
            />
          </>
        );
      case 'end':
        return <Button onClick={() => startNewGame()}>Start new game.</Button>;
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
      </Flex>
      <PlaylistModal
        isOpen={isOpen}
        onClose={onClose}
        socket={socket}
        room={randomRoom}
      />
    </>
  );
};

export default Host;
