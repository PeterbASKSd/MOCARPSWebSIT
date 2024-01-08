import "./editForm.scss";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { CustomGridColDef } from "../../data";

const EditForm = ({
  slug,
  id,
  columns,
}: {
  slug: string;
  id: string;
  columns: CustomGridColDef[];
}) => {
  const [data, setData] = useState<object>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `https://mocarps.azurewebsites.net/${slug}/${id}`
        );
        setData(response.data);
      } catch (error) {
        console.error("Error fetching edit data:", error);
      }
    };

    fetchData();
  }, []);

  const isFieldInputRequired = (field: string, columns: CustomGridColDef[]) => {
    return columns.find((column) => column.field === field)?.input;
  };

  const isFieldInputType = (field: string, columns: CustomGridColDef[]) => {
    return columns.find((column) => column.field === field)?.type;
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
            <label className="itemField">{field}</label>
            {isFieldInputType(field, columns) === "longText" ? (
              <textarea
                className="itemValueLongText"
                value={value || ""}
                onChange={(e) => handleLongInputChange(e, field)}
                disabled={!isFieldInputRequired(field, columns)}
              />
            ) : (
              <input
                className="itemValueText"
                value={value || ""}
                onChange={(e) => handleInputChange(e, field)}
                disabled={!isFieldInputRequired(field, columns)}
              />
            )}
          </div>
        ))}
      </form>
    </div>
  );
};

export default EditForm;
