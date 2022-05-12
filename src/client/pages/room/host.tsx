import { Button, Heading, Stack } from '@chakra-ui/react';
import { NextPage } from 'next';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import fetcher from '../../utils/fetcher';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';

const SocketIo: NextPage = () => {
  const [socket, setSocket] = useState(null);
  const [gameType, setGameType] = useState('topTracks');
  const [tracks, setTracks] = useState({});
  const [startTime, setStartTime] = useState(10);
  const [randomRoom, setRandomRoom] = useState(
    (Math.random() + 1).toString(36).substring(7),
  );
  const [showGame, setShowGame] = useState(false);
  const [currentSong, setCurrentSong] = useState<any>();

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
      if (s === 0) {
        setShowGame(true);
      }
    });

    socketIo.on('changeSong', (s) => {
      console.log(s);
      setCurrentSong(s);
    });
  }, [randomRoom]);

  const addItem = (item) => {
    if (tracks[item.name] !== undefined) return;
    console.log(tracks);
    setTracks((prev) => {
      const newTracks = Object.assign({}, prev);
      newTracks[item.name] = item;
      return newTracks;
    });
  };

  const selectTopTracks = async () => {
    socket.emit('hostTopTracks', { id: randomRoom });
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
  };

  const startGame = async () => {
    socket.emit('startGame', { id: randomRoom });
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
          <Button onClick={() => getRandomSong()}>Get randomsong</Button>
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
