import "./editForm.scss";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { CustomGridColDef } from "../../data";
import PreviewModal from "react-media-previewer";
import preview from "../../assets/preview.svg";
import { IconButton } from "@mui/material";
import Swal from "sweetalert2";

const EditForm = ({
  slug,
  id,
  columns,
}: {
  slug: string;
  id: string;
  columns: CustomGridColDef[];
}) => {
  const url = `https://mocarps.azurewebsites.net/${slug}/${id}`;
  const [data, setData] = useState<object>({});
  const [tempData, setTempData] = useState<object>({});
  const [change, setChange] = useState(null || Boolean);
  const [open, setOpen] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(url);
        setData(response.data);
        setTempData(response.data);
      } catch (error) {
        console.error("Error fetching edit data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    console.log("Please check here :", change);
  });

  const isFieldRequired = (field: string, columns: CustomGridColDef[]) => {
    return columns.find((column) => column.field === field)?.required;
  };

  const isFieldInputRequired = (field: string, columns: CustomGridColDef[]) => {
    return columns.find((column) => column.field === field)?.input;
  };

  const isFieldInputType = (field: string, columns: CustomGridColDef[]) => {
    return columns.find((column) => column.field === field)?.type;
  };

  const getHeaderName = (field: string, columns: CustomGridColDef[]) => {
    return columns.find((column) => column.field === field)?.headerName;
  };

  const getOptions = (field: string, columns: CustomGridColDef[]) => {
    return columns.find((column) => column.field === field)?.inputOptions;
  };

  const handleEditedData = () => {
    Swal.fire({
      title: "Are you sure you want to edit this form?",
      showDenyButton: false,
      showCancelButton: true,
      confirmButtonText: "Comfirm",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire("Comfirm!");
        handleConfirm();
      }
    });

    const handleConfirm = () => {
      fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then((response) => {
          console.log(response.json());
        })
        .catch((error) => {
          console.error(error);
        });
    };
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    axios
      .put(`https://mocarps.azurewebsites.net/${slug}/${id}`, data)
      .then(() => {})
      .catch((error) => {
        console.error(error);
      });
  };

  const handleReset = () => {
    Swal.fire({
      title: "Are you sure you want to edit this form?",
      showDenyButton: false,
      showCancelButton: true,
      confirmButtonText: "Comfirm",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire("Comfirm!");
        handleConfirm();
      }
    });

    const handleConfirm = () => {
      setData(tempData);
    };
  };

  const handleLongInputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    field: string
  ) => {
    setData({ ...data, [field]: e.target.value });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    setData({ ...data, [field]: e.target.value });
  };

  return (
    <div className="editForm">
      <form onSubmit={handleSubmit} className="editContect">
        {Object.entries(data).map(([field, value]) => (
          <div className="item" key={field}>
            {isFieldRequired(field, columns) ? (
              <label className="itemField">
                {getHeaderName(field, columns)}{" "}
                <label className="redStar">*</label>
              </label>
            ) : (
              <label className="itemField">
                {getHeaderName(field, columns)}
              </label>
            )}
            {isFieldInputType(field, columns) === "longText" ? (
              <textarea
                className="itemValueLongText"
                value={value || ""}
                onChange={(e) => {
                  setChange(true);
                  handleLongInputChange(e, field);
                }}
                disabled={!isFieldInputRequired(field, columns)}
              />
            ) : isFieldInputType(field, columns) === "options" ? (
              isFieldInputRequired(field, columns) ? (
                <select>
                  {getOptions(field, columns) ??
                    [].map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                </select>
              ) : (
                <input className="itemOptions" type="value" name={value} />
              )
            ) : isFieldInputType(field, columns) === "file" ? (
              <div className="itemUploadFile">
                <div className="itemUploadedFile">
                  <label className="uploadFileLabel">Uploaded file:</label>
                  <a href={value} className="uploadedFileLink">
                    {value}
                  </a>
                </div>
                <div className="itemPreviewUploadedFile">
                  <label className="uploadNewFileLabel">Upload New file:</label>
                  <input
                    className="uploadFileInput"
                    type="file"
                    name={value}
                    disabled={!isFieldInputRequired(field, columns)}
                  />
                  <div className="previewIcon">
                    <IconButton
                      onClick={() => {
                        setOpen(true);
                      }}
                    >
                      <img src={preview} alt="" className="previewIconButton" />
                    </IconButton>
                    {open && (
                      <PreviewModal
                        visible={visible}
                        setVisible={() => setVisible(false)}
                        urls={[value || ""]}
                      />
                    )}
                  </div>
                </div>
              </div>
            ) : isFieldInputType(field, columns) === "boolean" ? (
              <div>
                <input
                  className="itemCheckbox"
                  type="checkbox"
                  name={field}
                  disabled={!isFieldInputRequired(field, columns)}
                />
              </div>
            ) : (
              <input
                className="itemValueText"
                value={value || ""}
                onChange={(e) => {
                  setChange(true);
                  handleInputChange(e, field);
                }}
                disabled={!isFieldInputRequired(field, columns)}
              />
            )}
          </div>
        ))}
        {change ? (
          <>
            <div className="buttonSet">
              <button
                className="saveButton"
                type="submit"
                onClick={() => handleEditedData()}
              >
                Save
              </button>
              <button
                className="resetButton"
                type="reset"
                onClick={() => handleReset()}
              >
                Reset
              </button>
            </div>
          </>
        ) : null}
      </form>
    </div>
  );
};

export default EditForm;
