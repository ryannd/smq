import {
  Avatar,
  Badge,
  Box,
  Center,
  Heading,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { BsCheckLg, BsXLg } from 'react-icons/bs';

export default function SocialProfileWithImage({ user }) {
  if (!user) return;
  return (
    <Center py={[0, 0, 6]} w={['250px', '200px']}>
      <Box
        w={'full'}
        bg={useColorModeValue('white', 'gray.900')}
        boxShadow={'2xl'}
        rounded={'lg'}
        p={[2, 2, 4]}
        textAlign={'center'}
        justifyContent="space-between"
        alignItems="center"
        display={['flex', 'flex', 'block']}
        flexDir={'row'}
      >
        <Avatar
          size={'lg'}
          src={user.user.pic ? user.user.pic.url : ''}
          mb={[0, 0, 2]}
          pos={'relative'}
        />
        <Heading
          fontSize={'2xl'}
          fontFamily={'body'}
          mb={[0, 0, 2]}
          isTruncated
        >
          {user.user.name}
        </Heading>
        {user.answer !== '' && (
          <Text>
            {user.answer}
            {user.isAnswerCorrect ? (
              <Badge ml="1" fontSize="0.8em" colorScheme="green">
                <BsCheckLg />
              </Badge>
            ) : (
              <Badge ml="1" fontSize="0.8em" colorScheme="red">
                <BsXLg />
              </Badge>
            )}
          </Text>
        )}
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
