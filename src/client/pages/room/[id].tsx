import { Stack } from '@chakra-ui/react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import fetcher from '../../utils/fetcher';

const trackObj = {};

const SocketIo: NextPage = () => {
  const router = useRouter();
  const [socket, setSocket] = useState(null);
  const [gameType, setGameType] = useState('topTracks');
  const [tracks, setTracks] = useState(() => new Set());
  const { id } = router.query;

  useEffect(() => {
    if (!id) return;
    const socketIo = io();
    setSocket(socketIo);
    socketIo.emit('joinRoom', { id });

    socketIo.on('topTracks', async (s) => {
      console.log('Recieved top tracks message.');
      setGameType('topTracks');
      const data = await fetcher('/api/tracks/top');
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
  }, [id]);

  const addItem = (item) => {
    if (trackObj[item.name] !== undefined) return;
    trackObj[item.name] = 1;
    setTracks((prev) => new Set(prev).add(item));
  };

  return (
    <>
      <Stack>
        {Array.from(tracks).map((track, i) => {
          return <p key={i}>{track.name}</p>;
        })}
      </Stack>
    </>
  );
};

export default SocketIo;
