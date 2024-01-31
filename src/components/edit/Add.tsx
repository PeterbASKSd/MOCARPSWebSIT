import "../edit/add.scss";
import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import { CustomGridColDef } from "../../data";
import Select from "react-select";
import PreviewModal from "react-media-previewer";
import preview from "../../assets/preview.svg";
import { IconButton } from "@mui/material";
import Swal from "sweetalert2";
import "react-quill/dist/quill.snow.css";
import "../../styles/custom-quill.scss";
import katex from "katex";
import "katex/dist/katex.min.css";
window.katex = katex;
import { Editor } from "@tinymce/tinymce-react";
import "@peterbasksd/tinymce-mathjax";

interface MyFormData {
  [key: string]: string | undefined;
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
  const [open, setOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<MyFormData>({});
  const [file, setFile] = useState<File | undefined>(undefined);
  const [visible, setVisible] = useState(false);
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

  const handleLongInputChangeForLong = (fieldName: string, value: string) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [fieldName]: value,
    }));
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
              ) : column.showInForm === false ? null : (
                <label>{column.headerName}</label>
              )}
              {column.type === "longText" ? (
                <Editor
                  apiKey="4hnohmgequ45f7ynkl86g9gyoaf02laiff21n26zuj660uzt"
                  key={column.field}
                  initialValue={defaultValueByRowAndColumnForLong(
                    props.rows,
                    column.field
                  )}
                  init={{
                    height: 400,
                    plugins: "mathjax",
                    toolbar1:
                      "undo redo | styles | bold italic underline | alignleft aligncenter alignright alignjustify | indent outdent | lineheight | mathjax",
                    toolbar2:
                      "subscript superscript|  bullist numlist | fontfamily fontsize forecolor backcolor | emoticons charmap",
                    external_plugins: {
                      mathjax:
                        "../node_modules/@peterbasksd/tinymce-mathjax/plugin.min.js",
                    },
                    mathjax: {
                      lib: "../node_modules/mathjax/es5/tex-mml-chtml.js", //required path to mathjax
                      symbols: { start: "\\(", end: "\\)" }, //optional: mathjax symbols
                      className: "math-tex", //optional: mathjax element class
                      configUrl:
                        "../node_modules/@peterbasksd/tinymce-mathjax/config.js", //optional: mathjax config js
                    },
                    htmlAllowedTags: [".*"],
                    htmlAllowedAttrs: [".*"],
                  }}
                  onEditorChange={(value) =>
                    handleLongInputChangeForLong(column.field, value)
                  }
                  value={formData[column.field]}
                />
              ) : column.type === "file" ? (
                (defaultValueByRowAndColumn(props.rows, column.field) ===
                "" ? null : (
                  <div className="uploadArea">
                    <div className="oldFileWrapper">
                      <span>Old File:</span>
                      <div className="mediaArea">
                        {column.type === "image" && (
                          <img
                            src={defaultValueByRowAndColumn(
                              props.rows,
                              column.field
                            )}
                            alt=""
                            className="mediaImage"
                          />
                        )}
                        {column.type === "video" && (
                          <video controls className="mediaVideo">
                            <source
                              src={defaultValueByRowAndColumn(
                                props.rows,
                                column.field
                              )}
                              type="video/mp4"
                            />
                          </video>
                        )}
                        {column.type === "audio" && (
                          <audio controls className="mediaAudio">
                            <source
                              src={defaultValueByRowAndColumn(
                                props.rows,
                                column.field
                              )}
                              type="audio/mpeg, audio/mp4, audio/aac"
                            />
                          </audio>
                        )}
                      </div>
                    </div>
                  </div>
                )) &&
                (!column.preCondition ? null : conditionValue !== undefined ? (
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
                ) : null)
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
                        Notice! Only video under or equal 480P will be accepted{" "}
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
                  disabled={column.input === false}
                  className={column.input === false ? "disabled" : undefined}
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
