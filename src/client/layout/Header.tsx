import { Box, Button, Flex, Heading } from '@chakra-ui/react';
import Link from 'next/link';
import { User } from '../types/user.type';
import ThemeToggle from './ThemeToggle';

interface Props {
  user: User;
}

const Header: React.FC<Props> = ({ user }: Props) => {
  return (
    <>
      <Flex pb="30px">
        <Heading>spotify.music.quiz</Heading>
        <Box marginLeft="auto">
          <ThemeToggle />
          {user ? (
            <Link href="">
              <Button>{user.display_name}</Button>
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
