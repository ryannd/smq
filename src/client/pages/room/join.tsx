import { Box, Button, Input } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useState } from 'react';

const Join = () => {
  const [code, setCode] = useState('');
  const router = useRouter();

  const handleChange = (event) => setCode(event.target.value);

  const handleClick = () => {
    router.push(`/room/${code}`);
  };

  return (
    <>
      <Box w="50%">
        <Input
          placeholder="Enter room code"
          size="lg"
          value={code}
          onChange={handleChange}
        ></Input>
        <Button colorScheme="green" w="100%" mt="30px" onClick={handleClick}>
          Join Room
        </Button>
      </Box>
    </>
  );
};

export default Join;
