import DataTable from "../../components/dataTable/DataTable";
import "./dictionary.scss";
import IconButton from "@mui/material/IconButton";
import AddButton from "/src/assets/add.svg";
import { useState, useEffect } from "react";
import Add from "../../components/add/Add";
import { dictionaryColumns } from "../../data";

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
          columns={dictionaryColumns}
          rows={rows}
          handleAfterAddRow={handleAfterAddRow}
        />
      )}
      {open && (
        <Add
          slug="dictionary"
          columns={dictionaryColumns}
          setOpen={setOpen}
          handleAfterAddRow={handleAfterAddRow}
        />
      )}
    </div>
  );
};

export default Dictionary;
