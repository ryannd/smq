import { ColorModeScript } from '@chakra-ui/react';
import { FlashlessScript } from 'chakra-ui-flashless';
import NextDocument, { Html, Head, Main, NextScript } from 'next/document';
import theme from '../theme';
export default class Document extends NextDocument {
  render() {
    return (
      <Html lang="en">
        <Head />
        <body>
          <FlashlessScript theme={theme} />
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
