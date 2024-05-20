import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import "./quiz.scss";

type User = {
  id: string;
  name: string;
  email: string;
  cardNumber: string;
  verified: boolean;
};

type Answer = {
  questionId: string;
  resultId: string;
  optionId: string;
};

type UserResult = {
  userId: string;
  answers: Answer[];
  user: User;
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

  useEffect(() => {
    fetchUsers();
    fetchQuestionSets();
  }, []);

  useEffect(() => {
    if (viewBy === "userId" && selectedUser) {
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
    }
  };

  const fetchResultsByQuestionSetId = async (questionSetId: string) => {
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
    }
  };

  const mapUserResults = async (data: { quizResult: any[]; user: User }) => {
    const userResponses = await Promise.all(
      data.quizResult.map(async (result) => {
        console.log("Result item:", result);
        if (result.answers) {
          const questionsResponse = await Promise.all(
            result.answers.map(async (answer: any) => {
              const questionResponse = await axios.get(
                `https://mocarps.azurewebsites.net/questionSet/${answer.questionId}`
              );
              return { ...answer, question: questionResponse.data };
            })
          );
          return { ...result, user: data.user, answers: questionsResponse };
        } else {
          return { ...result, user: data.user, answers: [] };
        }
      })
    );
    return userResponses;
  };

  const mapQuestionSetResults = async (
    data: { quizResult: any[]; questionSet: QuestionSetData },
    questionSet: QuestionSetData
  ) => {
    const userResponses = await Promise.all(
      data.quizResult.map(async (result) => {
        const userResponse = await axios.get(
          `https://mocarps.azurewebsites.net/user/${result.userId}`
        );
        return { ...result, user: userResponse.data };
      })
    );
    const averageScore =
      userResponses.reduce((acc, result) => acc + result.score, 0) /
      userResponses.length;
    return { questionSet, averageScore, results: userResponses };
  };

  const userOptions = users.map((user) => ({
    label: `${user.name} (${user.id})`,
    value: user.id,
  }));

  const questionSetOptions = questionSets.map((questionSet) => ({
    label: `${questionSet.name} - ${questionSet.description} (${questionSet.id})`,
    value: questionSet.id,
  }));

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
              <option value="questionId">Question Set</option>
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
              placeholder="Select Question Set"
              isClearable
            />
          )}
        </div>
      </div>
      <div className="quiz-Content">
        {viewBy === "userId" && results && Array.isArray(results) ? (
          <table>
            <thead>
              <tr>
                <th>User ID</th>
                <th>User Name</th>
                <th>Question ID</th>
                <th>Result ID</th>
                <th>Option ID</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result: UserResult) => (
                <React.Fragment key={result.userId}>
                  <tr>
                    <td>{result.user.id}</td>
                    <td>{result.user.name}</td>
                  </tr>
                  {result.answers.map((answer: Answer) => (
                    <tr key={`${answer.resultId}-${answer.questionId}`}>
                      <td></td>
                      <td></td>
                      <td>{answer.questionId}</td>
                      <td>{answer.resultId}</td>
                      <td>{answer.optionId}</td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        ) : viewBy === "questionId" && results && !Array.isArray(results) ? (
          <table>
            <thead>
              <tr>
                <th>Question Set ID</th>
                <th>Question Set Name</th>
                <th>Average Score</th>
                <th>User Name</th>
                <th>Score</th>
                <th>Completed At</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{results.questionSet.id}</td>
                <td>{results.questionSet.name}</td>
                <td>{results.averageScore}</td>
              </tr>
              {results.results.map((result: QuestionSetResult) => (
                <tr key={`${result.userId}-${result.score}`}>
                  <td>{result.user.name}</td>
                  <td>{result.score}</td>
                  <td>{result.completedAt}</td>
                  <td>{result.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </div>
    </div>
  );
};

export default Quiz;
