import {
  Modal,
  Title,
  Stack,
  NumberInput,
  Select,
  Button,
} from '@mantine/core';
import { useState } from 'react';

const TopTracksModal = ({ opened, setOpened, setMode, socket, id }) => {
  const [range, setRange] = useState('long_term');
  const [limit, setLimit] = useState(5);

  const emitMode = () => {
    socket.emit('hostTopTracks', { range, limit, id });
    setMode('toptracks');
    setOpened(false);
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
        title={<Title order={2}>Top Track Settings</Title>}
        padding="xl"
      >
        <Stack align="center">
          <NumberInput
            style={{ width: '100%' }}
            label="Number of tracks per user"
            stepHoldDelay={500}
            stepHoldInterval={100}
            max={30}
            defaultValue={5}
            value={limit}
            onChange={setLimit}
          />
          <Select
            label="Time range"
            style={{ width: '100%' }}
            value={range}
            onChange={setRange}
            data={[
              { value: 'long_term', label: 'Long Term' },
              { value: 'medium_term', label: 'Medium Term' },
              { value: 'short_term', label: 'Short Term' },
            ]}
          />
          <Button style={{ width: '100%' }} onClick={emitMode}>
            Set
          </Button>
        </Stack>
      </Modal>
    </>
  );
};

export default TopTracksModal;
