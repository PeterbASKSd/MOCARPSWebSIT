import DataTable from "../../components/dataTable/DataTable";
import "./user.scss";
import { useState, useEffect } from "react";
import { signUpColumns, userColumns, accountColumns } from "../../data";
import { passwordColumns } from "../../data";
import Edit from "../../components/edit/Add";
import KeyChange from "../../components/password/Add";
import ControlChange from "../../components/userControl/Add";
import IconButton from "@mui/material/IconButton";
import AddButton from "/src/assets/add.svg";
import Add from "../../components/add/Add";

const url = "https://mocarps.azurewebsites.net/user/";

interface UserProps {
  priority: Number;
}

const User: React.FC<UserProps> = ({ priority }) => {
  const [openEdit, setOpenEdit] = useState(false);
  const [openKeyChange, setKeyChange] = useState(false);
  const [openControlChange, setControlChange] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openAdd, setOpenAdd] = useState(false);
  const [targetId, setTargetId] = useState<number>(0);

  const fetchRowsFromAPI = async () => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch rows from API");
      }
      const data = await response.json();
      if (priority === 0) {
        setRows(data);
        console.log("Data 0: ", data);
      } else {
        for (let i = data.length - 1; i >= 0; i--) {
          const row = data[i];
          if (row.priority <= priority) {
            console.log("Row: ", row);
            data.splice(i, 1);
          }
        }
        setRows(data);
        console.log("Data 1: ", data);
      }
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
    console.log("priority: ", priority);
    console.log("rows: ", rows);
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
        {priority === 0 ? (
          <IconButton onClick={() => setOpenAdd(true)} className="addButton">
            <img src={AddButton} alt="" />
            <h3>New</h3>
          </IconButton>
        ) : null}
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
          setControlChange={setControlChange}
          setId={setTargetId}
          passwordField={true}
          priority={priority}
        />
      )}
      {openAdd && priority === 0 ? (
        <Add
          slug="user/portal/signup"
          columns={signUpColumns}
          setOpen={setOpenAdd}
          handleAfterAddRow={handleAfterAddRow}
        />
      ) : null}
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
      {openControlChange ? (
        <ControlChange
          slug="user"
          columns={accountColumns}
          setControlChange={setControlChange}
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
