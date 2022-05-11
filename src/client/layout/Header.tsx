import { Box, Button, Flex, Heading } from '@chakra-ui/react';
import Link from 'next/link';
import ThemeToggle from './ThemeToggle';

const Header: React.FC<any> = ({ user }) => {
  return (
    <>
      <Flex pb="30px">
        <Heading>spotify.music.quiz</Heading>
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
