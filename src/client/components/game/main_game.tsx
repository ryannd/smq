import { Grid, Stack } from '@mantine/core';
import { useEffect, useRef, useState } from 'react';
import { Track } from '~client/globals/types';

const MainGame = ({ socket, user, roomId, roomData }) => {
  const [currentTrack, setCurrentTrack] = useState<Track>();
  const audioRef = useRef<HTMLAudioElement>();

  useEffect(() => {
    if (!socket || !roomId) return;
    socket.on('changeSong', (s) => {
      console.log(s);
      setCurrentTrack(s);
    });

    return () => {
      socket.off('changeSong');
    };
  }, [socket, roomId]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.1;
    }
  }, [currentTrack]);
  return (
    <Grid.Col xs={12}>
      <Stack justify="flex-start" align="center">
        {currentTrack && (
          <audio src={currentTrack.preview_url} autoPlay ref={audioRef}></audio>
        )}
      </Stack>
    </Grid.Col>
  );
};

export default MainGame;
