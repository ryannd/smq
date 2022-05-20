import {
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Text,
} from '@chakra-ui/react';
import { useState } from 'react';

const TopTracksModal = ({ isOpen, onClose, socket, room }) => {
  if (!socket || !room) return;
  const [numPerUser, setNumPerUser] = useState(0);
  const [timeRange, setTimeRange] = useState('long_term');
  const sendTopTracksMsg = () => {
    socket.emit('hostTopTracks', { id: room, timeRange, limit: numPerUser });
    onClose();
  };
  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Top Tracks Options</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize="lg" mb="5px">
              Number of tracks per user
            </Text>
            <Flex mb="20px">
              <NumberInput
                maxW="100px"
                mr="2rem"
                value={numPerUser}
                onChange={(v) => setNumPerUser(parseInt(v))}
                max={20}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <Slider
                flex="1"
                focusThumbOnChange={false}
                value={numPerUser}
                onChange={(v) => setNumPerUser(v)}
                max={20}
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb
                  fontSize="sm"
                  boxSize="32px"
                  children={numPerUser}
                />
              </Slider>
            </Flex>
            <Select
              defaultValue="long_term"
              onChange={(v) => setTimeRange(v.target.value)}
            >
              <option value="long_term">Long term</option>
              <option value="medium_term">Medium term</option>
              <option value="short_term">Short term</option>
            </Select>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={sendTopTracksMsg}>
              Send
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default TopTracksModal;
