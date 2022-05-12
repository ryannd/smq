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
  useEffect(() => {
    setTrackFill(
      Object.keys(allTracks).map((t) => ({ value: t.toLowerCase(), label: t })),
    );
    console.log(allTracks);
    console.log(trackFill);
  }, [allTracks]);

  useEffect(() => {
    if (!socket) return;
    socket.on('roundStartTick', (s) => {
      setGameTime(s);
    });
    socket.on('showTitle', () => {
      console.log('HERE');
      setShowTitle(true);
    });

    socket.on('changeSong', (s) => {
      setShowTitle(false);
      setGameTime(30);
    });
  }, [socket]);

  return (
    <>
      {currentSong && (
        <Box>
          {showTitle && (
            <>
              <Heading>{currentSong.name}</Heading>
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
            isClearable
            isSearchable
            onInputChange={(input) => {
              if (input && input.length > 2) {
                setOpenMenu(true);
              } else {
                setOpenMenu(false);
              }
            }}
            components={{
              DropdownIndicator: () => null, // Remove dropdown icon
              IndicatorSeparator: () => null, // Remove separator
            }}
            menuIsOpen={openMenu}
          />
        </Box>
      )}
    </>
  );
};

export default Game;
