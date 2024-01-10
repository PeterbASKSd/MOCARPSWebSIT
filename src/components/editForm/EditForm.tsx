import "./editForm.scss";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { CustomGridColDef } from "../../data";
import PreviewModal from "react-media-previewer";
import preview from "../../assets/preview.svg";
import { IconButton } from "@mui/material";
import Swal from "sweetalert2";
import Select from "react-select";

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
  const [changeFile, setFileChange] = useState(null || Boolean);
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | undefined>(undefined);
  const [newUrl, setNewUrl] = useState<string>();
  const [visible, setVisible] = useState<boolean>(false);
  const [blobUrl, setBlobUrl] = useState<string>();
  const [options, setOptions] = useState<string[]>([]); // Initialize with an empty array
  const fileFormData = new FormData();

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

  const replaceUrlsInFormData = (file: File, blobUrl: string) => {
    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === "string" && (value as string).includes(file.name)) {
        console.log("here: point 4:", (data as any)[key]);
        (data as any)[key] = blobUrl;
        setData(data);
      }
    });
  };

  const handleConfirm = () => {
    if (file) {
      fileFormData.append("file", file);

      axios
        .post(`https://mocarps.azurewebsites.net/uploadFile`, fileFormData, {
          headers: {
            "Content-Type": "application/octet-stream",
          },
        })
        .then((response) => {
          setBlobUrl(response.data.blobUrl);

          if (newUrl && blobUrl) {
            console.log("here: point 1:", newUrl);
            console.log("here: point 2:", blobUrl);
            replaceUrlsInFormData(file, blobUrl);
            console.log("here: point 3:", data);
          }
        });
    }

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
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent the default form submission
    console.log("here: point 0:", data);

    if (change || changeFile) {
      handleEditedData(); // Show the warning alert
    } else {
      axios
        .put(`https://mocarps.azurewebsites.net/${slug}/${id}`, data)
        .then(() => {})
        .catch((error) => {
          console.error(error);
        });
    }
  };

  const handleLongInputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    field: string
  ) => {
    setData({ ...data, [field]: e.target.value });
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile); // Convert the file to a URL
      setNewUrl(URL.createObjectURL(selectedFile)); // Convert the file to a URL
      setVisible(true); // Show the preview modal
      handleInputChange(e, field); // Update the formData
    } else {
      setVisible(false); // Hide the preview modal
      setFile(undefined); // Convert the file to a URL
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    setData({ ...data, [field]: e.target.value });
  };

  const handleSelectChange = (field: string, selectedOption: any) => {
    setData({ ...data, [field]: selectedOption });
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
                <div>
                  <label>
                    Default: <label className="oldlabel">{value}</label>
                  </label>
                  <Select
                    className="itemOptions"
                    defaultValue={value}
                    options={
                      getOptions(field, columns)?.map((option) => ({
                        value: [option],
                        label: [option],
                      })) || []
                    }
                    onChange={(selectedValue) => {
                      console.log(selectedValue);
                      handleSelectChange(field, selectedValue.value);
                      setChange(true);
                    }}
                  />
                </div>
              ) : (
                <input
                  className="itemOptions"
                  type="value"
                  name={value}
                  disabled
                />
              )
            ) : isFieldInputType(field, columns) === "file" ? (
              <div className="itemUploadFile">
                {!changeFile ? (
                  <div className="itemUploadedFile">
                    <label className="uploadFileLabel">Uploaded file:</label>
                    <a
                      href={value}
                      className="uploadedFileLink"
                      target="_blank"
                    >
                      {value}
                    </a>
                  </div>
                ) : null}
                <div className="itemPreviewUploadedFile">
                  <label className="uploadNewFileLabel">Upload New file:</label>
                  <input
                    className="uploadFileInput"
                    type="file"
                    name={value}
                    disabled={!isFieldInputRequired(field, columns)}
                    accept=".jpg, .jpeg, .svg, .png, .mp3, .mp4 .mov .avi"
                    onChange={(e) => {
                      handleFileChange(e, field);
                      setFileChange(true);
                    }}
                  />
                  <div className="previewIcon">
                    <IconButton
                      onClick={() => {
                        setOpen(true);
                        setVisible(true);
                      }}
                    >
                      <img src={preview} alt="" className="previewIconButton" />
                    </IconButton>
                    {open && (
                      <PreviewModal
                        visible={visible}
                        setVisible={() => {
                          setOpen(false);
                          setVisible(false);
                        }}
                        urls={[newUrl || ""]}
                      />
                    )}
                  </div>
                </div>
                <div className="uploadReminder">
                  *It will cover the old file, please make sure you want to do
                  it.
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
        {change || changeFile ? (
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
