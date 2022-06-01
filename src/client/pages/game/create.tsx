import { Center, Grid, Stack } from '@mantine/core';
import { io } from 'socket.io-client';
import { useEffect, useState } from 'react';
import { SocketRoom } from '~client/globals/types';
import UserCard from '~client/components/game/user_card';
import HostSettings from '~client/components/game/host_settings';
import RoomInfo from '~client/components/game/room_info';
import MainGame from '~client/components/game/main_game';

const Create = ({ user }) => {
  const [socket, setSocket] = useState(null);
  const [roomData, setRoomData] = useState<SocketRoom>();
  const [roomId] = useState((Math.random() + 1).toString(36).substring(7));
  const [gameState, setGameState] = useState('wait');

  useEffect(() => {
    const socketIo = io();
    setSocket(socketIo);

    socketIo.on('updateRoom', (data) => {
      setRoomData({ ...data });
    });

    socketIo.on('startAll', () => {
      setGameState('game');
    });

    return () => {
      socketIo.off('updateRoom');
    };
  }, []);

  const content = () => {
    switch (gameState) {
      case 'wait':
        return (
          <>
            <HostSettings
              roomData={roomData}
              socket={socket}
              roomId={roomId}
              user={user}
            />
            <Grid.Col xs={12} xl={6}>
              <RoomInfo roomData={roomData} roomId={roomId} />
            </Grid.Col>
          </>
        );
      case 'game':
        return (
          <MainGame
            socket={socket}
            user={user}
            roomData={roomData}
            roomId={roomId}
          />
        );
    }
  };

  return (
    <>
      <Grid style={{ width: '100%', height: '100%' }}>
        <Grid.Col xs={12} sm={6} md={7} xl={9}>
          <Center
            style={{ width: '100%', height: '100%', flexDirection: 'column' }}
          >
            <Grid style={{ width: '50%' }} justify="center">
              {content()}
            </Grid>
          </Center>
        </Grid.Col>
        <Grid.Col
          xs={12}
          sm={6}
          md={5}
          xl={3}
          style={{ width: '100%', height: '100%' }}
        >
          {roomData && (
            <Center>
              <Stack style={{ width: '100%', height: '100%' }}>
                {roomData.users &&
                  Object.keys(roomData.users).map((user) => (
                    <UserCard user={roomData.users[user]} />
                  ))}
              </Stack>
            </Center>
          )}
        </Grid.Col>
      </Grid>
    </>
  );
};

export default Create;
