import "./add.scss";
import axios from "axios";
import React, { useState } from "react";
import { CustomGridColDef } from "../../data";
import Select from "react-select";
import PreviewModal from "react-media-previewer";
import preview from "../../assets/preview.svg";
import { IconButton } from "@mui/material";

type Props = {
  slug: string;
  columns: CustomGridColDef[];
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleAfterAddRow: (newRow: any) => void;
};

const Add = (props: Props) => {
  const [open, setOpen] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean | null>(null);
  const [formData, setFormData] = useState<FormData>(new FormData());
  const [file, setFile] = useState<File | undefined>(undefined);
  const [visible, setVisible] = useState(false);
  const [selectValue, setSelectValue] = useState(null);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [urls, setUrls] = useState<string | undefined>(undefined);
  const [conditionValue, setConditionValue] = useState<string | undefined>(
    undefined
  );

  const errorMessage = missingFields.join(", ");
  const fileFormData = new FormData();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const requiredFields = props.columns
      .filter((column) => column.required)
      .map((column) => column.field);

    const isAllFieldsPresent = requiredFields.every((field) =>
      Object.keys(formData).includes(field)
    );

    const missingFields = requiredFields.filter(
      (headerName) => !Object.keys(formData).includes(headerName)
    );
    setMissingFields(missingFields);

    if (
      !isAllFieldsPresent ||
      Object.values(formData).some((value) => value === "")
    ) {
      setIsSubmitted(false);
      return;
    } else {
      setIsSubmitted(true);

      console.log("Please check here 33333:", formData);

      if (file) {
        fileFormData.append("file", file);

        axios
          .post(`https://mocarps.azurewebsites.net/uploadFile`, fileFormData, {
            headers: {
              "Content-Type": "application/octet-stream",
            },
          })
          .then((response) => {
            const blobUrl = response.data.blobUrl;
            const updatedFormData = { ...formData };
            // const contentType = file.type;

            const replaceUrlsInFormData = (oldUrl: File, newUrl: string) => {
              Object.entries(updatedFormData).forEach(([key, value]) => {
                if (
                  typeof value === "string" &&
                  (value as string).includes(oldUrl.name)
                ) {
                  (updatedFormData as any)[key] = newUrl;
                  setFormData(updatedFormData);
                }
              });
            };

            replaceUrlsInFormData(file, blobUrl);

            axios
              .post(
                `https://mocarps.azurewebsites.net/${props.slug}`,
                updatedFormData
              )
              .then(() => {
                console.log("Please check here Update file:", updatedFormData);
                props.handleAfterAddRow(updatedFormData);
              })
              .catch((error) => {
                console.error(error);
              });
          })
          .catch((error) => {
            console.error(error);
          });
      } else {
        axios
          .post(`https://mocarps.azurewebsites.net/${props.slug}`, formData)
          .then(() => {
            props.handleAfterAddRow(formData);
          })
          .catch((error) => {
            console.error(error);
          });
      }
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
      setFile(selectedFile); // Convert the file to a URL
      setUrls(URL.createObjectURL(selectedFile)); // Convert the file to a URL
      setVisible(true); // Show the preview modal
      handleInputChange(e); // Update the formData
    } else {
      setVisible(false); // Hide the preview modal
      setFile(undefined); // Convert the file to a URL
    }
  };

  const handleFileAcceptance = (conditionValue: string) => {
    if (conditionValue === "image") {
      return ".jpg, .jpeg, .png";
    } else if (conditionValue === "audio") {
      return ".mp3, .m4a, .aac";
    } else if (conditionValue === "video") {
      return ".mp4";
    } else {
      return "";
    }
  };

  const handleButtonClick = () => {
    setOpen(true);
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
                {column.required ? (
                  <label>
                    {column.headerName} <label className="redStar">*</label>
                  </label>
                ) : (
                  <label>{column.headerName}</label>
                )}
                {column.type === "longText" ? (
                  <textarea
                    name={column.field}
                    placeholder={column.inputHint}
                    onChange={handleLongInputChange}
                  />
                ) : column.type === "file" ? (
                  !column.preCondition ? (
                    <div className="special-file">
                      <div className="uploadBox">
                        <input
                          className="uploadButton"
                          type="file"
                          name={column.field}
                          accept=".jpg, .jpeg, .svg, .png, .mp3, .mp4 .mov .avi"
                          onChange={handleFileChange}
                        />
                      </div>
                      <div className="previewBox">
                        <IconButton
                          className="previewButton"
                          onClick={() => {
                            handleButtonClick();
                            setVisible(true);
                          }}
                        >
                          <img
                            src={preview}
                            alt=""
                            className="previewButtonIcon"
                          />
                          <label className="previewButtonText">Preview</label>
                        </IconButton>
                        {open && (
                          <PreviewModal
                            visible={visible}
                            setVisible={() => {
                              setVisible(false);
                              setOpen(false);
                            }}
                            urls={[urls || ""]}
                          />
                        )}
                      </div>
                    </div>
                  ) : conditionValue !== undefined ? (
                    <div className="special-file">
                      <div className="uploadBox">
                        <input
                          className="uploadButton"
                          type="file"
                          name={column.field}
                          accept={handleFileAcceptance(conditionValue)}
                          onChange={handleFileChange}
                        />
                      </div>
                      <div className="previewBox">
                        <IconButton
                          className="previewButton"
                          onClick={() => {
                            handleButtonClick();
                            setVisible(true);
                          }}
                        >
                          <img
                            src={preview}
                            alt=""
                            className="previewButtonIcon"
                          />
                          <label className="previewButtonText">Preview</label>
                        </IconButton>
                        {open && (
                          <PreviewModal
                            visible={visible}
                            setVisible={() => {
                              setVisible(false);
                              setOpen(false);
                            }}
                            urls={[urls || ""]}
                          />
                        )}
                      </div>
                    </div>
                  ) : null
                ) : column.type === "options" ? (
                  column.isCondition ? (
                    <div className="special-option">
                      <Select
                        className="options"
                        defaultValue={selectValue}
                        onChange={(selectValue) => {
                          selectValue &&
                            handleOptionChange(
                              selectValue.value?.join(", "),
                              column.field
                            );
                          setConditionValue(selectValue?.value?.join(", "));
                        }}
                        options={
                          column.inputOptions?.map((option) => ({
                            value: [option],
                            label: [option],
                          })) || []
                        }
                      />
                    </div>
                  ) : (
                    <div className="special-option">
                      <Select
                        className="options"
                        defaultValue={selectValue}
                        onChange={(selectValue) =>
                          selectValue &&
                          handleOptionChange(
                            selectValue.value?.join(", "),
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
                  )
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
          <div className="item">
            <label className="postScript">
              Please enter all <label className="redStar">*</label> field
            </label>

            <button className="submit button1">
              <span>Submit</span>
            </button>

            {isSubmitted === false && (
              <div className="error">Please input {errorMessage}</div>
            )}

            {isSubmitted === true && (
              <div className="success">Successfully added</div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Add;
