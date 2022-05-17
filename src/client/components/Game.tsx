import { Badge, Box, Heading, Image } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import AudioPlayer, { RHAP_UI } from 'react-h5-audio-player';
import { Select } from 'chakra-react-select';
import 'react-h5-audio-player/lib/styles.css';

const Game = ({ currentSong, allTracks, socket, user, id }) => {
  const [trackFill, setTrackFill] = useState<any>();
  const [openMenu, setOpenMenu] = useState(false);
  const [gameTime, setGameTime] = useState(20);
  const [showTitle, setShowTitle] = useState(false);
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
      setIsAnswerCorrect((p) => false);
      setGameTime(20);
    });

    socket.on('roundStartTick', (s) => {
      setGameTime(s);
    });
    socket.on('showTitle', () => {
      setShowTitle(true);
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
                w={['300px', '640px']}
                objectFit="cover"
                src={currentSong.images[0].url}
                alt="Dan Abramov"
                mt="20px"
              />
            </>
          ) : (
            <Image
              boxSize="300px"
              borderTopRadius="10px"
              w={['300px', '640px']}
              objectFit="cover"
              src="https://images.pexels.com/photos/3391925/pexels-photo-3391925.jpeg?cs=srgb&dl=pexels-miguel-%C3%A1-padri%C3%B1%C3%A1n-3391925.jpg&fm=jpg&w=640&h=426"
              alt="Blank album cover"
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
          </Box>
        </Box>
      )}
    </>
  );
};

export default Game;
