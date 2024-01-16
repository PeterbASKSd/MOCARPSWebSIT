import { useNavigate } from "react-router";
import "./dictionaryEdit.scss";
import Back from "../../assets/back.svg";
import { IconButton } from "@mui/material";
import { useParams } from "react-router-dom";
import { dictionaryColumns } from "../../data";
import EditForm from "../../components/.editForm/EditForm";

const DictionaryEdit = () => {
  const navigate = useNavigate();
  const { slug, id } = useParams();
  const safeSlug = slug || "";
  const safeId = id || "";

  return (
    <div className="dictionaryEdit">
      <div className="info">
        <h1>Dictionary Edit</h1>
        <IconButton className="backButton" onClick={() => navigate(-1)}>
          <img src={Back} alt="" />
        </IconButton>
      </div>
      <div className="editContect">
        <EditForm id={safeId} slug={safeSlug} columns={dictionaryColumns} />
      </div>
    </div>
  );
};

export default DictionaryEdit;
