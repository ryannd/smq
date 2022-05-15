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
import fetcher from '../../utils/fetcher';
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
  const [tracks, setTracks] = useState({});
  const [allTracks, setAllTracks] = useState({});
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
    socketIo.on('updateScore', (s) => {
      setUsers((prev) => {
        return [...s];
      });
    });

    socketIo.on('userDisconnect', (s) => {
      setUsers((prev) => {
        return [...s];
      });
    });

    socketIo.on('playlist', (s) => {
      setGameType('playlist');
      setPlaylistTitle(s);
      console.log(s);
    });

    socketIo.on('endGame', (s) => {
      setGameState('end');
    });

    socketIo.on('newGame', (s) => {
      setStartTime(5);
      setHideSkip(false);
      setRounds(0);
      setGameState('select');
      setUsers((prev) => {
        return [...s];
      });
    });
  }, []);

  useEffect(() => {
    if (!randomRoom) return;
    if (!user) return;
    if (!socket) return;
    socket.off('playerJoined');
    socket.off('tracks');
    socket.emit('hostJoinRoom', {
      id: randomRoom,
      user: {
        name: user.body.display_name,
        pic: user.body.images[0] || undefined,
        url: user.body.external_urls.spotify,
        id: user.body.id,
      },
    });

    socket.on('tracks', async (s) => {
      if (s !== null) {
        console.log('Recieved tracks.');
        if (s.length > 0) {
          s.forEach((track) => {
            addItem(track);
          });
        }
      }
    });

    socket.on('timerStartTick', (s) => {
      setStartTime(s);
    });

    socket.on('playerJoined', (s) => {
      setUsers((prev) => {
        return [...s];
      });
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
      setHideSkip(true);
      setTimeout(() => {
        console.log(rounds);
        if (rounds - 1 > 0) {
          const next = getRandomSong();
          socket.emit('newSong', { song: next, id: randomRoom });
          setHideSkip(false);
        } else {
          socket.emit('endGame', { id: randomRoom });
        }
      }, 5000);
      setRounds((prev) => prev - 1);
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
    console.log(data);
    socket.emit('tracks', { id: randomRoom, tracks: data });
    setGameType('topTracks');
  };

  const getRandomSong = () => {
    const keys = Object.keys(tracks);
    console.log(tracks);
    if (keys.length === 0) {
      return false;
    } else {
      const index = Math.floor(Math.random() * keys.length);
      const randomKey = keys[index];
      const nextSong = tracks[randomKey];
      setTracks((prev) => {
        const newTracks = Object.assign({}, prev);
        delete newTracks[randomKey];
        return newTracks;
      });
      return nextSong;
    }
  };

  const startGame = async () => {
    setGameState('prep');
    console.log(gameType);
    switch (gameType) {
      case 'topTracks':
        await selectTopTracks();
        break;
      case 'playlist':
        break;
    }
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
                  max={Object.keys(tracks).length + 1}
                >
                  <NumberInputField />
                </NumberInput>
                <Slider
                  flex="1"
                  focusThumbOnChange={false}
                  value={rounds}
                  onChange={(value) => setRounds(value)}
                  max={Object.keys(tracks).length + 1}
                >
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb fontSize="sm" boxSize="32px" children={rounds} />
                </Slider>
              </Flex>
              <Button colorScheme="green" onClick={() => startGame()}>
                Start Game
              </Button>
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
