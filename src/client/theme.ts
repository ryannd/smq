import { extendTheme, type ThemeConfig } from '@chakra-ui/react';
import { flashless } from 'chakra-ui-flashless';
const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

const theme = extendTheme(flashless({ config }));

export default theme;
