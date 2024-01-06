import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import "./dataTable.scss";
import { Link } from "react-router-dom";
import Edit from "/src/assets/edit.svg";
import Delete from "/src/assets/delete.svg";
import axios from "axios";
import React from "react";

type Props = {
  columns: GridColDef[];
  rows: object[];
  slug: string;
  handleAfterAddRow: (newRow: any) => void;
};

const DataTable = (props: Props) => {
  const [rows, setRows] = React.useState<object[]>(props.rows);

  // Delete id message
  const handleDelete = (id: number) => {
    axios
      .delete(`https://mocarps.azurewebsites.net/${props.slug}/${id}`)
      .then(() => {
        console.log(id + " has been deleted");
        const updatedRows = rows.filter((row: any) => row.id !== id);
        setRows(updatedRows);
      })
      .catch((error) => {
        console.error("Error deleting row:", error);
      });
  };

  const actionColumn: GridColDef = {
    field: "actions",
    headerName: "Actions",
    width: 200,
    renderCell: (params) => {
      return (
        <div className="edit">
          <Link to={`/${props.slug}Edit/${params.row.id}`}>
            <img src={Edit} alt="" />
          </Link>
          <div
            className="delete"
            onClick={() => {
              handleDelete(params.row.id);
            }}
          >
            <img src={Delete} alt="" />
          </div>
        </div>
      );
    },
  };

  return (
    <div className="dataTable">
      <DataGrid
        className="dataGrid"
        rows={rows} // Updated to use the updated rows state
        columns={[...props.columns, actionColumn]}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10,
            },
          },
        }}
        slots={{
          toolbar: GridToolbar,
        }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
          },
        }}
        pageSizeOptions={[5, 10, 20, 50, 100]}
      />
    </div>
  );
};

export default DataTable;
