import { Box, Button, Input } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useState } from 'react';

const Join = () => {
  const [code, setCode] = useState('');
  const router = useRouter();

  const handleChange = (event) => setCode(event.target.value);

  return (
    <>
      <Box w="50%">
        <Input
          placeholder="Enter room code"
          size="lg"
          value={code}
          onChange={handleChange}
        ></Input>
        <a href={`/room/${code}`}>
          <Button colorScheme="green" w="100%" mt="30px">
            Join Room
          </Button>
        </a>
      </Box>
    </>
  );
};

export default Join;
