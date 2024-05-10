import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import "./dataTable.scss";
import EditIcon from "/src/assets/edit.svg";
import DeleteIcon from "/src/assets/delete.svg";
import DisableIcon from "/src/assets/disable.svg";
import axios from "axios";
import React from "react";
import Swal from "sweetalert2";
import keyIcon from "/src/assets/key.svg";
import EnableIcon from "/src/assets/enable.svg";
import NavigateIcon from "/src/assets/navigate.svg";
import ViewIcon from "/src/assets/view.svg";
import { useNavigate } from "react-router-dom";
// import ControlIcon from "/src/assets/control.svg";

type Props = {
  columns: GridColDef[];
  rows: object[];
  slug: string;
  handleAfterAddRow: (newRow: any) => void;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setKeyChange?: React.Dispatch<React.SetStateAction<boolean>>;
  setControlChange?: React.Dispatch<React.SetStateAction<boolean>>;
  setId: React.Dispatch<React.SetStateAction<number>>;
  passwordField?: boolean;
  setEmail?: React.Dispatch<React.SetStateAction<string>>;
  priority?: Number;
};

const DataTable = (props: Props) => {
  const [rows, setRows] = React.useState<object[]>(props.rows);
  const navigate = useNavigate();

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

  const handleDisable = (id: number) => {
    Swal.fire({
      title: "Are you sure you want to disable this account?",
      showDenyButton: false,
      showCancelButton: true,
      confirmButtonText: "Disable",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire("The account has been disabled now!");
        axios
          .post(`https://mocarps.azurewebsites.net/user/disable/${id}`)
          .then(() => {
            console.log(id + " has been disabled");
            const updatedRows = rows.map((row: any) => {
              if (row.id === id) {
                return { ...row, disabled: true };
              }
              return row;
            });
            setRows(updatedRows);
          })
          .catch((error) => {
            console.error("Error disabling account:", error);
          });
      }
    });
  };

  const handleEnable = (id: number) => {
    Swal.fire({
      title: "Are you sure you want to enable this account?",
      showDenyButton: false,
      showCancelButton: true,
      confirmButtonText: "Enable",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire("The account is ready now!");
        axios
          .post(`https://mocarps.azurewebsites.net/user/enable/${id}`)
          .then(() => {
            console.log(id + " has been enabled");
            const updatedRows = rows.map((row: any) => {
              if (row.id === id) {
                return { ...row, disabled: false };
              }
              return row;
            });
            setRows(updatedRows);
          })
          .catch((error) => {
            console.error("Error enabling account:", error);
          });
      }
    });
  };

  const handleDisPublished = (id: number) => {
    Swal.fire({
      title: "Are you sure you want to disable this publish?",
      showDenyButton: false,
      showCancelButton: true,
      confirmButtonText: "Disable",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire("The publish has been disabled now!");
        axios
          .put(`https://mocarps.azurewebsites.net/questionSet/publish/${id}`, {
            publish: false, // Sending JSON data
          })
          .then(() => {
            console.log(id + " has been disabled");
            const updatedRows = rows.map((row: any) => {
              if (row.id === id) {
                return { ...row, published: false };
              }
              return row;
            });
            setRows(updatedRows);
          })
          .catch((error) => {
            console.error("Error disabling publish:", error);
          });
      }
    });
  };

  const handlePublished = (id: number) => {
    Swal.fire({
      title: "Are you sure you want to enable this publish?",
      showDenyButton: false,
      showCancelButton: true,
      confirmButtonText: "Enable",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire("The publish is ready now!");
        axios
          .put(`https://mocarps.azurewebsites.net/questionSet/publish/${id}`, {
            publish: true, // Sending JSON data
          })
          .then(() => {
            console.log(id + " has been enabled");
            const updatedRows = rows.map((row: any) => {
              if (row.id === id) {
                return { ...row, published: true };
              }
              return row;
            });
            setRows(updatedRows);
          })
          .catch((error) => {
            console.error("Error enabling account:", error);
          });
      }
    });
  };

  const handleCategoryClick = (questions: any, id: any) => {
    navigate(`/questionset/${id}`, {
      state: {
        questions,
        id,
      },
    });
  };

  const handleResultClick = (
    questionSet: any,
    answers: any,
    userId: any,
    questionSetId: any
  ) => {
    navigate(`/quiz/${userId}/${questionSetId}`, {
      state: {
        questionSet,
        answers,
        userId,
        questionSetId,
      },
    });
  };

  // Add action column
  const actionColumn: GridColDef = {
    field: "actions",
    headerName: "Actions",
    width: 200,
    renderCell: (params) => {
      return (
        <div className="actionSet">
          {props.slug !== "user" && props.slug !== "quiz" ? (
            <div className="edit">
              <img
                src={EditIcon}
                alt=""
                onClick={() => {
                  props.setOpen(true);
                  props.setId(params.row.id);
                }}
              />
            </div>
          ) : props.passwordField &&
            props.priority === 0 &&
            (params.row.priority === 0 ||
              params.row.priority === 1 ||
              params.row.priority === 2) ? (
            <div className="edit">
              <img
                src={EditIcon}
                alt=""
                onClick={() => {
                  props.setOpen(true);
                  props.setId(params.row.id);
                }}
              />
            </div>
          ) : props.priority === 1 && params.row.priority === 2 ? (
            <div className="edit">
              <img
                src={EditIcon}
                alt=""
                onClick={() => {
                  props.setOpen(true);
                  props.setId(params.row.id);
                }}
              />
            </div>
          ) : null}

          {props.passwordField &&
          props.priority === 0 &&
          (params.row.priority === 0 ||
            params.row.priority === 1 ||
            params.row.priority === 2) ? (
            <div className="password">
              <img
                src={keyIcon}
                alt=""
                onClick={() => {
                  if (props.setKeyChange) {
                    props.setKeyChange(true);
                    props.setId(params.row.id);
                  }
                }}
              />
            </div>
          ) : props.passwordField &&
            props.priority === 1 &&
            params.row.priority === 2 ? (
            <div className="password">
              <img
                src={keyIcon}
                alt=""
                onClick={() => {
                  if (props.setKeyChange) {
                    props.setKeyChange(true);
                    props.setId(params.row.id);
                  }
                }}
              />
            </div>
          ) : null}
          {/* {props.priority === 0 ? (
            <div className="control">
              <img
                src={ControlIcon}
                alt=""
                onClick={() => {
                  if (props.setControlChange) {
                    props.setControlChange(true);
                  }
                }}
              />
            </div>
          ) : null} */}

          {props.slug !== "user" &&
          props.slug !== "questionSet" &&
          props.slug !== "quiz" ? (
            <div>
              <img
                className="delete"
                src={DeleteIcon}
                alt=""
                onClick={() => {
                  handleDelete(params.row.id);
                }}
              />
            </div>
          ) : props.passwordField &&
            props.priority === 0 &&
            params.row.disabled === false &&
            (params.row.priority === 0 ||
              params.row.priority === 1 ||
              params.row.priority === 2) ? (
            <div>
              <img
                className="delete"
                src={EnableIcon}
                alt=""
                onClick={() => {
                  handleDisable(params.row.id);
                }}
              />
            </div>
          ) : props.priority === 1 &&
            params.row.priority === 2 &&
            params.row.disabled === false ? (
            <div>
              <img
                className="delete"
                src={DisableIcon}
                alt=""
                onClick={() => {
                  handleDisable(params.row.id);
                }}
              />
            </div>
          ) : params.row.published === true ? (
            <div>
              <img
                className="delete"
                src={EnableIcon}
                alt=""
                onClick={() => {
                  handleDisPublished(params.row.id);
                }}
              />
            </div>
          ) : params.row.published === false ? (
            <div>
              <img
                className="delete"
                src={DisableIcon}
                alt=""
                onClick={() => {
                  handlePublished(params.row.id);
                }}
              />
            </div>
          ) : null}

          {props.slug !== "user" ? null : props.passwordField &&
            props.priority === 0 &&
            params.row.disabled === true &&
            (params.row.priority === 0 ||
              params.row.priority === 1 ||
              params.row.priority === 2) ? (
            <div>
              <img
                className="delete"
                src={DisableIcon}
                alt=""
                onClick={() => {
                  handleEnable(params.row.id);
                }}
              />
            </div>
          ) : props.priority === 1 &&
            params.row.priority === 2 &&
            params.row.disabled === true ? (
            <div>
              <img
                className="delete"
                src={DisableIcon}
                alt=""
                onClick={() => {
                  handleEnable(params.row.id);
                }}
              />
            </div>
          ) : null}

          {props.slug !== "questionSet" ? null : (
            <div>
              <img
                className="navigate"
                src={NavigateIcon}
                alt=""
                onClick={() => {
                  handleCategoryClick(params.row.question, params.row.id);
                }}
              />
            </div>
          )}

          {props.slug !== "quiz" ? null : (
            <div>
              <img
                className="view"
                src={ViewIcon}
                alt=""
                onClick={() => {
                  handleResultClick(
                    params.row.questionSet,
                    params.row.answers,
                    params.row.userId,
                    params.row.questionSetId
                  );
                }}
              />
            </div>
          )}
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
        checkboxSelection
        disableRowSelectionOnClick
        columnVisibilityModel={{
          questions: false,
          questionSet: false,
          answers: false,
        }}
      />
    </div>
  );
};

export default DataTable;
