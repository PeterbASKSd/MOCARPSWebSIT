import axios from "axios";
import React, { useEffect, useState, ChangeEvent } from "react";
import { CustomGridColDef } from "../../data";
import Swal from "sweetalert2";
import "./questionForm.scss";

type Props = {
  slug: string;
  rows: any;
  allRows?: any;
  columns: CustomGridColDef[]; // Replace "MyInterface" with the actual interface name or a valid type
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setRow: React.Dispatch<React.SetStateAction<any>>;
  name: string;
  questionID?: number;
  editingQuestion?: number;
};

const OptionAddForm = (props: Props) => {
  const [formData, setFormData] = useState<FormData>(new FormData());
  const [editing, setEditing] = useState<boolean>(false);
  const [value, setValue] = useState<string>("");

  useEffect(() => {
    console.log("formData", formData);
    console.log("props.rows", props.rows);
    console.log("props.allrows", props.allRows);
    console.log(
      "props.editingQuestion:",
      props.editingQuestion !== undefined ? props.editingQuestion : undefined
    );
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const numberFields = props.columns
      .filter((column) => column.required && column.type === "number")
      .map((column) => column.field);

    const requiredFields = props.columns
      .filter((column) => column.required === true && column.type !== "number")
      .map((column) => column.field);

    const missingFields = requiredFields.filter(
      (field) => !(field in formData)
    );

    const missingHeaders = missingFields.map((field) => {
      const matchingColumn = props.columns.find(
        (column) => column.field === field
      );
      return matchingColumn ? matchingColumn.headerName : "";
    });

    await Promise.all([
      Promise.all(
        numberFields.map(async (field) => {
          if (!Object.keys(formData).includes(field)) {
            setFormData((prevData) => ({
              ...prevData,
              [field]: 0,
            }));
          }
        })
      ),
    ]);

    // Check for missing required fields
    if (missingFields.length > 0) {
      Swal.fire({
        title: "Error",
        text: `Please input missing fields with *: ${missingHeaders}`,
        icon: "error",
      });
      console.log("Missing Fields:", missingHeaders);
      return;
    }

    console.log("formData checking", formData);

    submitFormData(formData); // Implement this function to handle form submission
  };

  async function submitFormData(formData: any) {
    //if no questionID, then it is a new question
    setFormData((prevFormData) => ({
      ...prevFormData,
      questionId: props.questionID,
      jumpTo: 0,
    }));

    axios
      .put(
        `https://mocarps.azurewebsites.net/${props.slug}/${props.editingQuestion}`,
        formData
      )
      .then((response) => {
        if (response.status === 200) {
          console.log("Please check here Update file:", formData);
          Swal.fire({
            title: "Successfully added",
            icon: "success",
          });
          setEditing(false);

          props.setRow(
            props.allRows.map((row: any) => {
              if (row.id === props.editingQuestion) {
                // Assuming formData is already an object containing updated question data
                // Spread the existing row and formData, then update the options array
                return {
                  ...row,
                  ...formData,
                  options: [...row.options, formData], // Add newOption to the existing options array
                };
              }
              return row;
            })
          );

          props.setOpen(false);
        }
      })
      .catch((error) => {
        handleSubmissionError(error);
      });
  }

  function handleSubmissionError(error: any) {
    let message = "Something went wrong"; // Default error message

    if (axios.isAxiosError(error)) {
      const status = error.response?.status;

      switch (status) {
        case 400:
          message = "Please input the other title because it should be unique";
          break;
        case 401:
          message =
            "Please enter another card number or email, those already exist";
          break;
        case 404:
          message = "Not found";
          break;
        case 500:
          message = "Internal server error. Please try again later.";
          break;
        default:
          break; // Keep the default message
      }
    }

    Swal.fire("Error", message, "error");
  }

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setValue(value);
    setEditing(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setEditing(true);
  };

  return (
    <div className="edit-form">
      <div className="edit-model">
        <h1>Add Option</h1>
        <form onSubmit={handleSubmit}>
          {props.columns
            .filter((item) => item.input === true)
            .map((column) => (
              <div className="item" key={column.field}>
                {column.required ? (
                  <label>
                    {column.headerName} <label className="redStar">*</label>
                  </label>
                ) : (
                  <label>{column.headerName}</label>
                )}
                {column.type === "boolean" ? (
                  <select name={column.field} onChange={handleChange}>
                    <option value="true">True</option>
                    <option value="false">False</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    name={column.field}
                    placeholder={column.inputHint}
                    onChange={handleInputChange}
                  />
                )}
              </div>
            ))}
          <div className="item">
            <label className="postScript">Please enter all * field</label>
            <div className="button-group">
              <button className="save-button">
                <span>Submit</span>
              </button>
            </div>
          </div>
        </form>
        <button
          className="cancel-button"
          onClick={() => {
            if (editing) {
              Swal.fire({
                title: "Are you sure?",
                text: "You won't be able to revert this!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes, cancel it!",
              }).then((confirmed) => {
                if (confirmed.isConfirmed) {
                  props.setOpen(false);
                }
              });
            } else {
              props.setOpen(false);
            }
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default OptionAddForm;
