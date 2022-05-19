import { Badge, Box, Button, Heading, Image } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import AudioPlayer, { RHAP_UI } from 'react-h5-audio-player';
import { Select } from 'chakra-react-select';
import TrackPlaceholderImg from '../public/images/blank_track.jpg';
import 'react-h5-audio-player/lib/styles.css';
import ChakraImageWrapper from './ChakraImageWrapper';

const Game = ({ currentSong, allTracks, socket, user, id }) => {
  const [trackFill, setTrackFill] = useState<any>();
  const [openMenu, setOpenMenu] = useState(false);
  const [gameTime, setGameTime] = useState(20);
  const [showTitle, setShowTitle] = useState(false);
  const [showSkip, setShowSkip] = useState(true);
  const [answer, setAnswer] = useState('');
  const [answerSave, setAnswerSave] = useState('');
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  useEffect(() => {
    setTrackFill(allTracks.map((t) => ({ value: t.toLowerCase(), label: t })));
  }, [allTracks]);

  useEffect(() => {
    if (!socket) return;

    socket.on('newRound', (s) => {
      setShowTitle(false);
      setAnswer('');
      setAnswerSave('');
      setShowSkip(true);
      setIsAnswerCorrect((p) => false);
      setGameTime(20);
    });

    socket.on('roundStartTick', (s) => {
      setGameTime(s);
    });
    socket.on('showTitle', () => {
      setShowTitle(true);
      setOpenMenu(false);
      socket.emit('roundAnswer', {
        user: {
          name: user.body.display_name,
          pic: user.body.images[0] || null,
          url: user.body.external_urls.spotify,
          id: user.body.id,
        },
        isAnswerCorrect,
        answer: answerSave,
        id,
      });
    });

    return () => {
      socket.off('newRound');
      socket.off('showTitle');
      socket.off('roundStartTick');
    };
  }, [socket, isAnswerCorrect, answerSave]);

  const skipSong = () => {
    socket.emit('skipSong', { id });
    setShowSkip(false);
  };

  const AnswerCheck = () => {
    return answerSave === currentSong.name ? (
      <Badge ml="1" fontSize="0.8em" colorScheme="green">
        CORRECT
      </Badge>
    ) : (
      <Badge ml="1" fontSize="0.8em" colorScheme="red">
        WRONG
      </Badge>
    );
  };
  return (
    <>
      {currentSong && (
        <Box
          w="100%"
          textAlign="center"
          justifyContent="center"
          alignItems="center"
          display="flex"
          flexDir="column"
        >
          <Heading position={['static']} fontSize="2xl" mb={['30px']}>
            Remaining time: {gameTime}
          </Heading>
          {showTitle ? (
            <>
              <Heading
                justifyContent="center"
                alignItems="center"
                fontSize={['md', 'xl', '4xl']}
              >
                {currentSong.name} <AnswerCheck />
              </Heading>

              <Image
                boxSize="300px"
                borderTopRadius="10px"
                w="640px"
                objectFit="cover"
                src={currentSong.images[0].url}
                mt="20px"
                fallbackSrc="/images/blank_track.jpg"
              />
            </>
          ) : (
            <ChakraImageWrapper
              borderTopRadius="10px"
              width="640px"
              height="300px"
              objectFit="cover"
              src={TrackPlaceholderImg}
            />
          )}
          <Box w={['100%', '640px']}>
            <AudioPlayer
              src={currentSong.preview_url}
              volume={0.1}
              autoPlay
              customVolumeControls={[]}
              customAdditionalControls={[]}
              showDownloadProgress={false}
              showJumpControls={false}
              customControlsSection={[]}
              customProgressBarSection={[RHAP_UI.PROGRESS_BAR]}
            />
          </Box>
          <Box mt="20px" w={['100%', '640px']}>
            <Select
              options={trackFill}
              isSearchable
              value={answer}
              inputValue={answer}
              placeholder={answerSave}
              onInputChange={(input) => {
                setAnswer(input);
                if (input && input.length > 2) {
                  setOpenMenu(true);
                } else {
                  setOpenMenu(false);
                }
              }}
              onChange={({ value, label }: any) => {
                if (!showTitle) {
                  setAnswer(value);
                  setAnswerSave(label);
                  setIsAnswerCorrect((p) => label === currentSong.name);
                } else {
                  setAnswer('');
                  setAnswerSave('');
                }
              }}
              components={{
                DropdownIndicator: () => null,
                IndicatorSeparator: () => null,
              }}
              blurInputOnSelect
              menuIsOpen={openMenu}
            />
            {showSkip && (
              <Button
                w={['100%', '640px']}
                onClick={() => skipSong()}
                mt="10px"
                colorScheme="red"
              >
                Vote Skip
              </Button>
            )}
          </Box>
        </Box>
      )}
    </>
  );
};

export default Game;
