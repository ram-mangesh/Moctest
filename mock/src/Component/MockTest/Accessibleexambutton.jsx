import { useNavigate } from "react-router-dom";

/**
 * AccessibleExamButton
 *
 * Add this button alongside the regular "Start Test" button on
 * TopicCard or wherever mock tests are launched.
 *
 * Usage:
 *   <AccessibleExamButton topicId={topic.id} topicName={topic.name} />
 *
 * It opens /blind-exam/:topicId
 */
const AccessibleExamButton = ({ topicId, topicName }) => {
  const navigate = useNavigate();

  const launch = () => {
    const confirmed = window.confirm(
      `Launch Voice-Accessible Exam for "${topicName}"?\n\n` +
      `This exam is designed for visually impaired students.\n` +
      `All questions and options will be read aloud.\n` +
      `You answer by speaking the option letter (A, B, C or D).\n\n` +
      `Make sure your speakers and microphone are on.`
    );
    if (confirmed) navigate(`/blind-exam/${topicId}`);
  };

  return (
    <button
      onClick={launch}
      title="Voice-accessible exam for visually impaired students"
      className="flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-xl border border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition"
    >
      <span style={{ fontSize: 16 }}>♿</span>
      Voice Exam
    </button>
  );
};

export default AccessibleExamButton;