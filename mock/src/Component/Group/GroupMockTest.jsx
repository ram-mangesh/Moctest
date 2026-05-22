import { useParams } from "react-router-dom";
import MockTestPage from "../MockTest/MockTest";

const GroupMockTest = () => {
  const { id } = useParams();
  return <MockTestPage mode="GROUP" groupExamId={id} />;
};

export default GroupMockTest;