import { Modal, Stack, InputWrapper, Input, Button } from '@mantine/core';
import { useState } from 'react';

const JoinModal = ({ setOpened, opened }) => {
  const [room, setRoom] = useState('');
  const [invalid, setInvalid] = useState(false);

  const joinRoom = () => {
    if (room.length <= 4) {
      setInvalid(true);
    } else {
      setInvalid(false);
      location.replace(`/game/${room}`);
    }
  };

  return (
    <>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Join a room"
      >
        <Stack>
          <InputWrapper label="Enter a room code">
            <Input
              onChange={(e) => setRoom(e.target.value)}
              placeholder="Room code"
              invalid={invalid}
            />
          </InputWrapper>
          <Button style={{ width: '100%' }} onClick={joinRoom}>
            Join Room
          </Button>
        </Stack>
      </Modal>
    </>
  );
};

export default JoinModal;
