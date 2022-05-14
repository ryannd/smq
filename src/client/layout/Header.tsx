import { Box, Button, Flex, Heading } from '@chakra-ui/react';
import Link from 'next/link';
import { User } from '../types/user.type';
import ThemeToggle from './ThemeToggle';

interface Props {
  user: {
    body: User;
  };
}

const Header: React.FC<Props> = ({ user }: Props) => {
  return (
    <>
      <Flex pb="30px">
        <Link href="/">
          <Heading fontSize={['xl', '4xl']}>spotify.music.quiz</Heading>
        </Link>
        <Box marginLeft="auto">
          <ThemeToggle />
          {user ? (
            <Link href="">
              <Button>{user.body.display_name}</Button>
            </Link>
          ) : (
            <Link href="/api/auth/login">
              <Button>Login</Button>
            </Link>
          )}
        </Box>
      </Flex>
    </>
  );
};

export default Header;
