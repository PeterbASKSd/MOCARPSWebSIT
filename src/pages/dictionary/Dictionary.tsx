import DataTable from "../../dataTable/DataTable";
import "./dictionary.scss";
import IconButton from "@mui/material/IconButton";
import AddButton from "/src/assets/add.svg";
import { useState, useEffect } from "react";
import Add from "../../components/add/Add";
import { CustomGridColDef } from "../../data";

const columns: CustomGridColDef[] = [
  {
    field: "id",
    headerName: "ID",
    width: 80,
  },
  {
    field: "keyword",
    headerName: "Keyword",
    type: "string",
    width: 150,
    editable: true,
    required: true,
    input: true,
    inputHint: "Enter a keyword",
  },
  {
    field: "description",
    headerName: "Description",
    type: "longText",
    width: 150,
    editable: true,
    required: true,
    input: true,
    inputHint: "Please enter a defined description",
  },
  {
    field: "example",
    headerName: "Example",
    type: "longText",
    width: 200,
    editable: true,
    required: true,
    input: true,
    inputHint: "Please enter an example",
  },
  {
    field: "count",
    headerName: "Count",
    type: "number",
    width: 100,
    editable: true,
  },
  {
    field: "resourceUri",
    headerName: "Media Url",
    type: "file",
    width: 200,
    editable: true,
    input: true,
  },
  {
    field: "resourceType",
    headerName: "Media Type",
    type: "options",
    width: 150,
    editable: true,
    input: true,
    inputOptions: ["Image", "Audio"],
  },
];

const url = "https://mocarps.azurewebsites.net/dictionary/";

const Dictionary = () => {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRowsFromAPI = async () => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch rows from API");
      }
      const data = await response.json();
      setRows(data);
    } catch (error) {
      console.error("Error fetching rows:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAfterAddRow = (newRow: any) => {
    setLoading(true);
    try {
      fetchRowsFromAPI();
      setRows((updatedRows) => [...updatedRows, newRow]);
      console.log("Successfully added: ", newRow);
      console.log("Rows: ", rows);
    } catch (error) {
      console.error("Error fetching rows:", error);
    }
  };

  useEffect(() => {
    fetchRowsFromAPI();
  }, []);

  return (
    <div className="dictionary">
      <div className="info">
        <h1>Dictionary</h1>
        <IconButton onClick={() => setOpen(true)} className="addButton">
          <img src={AddButton} alt="" />
          <h3>New</h3>
        </IconButton>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <DataTable
          slug="dictionary"
          columns={columns}
          rows={rows}
          handleAfterAddRow={handleAfterAddRow}
        />
      )}
      {open && (
        <Add
          slug="dictionary"
          columns={columns}
          setOpen={setOpen}
          handleAfterAddRow={handleAfterAddRow}
        />
      )}
    </div>
  );
};

export default Dictionary;
