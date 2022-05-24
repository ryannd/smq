import { Box, Button, Flex, Heading, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { ClientUser, User } from '../globals/types';
import cookieCutter from 'cookie-cutter';

interface Props {
  user: ClientUser;
}

const Header: React.FC<Props> = ({ user }: Props) => {
  const logout = () => {
    cookieCutter.set('jwt', '', { expires: new Date(0) });
    localStorage.removeItem('guestName');
    location.reload();
  };
  return (
    <>
      <Flex pb="30px">
        <Link href="/">
          <a>
            <Heading fontSize={['xl', '2xl', '4xl']}>s.m.q</Heading>
          </a>
        </Link>
        <Box marginLeft="auto">
          {user && (
            <Link href="">
              <Button
                maxW={['75px', '100%']}
                onClick={logout}
                colorScheme="red"
              >
                <Text noOfLines={1}>{user.name}</Text>
              </Button>
            </Link>
          )}
        </Box>
      </Flex>
    </>
  );
};

export default Header;
