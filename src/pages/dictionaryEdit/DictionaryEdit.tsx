import { useParams } from "react-router-dom";
import Edit from "../../components/edit/Edit";
import { useNavigate } from "react-router";
import "./dictionaryEdit.scss";
import Back from "../../assets/back.svg";
import IconButton from "@mui/material/IconButton";

const DictionaryEdit = () => {
  const { id } = useParams();
  const idTemp = Number(id);
  const navigate = useNavigate();

  return (
    <div className="dictionaryEdit">
      <div className="info">
        <h1>Dictionary Edit</h1>
        <IconButton className="backButton" onClick={() => navigate(-1)}>
          <img src={Back} alt="" />
        </IconButton>
        <Edit id={idTemp} />
      </div>
    </div>
  );
};

export default DictionaryEdit;
