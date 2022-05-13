import { Center, Flex } from '@chakra-ui/react';
import React, { ReactNode } from 'react';
import useSWR from 'swr';
import { NotLoggedIn } from '~client/pages';
import fetcher from '../utils/fetcher';

import Header from './Header';

interface Props {
  children: ReactNode;
}

const Layout: React.FC<Props> = ({ children }: Props) => {
  const { data: user, error } = useSWR('/api/user/me', fetcher);

  const childrenWithUser = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { user });
    }
    return child;
  });

  return (
    <Flex alignContent="center" p="30px" flexDir="column" w="100vw" h="100vh">
      <Header user={user} />
      <Center justifySelf="center" w="100%" h="100%">
        {error ? <NotLoggedIn /> : childrenWithUser}
      </Center>
    </Flex>
  );
};

export default Layout;
