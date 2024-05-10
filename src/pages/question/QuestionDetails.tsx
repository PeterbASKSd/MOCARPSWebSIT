import "./questionDetails.scss";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import ReturnIcon from "../../assets/back.svg";
import EditIcon from "../../assets/edit.svg";
import DeleteIcon from "../../assets/delete.svg";
import AddIcon from "../../assets/add.svg";
import { questionDetailColumns, OptionsNode, optionColumns } from "../../data";
import axios from "axios";
import QuestionForm from "../../components/questionForm/QuestionForm";
import QuestionEditForm from "../../components/questionForm/QuestionEditForm";
import OptionAddForm from "../../components/questionForm/OptionAddForm";

const QuestionDetails = () => {
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const { id } = location.state || {};
  const navigate = useNavigate();
  const [change, setChange] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const [openQuestionAdd, setOpenQuestionAdd] = useState<boolean>(false);
  const [openQuestionEdit, setOpenQuestionEdit] = useState<boolean>(false);
  const [openOptionAdd, setOpenOptionAdd] = useState<boolean>(false);
  const [published, setPublished] = useState<boolean>(false);
  const [editingQuestion, setEditingQuestion] = useState<number>(0);
  const [editOptionId, setEditOptionId] = useState(null);
  const [editedOption, setEditedOption] = useState({
    keyword: "",
    description: "",
  });
  const [editStates, setEditStates] = useState({});

  useEffect(() => {
    console.log("Id: ", id);
    console.log("Question: ", rows);
  });

  const fetchRowsFromAPI = async () => {
    try {
      const response = await fetch(
        "https://mocarps.azurewebsites.net/questionSet/" + id
      );
      if (!response.ok) {
        throw new Error("Failed to fetch rows from API");
      }
      const data = await response.json();
      setRows(data.questions);
      setPublished(data.published);
    } catch (error) {
      console.error("Error fetching rows:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditQuestion = (questionId: any) => {
    // Logic to handle question edit
    console.log("Editing question with ID:", questionId);
    // You can use navigate function here if you have a separate edit page
    // navigate(`/edit-question/${questionId}`);
  };

  const handleDeleteQuestion = (questionId: any) => {
    // Logic to handle question delete
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
        // Here you would call an API to delete the question
        // After that, fetch the updated list of questions
      }
    });
  };

  const handleDeleteOption = (questionId: any, optionID: any) => {
    // Logic to handle question delete
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
        try {
          setRows((prevRows) =>
            prevRows.map((question) => {
              if (question.id === questionId) {
                question.options = question.options.filter(
                  (option: any) => option.id !== optionID
                );
              }
              return question;
            })
          );

          const updatedQuestion = rows.find(
            (question) => question.id === questionId
          );
          console.log("Update option with question:", updatedQuestion);
          console.log("Update option with question ID:", questionId);
          axios.put(
            `https://mocarps.azurewebsites.net/questionSet/question/${questionId}`,
            updatedQuestion
          );
          // Here you would call an API to delete the question
          // After that, fetch the updated list of questions
        } catch (error) {
          console.error("Error updating option:", error);
        }
      }
    });
  };

  const handleBackToQuestionSet = async () => {
    const navigateBack = () => {
      // Navigate back to the Information page
      navigate("/questionset");
    };

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
          // Discard changes and navigate back
          navigateBack();
        } else {
          return;
        }
      });
    } else {
      // No changes to save, just navigate back
      console.log("No changes");
      navigateBack();
    }
  };

  useEffect(() => {
    fetchRowsFromAPI();
  }, []);

  return (
    <div className="questionDetails">
      <div className="info">
        <h1>Question</h1>
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
      <div className="toolsbar">
        <button className="addButton" onClick={() => setOpenQuestionAdd(true)}>
          <img src={AddIcon} /> Add a new question
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="question-container">
          <div className="list-container">
            {rows.map((question) => (
              <div key={question.id} className="question-item">
                <div className="question-content">
                  <div className="question-info">
                    <span>{question.description}</span>
                  </div>
                  <div className="question-actions">
                    <button
                      className="actionButton"
                      onClick={() => {
                        setOpenQuestionEdit(true);
                        handleEditQuestion(question.id);
                        setEditingQuestion(question.id);
                        console.log("question.id:", question.id);
                      }}
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
                    <button
                      className="actionButton"
                      onClick={() => {
                        setOpenOptionAdd(true);
                        handleEditQuestion(question.id);
                        setEditingQuestion(question.id);
                        console.log("question.id:", question.id);
                      }}
                    >
                      <img src={AddIcon} alt="Add" />
                    </button>
                  </div>
                </div>
                <div className="options-container">
                  {question.options.map((option: OptionsNode) => (
                    <div key={option.id} className="option-item">
                      <div className="option-content">
                        <span>
                          <input
                            type="text"
                            value={option.keyword}
                            onChange={(e) =>
                              setEditedOption({
                                ...editedOption,
                                keyword: e.target.value,
                              })
                            }
                          />
                          <input
                            type="text"
                            value={option.description}
                            onChange={(e) =>
                              setEditedOption({
                                ...editedOption,
                                description: e.target.value,
                              })
                            }
                          />
                        </span>
                      </div>
                      <div className="option-actions">
                        {published ? null : (
                          <button
                            className="actionButton"
                            onClick={() =>
                              handleDeleteOption(question.id, option.id)
                            }
                          >
                            <img src={DeleteIcon} alt="Delete" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="edit-container ">
            {openQuestionAdd ? (
              <div className="edit-form">
                <div className="edit-content">
                  <QuestionForm
                    slug={"questionSet/question/add"} // Fix the concatenation of the slug prop
                    rows={rows}
                    setOpen={setOpenQuestionAdd}
                    setRow={setRows}
                    columns={questionDetailColumns}
                    name="Question"
                    questionID={id}
                  />
                </div>
              </div>
            ) : openQuestionEdit ? (
              <div className="edit-form">
                <div className="edit-content">
                  <QuestionEditForm
                    slug={"questionSet/question/"} // Fix the concatenation of the slug prop
                    rows={rows.find((row) => row.id === editingQuestion)} // Fix the syntax error and variable name
                    setOpen={setOpenQuestionEdit}
                    setRow={setRows}
                    allRows={rows}
                    columns={questionDetailColumns}
                    name="Question"
                    questionID={id}
                    editingQuestion={editingQuestion}
                  />
                </div>
              </div>
            ) : openOptionAdd ? (
              <div className="edit-form">
                <div className="edit-content">
                  <OptionAddForm
                    slug={"questionSet/question"} // Fix the concatenation of the slug prop
                    rows={rows.find((row) => row.id === editingQuestion)} // Fix the syntax error and variable name
                    setOpen={setOpenOptionAdd}
                    setRow={setRows}
                    allRows={rows}
                    columns={optionColumns}
                    name="Question"
                    questionID={id}
                    editingQuestion={editingQuestion}
                  />
                </div>
              </div>
            ) : null}
          </div>
          {openQuestionAdd && <div className="questionAddOverlay"></div>}
          {openQuestionEdit && <div className="questionAddOverlay"></div>}
          {openOptionAdd && <div className="questionAddOverlay"></div>}
        </div>
      )}
    </div>
  );
};

export default QuestionDetails;
