import {
  AppShell
} from '@mantine/core';

import TopBar from './top_bar';

const Shell = ({ children }) => {
  return (
    <AppShell
      padding="md"
      header={<TopBar />}
      styles={{ main: { height: '100vh', width: '100vw' } }}
    >
      {children}
    </AppShell>
  );
};

export default Shell;
