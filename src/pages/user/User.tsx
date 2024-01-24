import DataTable from "../../components/dataTable/DataTable";
import "./user.scss";
import { useState, useEffect } from "react";
import { userColumns } from "../../data";
import { passwordColumns } from "../../data";
import Edit from "../../components/edit/Add";
import KeyChange from "../../components/password/Add";

const url = "https://mocarps.azurewebsites.net/user/";

const User = () => {
  const [openEdit, setOpenEdit] = useState(false);
  const [openKeyChange, setKeyChange] = useState(false);
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
    console.log("Rows: ", rows);
    console.log("openEdit: ", openEdit);
    console.log("openAdd: ", openKeyChange);
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
          setKeyChange={setKeyChange}
          setId={setTargetId}
          passwordField={true}
        />
      )}
      {openKeyChange ? (
        <KeyChange
          slug="user"
          columns={passwordColumns}
          setKeyChange={setKeyChange}
          handleAfterAddRow={handleAfterAddRow}
          rows={rows.find((row) => row.id === targetId)}
          targetId={targetId}
        />
      ) : null}
      {openEdit ? (
        <Edit
          slug="user"
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
