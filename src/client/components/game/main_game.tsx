import {
  Autocomplete,
  BackgroundImage,
  Button,
  Card,
  Grid,
  Progress,
  Stack,
  Title,
} from '@mantine/core';
import { useEffect, useRef, useState } from 'react';
import { Track } from '~client/globals/types';

const MainGame = ({ socket, user, roomId, roomData }) => {
  const [currentTrack, setCurrentTrack] = useState<Track>();
  const [answer, setAnswer] = useState('');
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [timer, setTimer] = useState(20);
  const [showSkip, setShowSkip] = useState(true);
  const audioRef = useRef<HTMLAudioElement>();

  useEffect(() => {
    if (!socket || !roomId) return;
    socket.on('changeSong', (s) => {
      setShowTitle(false);
      setCurrentTrack(s);
    });

    socket.on('newRound', () => {
      setShowTitle(false);
      setAnswer('');
      setShowSkip(true);
      setIsAnswerCorrect(() => false);
      setTimer(20);
    });

    socket.on('showTitle', () => {
      setShowTitle(true);
      setShowSkip(false);
      socket.emit('roundAnswer', {
        user,
        isAnswerCorrect,
        answer,
        id: roomId,
      });
    });

    socket.on('roundStartTick', (s) => {
      setTimer(s);
    });

    return () => {
      socket.off('changeSong');
      socket.off('newRound');
      socket.off('showTitle');
      socket.off('roundStartTick');
    };
  }, [socket, roomId, answer, isAnswerCorrect]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.1;
    }
  }, [currentTrack]);

  const skipSong = () => {
    socket.emit('skipSong', { id: roomId });
    setShowSkip(false);
  };

  if (!roomData) return;
  return (
    <>
      <Grid.Col xs={7}>
        <Stack justify="flex-start" align="center">
          <Progress
            value={(timer / 20) * 100}
            label={timer.toString()}
            style={{ width: '100%' }}
            size={25}
            radius="xl"
          />
          <Card style={{ width: '100%', height: '450px' }}>
            <BackgroundImage
              radius="md"
              src={
                showTitle
                  ? currentTrack.images[0].url
                  : '/images/blank_track.jpg'
              }
              style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {showTitle && (
                <Card>
                  <Title color="white">{currentTrack.name}</Title>
                </Card>
              )}
            </BackgroundImage>
          </Card>
          <Autocomplete
            value={answer}
            onChange={(v) => {
              setAnswer(v);
              setIsAnswerCorrect(
                () => v.toLowerCase() === currentTrack.name.toLowerCase(),
              );
            }}
            filter={(value, item) => {
              return (
                value.length >= 2 &&
                item.value.toLowerCase().includes(value.toLowerCase())
              );
            }}
            disabled={showTitle}
            data={roomData.allTrackTitles}
            style={{ width: '100%' }}
            limit={3}
            size="lg"
            dropdownPosition="bottom"
          />
          <Button
            size="md"
            style={{ width: '100%' }}
            color="red"
            onClick={skipSong}
            disabled={!showSkip}
          >
            SKIP
          </Button>
        </Stack>
      </Grid.Col>
      {currentTrack && (
        <audio src={currentTrack.preview_url} autoPlay ref={audioRef}></audio>
      )}
    </>
  );
};

export default MainGame;
