import { LayoutDashboard } from 'lucide-react';
import { Col, Container, Row } from 'react-bootstrap';
import ChatBox from '../components/ChatBox';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="d-flex align-items-center">
            <LayoutDashboard className="me-2" />
            Welcome, {user?.email}
          </h2>
        </Col>
      </Row>

      <ChatBox />
    </Container>
  );
};

export default Dashboard;