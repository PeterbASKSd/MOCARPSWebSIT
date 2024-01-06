import "./add.scss";
import axios from "axios";
import React, { useState } from "react";
import { CustomGridColDef } from "../../data";
import Select from "react-select";
// import PreviewModal from "react-media-previewer";
import PreviewModal from "react-media-previewer";

type Props = {
  slug: string;
  columns: CustomGridColDef[];
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleAfterAddRow: (newRow: any) => void;
};

const Add = (props: Props) => {
  const [isSubmitted, setIsSubmitted] = useState<boolean | null>(null);
  const [formData, setFormData] = useState<object>({});
  const [file, setFile] = useState<string | undefined>(undefined);
  const [visible, setVisible] = useState(false);
  const [selectValue, setSelectValue] = useState(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
      setIsSubmitted(false);
      return;
    } else {
      setIsSubmitted(true);
      console.log(formData);
      axios
        .post(`https://mocarps.azurewebsites.net/${props.slug}`, formData)
        .then(() => {
          // console.log("Successfully added: ");
          props.handleAfterAddRow(formData);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

  const handleOptionChange = (selectValue: string, fieldName: string) => {
    setSelectValue(null);
    setFormData({
      ...formData,
      [fieldName]: selectValue,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLongInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(URL.createObjectURL(selectedFile)); // Convert the file to a URL
      setVisible(true); // Show the preview modal
      handleInputChange(e); // Update the formData
    } else {
      setVisible(false); // Hide the preview modal
      setFile(undefined); // Convert the file to a URL
    }
  };

  return (
    <div className="add">
      <div className="model">
        <span className="close" onClick={() => props.setOpen(false)}>
          x
        </span>
        <h1>Add new {props.slug}</h1>
        <form onSubmit={handleSubmit}>
          {props.columns
            .filter((item) => item.input === true)
            .map((column) => (
              <div className="item" key={column.field}>
                <label>{column.headerName}</label>
                {column.type === "longText" ? (
                  <textarea
                    name={column.field}
                    placeholder={column.inputHint}
                    onChange={handleLongInputChange}
                  />
                ) : column.type === "file" ? (
                  <div>
                    <div className="item">
                      <input
                        type="file"
                        name={column.field}
                        accept=".jpg, .jpeg, .svg, .png, .mp3, .mp4 .mov .avi"
                        onChange={handleFileChange}
                      />
                    </div>
                    <PreviewModal
                      visible={visible}
                      setVisible={() => setVisible(false)}
                      urls={[file || ""]}
                    />
                  </div>
                ) : column.type === "options" ? (
                  <div className="item">
                    <Select
                      className="options"
                      defaultValue={selectValue}
                      onChange={(selectValue) =>
                        selectValue &&
                        handleOptionChange(
                          selectValue.value.join(", "),
                          column.field
                        )
                      }
                      options={
                        column.inputOptions?.map((option) => ({
                          value: [option],
                          label: [option],
                        })) || []
                      }
                    />
                  </div>
                ) : column.type === "boolean" ? (
                  <div>
                    <input
                      className="checkbox"
                      type="checkbox"
                      name={column.field}
                    />
                    <div className="item">
                      <Select
                        className="options"
                        defaultValue={selectValue}
                        onChange={(selectValue) =>
                          selectValue &&
                          handleOptionChange(
                            selectValue.value.join(", "),
                            column.field
                          )
                        }
                        options={
                          column.inputOptions?.map((option) => ({
                            value: [option],
                            label: [option],
                          })) || []
                        }
                      />
                    </div>
                  </div>
                ) : column.type === "boolean" ? (
                  <input
                    className="checkbox"
                    type="checkbox"
                    name={column.field}
                    onChange={handleInputChange}
                  />
                ) : (
                  <input
                    type={column.type}
                    name={column.field}
                    placeholder={column.inputHint}
                    onChange={handleInputChange}
                  />
                )}
              </div>
            ))}
          <button type="submit">Submit</button>

          {isSubmitted === false && (
            <p className="error">Please input the keyword</p>
          )}

          {isSubmitted === true && (
            <p className="success">Successfully added</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Add;
