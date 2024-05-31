import { useState, useEffect } from "react";
import axios from "axios";
import ViewIcon from "/src/assets/view.svg";
import ExpandIcon from "/src/assets/expand.svg";
import CollapseIcon from "/src/assets/collapse.svg";
import AscendingIcon from "/src/assets/ascending.svg";
import DescendingIcon from "/src/assets/descending.svg";
import "./quiz.scss";
import { useNavigate, useLocation } from "react-router-dom";

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

type QuestionSetData = {
  id: string;
  name: string;
  description: string;
  publishedAt: string;
};

type SortConfig = {
  key: keyof UserResult | "user.name" | "questionSet.name" | null;
  direction: "ascending" | "descending";
};

const Quiz = () => {
  const [results, setResults] = useState<UserResult[] | null>(null);
  const [filteredResults, setFilteredResults] = useState<UserResult[] | null>(
    null
  );
  const [users, setUsers] = useState<User[]>([]);
  const [questionSets, setQuestionSets] = useState<QuestionSetData[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedQuestionSets, setSelectedQuestionSets] = useState<string[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [isTableCollapsed, setIsTableCollapsed] = useState<boolean>(false);
  const [isUserFilterCollapsed, setIsUserFilterCollapsed] =
    useState<boolean>(false);
  const [isQuizFilterCollapsed, setIsQuizFilterCollapsed] =
    useState<boolean>(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "completedAt",
    direction: "ascending",
  });
  const [activeTab, setActiveTab] = useState<"user" | "quiz">("user");
  const [groupedResultsExpanded, setGroupedResultsExpanded] = useState<{
    [key: string]: boolean;
  }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(10);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchUsers();
    fetchQuestionSets();
    loadSavedSelections();
  }, []);

  useEffect(() => {
    if (selectedUsers.length > 0) {
      fetchResultsByUserIds(selectedUsers);
    }
  }, [selectedUsers]);

  useEffect(() => {
    if (selectedQuestionSets.length > 0) {
      filterResultsByQuestionSet(selectedQuestionSets);
    } else {
      setFilteredResults(results);
    }
  }, [selectedQuestionSets, results]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        "https://mocarps.azurewebsites.net/user"
      );
      const sortedUsers = response.data.sort((a: User, b: User) =>
        a.name.localeCompare(b.name)
      );
      setUsers(sortedUsers);
      if (!location.state) {
        setSelectedUsers(sortedUsers.map((user: User) => user.id)); // Select all users by default
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchQuestionSets = async () => {
    try {
      const response = await axios.get(
        "https://mocarps.azurewebsites.net/questionSet"
      );
      const sortedQuestionSets = response.data.sort(
        (a: QuestionSetData, b: QuestionSetData) => a.name.localeCompare(b.name)
      );
      setQuestionSets(sortedQuestionSets);
      if (!location.state) {
        setSelectedQuestionSets(sortedQuestionSets.map((qs: any) => qs.id)); // Select all question sets by default
      }
    } catch (error) {
      console.error("Error fetching question sets:", error);
    }
  };

  const fetchResultsByUserIds = async (userIds: string[]) => {
    setLoading(true);
    try {
      const results: UserResult[] = [];
      for (const userId of userIds) {
        const response = await axios.get(
          `https://mocarps.azurewebsites.net/quizResult/user/${userId}`
        );
        if (response.data && Array.isArray(response.data.quizResult)) {
          const userResults = await mapUserResults(response.data);
          results.push(...userResults);
        }
      }
      setResults(results);
      setFilteredResults(results);
    } catch (error) {
      console.error("Error fetching results by userIds:", error);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const handleUserSelection = (userId: string) => {
    setSelectedUsers((prevSelectedUsers) =>
      prevSelectedUsers.includes(userId)
        ? prevSelectedUsers.filter((id) => id !== userId)
        : [...prevSelectedUsers, userId]
    );
  };

  const handleSelectAllUsers = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((user) => user.id));
    }
  };

  const handleQuizSelection = (questionSetId: string) => {
    setSelectedQuestionSets((prevSelectedQuestionSets) =>
      prevSelectedQuestionSets.includes(questionSetId)
        ? prevSelectedQuestionSets.filter((id) => id !== questionSetId)
        : [...prevSelectedQuestionSets, questionSetId]
    );
  };

  const handleSelectAllQuizzes = () => {
    if (selectedQuestionSets.length === questionSets.length) {
      setSelectedQuestionSets([]);
    } else {
      setSelectedQuestionSets(questionSets.map((qs) => qs.id));
    }
  };

  const sortData = (
    key: keyof UserResult | "user.name" | "questionSet.name"
  ) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const filterResultsByQuestionSet = (selectedQuestionSets: string[]) => {
    if (results) {
      const filteredResults = results.filter((result) =>
        selectedQuestionSets.includes(result.questionSetId)
      );
      setFilteredResults(filteredResults);
    }
  };

  let sortableResults = Array.isArray(filteredResults)
    ? [...filteredResults]
    : [];

  if (sortConfig.key) {
    sortableResults.sort((a, b) => {
      const getNestedValue = (obj: any, key: string) => {
        return key.split(".").reduce((o, k) => (o ? o[k] : null), obj);
      };

      const aValue =
        sortConfig.key && sortConfig.key.includes(".")
          ? getNestedValue(a, sortConfig.key)
          : a[sortConfig.key as keyof UserResult];
      const bValue =
        sortConfig.key && sortConfig.key.includes(".")
          ? getNestedValue(b, sortConfig.key)
          : b[sortConfig.key as keyof UserResult];

      if (sortConfig.key === "completedAt") {
        return sortConfig.direction === "ascending"
          ? new Date(aValue).getTime() - new Date(bValue).getTime()
          : new Date(bValue).getTime() - new Date(aValue).getTime();
      }

      if (aValue < bValue) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });
  }

  // Calculate statistics for summary box
  const calculateStatistics = (results: UserResult[]) => {
    const scores = results.map((result) => result.score);
    const count = scores.length;
    const average = scores.reduce((acc, score) => acc + score, 0) / count || 0;
    const median = (() => {
      const sorted = [...scores].sort((a, b) => a - b);
      const middle = Math.floor(sorted.length / 2);
      if (sorted.length % 2 === 0) {
        return (sorted[middle - 1] + sorted[middle]) / 2;
      }
      return sorted[middle];
    })();
    const stdDev = Math.sqrt(
      scores.reduce((acc, score) => acc + Math.pow(score - average, 2), 0) /
        count
    );
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);
    const highestScoreByUser = calculateHighestScoreByUser(results);

    return {
      count,
      average,
      median,
      stdDev,
      highestScore,
      lowestScore,
      highestScoreByUser,
    };
  };

  const calculateHighestScoreByUser = (results: UserResult[]) => {
    const highestScores: { [key: string]: number } = {};
    results.forEach((result) => {
      if (
        !highestScores[result.userId] ||
        highestScores[result.userId] < result.score
      ) {
        highestScores[result.userId] = result.score;
      }
    });
    const highestScoresArray = Object.values(highestScores);
    const highestScoreAverage =
      highestScoresArray.reduce((acc, score) => acc + score, 0) /
        highestScoresArray.length || 0;
    return highestScoreAverage;
  };

  const groupedResults = sortableResults.reduce((acc, result) => {
    if (!acc[result.questionSetName]) {
      acc[result.questionSetName] = [];
    }
    acc[result.questionSetName].push(result);
    return acc;
  }, {} as Record<string, UserResult[]>);

  const saveSelections = () => {
    sessionStorage.setItem("selectedUsers", JSON.stringify(selectedUsers));
    sessionStorage.setItem(
      "selectedQuestionSets",
      JSON.stringify(selectedQuestionSets)
    );
  };

  const loadSavedSelections = () => {
    const savedSelectedUsers = sessionStorage.getItem("selectedUsers");
    const savedSelectedQuestionSets = sessionStorage.getItem(
      "selectedQuestionSets"
    );

    if (savedSelectedUsers) {
      setSelectedUsers(JSON.parse(savedSelectedUsers));
    }

    if (savedSelectedQuestionSets) {
      setSelectedQuestionSets(JSON.parse(savedSelectedQuestionSets));
    }
  };

  const handleResultsPerPageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setResultsPerPage(parseInt(event.target.value));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const padWithLeadingZeros = (num: number | string, totalLength: number) => {
    return String(num).padStart(totalLength, "0");
  };

  const totalUsers = users.length;
  const totalQuestionSets = questionSets.length;

  const indexOfLastResult = currentPage * resultsPerPage;
  const indexOfFirstResult = indexOfLastResult - resultsPerPage;
  const currentResults = sortableResults.slice(
    indexOfFirstResult,
    indexOfLastResult
  );

  return (
    <div className="quiz">
      <div className="quiz-Info">
        <h1>Quiz Result</h1>
      </div>
      <div className="quiz-Content">
        <div className="quiz-List">
          <div className="header">
            <div className="header-name">
              <h2>User List</h2>
            </div>
            <div className="header-action">
              <button
                className="toggle-button"
                onClick={() => setIsTableCollapsed(!isTableCollapsed)}
              >
                <img
                  src={isTableCollapsed ? ExpandIcon : CollapseIcon}
                  alt="Toggle"
                />
              </button>
            </div>
          </div>
          {loading ? (
            <div className="loading">Loading...</div>
          ) : filteredResults ? (
            <>
              <div className="section">
                {!isTableCollapsed && (
                  <table>
                    <thead>
                      <tr>
                        <th>User ID</th>
                        <th onClick={() => sortData("user.name")}>
                          User Name{" "}
                          {sortConfig.key === "user.name" && (
                            <div className="sort-icon">
                              <img
                                src={
                                  sortConfig.direction === "ascending"
                                    ? AscendingIcon
                                    : DescendingIcon
                                }
                                alt="Sort"
                              />
                            </div>
                          )}
                        </th>
                        <th>Quiz ID</th>
                        <th onClick={() => sortData("questionSet.name")}>
                          Quiz Name{" "}
                          {sortConfig.key === "questionSet.name" && (
                            <div className="sort-icon">
                              <img
                                src={
                                  sortConfig.direction === "ascending"
                                    ? AscendingIcon
                                    : DescendingIcon
                                }
                                alt="Sort"
                              />
                            </div>
                          )}
                        </th>
                        <th onClick={() => sortData("completedAt")}>
                          Completed Date{" "}
                          {sortConfig.key === "completedAt" && (
                            <div className="sort-icon">
                              <img
                                src={
                                  sortConfig.direction === "ascending"
                                    ? AscendingIcon
                                    : DescendingIcon
                                }
                                alt="Sort"
                              />
                            </div>
                          )}
                        </th>
                        <th onClick={() => sortData("score")}>
                          Score{" "}
                          {sortConfig.key === "score" && (
                            <div className="sort-icon">
                              <img
                                src={
                                  sortConfig.direction === "ascending"
                                    ? AscendingIcon
                                    : DescendingIcon
                                }
                                alt="Sort"
                              />
                            </div>
                          )}
                        </th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentResults.map((result: UserResult) => (
                        <tr key={`user-${result.id}`}>
                          <td>
                            {padWithLeadingZeros(
                              result.user.id,
                              totalUsers.toString().length
                            )}
                          </td>
                          <td>{result.user.name}</td>
                          <td>
                            {padWithLeadingZeros(
                              result.questionSetId,
                              totalQuestionSets.toString().length
                            )}
                          </td>
                          <td>{result.questionSetName}</td>
                          <td>{formatDate(result.completedAt)}</td>
                          <td>{result.score}</td>
                          <td>
                            <img
                              className="view-icon"
                              src={ViewIcon}
                              alt="View"
                              onClick={() => {
                                saveSelections(); // Save selections before navigating
                                navigate(`/quiz/${result.id}`, {
                                  state: {
                                    selectedUsers,
                                    selectedQuestionSets,
                                  },
                                });
                              }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {!isTableCollapsed && (
                  <div className="pagination">
                    <span className="records-count">
                      number of filtering record(s): {sortableResults.length}
                    </span>
                    <div className="pagination-controls">
                      <button
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                        className="page-button"
                      >
                        Previous
                      </button>
                      <span>
                        Page {currentPage} of{" "}
                        {Math.ceil(sortableResults.length / resultsPerPage)}
                      </span>
                      <button
                        disabled={
                          currentPage ===
                          Math.ceil(sortableResults.length / resultsPerPage)
                        }
                        onClick={() => handlePageChange(currentPage + 1)}
                        className="page-button"
                      >
                        Next
                      </button>
                    </div>
                    <div className="pagination-page-showing">
                      <select
                        value={resultsPerPage}
                        onChange={handleResultsPerPageChange}
                        className="page-select"
                      >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
              <div className="summary-boxes">
                {Object.entries(groupedResults).map(
                  ([questionSetName, results]) => {
                    const stats = calculateStatistics(results);
                    const isExpanded = groupedResultsExpanded[questionSetName];
                    return (
                      <div className="summary-box" key={questionSetName}>
                        <div
                          className="summary-box-header"
                          onClick={() =>
                            setGroupedResultsExpanded({
                              ...groupedResultsExpanded,
                              [questionSetName]: !isExpanded,
                            })
                          }
                        >
                          <h3>{questionSetName}</h3>
                          <img
                            src={isExpanded ? CollapseIcon : ExpandIcon}
                            alt="Toggle"
                          />
                        </div>
                        {isExpanded && (
                          <div className="summary-box-content">
                            <div className="summary-item">
                              <span>Number of Attempts:</span>
                              <span>{stats.count}</span>
                            </div>
                            <div className="summary-item">
                              <span>Average:</span>
                              <span>{stats.average.toFixed(2)}</span>
                            </div>
                            <div className="summary-item">
                              <span>Median:</span>
                              <span>{stats.median.toFixed(2)}</span>
                            </div>
                            <div className="summary-item">
                              <span>Standard Deviation:</span>
                              <span>{stats.stdDev.toFixed(2)}</span>
                            </div>
                            <div className="summary-item">
                              <span>Highest Score:</span>
                              <span>{stats.highestScore}</span>
                            </div>
                            <div className="summary-item">
                              <span>Lowest Score:</span>
                              <span>{stats.lowestScore}</span>
                            </div>
                            <div className="summary-item">
                              <span>
                                Average Of Selected Uers' Highest Score
                              </span>
                              <span>{stats.highestScoreByUser.toFixed(2)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            </>
          ) : null}
        </div>
        <div className="quiz-Filter">
          <div className="filter-tabs">
            <button
              className={`tab-button ${activeTab === "user" ? "active" : ""}`}
              onClick={() => setActiveTab("user")}
            >
              User Filter
            </button>
            <button
              className={`tab-button ${activeTab === "quiz" ? "active" : ""}`}
              onClick={() => setActiveTab("quiz")}
            >
              Quiz Filter
            </button>
          </div>
          {activeTab === "user" ? (
            <div className="user-Filter">
              <div
                className="filter-header"
                onClick={() => setIsUserFilterCollapsed(!isUserFilterCollapsed)}
              >
                <h3>Username</h3>
                <img
                  src={isUserFilterCollapsed ? ExpandIcon : CollapseIcon}
                  alt="Toggle"
                />
              </div>
              {!isUserFilterCollapsed && (
                <div className="filter-content">
                  <label>
                    <span>Select All Users</span>
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === users.length}
                      onChange={handleSelectAllUsers}
                    />
                  </label>
                  {users.map((user, _) => (
                    <label key={user.id}>
                      <span>
                        {padWithLeadingZeros(
                          user.id,
                          totalUsers.toString().length
                        )}
                        : {user.name}
                      </span>
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleUserSelection(user.id)}
                      />
                    </label>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="quiz-Filter">
              <div
                className="filter-header"
                onClick={() => setIsQuizFilterCollapsed(!isQuizFilterCollapsed)}
              >
                <h3>Quiz</h3>
                <img
                  src={isQuizFilterCollapsed ? ExpandIcon : CollapseIcon}
                  alt="Toggle"
                />
              </div>
              {!isQuizFilterCollapsed && (
                <div className="filter-content">
                  <label>
                    <span>Select All Quizzes</span>
                    <input
                      type="checkbox"
                      checked={
                        selectedQuestionSets.length === questionSets.length
                      }
                      onChange={handleSelectAllQuizzes}
                    />
                  </label>
                  {questionSets.map((questionSet, _) => (
                    <label key={questionSet.id}>
                      <span>
                        {padWithLeadingZeros(
                          questionSet.id,
                          totalQuestionSets.toString().length
                        )}
                        : {questionSet.name} (
                        {
                          results?.filter(
                            (result) => result.questionSetId === questionSet.id
                          ).length
                        }
                        )
                      </span>
                      <input
                        type="checkbox"
                        checked={selectedQuestionSets.includes(questionSet.id)}
                        onChange={() => handleQuizSelection(questionSet.id)}
                      />
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quiz;
