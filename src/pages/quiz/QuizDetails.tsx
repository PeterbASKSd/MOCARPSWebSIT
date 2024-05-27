import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "../quiz/quizDetails.scss";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type User = {
  id: string;
  name: string;
  email: string;
  cardNumber: string;
  verified: boolean;
};

type Answer = {
  id: number;
  questionId: string;
  resultId: string;
  optionId: string;
  question: {
    id: number;
    description: string;
    score: number;
    questionType: string;
  };
  option: {
    id: number;
    keyword: string;
    description: string;
    isCorrect: boolean;
  };
};

type UserResult = {
  id: number;
  userId: string;
  answers: Answer[];
  user: User;
  questionSetId: string;
  questionSetName: string;
  completedAt: string;
  score: number;
};

const COLORS_ANSWERS = ["#28a745", "#dc3545"]; // Green for correct, red for incorrect
const COLORS_SCORES = ["#007bff", "#ffc107"]; // Blue for scored, yellow for remaining

const QuizDetail = () => {
  const { quizresultId } = useParams<{ quizresultId: string }>();
  const [resultDetails, setResultDetails] = useState<UserResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (quizresultId) {
      fetchResultDetails(quizresultId);
    }
  }, [quizresultId]);

  const fetchResultDetails = async (id: string) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://mocarps.azurewebsites.net/quizResult/detail/${id}`
      );
      setResultDetails(response.data);
    } catch (error) {
      console.error("Error fetching result details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!resultDetails) {
    return (
      <div className="loading">No details found for the selected result.</div>
    );
  }

  const correctAnswersCount = calculateCorrectAnswers(resultDetails.answers);
  const totalQuestions = resultDetails.answers.length;
  const totalScore = resultDetails.answers.reduce(
    (sum, answer) => sum + answer.question.score,
    0
  );

  const pieData = [
    { name: "Correct", value: correctAnswersCount },
    { name: "Incorrect", value: totalQuestions - correctAnswersCount },
  ];

  const scorePieData = [
    { name: "Scored", value: resultDetails.score },
    { name: "Remaining", value: totalScore - resultDetails.score },
  ];

  return (
    <div className="quiz-detail">
      <button
        className="back-button"
        onClick={() =>
          navigate("/quiz", {
            state: {
              selectedUsers: location.state.selectedUsers,
              selectedQuestionSet: location.state.selectedQuestionSet,
            },
          })
        }
      >
        Back to User List
      </button>
      <div className="section">
        <h2>User Details</h2>
        <table>
          <thead>
            <tr>
              <th>User ID</th>
              <th>User Name</th>
              <th>User Email</th>
              <th>Card Number</th>
              <th>Verified</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{resultDetails.user.id}</td>
              <td>{resultDetails.user.name}</td>
              <td>{resultDetails.user.email}</td>
              <td>{resultDetails.user.cardNumber}</td>
              <td>{resultDetails.user.verified ? "Yes" : "No"}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="section">
        <h2>Answers Details</h2>
        <table>
          <thead>
            <tr>
              <th>Q#</th>
              <th>Question Description</th>
              <th>Question Type</th>
              <th>Question Score</th>
              <th>Selected Option</th>
              <th>Option Description</th>
              <th>Is Correct</th>
            </tr>
          </thead>
          <tbody>
            {resultDetails.answers.map((answer, index) => (
              <tr key={`answer-${answer.id}`}>
                <td>{index + 1}</td>
                <td>{answer.question.description}</td>
                <td>{answer.question.questionType}</td>
                <td>{answer.question.score}</td>
                <td>{answer.option.keyword}</td>
                <td>{answer.option.description}</td>
                <td>{answer.option.isCorrect ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="summary">
        <h2>Summary</h2>
        <div className="summary-boxes">
          <div className="summary-box">
            <p>
              Correct Answers: {correctAnswersCount}/{totalQuestions}
            </p>
            <div className="recharts-wrapper">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS_ANSWERS[index % COLORS_ANSWERS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="summary-box">
            <p>
              Quiz Score: {resultDetails.score}/{totalScore}
            </p>
            <div className="recharts-wrapper">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={scorePieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {scorePieData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS_SCORES[index % COLORS_SCORES.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const calculateCorrectAnswers = (answers: Answer[]) => {
  return answers.filter((answer) => answer.option.isCorrect).length;
};

export default QuizDetail;
