import { AppShell } from '@mantine/core';
import React, { ReactNode, useEffect, useState } from 'react';
import useSWR from 'swr';
import { ClientUser } from '~client/globals/types';
import fetcher from '~client/utils/fetcher';

import TopBar from './top_bar';

const Shell = ({ children }: { children: ReactNode }) => {
  const { data } = useSWR('/api/user/me', fetcher, {
    revalidateOnFocus: false,
  });
  const [user, setUser] = useState<ClientUser>();

  const childrenWithUser = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { user });
    }
    return child;
  });

  useEffect(() => {
    if (!data) {
      if (
        localStorage.getItem('guestName') == null ||
        localStorage.getItem('guestId') == null
      ) {
        return;
      } else {
        const name = localStorage.getItem('guestName');
        const id = localStorage.getItem('guestId');
        setUser({
          name,
          id,
          pic: { url: '', height: 0, width: 0 },
          url: '',
        });
      }
    } else {
      setUser({
        name: data.body.display_name,
        pic: data.body.images[0] || undefined,
        url: data.body.external_urls.spotify,
        id: data.body.id,
      });
    }
  }, [data]);

  return (
    <AppShell
      padding="md"
      header={<TopBar data={data} />}
      styles={{
        root: { height: '100vh', width: '100vw', overflowX: 'hidden' },
        body: {
          height: 'calc(100% - 60px)',
          width: '100%',
          paddingTop: '60px',
          overflowX: 'hidden',
        },
      }}
    >
      {childrenWithUser}
    </AppShell>
  );
};

export default Shell;
