import "../add/add.scss";
import axios from "axios";
import React, { useState } from "react";
import { CustomGridColDef } from "../../data";
import Select from "react-select";
import PreviewModal from "react-media-previewer";
import preview from "../../assets/preview.svg";
import { IconButton } from "@mui/material";
import "react-quill/dist/quill.snow.css";
import "../../styles/custom-quill.scss";
import katex from "katex";
import "katex/dist/katex.min.css";
window.katex = katex;
import { Editor } from "@tinymce/tinymce-react";

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
      .filter((column) => column.required && column.type !== "number")
      .map((column) => column.field);

    const numberFields = props.columns
      .filter((column) => column.required && column.type === "number")
      .map((column) => column.field);

    const isAllFieldsPresent = requiredFields.every((field) =>
      Object.keys(formData).includes(field)
    );

    await Promise.all([
      Promise.all(
        numberFields.map(async (field) => {
          if (!Object.keys(formData).includes(field)) {
            console.log("Please check here 11111:", formData);
            await setFormData((prevData) => ({
              ...prevData,
              [field]: 0,
            }));
          }
        })
      ),
      setMissingFields(
        requiredFields.filter(
          (headerName) => !Object.keys(formData).includes(headerName)
        )
      ),
    ]);

    if (
      !isAllFieldsPresent ||
      Object.values(formData).some((value) => value === "")
    ) {
      setIsSubmitted(false);
      return;
    } else {
      setIsSubmitted(true);

      console.log("Please check here:", formData);

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

  const handleLongInputChange = (fieldName: any, value: any) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [fieldName]: value,
    }));
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

  return (
    <div className="add">
      <div className="model">
        <span className="close" onClick={() => props.setOpen(false)}>
          x
        </span>
        <h1>Add New Entry</h1>
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
                  <Editor
                    tinymceScriptSrc="/dependencies/tinymce/tinymce.min.js"
                    init={{
                      height: 400,
                      plugins: "mathjax",
                      toolbar1:
                        "undo redo | styles | bold italic underline | alignleft aligncenter alignright alignjustify | indent outdent | lineheight | mathjax",
                      toolbar2:
                        "subscript superscript|  bullist numlist | fontfamily fontsize forecolor backcolor | emoticons charmap",
                      external_plugins: {
                        mathjax:
                          "../@dimakorotkov/tinymce-mathjax/plugin.min.js",
                      },
                      mathjax: {
                        lib: "/dependencies/mathjax/es5/tex-mml-chtml.js", //required path to mathjax
                        symbols: { start: "\\(", end: "\\)" }, //optional: mathjax symbols
                        className: "math-tex", //optional: mathjax element class
                        configUrl:
                          "/dependencies/@dimakorotkov/tinymce-mathjax/config.js", //optional: mathjax config js
                      },
                      htmlAllowedTags: [".*"],
                      htmlAllowedAttrs: [".*"],
                    }}
                    onEditorChange={(value) =>
                      handleLongInputChange(column.field, value)
                    }
                  />
                ) : column.type === "file" ? (
                  !column.preCondition ? null : conditionValue !== undefined ? (
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
                      onChange={(event) =>
                        handleOptionChange(
                          event.target.checked.toString(),
                          column.field
                        )
                      }
                    />
                  </div>
                ) : (
                  <input
                    type={column.type}
                    name={column.field}
                    placeholder={column.inputHint}
                    defaultValue={column.type === "number" ? 0 : undefined}
                    onChange={handleInputChange}
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
            </div>

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
