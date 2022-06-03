import {
  Modal,
  Title,
  Stack,
  InputWrapper,
  Input,
  Button,
} from '@mantine/core';
import { useState } from 'react';
import { BsGlobe } from 'react-icons/bs';

const PlaylistModal = ({ opened, setOpened, setMode, id, socket }) => {
  const [url, setUrl] = useState('');
  const [valid, setValid] = useState(true);

  const emitMode = async () => {
    try {
      const urlObj = new URL(url);
      const playlist = urlObj.pathname.split('/');
      if (urlObj.hostname === 'open.spotify.com' && playlist[2] !== undefined) {
        socket.emit('hostPlaylist', {
          id,
          playlistId: playlist[2],
        });
        setValid(true);
        setMode('playlist');
        setOpened(false);
      } else {
        setValid(false);
      }
    } catch {
      setValid(false);
    }
  };

  if (!id || !socket) return;
  return (
    <>
      <Modal
        centered
        closeOnClickOutside={false}
        size="sm"
        opened={opened}
        onClose={() => setOpened(false)}
        title={<Title order={2}>Playlist Settings</Title>}
        padding="xl"
      >
        <Stack align="center">
          <InputWrapper
            label="Enter a playlist url"
            required
            error={
              !valid == true &&
              "Must enter Spotify playlist url ('open.spotify.com')"
            }
            style={{ width: '100%' }}
          >
            <Input
              icon={<BsGlobe />}
              placeholder="Playlist url..."
              onChange={(event) => setUrl(event.target.value)}
              invalid={!valid}
              style={{ width: '100%' }}
            />
          </InputWrapper>
          <Button style={{ width: '100%' }} onClick={emitMode}>
            Set
          </Button>
        </Stack>
      </Modal>
    </>
  );
};

export default PlaylistModal;
