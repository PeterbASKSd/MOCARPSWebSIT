import DataTable from "../../components/dataTable/DataTable";
import "./user.scss";
import { useState, useEffect } from "react";
import Add from "../../components/add/Add";
import { userColumns } from "../../data";
import Edit from "../../components/edit/Add";

const url = "https://mocarps.azurewebsites.net/user/";

const User = () => {
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
    <div className="user">
      <div className="info">
        <h1>User</h1>
        {/* <IconButton onClick={() => setOpenAdd(true)} className="addButton">
          <img src={AddButton} alt="" />
          <h3>New</h3>
        </IconButton> */}
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <DataTable
          slug="user"
          columns={userColumns}
          rows={rows}
          handleAfterAddRow={handleAfterAddRow}
          setOpen={setOpenEdit}
          setId={setTargetId}
          passwordField={true}
        />
      )}
      {openAdd ? (
        <Add
          slug="user"
          columns={userColumns}
          setOpen={setOpenAdd}
          handleAfterAddRow={handleAfterAddRow}
        />
      ) : null}
      {openEdit ? (
        <Edit
          slug="dictionary"
          columns={userColumns}
          setOpen={setOpenEdit}
          handleAfterAddRow={handleAfterAddRow}
          rows={rows.find((row) => row.id === targetId)}
          targetId={targetId}
        />
      ) : null}
    </div>
  );
};

export default User;
