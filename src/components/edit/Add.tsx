import "../edit/add.scss";
import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import { CustomGridColDef } from "../../data";
import Select from "react-select";
import Swal from "sweetalert2";
import "react-quill/dist/quill.snow.css";
import "../../styles/custom-quill.scss";
import katex from "katex";
import "katex/dist/katex.min.css";
window.katex = katex;
import { Editor } from "@tinymce/tinymce-react";

interface MyFormData {
  [key: string]: string | undefined;
}

// File preview component
interface FilePreviewProps {
  file: string | undefined;
  conditionValue?: string;
}

type Props = {
  slug: string;
  columns: CustomGridColDef[];
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleAfterAddRow: (newRow: any) => void;
  rows: object[];
  targetId: number;
};

const Add = (props: Props) => {
  const [formData, setFormData] = useState<MyFormData>({});
  const [file, setFile] = useState<File | undefined>(undefined);
  const [urls, setUrls] = useState<string | undefined>(undefined);
  const [conditionValue, setConditionValue] = useState<string | undefined>(
    undefined
  );
  const [editing, setEditing] = useState<boolean>(false);
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
    console.log("Please check here formData:", formData);
  }, []);

  const resetFormData = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();

    const updatedFormData: { [key: string]: any } = {}; // Add type assertion

    props.columns.forEach((column) => {
      let value;
      if (column.type === "longtext") {
        value = defaultValueByRowAndColumnForLong(props.rows, column.field);
      } else {
        value = defaultValueByRowAndColumn(props.rows, column.field);
      }

      updatedFormData[column.field] = value;
    });

    setFormData((prevFormData) => ({
      ...prevFormData,
      ...updatedFormData,
    }));
  };

  const handleReset = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    Swal.fire({
      title: "It has been reset",
      showDenyButton: false,
      showCancelButton: true,
      confirmButtonText: "Confirm",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire("You can edit again!");
        resetFormData(e);
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const requiredFields = props.columns
      .filter((column) => column.required === true && column.type !== "number")
      .map((column) => column.field);

    const missingFields = requiredFields.filter((field) => !formData[field]);

    const missingHeaders = missingFields.map((field) => {
      const matchingColumn = props.columns.find(
        (column) => column.field === field
      );
      return matchingColumn ? matchingColumn.headerName : "";
    });

    if (missingFields.length > 0) {
      Swal.fire({
        title: "Error",
        text: `Please input missing fields with *: ${missingHeaders}`,
        icon: "error",
      });
      console.log("Please check here missingFields:", missingHeaders);
    } else {
      Swal.fire({
        title: "Are you sure you want to edit this row?",
        showDenyButton: false,
        showCancelButton: true,
        confirmButtonText: "Submit",
      }).then((result) => {
        if (result.isConfirmed) {
          props.columns.forEach((column) => {
            if (column.type === "number" && !formData[column.field]) {
              formData[column.field] = "0";
            }
          });

          console.log("Please check here formData 2:", formData);
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
                  .then((response) => {
                    if (response.status === 200) {
                      console.log("Please check here Update file:", formData);
                      props.handleAfterAddRow(formData);
                      Swal.fire({
                        title: "Successfully added",
                        icon: "success",
                      });
                    }
                    props.setOpen(false);
                  })
                  .catch((error) => {
                    if (error.response && error.response.status === 400) {
                      Swal.fire({
                        title: "Error",
                        text: `Please input the other title because it should be unique`,
                        icon: "error",
                      });
                    } else if (
                      error.response &&
                      error.response.status === 404
                    ) {
                      Swal.fire({
                        title: "Error",
                        text: `404`,
                        icon: "error",
                      });
                    } else {
                      Swal.fire({
                        title: "Error",
                        text: `Something went wrong`,
                        icon: "error",
                      });
                    }
                  });
              })
              .catch((error) => {
                if (error.response && error.response.status === 400) {
                  Swal.fire({
                    title: "Error",
                    text: `Please input the other title because it should be unique`,
                    icon: "error",
                  });
                } else if (error.response && error.response.status === 404) {
                  Swal.fire({
                    title: "Error",
                    text: `404`,
                    icon: "error",
                  });
                } else {
                  Swal.fire({
                    title: "Error",
                    text: `Something went wrong`,
                    icon: "error",
                  });
                }
              });
          } else {
            if (formData.resourceType === "none") {
              formData.resourceUri = "";
            }

            axios
              .put(
                `https://mocarps.azurewebsites.net/${props.slug}/${props.targetId}`,
                formData
              )
              .then((response) => {
                if (response.status === 200) {
                  console.log("Please check here Update file:", formData);
                  props.handleAfterAddRow(formData);
                  Swal.fire({
                    title: "Successfully added",
                    icon: "success",
                  });
                  props.setOpen(false);
                }
              })
              .catch((error) => {
                if (error.response && error.response.status === 400) {
                  Swal.fire({
                    title: "Error",
                    text: `Please input the other title because it should be unique`,
                    icon: "error",
                  });
                } else if (error.response && error.response.status === 404) {
                  Swal.fire({
                    title: "Error",
                    text: `404`,
                    icon: "error",
                  });
                } else {
                  Swal.fire({
                    title: "Error",
                    text: `Something went wrong`,
                    icon: "error",
                  });
                }
              });
          }
        }
      });
    }
  };

  const handleOptionChange = (selectValue: string, fieldName: string) => {
    setFormData({
      ...formData,
      [fieldName]: selectValue,
    });
    setEditing(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setEditing(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];

    if (selectedFile) {
      if (conditionValue === "video") {
        const video = document.createElement("video");
        video.preload = "metadata";

        video.onloadedmetadata = () => {
          window.URL.revokeObjectURL(video.src);

          const videoHeight = video.videoHeight;

          if (videoHeight > 480) {
            // Display an error message for incorrect video resolution
            alert(
              "Video resolution should be limited to 480p (720x480) or below."
            );
            e.target.value = ""; // Reset the file input value
          } else {
            setFile(selectedFile); // Convert the file to a URL
            setUrls(URL.createObjectURL(selectedFile)); // Convert the file to a URL
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
        setFile(selectedFile); // Convert the file to a URL
        setUrls(URL.createObjectURL(selectedFile)); // Convert the file to a URL
        handleInputChange(e); // Update the formData
      }
    } else {
      setFile(undefined); // Convert the file to a URL
    }
    setEditing(true);
  };

  const handleLongInputChangeForLong = (fieldName: string, value: string) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [fieldName]: value,
    }));
    setEditing(true);
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

  const defaultValueByRowAndColumn = (
    rows: any, // Add index signature to allow indexing with a string
    columnName: string
  ) => {
    return rows?.[columnName];
  };

  const defaultValueByRowAndColumnForLong = (
    rows: Record<string, any> | undefined,
    columnName: string
  ): string | undefined => {
    const wrapInPTags = (text: string | undefined): string | undefined => {
      if (text && !text.startsWith("<p>") && !text.endsWith("</p>")) {
        return `<p>${text}</p>`;
      }
      return text;
    };

    const wrappedValue = wrapInPTags(rows?.[columnName]);

    return wrappedValue;
  };

  // const handleLongInputChange = (fieldName: string, value: string) => {
  //   setFormData((prevFormData) => ({
  //     ...prevFormData,
  //     [fieldName]: value,
  //   }));
  // };

  // Helper function to determine file type based on extension
  const getFileType = (fileName: string | undefined | Blob): string | null => {
    if (!fileName) {
      return null;
    }

    if (fileName instanceof Blob) {
      console.log("Please check here fileName1:", fileName);
      if (fileName.type.startsWith("image/")) {
        return "image";
      } else if (fileName.type.startsWith("audio/")) {
        return "audio";
      } else if (fileName.type.startsWith("video/")) {
        return "video";
      } else {
        return null;
      }
    }

    console.log("Please check here fileName2:", fileName);
    const extension = fileName?.toLowerCase().split(".").pop() ?? "";
    if (["jpg", "jpeg", "png"].includes(extension)) {
      return "image";
    } else if (["mp3", "m4a", "aac"].includes(extension)) {
      return "audio";
    } else if (extension === "mp4") {
      return "video";
    } else {
      return null;
    }
  };

  const FilePreview = ({ file, conditionValue }: FilePreviewProps) => {
    if (conditionValue) {
      if (conditionValue === "image") {
        return <img src={file} alt="" />;
      } else if (conditionValue === "audio") {
        return <audio src={file} controls />;
      } else if (conditionValue === "video") {
        return <video src={file} controls />;
      } else {
        return null;
      }
    } else {
      const fileType = getFileType(file);

      if (fileType === "image") {
        return <img src={file} alt="" />;
      } else if (fileType === "audio") {
        return <audio src={file} controls />;
      } else if (fileType === "video") {
        return <video src={file} controls />;
      } else {
        return null;
      }
    }
  };

  return (
    <div className="add">
      <div className="model">
        <span
          className="close"
          onClick={() =>
            editing === true
              ? Swal.fire({
                  title: "Are you sure you want to discard your changes?",
                  showDenyButton: false,
                  showCancelButton: true,
                  confirmButtonText: "Discard",
                }).then((result) => {
                  if (result.isConfirmed) {
                    props.setOpen(false);
                  }
                })
              : props.setOpen(false)
          }
        >
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
              ) : column.showInForm === false ? null : (
                <label>{column.headerName}</label>
              )}
              {column.type === "longText" ? (
                <>
                  <Editor
                    tinymceScriptSrc="/dependencies/tinymce/tinymce.min.js"
                    key={column.field}
                    initialValue={defaultValueByRowAndColumnForLong(
                      props.rows,
                      column.field
                    )}
                    init={{
                      height: 400,
                      plugins: "mathjax wordcount link", // Add the wordcount plugin
                      toolbar1:
                        "undo redo | styles | bold italic underline | alignleft aligncenter alignright alignjustify | indent outdent | lineheight | link mathjax",
                      toolbar2:
                        "subscript superscript| bullist numlist | fontfamily fontsize forecolor backcolor | emoticons charmap | wordcount", // Add the wordcount button
                      external_plugins: {
                        mathjax:
                          "../@dimakorotkov/tinymce-mathjax/plugin.min.js",
                      },
                      mathjax: {
                        lib: "/dependencies/mathjax/es5/tex-mml-chtml.js",
                        symbols: { start: "\\(", end: "\\)" },
                        className: "math-tex",
                        configUrl:
                          "/dependencies/@dimakorotkov/tinymce-mathjax/config.js",
                      },
                      htmlAllowedTags: [".*"],
                      htmlAllowedAttrs: [".*"],
                    }}
                    onEditorChange={(value) =>
                      handleLongInputChangeForLong(column.field, value)
                    }
                    value={formData[column.field]}
                  />
                </>
              ) : column.type === "file" ? (
                (() => {
                  const defaultValue = defaultValueByRowAndColumnForLong(
                    props.rows,
                    column.field
                  );

                  const sanitizedValue =
                    defaultValue?.replace(/<\/?p>/g, "") ?? "";

                  return (
                    <>
                      {conditionValue === "none" ? null : column.preCondition &&
                        conditionValue !== undefined ? (
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
                          </div>
                        </div>
                      ) : null}
                      <div className="previewArea">
                        <div>
                          <div>Uploaded File:</div>
                          <div className="previewExistFileBox">
                            <FilePreview file={sanitizedValue} />
                          </div>
                        </div>
                        <div>
                          <div>New File:</div>
                          <div className="previewExistFileBox">
                            <FilePreview
                              file={urls}
                              conditionValue={conditionValue}
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()
              ) : column.type === "options" ? (
                column.isCondition ? (
                  defaultValueByRowAndColumn(props.rows, column.field) ? (
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
                      {conditionValue ===
                      undefined ? null : conditionValue.includes("image") ? (
                        <div className="fileReminder">
                          {" "}
                          Notice! Only image under 2MB will be accepted
                          <br />
                          Accept ".jpg / .jpeg / .png" file types
                        </div>
                      ) : conditionValue.includes("audio") ? (
                        <div className="fileReminder">
                          {" "}
                          Notice! Only audio under 5MB will be accepted
                          <br />
                          Accept ".mp3 / .m4a / .aac" file types
                        </div>
                      ) : conditionValue.includes("video") ? (
                        <div className="fileReminder">
                          {" "}
                          Notice! Only video under or equal 480P will be
                          accepted
                          <br />
                          Accept ".mp4 " file type
                        </div>
                      ) : null}
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
                      {conditionValue ===
                      undefined ? null : conditionValue.includes("image") ? (
                        <div className="fileReminder">
                          {" "}
                          Notice! Only image under 2MB will be accepted{" "}
                        </div>
                      ) : conditionValue.includes("audio") ? (
                        <div className="fileReminder">
                          {" "}
                          Notice! Only audio under 5MB will be accepted{" "}
                        </div>
                      ) : conditionValue.includes("video") ? (
                        <div className="fileReminder">
                          {" "}
                          Notice! Only video under or equal 480P will be
                          accepted{" "}
                        </div>
                      ) : null}
                    </div>
                  )
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
              ) : column.type === "boolean" && column.showInForm === true ? (
                <div className="checkbox-container">
                  <input
                    className="checkbox-input"
                    type="checkbox"
                    id={column.field}
                    name={column.field}
                    onChange={(event) =>
                      handleOptionChange(
                        event.target.checked.toString(),
                        column.field
                      )
                    }
                    defaultChecked={defaultValueByRowAndColumn(
                      props.rows,
                      column.field
                    )}
                    disabled={column.input === false}
                  />
                  <label className="checkbox-label" htmlFor={column.field}>
                    <span className="inner-ball"></span>
                  </label>
                </div>
              ) : column.showInForm === false ? null : (
                <input
                  type={column.type}
                  name={column.field}
                  placeholder={column.inputHint}
                  onChange={handleInputChange}
                  defaultValue={
                    column.type === "number"
                      ? defaultValueByRowAndColumn(props.rows, column.field) ||
                        formData[column.field] ||
                        0
                      : defaultValueByRowAndColumn(props.rows, column.field) ||
                        formData[column.field] ||
                        ""
                  }
                  disabled={column.input === false || column.unqiue === true}
                  className={
                    column.input === false
                      ? "disabled"
                      : column.unqiue === true
                      ? "disabled"
                      : undefined
                  }
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
                <span>Save</span>
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
