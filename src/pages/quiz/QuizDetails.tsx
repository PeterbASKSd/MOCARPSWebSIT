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
import correctIcon from "/src/assets/correct.svg";
import incorrectIcon from "/src/assets/incorrect.svg";

type User = {
  id: string;
  name: string;
  email: string;
  cardNumber: string;
  verified: boolean;
};

type Question = {
  id: number;
  description: string;
  score: number;
  questionType: string;
  options: {
    id: number;
    keyword: string;
    description: string;
    isCorrect: boolean;
    jumpTo: number;
  }[];
};

type Answer = {
  id: number;
  questionId: number; // Ensure this is a number
  resultId: string;
  optionId: number; // Ensure this is a number
  question: Question;
  option: {
    id: number;
    keyword: string;
    description: string;
    isCorrect: boolean;
    jumpTo: number;
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

const QuizDetail = () => {
  const { quizresultId } = useParams<{ quizresultId: string }>();
  const [resultDetails, setResultDetails] = useState<UserResult | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (quizresultId) {
      fetchResultDetails(quizresultId);
    }
  }, [quizresultId]);

  useEffect(() => {
    if (resultDetails?.questionSetId) {
      fetchQuestions(resultDetails.questionSetId);
    }
  }, [resultDetails]);

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

  const fetchQuestions = async (id: string) => {
    try {
      const response = await axios.get(
        `https://mocarps.azurewebsites.net/questionSet/${id}`
      );
      setQuestions(response.data.questions);
    } catch (error) {
      console.error("Error fetching questions:", error);
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
  const totalQuestions = questions.length;
  const totalScore = resultDetails.answers
    .filter((answer) => answer.question.questionType !== "BRANCH")
    .reduce((sum, answer) => sum + answer.question.score, 0);

  const pieData = [
    { name: "Correct", value: correctAnswersCount },
    { name: "Incorrect", value: totalQuestions - correctAnswersCount },
  ];

  const getJumpToText = (jumpTo: number) => {
    if (jumpTo === 0) return "Next question";
    if (jumpTo === -1) return "The end";
    const jumpToQuestionIndex = questions.findIndex(
      (question) => question.id === jumpTo
    );
    return `Jump to Q# ${jumpToQuestionIndex + 1}`;
  };

  const findAnswerForQuestion = (questionId: number) => {
    return resultDetails.answers.find(
      (answer) => answer.questionId === questionId
    );
  };

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
              <th>Is Answer Correct</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((question, index) => {
              const answer = findAnswerForQuestion(question.id);
              return (
                <tr key={`question-${question.id}`}>
                  <td>{index + 1}</td>
                  <td>{question.description}</td>
                  <td>{question.questionType}</td>
                  <td>
                    {question.questionType !== "BRANCH" ? question.score : "-"}
                  </td>
                  <td>
                    {answer ? (
                      <>
                        {answer.option.keyword}
                        {answer.option.jumpTo !== 0 &&
                          answer.option.jumpTo !== -1 &&
                          ` (${getJumpToText(answer.option.jumpTo)})`}
                      </>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>{answer ? answer.option.description : "-"}</td>
                  <td>
                    {answer ? (
                      answer.option.isCorrect ? (
                        <img
                          src={correctIcon}
                          alt="Correct"
                          className="correct-icon"
                        />
                      ) : (
                        <img
                          src={incorrectIcon}
                          alt="Incorrect"
                          className="incorrect-icon"
                        />
                      )
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="summary">
        <h2>Summary</h2>
        <div className="summary-boxes">
          <div className="summary-box">
            <div className="summary-description">
              <p>
                Correct Answers: {correctAnswersCount}/{totalQuestions}
              </p>
              <p>
                Quiz Score: {resultDetails.score}/{totalScore}
              </p>
            </div>

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
        </div>
      </div>
    </div>
  );
};

const calculateCorrectAnswers = (answers: Answer[]) => {
  return answers.filter((answer) => answer.option.isCorrect).length;
};

export default QuizDetail;
