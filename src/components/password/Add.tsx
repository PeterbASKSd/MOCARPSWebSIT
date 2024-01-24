import "../edit/add.scss";
import axios from "axios";
import React, { useState, useEffect } from "react";
import { CustomGridColDef } from "../../data";
import Swal from "sweetalert2";
import "react-quill/dist/quill.snow.css";
import "../../styles/custom-quill.scss";
import katex from "katex";
import "katex/dist/katex.min.css";
window.katex = katex;

interface MyFormData {
  [key: string]: string | undefined;
}

type Props = {
  slug: string;
  columns: CustomGridColDef[];
  setKeyChange: React.Dispatch<React.SetStateAction<boolean>>;
  handleAfterAddRow: (newRow: any) => void;
  rows: object[];
  targetId: number;
};

const Add = (props: Props) => {
  const [formData, setFormData] = useState<MyFormData>({});

  const existFormData = () => {
    props.columns.forEach((column) => {
      const value = defaultValueByRowAndColumn(props.rows, column.field);
      setFormData((prevFormData) => ({
        ...prevFormData,
        [column.field]: value,
      }));
    });
  };

  useEffect(() => {
    existFormData();
  }, []);

  useEffect(() => {
    console.log("Please check here 33333:", formData);
  }, [formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedFormData = {
      ...formData,
      [e.target.name]: e.target.value,
    };
    setFormData(updatedFormData);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const requiredFields = props.columns
      .filter((column) => column.required)
      .map((column) => column.field);

    const isAllFieldsPresent = requiredFields.every((field) =>
      Object.keys(formData).includes(field)
    );

    if (
      !isAllFieldsPresent ||
      Object.values(formData).some((value) => value === "")
    ) {
      Swal.fire({
        title: "Please fill in all required fields",
      });
    } else {
      const password = (formData["password"] ?? "").trim();
      const passwordConfirm = (formData["passwordConfirm"] ?? "").trim();

      if (password !== passwordConfirm) {
        Swal.fire({
          title:
            "Please confirm whether the passwords entered twice are the same",
        });
      } else {
        Swal.fire({
          title: "Are you sure you want to change the password?",
          showDenyButton: false,
          showCancelButton: true,
          confirmButtonText: "Submit",
        }).then((result) => {
          if (result.isConfirmed) {
            Swal.fire("Submitted!");

            axios
              .post(
                `https://mocarps.azurewebsites.net/${props.slug}/reset-password`,
                formData
              )
              .then(() => {
                props.handleAfterAddRow(formData);
              })
              .catch((error) => {
                console.error(error);
              });
          }
        });
      }
    }
  };

  const defaultValueByRowAndColumn = (
    rows: any, // Add index signature to allow indexing with a string
    columnName: string
  ) => {
    return rows?.[columnName];
  };

  return (
    <div className="add">
      <div className="model">
        <span className="close" onClick={() => props.setKeyChange(false)}>
          x
        </span>
        <h1>Change Password</h1>
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
                <input
                  type={column.type}
                  name={column.field}
                  placeholder={column.inputHint}
                  onChange={handleInputChange}
                  value={formData[column.field]}
                  defaultValue={
                    defaultValueByRowAndColumn(props.rows, column.field) || ""
                  }
                  disabled={column.input === false}
                />
              </div>
            ))}
          <div className="item">
            <label className="postScript">
              Please enter all <label className="redStar">*</label> field
            </label>
            <div className="buttonArea">
              <button className="submit button1">
                <span>Save</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Add;
