import { Box, Heading } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import AudioPlayer from 'react-h5-audio-player';
import { Select } from 'chakra-react-select';
import 'react-h5-audio-player/lib/styles.css';

const Game = ({ currentSong, allTracks, socket }) => {
  const [trackFill, setTrackFill] = useState<any>();
  const [openMenu, setOpenMenu] = useState(false);
  const [gameTime, setGameTime] = useState(30);
  const [showTitle, setShowTitle] = useState(true);
  const [answer, setAnswer] = useState('');
  const [answerSave, setAnswerSave] = useState('');
  useEffect(() => {
    setTrackFill(
      Object.keys(allTracks).map((t) => ({ value: t.toLowerCase(), label: t })),
    );
  }, [allTracks]);

  useEffect(() => {
    if (!socket) return;
    socket.on('roundStartTick', (s) => {
      setGameTime(s);
    });
    socket.on('showTitle', () => {
      setShowTitle(true);
    });

    socket.on('changeSong', (s) => {
      setShowTitle(false);
      setAnswer('');
      setAnswerSave('');
      setGameTime(30);
    });
  }, [socket]);
  const AnswerCheck = () => {
    console.log(answerSave);
    console.log(currentSong.name);
    return answerSave === currentSong.name ? (
      <Heading>CORRECT!</Heading>
    ) : (
      <Heading>WRONG!</Heading>
    );
  };
  return (
    <>
      {currentSong && (
        <Box w="75%">
          {showTitle && (
            <>
              <Heading>{currentSong.name}</Heading>
              <AnswerCheck />
            </>
          )}
          <Heading>{gameTime}</Heading>
          <AudioPlayer
            src={currentSong.preview_url}
            volume={0.1}
            autoPlay
            customVolumeControls={[]}
            customAdditionalControls={[]}
            showDownloadProgress={false}
            showJumpControls={false}
            customControlsSection={[]}
          />
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
            onChange={({ value, label }) => {
              setAnswer(value);
              setAnswerSave(label);
            }}
            components={{
              DropdownIndicator: () => null,
              IndicatorSeparator: () => null,
            }}
            blurInputOnSelect
            menuIsOpen={openMenu}
          />
        </Box>
      )}
    </>
  );
};

export default Game;
