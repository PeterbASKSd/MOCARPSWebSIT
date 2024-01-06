import "./edit.scss";

import React from "react";

interface EditProps {
  id: number;
}

const Edit: React.FC<EditProps> = ({ id }) => {
  console.log(id);
  return <div className="edit"></div>;
};

export default Edit;
