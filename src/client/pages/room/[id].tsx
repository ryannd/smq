import { Box, Heading } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import fetcher from '../../utils/fetcher';
import Game from '~client/components/Game';

const strings = {
  topTracks: 'Top Tracks',
};

const SocketIo: any = ({ user }) => {
  const router = useRouter();
  const [gameType, setGameType] = useState('topTracks');
  const [socket, setSocket] = useState(null);
  const [allTracks, setAllTracks] = useState({});
  const [tracks, setTracks] = useState({});
  const [startTime, setStartTime] = useState(10);
  const [showGame, setShowGame] = useState(false);
  const [currentSong, setCurrentSong] = useState<any>();
  const [gameState, setGameState] = useState('wait');
  const { id } = router.query;

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
      console.log(s);
    });
  }, [socket]);

  useEffect(() => {
    if (!id) return;
    const socketIo = io();
    setSocket(socketIo);
    socketIo.emit('joinRoom', { id });

    socketIo.on('topTracks', async (s) => {
      console.log('Recieved top tracks message.');
      setGameType('topTracks');
      setTracks({});
      const data = await fetcher('/api/tracks/top');
      data.forEach((track) => {
        addItem(track);
      });
      socketIo.emit('tracks', { id, data });
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
      setGameState('prep');
      setStartTime(s);
    });

    socketIo.on('changeSong', (s) => {
      if (s !== null) {
        setGameState('game');
        console.log(s);
        setCurrentSong(s);
        setTracks((prev) => {
          const newTracks = Object.assign({}, prev);
          delete newTracks[s.name];
          return newTracks;
        });
      }
    });

    socketIo.on('startAll', (s) => {
      setGameState('game');
      setShowGame(true);
    });
  }, [id]);

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
          />
        );
      case 'wait':
        return (
          <Box textAlign="center">
            <Heading>Current mode: {strings[gameType]}</Heading>
            <Heading pt="10px">Room Code: {id}</Heading>
          </Box>
        );
    }
  };

  return <>{content()}</>;
};

export default SocketIo;
