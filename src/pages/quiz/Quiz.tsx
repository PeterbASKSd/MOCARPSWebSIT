import { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import ViewIcon from "/src/assets/view.svg";
import "./quiz.scss";

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

type QuestionSetResult = {
  userId: string;
  score: number;
  completedAt: string;
  createdAt: string;
  user: User;
};

type QuestionSetData = {
  id: string;
  name: string;
  description: string;
  publishedAt: string;
};

type QuestionSetResults = {
  questionSet: QuestionSetData;
  averageScore: number;
  results: QuestionSetResult[];
};

const customStyles = {
  control: (provided: any) => ({
    ...provided,
    color: "black",
    backgroundColor: "white",
  }),
  singleValue: (provided: any) => ({
    ...provided,
    color: "black",
  }),
  input: (provided: any) => ({
    ...provided,
    color: "black",
    padding: "0px", // Remove padding to ensure text is not cut off
    margin: "0px", // Remove margin to ensure text is not cut off
  }),
  valueContainer: (provided: any) => ({
    ...provided,
    padding: "0px 8px", // Adjust padding for the value container
  }),
  menu: (provided: any) => ({
    ...provided,
    color: "black",
    backgroundColor: "white",
  }),
  placeholder: (provided: any) => ({
    ...provided,
    color: "black",
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    color: "black",
    backgroundColor: state.isSelected
      ? "#ddd"
      : state.isFocused
      ? "#f4f4f4"
      : "white",
  }),
};

const Quiz = () => {
  const [results, setResults] = useState<
    UserResult[] | QuestionSetResults | null
  >(null);
  const [viewBy, setViewBy] = useState<"userId" | "questionId">("userId");
  const [users, setUsers] = useState<User[]>([]);
  const [questionSets, setQuestionSets] = useState<QuestionSetData[]>([]);
  const [selectedUser, setSelectedUser] = useState<{
    label: string;
    value: string;
  } | null>(null);
  const [selectedQuestionSet, setSelectedQuestionSet] = useState<{
    label: string;
    value: string;
  } | null>(null);
  const [filterQuestionSetId, setFilterQuestionSetId] = useState<{
    label: string;
    value: string;
  } | null>(null);
  const [selectedResultDetails, setSelectedResultDetails] =
    useState<UserResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isTableCollapsed, setIsTableCollapsed] = useState<boolean>(false);

  useEffect(() => {
    fetchUsers();
    fetchQuestionSets();
  }, []);

  useEffect(() => {
    if (viewBy === "userId" && selectedUser) {
      setSelectedResultDetails(null); // Clear user details when changing user
      fetchResultsByUserId(selectedUser.value);
    } else if (viewBy === "questionId" && selectedQuestionSet) {
      fetchResultsByQuestionSetId(selectedQuestionSet.value);
    }
  }, [viewBy, selectedUser, selectedQuestionSet]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        "https://mocarps.azurewebsites.net/user"
      );
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchQuestionSets = async () => {
    try {
      const response = await axios.get(
        "https://mocarps.azurewebsites.net/questionSet"
      );
      setQuestionSets(response.data);
    } catch (error) {
      console.error("Error fetching question sets:", error);
    }
  };

  const fetchResultsByUserId = async (userId: string) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://mocarps.azurewebsites.net/quizResult/user/${userId}`
      );
      console.log("Response data by userId:", response.data);
      if (response.data && Array.isArray(response.data.quizResult)) {
        const data = await mapUserResults(response.data);
        setResults(data);
      } else {
        console.error(
          "Expected an object with quizResult array, but got:",
          response.data
        );
      }
    } catch (error) {
      console.error("Error fetching results by userId:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchResultsByQuestionSetId = async (questionSetId: string) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://mocarps.azurewebsites.net/quizResult/questionSet/${questionSetId}`
      );
      console.log("Response data by questionSetId:", response.data);
      if (response.data && Array.isArray(response.data.quizResult)) {
        const data = await mapQuestionSetResults(
          response.data,
          response.data.questionSet
        );
        setResults(data);
      } else {
        console.error(
          "Expected an object with quizResult array, but got:",
          response.data
        );
      }
    } catch (error) {
      console.error("Error fetching results by questionSetId:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchResultDetails = async (resultId: number) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://mocarps.azurewebsites.net/quizResult/detail/${resultId}`
      );
      console.log("Response data for result details:", response.data);
      setSelectedResultDetails(response.data);
      setIsTableCollapsed(true);
    } catch (error) {
      console.error("Error fetching result details:", error);
    } finally {
      setLoading(false);
    }
  };

  const mapUserResults = async (data: { quizResult: any[]; user: User }) => {
    const userResponses = data.quizResult.map((result) => ({
      ...result,
      user: data.user,
      questionSetId: result.questionSet?.id,
      questionSetName: result.questionSet?.name,
      completedAt: result.completedAt,
      score: result.score,
    }));
    return userResponses;
  };

  const mapQuestionSetResults = async (
    data: { quizResult: any[]; questionSet: QuestionSetData },
    questionSet: QuestionSetData
  ) => {
    const userResponses = await Promise.all(
      data.quizResult.map(async (result, index) => {
        const userResponse = await axios.get(
          `https://mocarps.azurewebsites.net/user/${result.userId}`
        );
        return {
          ...result,
          user: userResponse.data,
          key: `${result.userId}-${index}`,
        };
      })
    );
    const averageScore = calculateAverageScore(userResponses);
    return { questionSet, averageScore, results: userResponses };
  };

  const calculateAverageScore = (results: QuestionSetResult[]) => {
    const highestScoresByUser = calculateHighestScoreByUser(results);
    const highestScores = Object.values(highestScoresByUser);
    return (
      highestScores.reduce((acc, score) => acc + score, 0) /
      highestScores.length
    );
  };

  const calculateScores = (results: QuestionSetResult[]) => {
    const highestScoresByUser = calculateHighestScoreByUser(results);
    const highestScores = Object.values(highestScoresByUser);
    const highestScore = Math.max(...highestScores);
    const lowestScore = Math.min(...highestScores);
    const averageScore = calculateAverageScore(results);
    return { highestScore, lowestScore, averageScore };
  };

  const calculateHighestScoreByUser = (results: QuestionSetResult[]) => {
    const highestScores: { [key: string]: number } = {};
    results.forEach((result) => {
      if (
        !highestScores[result.userId] ||
        highestScores[result.userId] < result.score
      ) {
        highestScores[result.userId] = result.score;
      }
    });
    return highestScores;
  };

  const userOptions = users.map((user) => ({
    label: `${user.name} (${user.id})`,
    value: user.id,
  }));

  const questionSetOptions = questionSets.map((questionSet) => ({
    label: `${questionSet.name} - ${questionSet.description} (${questionSet.id})`,
    value: questionSet.id,
  }));

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const calculateCorrectAnswers = (answers: Answer[]) => {
    return answers.filter((answer) => answer.option.isCorrect).length;
  };

  return (
    <div className="quiz">
      <div className="quiz-Info">
        <h1>Quiz Result</h1>
        <div>
          <label>
            View by:
            <select
              value={viewBy}
              onChange={(e) =>
                setViewBy(e.target.value as "userId" | "questionId")
              }
            >
              <option value="userId">User</option>
              <option value="questionId">Quiz</option>
            </select>
          </label>
          {viewBy === "userId" ? (
            <Select
              styles={customStyles}
              options={userOptions}
              value={selectedUser}
              onChange={(selectedOption) => setSelectedUser(selectedOption)}
              placeholder="Select User"
              isClearable
            />
          ) : (
            <Select
              styles={customStyles}
              options={questionSetOptions}
              value={selectedQuestionSet}
              onChange={(selectedOption) =>
                setSelectedQuestionSet(selectedOption)
              }
              placeholder="Select Quiz"
              isClearable
            />
          )}
          {viewBy === "userId" && (
            <Select
              styles={customStyles}
              options={questionSetOptions}
              value={filterQuestionSetId}
              onChange={(selectedOption) =>
                setFilterQuestionSetId(selectedOption)
              }
              placeholder="Filter by Quiz"
              isClearable
            />
          )}
        </div>
      </div>
      <div className="quiz-Content">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : viewBy === "userId" && results && Array.isArray(results) ? (
          <>
            <div className="section">
              <button
                className="toggle-button"
                onClick={() => setIsTableCollapsed(!isTableCollapsed)}
              >
                {isTableCollapsed ? "Expand Table" : "Collapse Table"}
              </button>
              {!isTableCollapsed && (
                <table>
                  <thead>
                    <tr>
                      <th>User ID</th>
                      <th>User Name</th>
                      <th>Quiz ID</th>
                      <th>Quiz Name</th>
                      <th>Completed At</th>
                      <th>Score</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results
                      .filter(
                        (result) =>
                          !filterQuestionSetId ||
                          result.questionSetId === filterQuestionSetId.value
                      )
                      .map((result: UserResult) => (
                        <tr key={`user-${result.id}`}>
                          <td>{result.user.id}</td>
                          <td>{result.user.name}</td>
                          <td>{result.questionSetId}</td>
                          <td>{result.questionSetName}</td>
                          <td>{formatDate(result.completedAt)}</td>
                          <td>{result.score}</td>
                          <td>
                            <img
                              className="view-icon"
                              src={ViewIcon}
                              alt="View"
                              onClick={() => {
                                fetchResultDetails(result.id);
                              }}
                            />
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>

            {selectedResultDetails && (
              <>
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
                        <td>{selectedResultDetails.user.id}</td>
                        <td>{selectedResultDetails.user.name}</td>
                        <td>{selectedResultDetails.user.email}</td>
                        <td>{selectedResultDetails.user.cardNumber}</td>
                        <td>
                          {selectedResultDetails.user.verified ? "Yes" : "No"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="section">
                  <h2>Answers Details</h2>
                  <table>
                    <thead>
                      <tr>
                        <th>Question Description</th>
                        <th>Option Keyword</th>
                        <th>Option Description</th>
                        <th>Is Correct</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedResultDetails.answers.map((answer) => (
                        <tr key={`answer-${answer.id}`}>
                          <td>{answer.question.description}</td>
                          <td>{answer.option.keyword}</td>
                          <td>{answer.option.description}</td>
                          <td>{answer.option.isCorrect ? "Yes" : "No"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="summary">
                  <p>
                    Correct Answers:{" "}
                    {calculateCorrectAnswers(selectedResultDetails.answers)}
                  </p>
                  <p>Total Score: {selectedResultDetails.score}</p>
                </div>
              </>
            )}
          </>
        ) : viewBy === "questionId" && results && !Array.isArray(results) ? (
          <>
            <div className="section">
              <h2>Quiz Details</h2>
              <table>
                <thead>
                  <tr>
                    <th>Quiz ID</th>
                    <th>Quiz Name</th>
                    <th>Description</th>
                    <th>Published At</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{results.questionSet.id}</td>
                    <td>{results.questionSet.name}</td>
                    <td>{results.questionSet.description}</td>
                    <td>{formatDate(results.questionSet.publishedAt)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="section">
              <h2>User Answer Details</h2>
              <table>
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>User Name</th>
                    <th>Score</th>
                    <th>Completed At</th>
                  </tr>
                </thead>
                <tbody>
                  {results.results.map((result, index) => (
                    <tr key={`question-${result.userId}-${index}`}>
                      <td>{result.user.id}</td>
                      <td>{result.user.name}</td>
                      <td>{result.score}</td>
                      <td>{formatDate(result.completedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="summary">
              <h2>Summary</h2>
              {(() => {
                const { highestScore, lowestScore, averageScore } =
                  calculateScores(results.results);
                return (
                  <>
                    <p>Average Score: {averageScore}</p>
                    <p>Lowest Score: {lowestScore}</p>
                    <p>Highest Score: {highestScore}</p>
                  </>
                );
              })()}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default Quiz;
