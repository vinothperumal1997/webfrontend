import React, { ChangeEvent, KeyboardEvent, useEffect, useState } from 'react';
import { Button, Card, Col, Form, InputGroup, ListGroup, Row } from 'react-bootstrap';
import { FaPaperPlane, FaSignOutAlt } from 'react-icons/fa';
import io from 'socket.io-client';
import './ChatBox.css';

const socket: any = io('http://localhost:3000', {
    auth: {
        token: localStorage.getItem('accessToken') || ''
    }
});

interface Message {
    sender: { email: string };
    content: string;
}

interface SocketData {
    room: string;
    content: string;
}


const ChatBox: React.FC = () => {

    const [room, setRoom] = useState<string>('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [messageContent, setMessageContent] = useState<string>('');
    const [connected, setConnected] = useState<boolean>(false);

    useEffect(() => {

        socket.on('connect', () => {
            setConnected(true);
        });

        socket.on('disconnect', () => {
            setConnected(false);
        });

        socket.on('previous_messages', (msgs: Message[]) => {
            setMessages(msgs);
        });

        socket.on('new_message', (msg: Message) => {
            setMessages((prevMessages) => [...prevMessages, msg]);
        });

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('previous_messages');
            socket.off('new_message');
        };
    }, []);

    const handleJoinRoom = (): void => {
        socket.emit('join_room', room);
    };

    const handleLeaveRoom = (): void => {
        socket.emit('leave_room', room);
        setRoom('');
    };

    const handleSendMessage = (): void => {
        if (messageContent.trim() === '') return;

        socket.emit('send_message', {
            room,
            content: messageContent
        } as SocketData);

        setMessageContent('');
    };

    const handleMessageChange = (e: ChangeEvent<HTMLInputElement>): void => {
        setMessageContent(e.target.value);
    };

    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>): void => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    return (
        <Card className="chat-card">
            <Card.Header className="d-flex justify-content-between align-items-center">
                <h4>Chat Room</h4>
                <div>
                    {room && (
                        <Button
                            variant="danger"
                            onClick={handleLeaveRoom}
                            disabled={!connected}
                            className="btn-icon">
                            <FaSignOutAlt />
                        </Button>
                    )}
                </div>
            </Card.Header>
            <Card.Body>
                <Row className="mb-3">
                    <Col>
                        <InputGroup>
                            <InputGroup.Text>Room</InputGroup.Text>
                            <Form.Control
                                type="text"
                                value={room}
                                onChange={(e) => setRoom(e.target.value)}
                                placeholder="Enter Room Name"
                            />
                        </InputGroup>
                    </Col>
                    <Col xs="auto">
                        <Button
                            className="mt-2"
                            onClick={handleJoinRoom}
                            disabled={connected || !room}
                            variant="primary">
                            {connected ? 'Connected' : 'Join Room'}
                        </Button>
                    </Col>
                </Row>
                {messages.length ? (
                    <div className="messages-box">
                        <ListGroup>
                            {messages.map((msg, index) => (
                                <ListGroup.Item key={index} className="message-item">
                                    <strong>{msg.sender.email}:</strong> {msg.content}
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </div>
                ) : (
                    <p>No messages yet. Be the first to send one!</p>
                )}
            </Card.Body>
            <Card.Footer className="d-flex justify-content-between align-items-center">
                <InputGroup className="w-100">
                    <Form.Control
                        type="text"
                        value={messageContent}
                        onChange={handleMessageChange}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message"
                    />
                    <Button variant="primary" onClick={handleSendMessage} className="btn-send">
                        <FaPaperPlane />
                    </Button>
                </InputGroup>
            </Card.Footer>
        </Card>
    );
};

export default ChatBox;
