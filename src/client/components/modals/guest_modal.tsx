import { Modal, Stack, InputWrapper, Input, Button } from '@mantine/core';
import { useState } from 'react';

const GuestModal = ({ setOpened, opened }) => {
  const [username, setUsername] = useState('');

  const guestLogin = () => {
    const randId = Math.random().toString(36).substring(2, 7);
    localStorage.setItem('guestId', randId);
    localStorage.setItem('guestName', username);
    location.replace('/');
  };

  return (
    <Modal
      centered
      closeOnClickOutside={false}
      opened={opened}
      onClose={() => setOpened(false)}
      title="Guest login"
    >
      <Stack>
        <InputWrapper label="Enter a username">
          <Input
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
          />
        </InputWrapper>
        <Button style={{ width: '100%' }} onClick={guestLogin}>
          Login
        </Button>
      </Stack>
    </Modal>
  );
};

export default GuestModal;
