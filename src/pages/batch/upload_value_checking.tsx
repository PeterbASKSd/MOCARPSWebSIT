import React, { useState } from "react";
import axios from "axios";
import "./ValueCheckingUpload.scss";
import { useNavigate } from "react-router-dom";

const ValueCheckingUpload: React.FC = () => {
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const selectFile = () => {
    document.getElementById("file-input")?.click();
  };

  const uploadFile = async (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      const formData = new FormData();
      formData.append("file", file);

      setUploadStatus(null);
      setUploadMessage(null);
      setLoading(true);

      try {
        const response = await axios.post(
          "https://mocarps.azurewebsites.net/valueChecking/upload",
          formData
        );
        if (response.status !== 200) {
          setUploadStatus("error");
          let errorMessage = response.data.message + "\n";
          response.data.log.forEach((item: any) => {
            errorMessage += `Title: ${item.title}, Error: ${item.error}\n`;
          });
          setUploadMessage(errorMessage);
        } else {
          setUploadStatus("success");
          setUploadMessage(response.data.message);
        }
      } catch (error: any) {
        setUploadStatus("error");
        setUploadMessage(error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div id="container">
      <div id="template-container">
        <h3>Value Checking Batch Upload Template</h3>
        <a>* Compulsory field</a>
        <button onClick={() => navigate("/value")}>Return</button>
        <table id="data-table">
          <thead>
            <tr>
              <th>title *</th>
              <th>keyword *</th>
              <th>description *</th>
              <th>unit</th>
              <th>maxValue</th>
              <th>minValue</th>
              <th>lowerDesc</th>
              <th>higherDesc</th>
              <th>normalDesc</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>demo_1</td>
              <td>demo_1</td>
              <td>demo_1</td>
              <td>demo</td>
              <td>100</td>
              <td>0</td>
              <td>lower</td>
              <td>higher</td>
              <td>normal</td>
            </tr>
            <tr>
              <td>demo_2</td>
              <td>demo_2</td>
              <td>demo_2</td>
              <td>demo</td>
              <td>10</td>
              <td>0</td>
              <td>lower</td>
              <td>higher</td>
              <td>normal</td>
            </tr>
          </tbody>
        </table>
        <a
          href="https://mocarpsassets.blob.core.windows.net/files/ValueCheckingBatch.xlsx"
          download
          id="template-container-message"
        >
          Download Template File
        </a>
      </div>
      <div id="upload-container" onClick={selectFile}>
        <i id="upload-icon" className="fas fa-cloud-upload-alt"></i>
        <p>Browse Xlsx File to Upload</p>
        <input
          type="file"
          id="file-input"
          onChange={(e) => uploadFile(e.target.files)}
          accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          style={{ display: "none" }}
        />
      </div>
      {loading && (
        <div id="loading">
          <div id="spinner"></div>
        </div>
      )}
      {uploadStatus && (
        <div id="upload-status">
          {uploadStatus === "success" && (
            <i id="upload-success-icon" className="fas fa-check-circle"></i>
          )}
          {uploadStatus === "error" && (
            <i id="upload-error-icon" className="fas fa-exclamation-circle"></i>
          )}
          <p id="upload-message">{uploadMessage}</p>
        </div>
      )}
    </div>
  );
};

export default ValueCheckingUpload;
