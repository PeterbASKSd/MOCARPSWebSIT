import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import "./dataTable.scss";
import EditIcon from "/src/assets/edit.svg";
import Delete from "/src/assets/delete.svg";
import axios from "axios";
import React from "react";
import Swal from "sweetalert2";
import keyIcon from "/src/assets/key.svg";

type Props = {
  columns: GridColDef[];
  rows: object[];
  slug: string;
  handleAfterAddRow: (newRow: any) => void;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setKeyChange?: React.Dispatch<React.SetStateAction<boolean>>;
  setId: React.Dispatch<React.SetStateAction<number>>;
  passwordField?: boolean;
  setEmail?: React.Dispatch<React.SetStateAction<string>>;
};

const DataTable = (props: Props) => {
  const [rows, setRows] = React.useState<object[]>(props.rows);
  // const [open, setOpen] = React.useState(false);
  // Remove the declaration of the unused 'showWarning' variable
  // const [showWarning, setShowWarning] = React.useState(false);

  // Delete id message
  const handleDelete = (id: number) => {
    Swal.fire({
      title: "Are you sure you want to delete this row?",
      showDenyButton: false,
      showCancelButton: true,
      confirmButtonText: "Delete",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire("Deleted!");
        handleConfirm();
      }
    });

    const handleConfirm = () => {
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
  };

  // Add action column
  const actionColumn: GridColDef = {
    field: "actions",
    headerName: "Actions",
    width: 150,
    renderCell: (params) => {
      return (
        <div className="actionSet">
          <div className="edit">
            {/* <Link to={`/${props.slug}/${params.row.id}`}> */}
            {/* <IconButton
              onClick={() => props.setOpen(true)}
              className="editButton"
            >
              <img src={EditIcon} alt="" />
            </IconButton> */}
            <img
              src={EditIcon}
              alt=""
              onClick={() => {
                props.setOpen(true);
                props.setId(params.row.id);
              }}
            />
          </div>
          {props.passwordField ? (
            <div className="password">
              <img
                src={keyIcon}
                alt=""
                onClick={() => {
                  if (props.setKeyChange) {
                    props.setKeyChange(true);
                  }
                  props.setId(params.row.id);
                }}
              />
            </div>
          ) : null}
          <div>
            <img
              className="delete"
              src={Delete}
              alt=""
              onClick={() => {
                handleDelete(params.row.id);
              }}
            />
          </div>
        </div>
      );
    },
  };

  return (
    // Setting the dataGrid rows to the updated rows state
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
