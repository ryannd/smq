import { Center, Flex } from '@chakra-ui/react';
import React, { ReactNode, useEffect, useState } from 'react';
import useSWR from 'swr';
import { NotLoggedIn } from '~client/pages';
import fetcher from '../utils/fetcher';
import { ClientUser } from '../globals/types';

import Header from './Header';

interface Props {
  children: ReactNode;
}

const Layout: React.FC<Props> = ({ children }: Props) => {
  // fetch user obj
  const { data, error } = useSWR('/api/user/me', fetcher);
  const [user, setUser] = useState<ClientUser>();
  const [noUser, setNoUser] = useState(true);
  // have user obj on every page
  const childrenWithUser = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { user });
    }
    return child;
  });

  useEffect(() => {
    if (!data) {
      const name = localStorage.getItem('guestName');
      const id = localStorage.getItem('guestId');
      if (name) {
        setUser({ id, name, url: '' });
        setNoUser(false);
      }
    } else {
      setUser({
        name: data.body.display_name,
        pic: data.body.images[0] || undefined,
        url: data.body.external_urls.spotify,
        id: data.body.id,
      });
      setNoUser(false);
    }
  }, [data]);

  return (
    <Flex
      alignContent="center"
      p="30px"
      flexDir="column"
      w="100vw"
      h="100vh"
      maxW="100vw"
      maxH="100vh"
    >
      <Header user={user} />
      <Center justifySelf="center" w="100%" h="100%">
        {noUser ? <NotLoggedIn /> : childrenWithUser}
      </Center>
    </Flex>
  );
};

export default Layout;
