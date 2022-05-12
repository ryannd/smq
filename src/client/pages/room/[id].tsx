import { Heading, Stack } from '@chakra-ui/react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import fetcher from '../../utils/fetcher';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';

const SocketIo: NextPage = () => {
  const router = useRouter();
  const [gameType, setGameType] = useState('topTracks');
  const [tracks, setTracks] = useState({});
  const [startTime, setStartTime] = useState(10);
  const [showGame, setShowGame] = useState(false);
  const [currentSong, setCurrentSong] = useState<any>();
  const { id } = router.query;

  useEffect(() => {
    if (!id) return;
    const socketIo = io();
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
      setStartTime(s);
    });

    socketIo.on('changeSong', (s) => {
      setCurrentSong(s);
      setTracks((prev) => {
        const newTracks = Object.assign({}, prev);
        delete newTracks[s.name];
        return newTracks;
      });
    });

    socketIo.on('startAll', (s) => {
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
  };

  return (
    <>
      {showGame ? (
        <>
          <Heading>{currentSong !== undefined ? currentSong.name : ''}</Heading>
          <AudioPlayer
            src={currentSong !== undefined ? currentSong.preview_url : ''}
            volume={0.1}
            autoPlay
            customVolumeControls={[]}
            customAdditionalControls={[]}
            showDownloadProgress={false}
            showJumpControls={false}
            customControlsSection={[]}
          />
          <Stack>
            {Object.keys(tracks).map((track, i) => {
              const currTrack = tracks[track];
              return <p key={i}>{currTrack.name}</p>;
            })}
          </Stack>
        </>
      ) : (
        <>
          <Heading>{startTime}</Heading>
          <Heading>{gameType}</Heading>
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
