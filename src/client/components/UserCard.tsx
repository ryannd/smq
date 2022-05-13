import {
  Avatar,
  Box,
  Center,
  Heading,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';

export default function SocialProfileWithImage({ user }) {
  if (!user) return;
  return (
    <Center py={6}>
      <Box
        maxW={'250px'}
        w={'full'}
        bg={useColorModeValue('white', 'gray.900')}
        boxShadow={'2xl'}
        rounded={'lg'}
        p={6}
        textAlign={'center'}
      >
        <Avatar
          size={'xl'}
          src={user.user.pic.url}
          alt={'Avatar Alt'}
          mb={4}
          pos={'relative'}
        />
        <Heading fontSize={'2xl'} fontFamily={'body'}>
          {user.user.name}
        </Heading>
        <Text fontWeight={600} color={'blue.400'} mb={4}>
          <a href={user.user.url} target="_blank">
            Spotify Link
          </a>
        </Text>
        <Heading
          textAlign={'center'}
          color={useColorModeValue('gray.700', 'gray.400')}
          px={3}
        >
          {user.score}
        </Heading>
      </Box>
    </Center>
  );
}
