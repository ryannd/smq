import {
  Button,
  Center,
  Flex,
  Heading,
  Link,
  Stack,
  Text,
} from '@chakra-ui/react';
import { NextPage } from 'next';
import useSWR from 'swr';
import { User } from '../types/user.type';
import fetcher from '../utils/fetcher';
interface IsLoggedInProps {
  user: User;
}
const Home: NextPage = () => {
  const { data } = useSWR('/api/user/me', fetcher);

  return (
    <>
      <Center w="100%" h="100%">
        {data ? <IsLoggedIn user={data.body} /> : <NotLoggedIn />}
      </Center>
    </>
  );
};

export const NotLoggedIn: React.FC = () => {
  return (
    <>
      <Stack align="center">
        <Heading>wewcome to spotify.music.quiz :3</Heading>
        <Text>pwease wogin bewow</Text>
        <a href="/api/auth/login">
          <Button>wogin with spowify</Button>
        </a>
      </Stack>
    </>
  );
};

const IsLoggedIn: React.FC<IsLoggedInProps> = ({ user }: IsLoggedInProps) => {
  return (
    <>
      <Stack align="center">
        <Heading mb="20px">
          hewwo {user.display_name.toLowerCase()}! sewect an option bewow.
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
