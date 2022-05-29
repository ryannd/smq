import {
  Button,
  Center,
  Flex,
  FormControl,
  Heading,
  Input,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { NextPage } from 'next';
import { useState } from 'react';
import { ClientUser } from '../globals/types';
interface IsLoggedInProps {
  user: ClientUser;
}
const Home: NextPage<IsLoggedInProps> = ({ user }) => {
  return (
    <>
      <Center w="100%" h="100%">
        {user ? <IsLoggedIn user={user} /> : <NotLoggedIn />}
      </Center>
    </>
  );
};

export const NotLoggedIn: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [name, setName] = useState('');

  const saveName = () => {
    const randId = Math.random().toString(36).substring(2, 7);
    localStorage.setItem('guestId', randId);
    localStorage.setItem('guestName', name);
    location.reload();
    onClose();
  };
  return (
    <>
      <Stack align="center">
        <Heading>wewcome to spotify.music.quiz :3</Heading>
        <Text>pwease wogin bewow</Text>
        <Flex>
          <a href="/api/auth/login">
            <Button mr="30px">wogin with spowify</Button>
          </a>
          <Button onClick={onOpen}>wogin aw gwest</Button>
        </Flex>
      </Stack>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Login as Guest</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <Input
                onChange={(event) => setName(event.target.value)}
                placeholder="User name"
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={saveName}>
              Login
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

const IsLoggedIn: React.FC<IsLoggedInProps> = ({ user }: IsLoggedInProps) => {
  return (
    <>
      <Stack align="center">
        <Heading mb="20px">
          hewwo {user.name.toLowerCase()}! sewect an option bewow.
        </Heading>
        <Flex>
          <Link href={`/room/host`}>
            <Button mr="30px">cweate a woom</Button>
          </Link>
          <Link href={'/room/join'}>
            <Button>join a woom</Button>
          </Link>
        </Flex>
      </Stack>
    </>
  );
};

export default Home;
