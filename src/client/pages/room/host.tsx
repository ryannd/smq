import { Button, Heading, Stack } from '@chakra-ui/react';
import { NextPage } from 'next';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import fetcher from '../../utils/fetcher';
import Game from '~client/components/Game';

const SocketIo: NextPage = () => {
  const [socket, setSocket] = useState(null);
  const [gameType, setGameType] = useState('topTracks');
  const [tracks, setTracks] = useState({});
  const [allTracks, setAllTracks] = useState({});
  const [startTime, setStartTime] = useState(10);
  const [showGame, setShowGame] = useState(false);
  const [currentSong, setCurrentSong] = useState<any>();
  const [randomRoom, setRandomRoom] = useState(
    (Math.random() + 1).toString(36).substring(7),
  );

  useEffect(() => {
    if (!randomRoom) return;
    const socketIo = io();
    setSocket(socketIo);
    socketIo.emit('joinRoom', { id: randomRoom });

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
  }, [randomRoom]);

  useEffect(() => {
    if (!socket) return;
    socket.off('roundDone');
    socket.off('startAll');

    socket.on('startAll', (s) => {
      setShowGame(true);
      getRandomSong();
    });

    socket.on('roundDone', () => {
      setTimeout(() => {
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
    return;
  };

  const startGame = async () => {
    socket.emit('startGame', { id: randomRoom });
  };

  return (
    <>
      {showGame ? (
        <>
          <Game
            currentSong={currentSong}
            allTracks={allTracks}
            socket={socket}
          />
        </>
      ) : (
        <>
          <Heading>{startTime}</Heading>
          <Heading>{gameType}</Heading>
          <Heading>Room Code: {randomRoom}</Heading>
          <Button onClick={() => selectTopTracks()}>Top Tracks</Button>
          <Button onClick={() => startGame()}>Start Game</Button>
          <Stack>
            {Object.keys(tracks).map((track, i) => {
              const currTrack = tracks[track];
              return <p key={i}>{currTrack.name}</p>;
            })}
          </Stack>
        </>
      )}
    </>
  );
};

export default SocketIo;
