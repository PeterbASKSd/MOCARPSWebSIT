import DataTable from "../../components/dataTable/DataTable";
import "./value.scss";
import IconButton from "@mui/material/IconButton";
import AddButton from "/src/assets/add.svg";
import { useState, useEffect } from "react";
import Add from "../../components/add/Add";
import { valueColumns } from "../../data";
import Edit from "../../components/edit/Add";

const url = "https://mocarps.azurewebsites.net/valueChecking/";

const Value = () => {
  const [openEdit, setOpenEdit] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [targetId, setTargetId] = useState<number>(0);

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
    } catch (error) {
      console.error("Error fetching rows:", error);
    }
  };

  useEffect(() => {
    console.log("Id: ", targetId);
    console.log("Rows: ", rows);
    console.log(
      "Rows with id: ",
      rows.find((row) => row.id === targetId)
    );
    console.log("openEdit: ", openEdit);
    console.log("openAdd: ", openAdd);
  });

  useEffect(() => {
    if (!openEdit) {
      setTargetId(0);
    }
  }, [openEdit]);

  useEffect(() => {
    fetchRowsFromAPI();
  }, []);

  return (
    <div className="value">
      <div className="info">
        <h1>Value</h1>
        <IconButton onClick={() => setOpenAdd(true)} className="addButton">
          <img src={AddButton} alt="" />
          <h3>New</h3>
        </IconButton>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <DataTable
          slug="valueChecking"
          columns={valueColumns}
          rows={rows}
          handleAfterAddRow={handleAfterAddRow}
          setOpen={setOpenEdit}
          setId={setTargetId}
        />
      )}
      {openAdd ? (
        <Add
          slug="valueChecking"
          columns={valueColumns}
          setOpen={setOpenAdd}
          handleAfterAddRow={handleAfterAddRow}
        />
      ) : null}
      {openEdit ? (
        <Edit
          slug="valueChecking"
          columns={valueColumns}
          setOpen={setOpenEdit}
          handleAfterAddRow={handleAfterAddRow}
          rows={rows.find((row) => row.id === targetId)}
          targetId={targetId}
        />
      ) : null}
    </div>
  );
};

export default Value;
