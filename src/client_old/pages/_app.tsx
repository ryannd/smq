import { ChakraProvider } from '@chakra-ui/react';
import theme from '~client/theme';
import Layout from '../layout/Layout';

function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider resetCSS theme={theme}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ChakraProvider>
  );
}

export default MyApp;
