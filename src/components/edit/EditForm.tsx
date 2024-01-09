import "./editForm.scss";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { CustomGridColDef } from "../../data";
import PreviewModal from "react-media-previewer";
import preview from "../../assets/preview.svg";
import { IconButton } from "@mui/material";

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
  const [change, setChange] = useState(null || Boolean);
  const [open, setOpen] = useState<boolean>(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(url);
        setData(response.data);
      } catch (error) {
        console.error("Error fetching edit data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    console.log("Please check here :", change);
  });

  const updateData = () => {
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Please check here 11111:", data);
    axios
      .put(`https://mocarps.azurewebsites.net/${slug}/${id}`, data)
      .then(() => {
        console.log("Please check here 33333:", data);
      })
      .catch((error) => {
        console.error(error);
      });
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
                <div className="itemPreviewUploadedFile">
                  <div className="previewText">{value}</div>
                  <div>
                    <IconButton
                      onClick={() => {
                        setOpen(true);
                      }}
                    >
                      <img src={preview} alt="" className="previewIcon" />
                    </IconButton>
                    {open && (
                      <PreviewModal
                        visible={visible}
                        setVisible={() => {
                          setOpen(false);
                        }}
                        urls={[value || ""]}
                      />
                    )}
                  </div>
                </div>
                <input
                  className="itemUploadFileIcon"
                  type="file"
                  name={value}
                  disabled={!isFieldInputRequired(field, columns)}
                />
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
            <button
              className="saveButton"
              type="submit"
              onClick={() => updateData()}
            >
              Save
            </button>
            <button
              className="cancelButton"
              type="submit"
              onClick={() => updateData()}
            >
              Cancel
            </button>
          </>
        ) : null}
      </form>
    </div>
  );
};

export default EditForm;
