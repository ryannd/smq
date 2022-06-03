import { Button, Center, Grid, Title } from '@mantine/core';
import { io } from 'socket.io-client';
import { useEffect, useState } from 'react';
import { SocketRoom, Track } from '~client/globals/types';
import HostSettings from '~client/components/game/host_settings';
import RoomInfo from '~client/components/game/room_info';
import MainGame from '~client/components/game/main_game';
import ScoreCol from '~client/components/game/score_col';

const Create = ({ user }) => {
  const [socket, setSocket] = useState(null);
  const [roomData, setRoomData] = useState<SocketRoom>();
  const [roomId] = useState((Math.random() + 1).toString(36).substring(7));
  const [gameState, setGameState] = useState('wait');
  const [currentTrack, setCurrentTrack] = useState<Track>();
  const [prep, setPrep] = useState(5);
  const [host, setHost] = useState(true);

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
    socketIo.on('gameTimerStart', () => {
      setGameState('prep');
    });
    socketIo.on('timerStartTick', (s) => {
      setPrep(s);
    });
    socketIo.on('changeSong', (s) => {
      setCurrentTrack(s);
    });
    return () => {
      socketIo.off('updateRoom');
    };
  }, []);

  useEffect(() => {
    if (!roomId || !socket || !user) return;
    socket.emit('hostJoinRoom', {
      id: roomId,
      user,
    });

    return () => {
      socket.off('hostJoinRoom');
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
            <HostSettings
              roomData={roomData}
              socket={socket}
              roomId={roomId}
              user={user}
            />
            <Grid.Col xs={12} xl={6}>
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
      case 'end':
        return (
          host && (
            <Button onClick={() => socket.emit('newGame', { id: roomId })}>
              New Game
            </Button>
          )
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
          <ScoreCol roomData={roomData} roomId={roomId} />
        </Grid.Col>
      </Grid>
    </>
  );
};

export default Create;
