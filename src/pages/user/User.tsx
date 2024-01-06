import DataTable from "../../dataTable/DataTable";
import "./user.scss";
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
    field: "email",
    headerName: "Email",
    type: "email",
    width: 150,
    editable: true,
    required: true,
    input: true,
  },
  {
    field: "name",
    headerName: "Name",
    type: "string",
    width: 150,
    editable: true,
    input: true,
  },
  {
    field: "cardNumber",
    headerName: "Card Number",
    type: "string",
    width: 100,
    editable: true,
    required: true,
    input: true,
  },
  {
    field: "verified",
    headerName: "Verified",
    type: "boolean",
    width: 150,
    editable: true,
    input: true,
  },
  {
    field: "disabled",
    headerName: "Disabled",
    type: "boolean",
    width: 150,
    editable: true,
    input: true,
  },
];

const url = "https://mocarps.azurewebsites.net/user/";

const User = () => {
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
    <div className="user">
      <div className="info">
        <h1>User</h1>
        <IconButton onClick={() => setOpen(true)} className="addButton">
          <img src={AddButton} alt="" />
          <h3>New</h3>
        </IconButton>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <DataTable
          slug="User"
          columns={columns}
          rows={rows}
          handleAfterAddRow={handleAfterAddRow}
        />
      )}
      {open && (
        <Add
          slug="User"
          columns={columns}
          setOpen={setOpen}
          handleAfterAddRow={handleAfterAddRow}
        />
      )}
    </div>
  );
};

export default User;
