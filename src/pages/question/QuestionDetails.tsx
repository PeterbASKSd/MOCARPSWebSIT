import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Toggle from "react-toggle";
import "react-toggle/style.css";
import ReturnIcon from "../../assets/back.svg";
import EditIcon from "../../assets/edit.svg";
import DeleteIcon from "../../assets/delete.svg";
import AddIcon from "../../assets/add.svg";
import Add2Icon from "../../assets/addBlack.svg";
import ExpandIcon from "../../assets/expand.svg";
import CollapseIcon from "../../assets/collapse.svg";
import axios from "axios";
import "./questionDetails.scss";
import QuestionForm from "../../components/questionForm/QuestionForm";
import { questionDetailColumns } from "../../data";

const QuestionDetails = () => {
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const { id, name } = location.state || {};
  const navigate = useNavigate();
  const [change, setChange] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const [openQuestionAdd, setOpenQuestionAdd] = useState<
    number | boolean | null
  >(null);
  const [published, setPublished] = useState<boolean>(false);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(
    new Set()
  );

  useEffect(() => {
    fetchRowsFromAPI();
  }, []);

  const fetchRowsFromAPI = async () => {
    console.log("Fetching rows from API...");
    try {
      const response = await fetch(
        `https://mocarps.azurewebsites.net/questionSet/${id}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch rows from API");
      }
      const data = await response.json();
      console.log("Fetched data:", data);
      setRows(data.questions || []);
      setPublished(data.published);
    } catch (error) {
      console.error("Error fetching rows:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditQuestion = (questionId: any) => {
    setOpenQuestionAdd(questionId);
  };

  const handleDeleteQuestion = (questionId: any) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        setRows((prevRows) =>
          prevRows.filter((question) => question.id !== questionId)
        );
        axios.delete(
          `https://mocarps.azurewebsites.net/questionSet/question/${questionId}`
        );
        console.log("Deleted question with ID:", questionId);
      }
    });
  };

  const handleDeleteOption = async (questionId: any, optionID: any) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const updatedRows = rows.map((question) => {
          if (question.id === questionId) {
            question.options = question.options
              .filter((option: any) => option.id !== optionID)
              .map((option: any, index: number) => ({
                ...option,
                keyword: String.fromCharCode(65 + index),
              }));
          }
          return question;
        });

        setRows(updatedRows);

        const updatedQuestion = updatedRows.find(
          (question) => question.id === questionId
        );
        if (updatedQuestion) {
          try {
            await axios.put(
              `https://mocarps.azurewebsites.net/questionSet/question/${questionId}`,
              updatedQuestion
            );
            console.log("Option deleted successfully");
          } catch (error) {
            console.error("Error deleting option:", error);
          }
        }
      }
    });
  };

  const getNextKeyword = (options: any[]) => {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const usedKeywords = options.map((option: any) => option.keyword);
    for (let i = 0; i < alphabet.length; i++) {
      if (!usedKeywords.includes(alphabet[i])) {
        return alphabet[i];
      }
    }
    return "";
  };

  const handleAddOption = async (questionId: any) => {
    let updatedRows = rows.map((question) => {
      if (question.id === questionId) {
        const newOption = {
          id: Date.now(),
          keyword: getNextKeyword(question.options),
          description: "",
          isCorrect: false,
          jumpTo: 0,
          questionId: questionId,
        };
        return {
          ...question,
          options: [...question.options, newOption],
        };
      }
      return question;
    });

    setRows(updatedRows);

    const updatedQuestion = updatedRows.find(
      (question) => question.id === questionId
    );
    if (updatedQuestion) {
      try {
        await axios.put(
          `https://mocarps.azurewebsites.net/questionSet/question/${questionId}`,
          updatedQuestion
        );
        console.log("Option added successfully");
      } catch (error) {
        console.error("Error adding option:", error);
      }
    }
  };

  const handleBackToQuestionSet = async () => {
    const navigateBack = () => {
      navigate("/questionset");
    };

    let valid = true;
    let errorMsg = "";

    rows.forEach((question) => {
      if (!question.options || question.options.length === 0) {
        valid = false;
        errorMsg = "Each question must have at least one option.";
      }

      if (!question.options.some((option: any) => option.isCorrect)) {
        valid = false;
        errorMsg = "Each question must have at least one correct answer.";
      }

      question.options.forEach((option: any) => {
        if (option.description.trim() === "") {
          valid = false;
          errorMsg = "Each option must have a description.";
        }
      });
    });

    if (!valid) {
      Swal.fire({
        title: "Validation Error",
        text: errorMsg,
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    if (change) {
      Swal.fire({
        title:
          "You have some unsaved edits, are you sure you want to leave or save?",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Save Changes",
        denyButtonText: "Discard Changes",
      }).then((result) => {
        if (result.isConfirmed) {
          console.log("Save changes");
          navigateBack();
        } else if (result.isDenied) {
          navigateBack();
        } else {
          return;
        }
      });
    } else {
      console.log("No changes");
      navigateBack();
    }
  };

  const handleExpandCollapse = (questionId: number) => {
    setExpandedQuestions((prev) => {
      const newExpandedQuestions = new Set(prev);
      if (newExpandedQuestions.has(questionId)) {
        newExpandedQuestions.delete(questionId);
      } else {
        newExpandedQuestions.add(questionId);
      }
      return newExpandedQuestions;
    });
  };

  const handleOptionChange = async (
    questionId: number,
    optionId: number,
    field: keyof any,
    value: any
  ) => {
    let updatedRows = rows.map((question) => {
      if (question.id === questionId) {
        question.options = question.options.map((option: any) =>
          option.id === optionId ? { ...option, [field]: value } : option
        );

        if (field === "isCorrect" && value) {
          question.options = question.options.map((option: any) =>
            option.id === optionId
              ? { ...option, isCorrect: true }
              : { ...option, isCorrect: false }
          );
        }
      }
      return question;
    });

    setRows(updatedRows);

    const updatedQuestion = updatedRows.find(
      (question) => question.id === questionId
    );
    if (updatedQuestion) {
      try {
        await axios.put(
          `https://mocarps.azurewebsites.net/questionSet/question/${questionId}`,
          updatedQuestion
        );
        console.log("Option updated successfully");
      } catch (error) {
        console.error("Error updating option:", error);
      }
    }
  };

  const handleQuestionFormSubmit = async () => {
    setOpenQuestionAdd(null);
    await fetchRowsFromAPI(); // Refetch data after form submission
  };

  // Determine if there are incomplete options
  const hasIncompleteOptions = rows.some((question) => {
    return question.options.some(
      (option: any) => !option.description.trim() || !option.isCorrect
    );
  });

  return (
    <div className="questionDetails">
      {hasIncompleteOptions && <div className="questionAddOverlay"></div>}
      <div className="info">
        <h1>{name}</h1>
        <button
          onClick={() => {
            handleBackToQuestionSet();
            setChange(false);
          }}
        >
          <img src={ReturnIcon} alt="Menu Icon" className="addButton" />
          Back to Question Set
        </button>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="questionDetails-content">
          <div className="toolsbar">
            <button
              className="addButton"
              onClick={() => setOpenQuestionAdd(true)}
            >
              <img src={AddIcon} /> Add a new question
            </button>
          </div>
          <div className="question-container">
            <div className="list-container">
              {rows.length === 0 ? (
                <p>This is an empty Question Set.</p>
              ) : (
                rows.map((question, questionIndex) => (
                  <div key={question.id} className="question-item">
                    <div className="question-content">
                      <div className="question-info">
                        <span style={{ marginRight: "10px" }}>
                          {"Q" + (questionIndex + 1) + ":"}
                        </span>
                        <span>
                          {question.description ||
                            "This is an empty Question Set."}
                        </span>
                      </div>
                      <div className="question-actions">
                        <button
                          className="actionButton"
                          onClick={() => handleEditQuestion(question.id)}
                        >
                          <img src={EditIcon} alt="Edit" />
                        </button>
                        {published ? null : (
                          <button
                            className="actionButton"
                            onClick={() => handleDeleteQuestion(question.id)}
                          >
                            <img src={DeleteIcon} alt="Delete" />
                          </button>
                        )}
                        {!question.options || question.options.length === 0 ? (
                          <button
                            className="actionButton"
                            onClick={() => handleAddOption(question.id)}
                          >
                            <img src={AddIcon} alt="Add" />
                          </button>
                        ) : null}
                        <button
                          className="actionButton"
                          onClick={() => handleExpandCollapse(question.id)}
                        >
                          {expandedQuestions.has(question.id) ? (
                            <img src={CollapseIcon} alt="Collapse" />
                          ) : (
                            <img src={ExpandIcon} alt="Expand" />
                          )}
                        </button>
                      </div>
                    </div>
                    {expandedQuestions.has(question.id) && (
                      <div className="options-container">
                        {question.options?.map(
                          (option: any, optionIndex: number) => (
                            <div key={option.id} className="option-item">
                              <div className="option-content">
                                <span>
                                  <span>{option.keyword}</span>
                                  <input
                                    type="text"
                                    value={option.description}
                                    placeholder="Please enter the option title"
                                    onChange={(e) =>
                                      handleOptionChange(
                                        question.id,
                                        option.id,
                                        "description",
                                        e.target.value
                                      )
                                    }
                                  />
                                  <select
                                    value={option.jumpTo}
                                    onChange={(e) =>
                                      handleOptionChange(
                                        question.id,
                                        option.id,
                                        "jumpTo",
                                        parseInt(e.target.value, 10)
                                      )
                                    }
                                  >
                                    <option value={0}>Next Question (0)</option>
                                    <option value={-1}>
                                      End of The Quiz (-1)
                                    </option>
                                    {rows.map((q, idx) => (
                                      <option key={q.id} value={q.id}>
                                        Jump to Q{idx + 1} - {q.description} (
                                        {q.questionType}, Score: {q.score})
                                      </option>
                                    ))}
                                  </select>
                                  <label>
                                    <Toggle
                                      checked={option.isCorrect}
                                      icons={false}
                                      onChange={(e) =>
                                        handleOptionChange(
                                          question.id,
                                          option.id,
                                          "isCorrect",
                                          e.target.checked
                                        )
                                      }
                                    />
                                    Correct Answer
                                  </label>
                                </span>
                                <div className="option-actions">
                                  {published ? null : (
                                    <>
                                      <button
                                        className="actionButton"
                                        onClick={() =>
                                          handleDeleteOption(
                                            question.id,
                                            option.id
                                          )
                                        }
                                      >
                                        <img src={DeleteIcon} alt="Delete" />
                                      </button>
                                      {optionIndex ===
                                        question.options.length - 1 && (
                                        <button
                                          className="actionButton"
                                          onClick={() =>
                                            handleAddOption(question.id)
                                          }
                                        >
                                          <img src={Add2Icon} alt="Add" />
                                        </button>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      {openQuestionAdd !== null && (
        <QuestionForm
          slug={"questionSet/question/add"}
          rows={rows}
          setOpen={setOpenQuestionAdd}
          setRow={setRows}
          columns={questionDetailColumns}
          name="Question"
          questionID={id}
          editingQuestionId={
            typeof openQuestionAdd === "number" ? openQuestionAdd : null
          }
          onSubmit={handleQuestionFormSubmit} // New prop for form submission
        />
      )}
    </div>
  );
};

export default QuestionDetails;
