import { Button, Heading, Stack } from '@chakra-ui/react';
import { NextPage } from 'next';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import fetcher from '../../utils/fetcher';

const trackObj = {};

const SocketIo: NextPage = () => {
  const [socket, setSocket] = useState(null);
  const [gameType, setGameType] = useState('topTracks');
  const [tracks, setTracks] = useState(() => new Set());
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
  }, [randomRoom]);

  const addItem = (item) => {
    if (trackObj[item.name] !== undefined) return;
    trackObj[item.name] = 1;
    setTracks((prev) => new Set(prev).add(item));
  };

  const selectTopTracks = async () => {
    socket.emit('hostTopTracks', { id: randomRoom });
    const data = await fetcher('/api/tracks/top');
    socket.emit('tracks', { id: randomRoom, data });
    setGameType('topTracks');
  };

  const startGame = async () => {
    socket.emit('startGame', { id: randomRoom });
  };

  return (
    <>
      <Heading>Room Code: {randomRoom}</Heading>
      <Button onClick={() => selectTopTracks()}>Top Tracks</Button>
      <Button onClick={() => startGame()}>Start Game</Button>
      <Stack>
        {Array.from(tracks).map((track, i) => {
          return <p key={i}>{track.name}</p>;
        })}
      </Stack>
    </>
  );
};

export default SocketIo;
