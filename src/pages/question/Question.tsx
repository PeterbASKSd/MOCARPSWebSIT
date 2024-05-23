import "./question.scss";
import DataTable from "../../components/dataTable/DataTable";
import IconButton from "@mui/material/IconButton";
import AddButton from "/src/assets/add.svg";
import { useState, useEffect } from "react";
import Add from "../../components/add/Add";
import { questionColumns, publishColumns } from "../../data";
import Edit from "../../components/edit/Add";
import ControlChange from "../../components/userControl/Add";

const url = "https://mocarps.azurewebsites.net/questionSet/";

const Question = () => {
  const [openEdit, setOpenEdit] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [openControlChange, setOpenControlChange] = useState(false);
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
    <div className="question">
      <div className="info">
        <h1>Quiz</h1>
        <IconButton onClick={() => setOpenAdd(true)} className="addButton">
          <img src={AddButton} alt="" />
          <h3>New</h3>
        </IconButton>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <DataTable
          slug="questionSet"
          columns={questionColumns}
          rows={rows}
          handleAfterAddRow={handleAfterAddRow}
          setOpen={setOpenEdit}
          setId={setTargetId}
        />
      )}
      {openAdd ? (
        <Add
          slug="questionSet/add"
          columns={questionColumns}
          setOpen={setOpenAdd}
          handleAfterAddRow={handleAfterAddRow}
        />
      ) : null}
      {openEdit ? (
        <Edit
          slug="questionSet/info"
          columns={questionColumns}
          setOpen={setOpenEdit}
          handleAfterAddRow={handleAfterAddRow}
          rows={rows.find((row) => row.id === targetId)}
          targetId={targetId}
          published={rows.find((row) => row.id === targetId)?.publishedAt} // Pass the published status of the selected row
        />
      ) : null}
      {openControlChange ? (
        <ControlChange
          slug="questionSet/published"
          columns={publishColumns}
          setControlChange={setOpenControlChange}
          handleAfterAddRow={handleAfterAddRow}
          rows={rows.find((row) => row.id === targetId)}
          targetId={targetId}
        />
      ) : null}
    </div>
  );
};

export default Question;
