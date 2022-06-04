import {
  Avatar,
  Badge,
  Card,
  Container,
  Indicator,
  Text,
  Title,
} from '@mantine/core';
import { forwardRef } from 'react';
import { ImCheckmark, ImCross } from 'react-icons/im';
import { SocketUser } from '~client/globals/types';

interface Props {
  user: SocketUser;
  inGame: boolean;
}

const UserCard = forwardRef(({ user, inGame }: Props, ref) => {
  if (!user) return;
  return (
    <div ref={ref as React.RefObject<HTMLDivElement>}>
      <Card
        shadow="sm"
        p="xl"
        style={{
          display: 'flex',
          width: '100%',
          height: '100px',
          marginTop: '15px',
        }}
      >
        {inGame ? (
          user.voteSkip ? (
            <Indicator inline label="SKIP" size={16} color="red" withBorder>
              <Avatar src={user.user.pic.url || ''} size="lg" />
            </Indicator>
          ) : (
            <Avatar src={user.user.pic.url || ''} size="lg" />
          )
        ) : user.isReady ? (
          <Indicator inline label="READY" size={16} color="green" withBorder>
            <Avatar src={user.user.pic.url || ''} size="lg" />
          </Indicator>
        ) : (
          <Avatar src={user.user.pic.url || ''} size="lg" />
        )}
        <Container style={{ textAlign: 'center' }}>
          <Title order={4}>{user.user.name}</Title>
          {user.answer !== '' && (
            <Text>
              {user.answer}
              {user.isAnswerCorrect ? (
                <Badge style={{ marginLeft: '10px' }} color="green">
                  <ImCheckmark />
                </Badge>
              ) : (
                <Badge style={{ marginLeft: '10px' }} color="red">
                  <ImCross />
                </Badge>
              )}
            </Text>
          )}
        </Container>
        <Title>{user.score}</Title>
      </Card>
    </div>
  );
});

export default UserCard;
