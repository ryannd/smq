import { Box, Button, Flex, Heading, Text } from '@chakra-ui/react';
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
          <a>
            <Heading fontSize={['xl', '2xl', '4xl']}>s.m.q</Heading>
          </a>
        </Link>
        <Box marginLeft="auto">
          <ThemeToggle />
          {user ? (
            <Link href="">
              <Button maxW={['75px', '100%']}>
                <Text isTruncated>{user.body.display_name}</Text>
              </Button>
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
