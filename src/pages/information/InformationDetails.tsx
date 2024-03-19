import "./information.scss";
import React, { useEffect, useState } from "react";
import SortableTree, {
  removeNodeAtPath,
  toggleExpandedForAll,
} from "@nosferatu500/react-sortable-tree";
import "@nosferatu500/react-sortable-tree/style.css";
import { useLocation } from "react-router-dom";
import { categoryColumns, GenerateNodePropsParams } from "../../data";
import AddNode from "../../components/tree/treeAdd";
import ReturnIcon from "../../assets/back.svg";
import EditIcon from "../../assets/edit.svg";
import DeleteIcon from "../../assets/delete.svg";
import AddNodeIcon from "../../assets/add2.svg";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const InformationDetails: React.FC = () => {
  const location = useLocation();
  const { category, largestId } = location.state || {};
  const [openAddNewNode, setOpenAddNewNode] = useState<boolean>(false);
  const [searchString, setSearchString] = useState("");
  const [searchFocusIndex, setSearchFocusIndex] = useState(0);
  const [searchFoundCount, setSearchFoundCount] = useState<number>(0);
  const [change, setChange] = useState<boolean>(false);
  const [targetTreeData, setTargetTreeData] = useState<any[]>([]);
  const [nodeInfo, setNodeInfo] = useState<GenerateNodePropsParams | null>(
    null
  );
  const navigate = useNavigate();

  useEffect(() => {
    setTargetTreeData(category.children);
  }, [category]);

  const selectPrevMatch = () => {
    setSearchFocusIndex(
      searchFocusIndex !== null
        ? (searchFoundCount + searchFocusIndex - 1) % searchFoundCount
        : searchFoundCount - 1
    );
  };

  const selectNextMatch = () => {
    setSearchFocusIndex(
      searchFocusIndex !== null ? (searchFocusIndex + 1) % searchFoundCount : 0
    );
  };

  function removeNode(rowInfo: any) {
    const { path } = rowInfo;
    Swal.fire({
      title: "Are you sure you want to delete the item?",
      showDenyButton: false,
      showCancelButton: true,
      confirmButtonText: "Delete",
    }).then((result) => {
      if (result.isConfirmed) {
        // Assuming setTargetTreeData is the setter from useState for targetTreeData
        // and removeNodeAtPath is correctly imported from wherever it's defined.
        setTargetTreeData((currentTreeData) =>
          removeNodeAtPath({
            treeData: currentTreeData, // Use the current state
            path,
            getNodeKey: ({ treeIndex }) => treeIndex, // An example initializer for getNodeKey
            // If nodes have unique IDs, getNodeKey could be something like:
            // getNodeKey: ({ node }) => node.id,
          })
        );
      }
    });
  }

  function updateTargetTreeData(treeData: any[]) {
    setTargetTreeData(treeData);
    setChange(true);
  }

  function expand(expanded: boolean) {
    // Use the correct property name 'treeData' when calling 'toggleExpandedForAll'
    const updatedTreeData = toggleExpandedForAll({
      treeData: targetTreeData, // Use the correct state variable here
      expanded, // This correctly sets whether to expand or collapse
    });

    // Now 'updatedTreeData' will have all nodes expanded or collapsed as per the 'expanded' argument
    setTargetTreeData(updatedTreeData);
  }

  function expandAll() {
    expand(true);
  }

  function collapseAll() {
    expand(false);
  }

  const alertNodeInfo = ({
    node,
    path,
    treeIndex,
  }: {
    node: any;
    path: any[];
    treeIndex: number;
  }) => {
    const objectString = Object.keys(node)
      .map((k) => (k === "children" ? "children: Array" : `${k}: '${node[k]}'`))
      .join(",\n   ");

    global.alert(
      "Info passed to the icon and button generators:\n\n" +
        `node: {\n   ${objectString}\n},\n` +
        `path: [${path.join(", ")}],\n` +
        `treeIndex: ${treeIndex}`
    );
  };

  const handleBackToCategory = () => {
    const navigateBack = () => {
      // Navigate back to the Information page
      navigate("/information");
    };

    if (change) {
      Swal.fire({
        title: "Are you sure you want to save the changes?",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Save Changes",
        denyButtonText: "Discard Changes",
      }).then((result) => {
        setTargetTreeData([]);
        setChange(false);
        if (result.isConfirmed) {
          // Save changes here, then navigate back
          // saveChanges(); // This would be your function to save the changes
          navigateBack();
        } else if (result.isDenied) {
          // Discard changes and navigate back
          navigateBack();
        } // No else needed as we call navigateBack() in both cases
      });
    } else {
      // No changes to save, just navigate back
      navigateBack();
    }
  };

  return (
    <div className="information">
      <div className="info">
        <h1>{category.title}</h1>
        <button onClick={handleBackToCategory}>
          {" "}
          <img src={ReturnIcon} alt="Menu Icon" className="addButton" />
          Back to Category
        </button>
      </div>
      <>
        <div className="information-container">
          <div className="tree-container">
            <div className="footerOfCategory">
              <h3>Add a new main item</h3>
              <button
                className="footerButtons"
                onClick={() => {
                  setOpenAddNewNode(true);
                  setNodeInfo(null); // Explicitly setting nodeInfo to null
                }}
              >
                <img src={AddNodeIcon} alt="Add Icon" />
              </button>
            </div>
            <div className="toolBar">
              <div className="searchBox">
                <input
                  className="search"
                  type="text"
                  placeholder="Filter by Ttile..."
                  onChange={(event) => setSearchString(event.target.value)}
                />
                <button
                  type="button"
                  disabled={!searchFoundCount}
                  onClick={selectPrevMatch}
                >
                  &lt;
                </button>
                <button
                  type="submit"
                  disabled={!searchFoundCount}
                  onClick={selectNextMatch}
                >
                  &gt;
                </button>
              </div>
              <div className="otherButtons">
                <button className="toolsButton" onClick={expandAll}>
                  Expand All
                </button>
                <button className="toolsButton" onClick={collapseAll}>
                  Collapse All
                </button>
              </div>
            </div>
            <SortableTree
              treeData={targetTreeData}
              onChange={(targetTreeData) =>
                updateTargetTreeData(targetTreeData)
              }
              searchQuery={searchString}
              searchFocusOffset={searchFocusIndex}
              searchFinishCallback={(matches) => {
                setSearchFoundCount(matches.length);
                setSearchFocusIndex(
                  matches.length > 0 ? searchFocusIndex % matches.length : 0
                );
              }}
              canDrag={({ node }) => !node.dragDisabled}
              generateNodeProps={(rowInfo) => ({
                buttons: [
                  <div className="actionSet">
                    <button onClick={() => alertNodeInfo(rowInfo)}>
                      <img src={EditIcon} alt="Info Icon" />
                    </button>
                    <button onClick={() => removeNode(rowInfo)}>
                      <img src={DeleteIcon} alt="Info Icon" />
                    </button>
                    {rowInfo.path.length < 3 ? (
                      <button
                        onClick={() => {
                          setOpenAddNewNode(true);
                          setNodeInfo(rowInfo);
                        }}
                      >
                        <img src={AddNodeIcon} alt="Add Icon" />
                      </button>
                    ) : null}
                  </div>,
                ],
              })}
              maxDepth={3}
            />
          </div>
          <div className="edit-container">
            <div className="edit">
              <h1>Edit</h1>
            </div>
          </div>
        </div>
        {openAddNewNode ? (
          <AddNode
            largestID={largestId.current}
            columns={categoryColumns}
            setOpen={setOpenAddNewNode}
            nodeInfo={nodeInfo}
            treeData={targetTreeData} // Pass the current tree data to AddNode
            updateTreeData={setTargetTreeData} // Pass a function to update the tree data in Information
            setChange={setChange} // Pass the state variable to AddNode
          />
        ) : null}
      </>
    </div>
  );
};

export default InformationDetails;
