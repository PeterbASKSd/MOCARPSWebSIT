import "../edit/add.scss";
import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import { CustomGridColDef } from "../../data";
import Select from "react-select";
import PreviewModal from "react-media-previewer";
import preview from "../../assets/preview.svg";
import { IconButton } from "@mui/material";
import Swal from "sweetalert2";

type Props = {
  slug: string;
  columns: CustomGridColDef[];
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleAfterAddRow: (newRow: any) => void;
  rows: object[];
  targetId: number;
};

const Add = (props: Props) => {
  const [open, setOpen] = useState<boolean>(false);
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  const handleReset = () => {
    Swal.fire({
      title: "It has been reset",
      showDenyButton: false,
      showCancelButton: false,
      confirmButtonText: "Confirm",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire("You can edit again!");
        resetFormData();
      }
    });
  };

  const resetFormData = () => {
    props.columns.forEach((column) => {
      const value = defaultValueByRowAndColumn(props.rows, column.field);
      setFormData((prevFormData) => ({
        ...prevFormData,
        [column.field]: value,
      }));
    });
  };

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
      Swal.fire({
        title: "Please input" + { errorMessage },
      });
    } else {
      Swal.fire({
        title: "Are you sure you want to edit this row?",
        showDenyButton: false,
        showCancelButton: true,
        confirmButtonText: "Submit",
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire("Submitted!");

          console.log("Please check here 44444:", formData);

          if (file) {
            fileFormData.append("file", file);

            axios
              .post(
                `https://mocarps.azurewebsites.net/uploadFile`,
                fileFormData,
                {
                  headers: {
                    "Content-Type": "application/octet-stream",
                  },
                }
              )
              .then((response) => {
                const blobUrl = response.data.blobUrl;
                const updatedFormData = { ...formData };
                // const contentType = file.type;

                const replaceUrlsInFormData = (
                  oldUrl: File,
                  newUrl: string
                ) => {
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
                  .put(
                    `https://mocarps.azurewebsites.net/${props.slug}/${props.targetId}`,
                    updatedFormData
                  )
                  .then(() => {
                    console.log(
                      "Please check here Update file:",
                      updatedFormData
                    );
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
              .put(
                `https://mocarps.azurewebsites.net/${props.slug}/${props.targetId}`,
                formData
              )
              .then(() => {
                props.handleAfterAddRow(formData);
              })
              .catch((error) => {
                console.error(error);
              });
          }
        }
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
      if (conditionValue === "video") {
        const video = document.createElement("video");
        video.preload = "metadata";

        video.onloadedmetadata = () => {
          window.URL.revokeObjectURL(video.src);

          const videoWidth = video.videoWidth;
          const videoHeight = video.videoHeight;

          if (videoWidth > 720 || videoHeight > 480) {
            // Display an error message for incorrect video resolution
            alert(
              "Video resolution should be limited to 480p (720x480) or below."
            );
            e.target.value = ""; // Reset the file input value
          } else {
            console.log("Please check here 11111:", selectedFile);
            setFile(selectedFile); // Convert the file to a URL
            setUrls(URL.createObjectURL(selectedFile)); // Convert the file to a URL
            setVisible(true); // Show the preview modal
            handleInputChange(e); // Update the formData
          }
        };

        video.src = URL.createObjectURL(selectedFile);
      } else if (
        conditionValue === "image" &&
        selectedFile.size > 1024 * 1024 * 2
      ) {
        // Display an error message for image file size limitation
        alert("Image file size should be limited to 2MB.");
        e.target.value = ""; // Reset the file input value
      } else if (
        conditionValue === "audio" &&
        selectedFile.size > 1024 * 1024 * 5
      ) {
        // Display an error message for audio file size limitation
        alert("Audio file size should be limited to 5MB.");
        e.target.value = ""; // Reset the file input value
      } else {
        console.log("Please check here 11111:", selectedFile);
        setFile(selectedFile); // Convert the file to a URL
        setUrls(URL.createObjectURL(selectedFile)); // Convert the file to a URL
        setVisible(true); // Show the preview modal
        handleInputChange(e); // Update the formData
      }
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

  const defaultValueByRowAndColumn = (
    rows: any, // Add index signature to allow indexing with a string
    columnName: string
  ) => {
    return rows?.[columnName];
  };

  return (
    <div className="add">
      <div className="model">
        <span className="close" onClick={() => props.setOpen(false)}>
          x
        </span>
        <h1>Edit Exist Entry</h1>
        <form onSubmit={handleSubmit}>
          {props.columns.map((column) => (
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
                  defaultValue={defaultValueByRowAndColumn(
                    props.rows,
                    column.field
                  )}
                />
              ) : column.type === "file" ? (
                !column.preCondition ? null : conditionValue !== undefined ? (
                  <div className="special-file">
                    <div className="uploadBox">
                      <input
                        ref={fileInputRef}
                        className="uploadButton"
                        type="file"
                        name={column.field}
                        accept={handleFileAcceptance(conditionValue)}
                        onChange={handleFileChange}
                      />
                      <div className="uploadArea">
                        <div className="oldFileWrapper">
                          <span>Old File:</span>
                          <span className="oldFilePath">
                            {defaultValueByRowAndColumn(
                              props.rows,
                              column.field
                            )}
                          </span>
                        </div>
                      </div>
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
                      defaultValue={{
                        value: defaultValueByRowAndColumn(
                          props.rows,
                          column.field
                        ),
                        label: defaultValueByRowAndColumn(
                          props.rows,
                          column.field
                        ),
                      }}
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
                      defaultValue={{
                        value: defaultValueByRowAndColumn(
                          props.rows,
                          column.field
                        ),
                        label: defaultValueByRowAndColumn(
                          props.rows,
                          column.field
                        ),
                      }}
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
                  defaultValue={
                    defaultValueByRowAndColumn(props.rows, column.field) || ""
                  }
                  disabled={column.editable === false}
                />
              )}
            </div>
          ))}
          <div className="item">
            <label className="postScript">
              Please enter all <label className="redStar">*</label> field
            </label>
            <div className="buttonArea">
              <button className="submit button1">
                <span>Submit</span>
              </button>
              <button
                className="submit button2"
                type="reset"
                onClick={handleReset}
              >
                Reset
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Add;
