import { Grid, Center, Title, Button } from '@mantine/core';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import HostSettings from '~client/components/game/host_settings';
import MainGame from '~client/components/game/main_game';
import RoomInfo from '~client/components/game/room_info';
import ScoreCol from '~client/components/game/score_col';
import { SocketRoom, Track } from '~client/globals/types';

const NonHost = ({ user }) => {
  const router = useRouter();
  const [socket, setSocket] = useState(null);
  const [roomData, setRoomData] = useState<SocketRoom>();
  const [prep, setPrep] = useState(5);
  const [gameState, setGameState] = useState('wait');
  const [host, setHost] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track>();
  const { roomId } = router.query;

  useEffect(() => {
    const socketIo = io();
    setSocket(socketIo);

    socketIo.on('updateRoom', (data) => {
      setRoomData({ ...data });
    });
    socketIo.on('startAll', () => {
      setGameState('game');
    });
    socketIo.on('newGame', () => {
      setPrep(5);
      setGameState('wait');
    });
    socketIo.on('hostDisconnect', () => {
      setGameState('disconnect');
    });
    socketIo.on('roomDoesNotExist', () => {
      setGameState('notExist');
    });
    socketIo.on('endGame', () => {
      setGameState('end');
    });
    socketIo.on('newHost', () => {
      setHost(true);
    });
    socketIo.on('gameTimerStart', () => {
      setGameState('prep');
    });
    socketIo.on('changeSong', (s) => {
      setCurrentTrack(s);
    });
    socketIo.on('timerStartTick', (s) => {
      setPrep(s);
    });
  }, []);

  useEffect(() => {
    if (!roomId || !socket || !user) return;
    socket.emit('joinRoom', {
      id: roomId,
      user,
    });

    return () => {
      socket.off('joinRoom');
    };
  }, [roomId, socket, user]);

  const ready = () => {
    socket.emit('ready', { id: roomId, user });
  };

  const content = () => {
    switch (gameState) {
      case 'wait':
        return (
          <>
            {host && (
              <HostSettings
                roomData={roomData}
                socket={socket}
                roomId={roomId}
                user={user}
              />
            )}
            <Grid.Col xs={12} xl={6} style={{ textAlign: 'center' }}>
              <RoomInfo
                roomData={roomData}
                roomId={roomId}
                host={host}
                ready={ready}
              />
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
            currentTrack={currentTrack}
          />
        );
      case 'notExist':
        return (
          <Grid.Col xs={12} xl={6}>
            <Title>This room does not exist.</Title>
          </Grid.Col>
        );
      case 'disconnect':
        return (
          <Grid.Col xs={12} xl={6}>
            <Title>The host disconnected.</Title>
          </Grid.Col>
        );
      case 'end':
        return (
          <>
            {host && (
              <Button onClick={() => socket.emit('newGame', { id: roomId })}>
                New Game
              </Button>
            )}
          </>
        );
      case 'prep':
        return <Title>{prep}</Title>;
    }
  };

  return (
    <>
      <Grid style={{ width: '100%', height: '100%' }}>
        <Grid.Col xs={12} sm={6} md={7} xl={9}>
          <Center
            style={{ width: '100%', height: '100%', flexDirection: 'column' }}
          >
            <Grid justify="center" style={{ width: '100%' }}>
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
          <ScoreCol roomData={roomData} />
        </Grid.Col>
      </Grid>
    </>
  );
};

export default NonHost;
