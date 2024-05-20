import axios from "axios";
import React, { useState, useEffect } from "react";
import Select from "react-select";
import Swal from "sweetalert2";
import "./questionForm.scss";
import { CustomGridColDef } from "../../data";

type Props = {
  slug: string;
  rows: any;
  columns: CustomGridColDef[];
  setOpen: React.Dispatch<React.SetStateAction<number | boolean | null>>;
  setRow: React.Dispatch<React.SetStateAction<any>>;
  name: string;
  questionID?: number;
  editingQuestionId?: number | null;
  onSubmit: () => void;
};

const QuestionForm = (props: Props) => {
  const [formData, setFormData] = useState({
    description: "",
    resourceUri: "",
    resourceType: "none",
    questionSetId: props.questionID || "",
    score: 0,
    questionType: "MAIN",
    options: [],
  });
  const [file, setFile] = useState<File | undefined>(undefined);
  const [filePreview, setFilePreview] = useState<string | undefined>(undefined);
  const [conditionValue, setConditionValue] = useState<string>("none");

  useEffect(() => {
    if (
      props.editingQuestionId !== null &&
      props.editingQuestionId !== undefined
    ) {
      const question = props.rows.find(
        (q: any) => q.id === props.editingQuestionId
      );
      if (question) {
        setFormData({
          ...question,
          questionSetId: props.questionID || question.questionSetId,
        });
        setConditionValue(question.resourceType);
      }
    }
  }, [props.editingQuestionId, props.rows, props.questionID]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (conditionValue !== "none" && file) {
      try {
        const fileFormData = new FormData();
        fileFormData.append("file", file);
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
        setFormData((prevData) => ({
          ...prevData,
          resourceUri: blobUrl,
        }));
      } catch (error) {
        console.error("Error uploading file", error);
        return;
      }
    }

    const method = props.editingQuestionId ? "put" : "post";
    const url = props.editingQuestionId
      ? `https://mocarps.azurewebsites.net/questionSet/question/${props.editingQuestionId}`
      : "https://mocarps.azurewebsites.net/questionSet/question/add";

    try {
      const response = await axios[method](url, formData);
      if (response.status === 200) {
        Swal.fire({
          title: "Successfully added",
          icon: "success",
        });
        props.onSubmit();
        props.setOpen(null);
      }
    } catch (error) {
      console.error("Error submitting data", error);
      Swal.fire({
        title: "Error",
        text: "Something went wrong",
        icon: "error",
      });
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (selectedOption: any, actionMeta: any) => {
    setFormData({
      ...formData,
      [actionMeta.name]: selectedOption.value,
    });
    if (actionMeta.name === "resourceType") {
      setConditionValue(selectedOption.value);
      if (selectedOption.value === "none") {
        setFormData({
          ...formData,
          resourceUri: "",
        });
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateFile(selectedFile, conditionValue).then((isValid: boolean) => {
        if (isValid) {
          setFile(selectedFile);
          setFilePreview(URL.createObjectURL(selectedFile));
        } else {
          setFile(undefined);
          setFilePreview(undefined);
        }
      });
    }
  };

  const resourceTypeOptions = [
    { value: "none", label: "none" },
    { value: "image", label: "image" },
    { value: "video", label: "video" },
    { value: "audio", label: "audio" },
  ];

  const questionTypeOptions = [
    { value: "MAIN", label: "MAIN" },
    { value: "BRANCH", label: "BRANCH" },
  ];

  const fileAcceptance: Record<string, string> = {
    image: "image/jpeg, image/png",
    audio: "audio/mpeg, audio/mp4, audio/aac",
    video: "video/mp4",
  };

  const fileSizeLimit: Record<string, number> = {
    image: 2 * 1024 * 1024,
    audio: 5 * 1024 * 1024,
    video: 5 * 1024 * 1024,
  };

  const validateFile = (file: File, type: string): Promise<boolean> => {
    const fileSizeValid = file.size <= fileSizeLimit[type];
    const fileTypeValid = fileAcceptance[type].split(", ").includes(file.type);

    if (!fileSizeValid || !fileTypeValid) {
      Swal.fire({
        title: "Invalid File",
        text: `Please ensure the file is a valid ${type} and meets the size requirements.`,
        icon: "error",
      });
      return Promise.resolve(false);
    }

    if (type === "video") {
      const video = document.createElement("video");
      video.src = URL.createObjectURL(file);

      return new Promise<boolean>((resolve) => {
        video.onloadedmetadata = () => {
          const validResolution =
            video.videoHeight <= 480 && video.videoWidth <= 720;
          if (!validResolution) {
            Swal.fire({
              title: "Invalid Video Resolution",
              text: "Please ensure the video resolution is 480p (720x480) or below.",
              icon: "error",
            });
            resolve(false);
          } else {
            resolve(true);
          }
        };
      });
    }

    return Promise.resolve(true);
  };

  return (
    <div className="edit-form">
      <div className="edit-model">
        <h1>
          {props.editingQuestionId ? "Edit" : "Add New"} {props.name}
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="item">
            <label>
              Description <span className="redStar">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="item">
            <label>
              Resource Type <span className="redStar">*</span>
            </label>
            <Select
              name="resourceType"
              value={resourceTypeOptions.find(
                (option) => option.value === formData.resourceType
              )}
              onChange={handleSelectChange}
              options={resourceTypeOptions}
            />
          </div>
          {conditionValue !== "none" && (
            <div className="item">
              <label>
                Resource URI <span className="redStar">*</span>
              </label>
              <input
                type="file"
                name="resourceUri"
                accept={fileAcceptance[conditionValue]}
                onChange={handleFileChange}
                required={conditionValue !== "none"}
              />
              <p className="file-acceptance" style={{ color: "red" }}>
                Acceptable file types: {fileAcceptance[conditionValue]}. Max
                size: 480p and below,{" "}
                {fileSizeLimit[conditionValue] / (1024 * 1024)}MB.
              </p>
              {props.editingQuestionId && formData.resourceUri && (
                <div className="file-preview" style={{ maxWidth: "100%" }}>
                  <label>Existing File:</label>
                  {conditionValue === "image" && (
                    <img
                      src={formData.resourceUri}
                      alt="Existing"
                      style={{ width: "100%" }}
                    />
                  )}
                  {conditionValue === "audio" && (
                    <audio controls style={{ width: "100%" }}>
                      <source src={formData.resourceUri} />
                      Your browser does not support the audio element.
                    </audio>
                  )}
                  {conditionValue === "video" && (
                    <video controls style={{ width: "100%" }}>
                      <source src={formData.resourceUri} />
                      Your browser does not support the video element.
                    </video>
                  )}
                </div>
              )}
              {filePreview && (
                <div className="file-preview" style={{ maxWidth: "100%" }}>
                  <label>Selected File:</label>
                  {conditionValue === "image" && (
                    <img
                      src={filePreview}
                      alt="Selected"
                      style={{ width: "100%" }}
                    />
                  )}
                  {conditionValue === "audio" && (
                    <audio controls style={{ width: "100%" }}>
                      <source src={filePreview} />
                      Your browser does not support the audio element.
                    </audio>
                  )}
                  {conditionValue === "video" && (
                    <video controls style={{ width: "100%" }}>
                      <source src={filePreview} />
                      Your browser does not support the video element.
                    </video>
                  )}
                </div>
              )}
            </div>
          )}
          <div className="item">
            <label>
              Question Type <span className="redStar">*</span>
            </label>
            <Select
              name="questionType"
              value={questionTypeOptions.find(
                (option) => option.value === formData.questionType
              )}
              onChange={handleSelectChange}
              options={questionTypeOptions}
            />
          </div>
          <div className="item">
            <label>Score</label>
            <input
              type="number"
              name="score"
              value={formData.score}
              onChange={handleInputChange}
            />
          </div>
          <div className="item">
            <label className="postScript">Please enter all * fields</label>
            <div className="button-group">
              <button className="save-button" type="submit">
                <span>Submit</span>
              </button>
              <button
                className="cancel-button"
                type="button"
                onClick={() => props.setOpen(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuestionForm;
