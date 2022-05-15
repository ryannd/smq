import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Input,
  ModalFooter,
  Button,
  FormControl,
  FormErrorMessage,
} from '@chakra-ui/react';
import { useState } from 'react';
import fetcher from '~client/utils/fetcher';

const PlaylistModal = ({ isOpen, onClose, socket, room }) => {
  const [url, setUrl] = useState('');
  const [valid, setValid] = useState(true);
  const handleSubmit = async () => {
    try {
      const urlObj = new URL(url);
      const id = urlObj.pathname.split('/');
      if (urlObj.hostname === 'open.spotify.com' && id[2] !== undefined) {
        setValid(true);
        const playlist = await fetcher(`/api/tracks/playlist/${id[2]}`);
        socket.emit('hostPlaylist', { id: room, title: playlist.title });
        socket.emit('tracks', { id: room, tracks: playlist.tracks });
        onClose();
      } else {
        setValid(false);
      }
    } catch {
      setValid(false);
    }
  };
  if (!socket || !room) return;
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Enter a playlist url</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl isInvalid={!valid}>
            <Input onChange={(event) => setUrl(event.target.value)} />
            {!valid && (
              <FormErrorMessage>Invalid URL entered.</FormErrorMessage>
            )}
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleSubmit}>
            Send
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default PlaylistModal;