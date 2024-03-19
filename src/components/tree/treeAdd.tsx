import "./treeAdd.scss";
import { useRef, useState } from "react";
import Swal from "sweetalert2";
import { CustomGridColDef, GenerateNodePropsParams } from "../../data";
import { addNodeUnderParent } from "@nosferatu500/react-sortable-tree";

type Props = {
  largestID: number;
  columns: CustomGridColDef[];
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  updateTreeData: (treeData: any[]) => void; // Callback to update tree data in Information
  nodeInfo: GenerateNodePropsParams | null; // Ensure this is used
  treeData: any[]; // Current tree data
  setChange: React.Dispatch<React.SetStateAction<boolean>>; // Ensure this is used
};

const treeAdd = (props: Props) => {
  const inputEl = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState<boolean>(false);

  const generateUniqueId = () =>
    `${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const createNode = () => {
    const value = inputEl.current?.value.trim();
    if (!value) {
      inputEl.current?.focus();
      return;
    }

    // Determine the parentKey based on whether nodeInfo is provided
    const parentKey = props.nodeInfo ? props.nodeInfo.treeIndex : null;

    let newTree = addNodeUnderParent({
      treeData: props.treeData,
      parentKey: parentKey, // Can be null for adding a primary node
      getNodeKey: ({ treeIndex }) => treeIndex,
      newNode: { id: generateUniqueId(), title: value },
      expandParent: true,
    });

    if (newTree.treeData) {
      props.updateTreeData(newTree.treeData);
      props.setChange(true);
      props.setOpen(false); // Close the component after adding the node
    } else {
      Swal.fire("Error", "Could not add the node.", "error");
    }

    // Reset input field and editing state
    if (inputEl.current) {
      inputEl.current.value = "";
    }
    setEditing(false);
  };

  return (
    <div className="treeAdd">
      <div className="model">
        <span
          className="close"
          onClick={() =>
            editing === true
              ? Swal.fire({
                  title: "Are you sure you want to discard your changes?",
                  showDenyButton: false,
                  showCancelButton: true,
                  confirmButtonText: "Discard",
                }).then((result) => {
                  if (result.isConfirmed) {
                    props.setOpen(false);
                  }
                })
              : props.setOpen(false)
          }
        >
          x
        </span>
        <h1>Add New Sub-Item</h1>
        <div>
          <label>
            <strong>Node Title:</strong>
          </label>
          <input
            ref={inputEl}
            type="text"
            placeholder="Enter node title"
            onChange={() => setEditing(true)}
          />
          <button onClick={createNode}>Add Node</button>
        </div>
      </div>
    </div>
  );
};

export default treeAdd;
