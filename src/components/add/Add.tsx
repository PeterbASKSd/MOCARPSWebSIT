import "../add/add.scss";
import axios from "axios";
import React, { useState } from "react";
import {
  CustomGridColDef,
  priorityOptions,
  prepareTreeDataForSubmission,
} from "../../data";
import Select from "react-select";
import "react-quill/dist/quill.snow.css";
import "../../styles/custom-quill.scss";
import katex from "katex";
import "katex/dist/katex.min.css";
window.katex = katex;
import { Editor } from "@tinymce/tinymce-react";
import Swal from "sweetalert2";

type Props = {
  slug: string;
  columns: CustomGridColDef[];
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleAfterAddRow: (newRow: any) => void;
  largestId?: number;
  treeData?: any[];
  setTreeData?: React.Dispatch<React.SetStateAction<any[]>>;
  questionSetID?: number;
};

// File preview component
interface FilePreviewProps {
  file: string | undefined;
  conditionValue?: string;
}

const Add = (props: Props) => {
  const [formData, setFormData] = useState<FormData>(new FormData());
  const [file, setFile] = useState<File | undefined>(undefined);
  const [selectValue, setSelectValue] = useState(null);
  const [urls, setUrls] = useState<string | undefined>(undefined);
  const [conditionValue, setConditionValue] = useState<string | undefined>(
    undefined
  );
  const [editing, setEditing] = useState<boolean>(false);

  const fileFormData = new FormData();

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

    // Password confirmation check (if applicable)
    if (
      "password" in formData &&
      "passwordConfirm" in formData &&
      formData.password !== formData.passwordConfirm
    ) {
      Swal.fire({
        title: "Error",
        text: "Please double check your password",
        icon: "error",
      });
      return;
    }

    // Min and max value check for number fields
    if ("maxValue" in formData && "minValue" in formData) {
      // Ensure both maxValue and minValue are actually numbers before comparing
      const maxValue = parseFloat(formData.maxValue as string);
      const minValue = parseFloat(formData.minValue as string);
      if (!isNaN(maxValue) && !isNaN(minValue) && maxValue < minValue) {
        Swal.fire({
          title: "Error",
          text: "Max value cannot be less than Min value.",
          icon: "error",
        });
        return;
      }
    }

    // Conditional media validation
    if (shouldValidateMedia()) {
      // Implement this function based on your form/page logic
      if (!isFileTypeValid(file, conditionValue)) {
        Swal.fire({
          title: "Error",
          text: "Uploaded file type does not match the selected media type.",
          icon: "error",
        });
        return;
      } else if (conditionValue !== "none" && !file) {
        Swal.fire({
          title: "Error",
          text: "Missing file for the selected resource type.",
          icon: "error",
        });
        return;
      }
    }

    // If conditionValue is "none" or media not applicable, ensure resourceUri is not set
    if (conditionValue === "none" || !shouldValidateMedia()) {
      (formData as any).resourceUri = "";
    }

    // Proceed with form data submission
    if (props.slug === "information") {
      submitTreeNode(formData); // Implement this function to handle form submission
    } else {
      submitFormData(formData); // Implement this function to handle form submission
    }
  };

  // Example implementation based on your application's logic
  function shouldValidateMedia(): boolean {
    // Return true if the current form/page context requires media validation
    // This logic might depend on the presence of certain fields, page identifiers, etc.
    return conditionValue !== undefined; // Simplified example
  }

  async function submitTreeNode(formData: any) {
    // Step 1: Initialize formData with an ID, empty sections, and handle resourceUri
    if (props.largestId !== undefined) {
      formData.id = props.largestId.toString();
      formData.sections = [];
    }

    if (conditionValue === "none") {
      formData.resourceUri = "";
    }

    // Ensure treeData is treated as an array even if it's initially undefined
    let updatedTreeData = [...(props.treeData ?? []), formData];

    if (file) {
      fileFormData.append("file", file);

      try {
        const response = await axios.post(
          `https://mocarps.azurewebsites.net/uploadFile`,
          fileFormData,
          {
            headers: {
              "Content-Type": "application/octet-stream",
            },
          }
        );

        const blobUrl = response.data.blobUrl;

        // Directly update the formData's resourceUri with the blobUrl
        const updatedFormData = {
          ...formData,
          resourceUri: blobUrl, // Assuming blobUrl is the direct URL to the uploaded file
        };

        updatedTreeData = [...(props.treeData ?? []), updatedFormData];
      } catch (error) {
        console.error("Error uploading file", error);
        // Handle the error accordingly
      }
    }

    // Step 3: Prepare and submit the updated tree data to the backend
    const submissionData = prepareTreeDataForSubmission(updatedTreeData);
    try {
      const response = await axios.post(
        `https://mocarps.azurewebsites.net/${props.slug}`,
        submissionData
      );
      if (response.status === 200) {
        console.log("Tree data successfully submitted:", submissionData);
        Swal.fire({ title: "Successfully added", icon: "success" });
        setEditing(false);
        if (props.setTreeData) {
          props.setTreeData(updatedTreeData);
        }
        props.setOpen(false);
      }
    } catch (error) {
      console.error("Error submitting tree data", error);
      handleSubmissionError(error);
    }
  }

  async function submitFormData(formData: any) {
    if (conditionValue === "none") {
      (formData as any).resourceUri = "";
    }

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
            .then((response) => {
              if (response.status === 200) {
                console.log("Please check here Update file:", updatedFormData);
                props.handleAfterAddRow(updatedFormData);
                Swal.fire({
                  title: "Successfully added",
                  icon: "success",
                });
                setEditing(false);
                props.setOpen(false);
              }
            })
            .catch((error) => {
              handleSubmissionError(error);
            });
        })
        .catch((error) => {
          console.error(error);
        });
    } else {
      axios
        .post(`https://mocarps.azurewebsites.net/${props.slug}`, formData)
        .then((response) => {
          if (response.status === 200) {
            console.log("Please check here Update file:", formData);
            props.handleAfterAddRow(formData);
            Swal.fire({
              title: "Successfully added",
              icon: "success",
            });
            setEditing(false);
            props.setOpen(false);
          }
        })
        .catch((error) => {
          handleSubmissionError(error);
        });
    }
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

  const isFileTypeValid = (
    file: File | undefined,
    conditionValue: string | undefined
  ): boolean => {
    // If no specific media type is selected ('none'), the file type validation should pass
    if (conditionValue === "none") return true;

    // If a file or conditionValue is not provided, fail the validation
    if (!file || !conditionValue) return false;

    // Extract the file extension
    const fileExtension = file.name.split(".").pop()?.toLowerCase();

    // Validate the file extension based on the selected media type (conditionValue)
    switch (conditionValue) {
      case "audio":
        return fileExtension === "mp3"; // Consider adding more extensions as needed
      case "image":
        return ["jpg", "jpeg", "png"].includes(fileExtension!); // Use non-null assertion wisely
      case "video":
        return fileExtension === "mp4"; // Consider adding more extensions as needed
      default:
        return false; // Fail validation for unrecognized media types
    }
  };

  const handleOptionChange = (selectValue: string, fieldName: string) => {
    setSelectValue(null);
    setFormData({
      ...formData,
      [fieldName]: selectValue,
    });
    setEditing(true);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: parseInt(e.target.value),
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

  const handleLongInputChange = (fieldName: any, value: any) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [fieldName]: value,
    }));
    setEditing(true);
  };

  const handlePriorityChange = (selectValue: number, fieldName: string) => {
    setFormData({
      ...formData,
      [fieldName]: selectValue,
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
                {column.type === "id" ? (
                  <input
                    type="text"
                    name={column.field}
                    placeholder={column.inputHint}
                    defaultValue={props.largestId}
                    disabled={true}
                  />
                ) : column.type === "longText" ? (
                  <Editor
                    tinymceScriptSrc="/dependencies/tinymce/tinymce.min.js"
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
                        lib: "/dependencies/mathjax/es5/tex-mml-svg.js", //required path to mathjax
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
                  !column.preCondition ||
                  conditionValue === "none" ? null : conditionValue !==
                    undefined ? (
                    <div>
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
                      </div>
                      <div className="previewArea">
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
                    </div>
                  ) : null
                ) : column.type === "priority" ? (
                  <div className="special-option">
                    <Select
                      className="options"
                      onChange={(selectValue) => {
                        selectValue &&
                          handlePriorityChange(selectValue.value, column.field);
                      }}
                      options={priorityOptions}
                    />
                  </div>
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
                ) : column.type === "number" ? (
                  <input
                    type={column.type}
                    name={column.field}
                    placeholder={column.inputHint}
                    onChange={handleNumberChange}
                  />
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
            {/* {isSubmitted === "false" ? (
              <div className="error">Please input {errorMessage}</div>
            ) : isSubmitted === "true" ? (
              <div className="success">Successfully added</div>
            ) : null} */}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Add;
