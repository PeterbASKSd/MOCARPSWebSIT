import "./informationDetails.scss";
import axios from "axios";
import React, { useEffect, useState } from "react";
import SortableTree, {
  removeNodeAtPath,
  toggleExpandedForAll,
} from "@nosferatu500/react-sortable-tree";
import "@nosferatu500/react-sortable-tree/style.css";
import { useLocation } from "react-router-dom";
import {
  categoryColumns,
  GenerateNodePropsParams,
  prepareTreeDataForSubmission,
} from "../../data";
import AddNode from "../../components/tree/treeAdd";
import ReturnIcon from "../../assets/back.svg";
import EditIcon from "../../assets/edit.svg";
import DeleteIcon from "../../assets/delete.svg";
import AddNodeIcon from "../../assets/add2.svg";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { TreeNode, resourceTypes } from "../../data";

const InformationDetails: React.FC = () => {
  const location = useLocation();
  const { category, largestId, treeData, id } = location.state || {};
  const [openAddNewNode, setOpenAddNewNode] = useState<boolean>(false);
  // const [searchString, setSearchString] = useState("");
  const [searchFocusIndex, setSearchFocusIndex] = useState(0);
  // const [searchFoundCount, setSearchFoundCount] = useState<number>(0);
  const [change, setChange] = useState<boolean>(false);
  const [targetTreeData, setTargetTreeData] = useState<any[]>([]);
  const [updateTreeData, setUpdateTreeData] = useState<any[]>([]);
  const [nodeInfo, setNodeInfo] = useState<GenerateNodePropsParams | null>(
    null
  );
  const navigate = useNavigate();
  const [editableNode, setEditableNode] = useState<TreeNode | null>(null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [resourceType, setResourceType] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [originalFileUrl, setOriginalFileUrl] = useState<string | null>(null);
  const [newFileUrl, setNewFileUrl] = useState<string | null>(null);
  const [isEditingNodeDetail, setIsEditingNodeDetail] = useState(false);
  const [isEditingNode, setIsEditingNode] = useState(true);

  useEffect(() => {
    if (change === false) {
      setTargetTreeData(category.children);
      setUpdateTreeData(treeData);
    }
  }, [category]);

  useEffect(() => {
    console.log("TargetTreeData: ", targetTreeData);
    console.log("UpdateTreeData: ", updateTreeData);
    console.log("Change: ", change);
    console.log("LargestID: ", id);
  }, [targetTreeData, updateTreeData, change]);

  // Populate originalFileUrl when the component mounts or when the editableNode changes
  useEffect(() => {
    // If the editableNode has a file associated with it, set the originalFileUrl
    if (editableNode?.resourceUri) {
      setOriginalFileUrl(editableNode.resourceUri);
    } else {
      // If there is no file, reset the originalFileUrl
      setOriginalFileUrl(null);
    }

    // Always reset the newFileUrl when editing a different node
    setNewFileUrl(null);
    setFile(null);
  }, [editableNode]);

  // const selectPrevMatch = () => {
  //   setSearchFocusIndex(
  //     searchFocusIndex !== null
  //       ? (searchFoundCount + searchFocusIndex - 1) % searchFoundCount
  //       : searchFoundCount - 1
  //   );
  // };

  // const selectNextMatch = () => {
  //   setSearchFocusIndex(
  //     searchFocusIndex !== null ? (searchFocusIndex + 1) % searchFoundCount : 0
  //   );
  // };

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
        setChange(true);
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

  // const alertNodeInfo = ({
  //   node,
  //   path,
  //   treeIndex,
  // }: {
  //   node: any;
  //   path: any[];
  //   treeIndex: number;
  // }) => {
  //   const objectString = Object.keys(node)
  //     .map((k) => (k === "children" ? "children: Array" : `${k}: '${node[k]}'`))
  //     .join(",\n   ");

  //   global.alert(
  //     "Info passed to the icon and button generators:\n\n" +
  //       `node: {\n   ${objectString}\n},\n` +
  //       `path: [${path.join(", ")}],\n` +
  //       `treeIndex: ${treeIndex}`
  //   );
  // };

  function updateChildrenById(
    nodes: any[],
    nodeId: any,
    newChildren: any[]
  ): any[] {
    return nodes.map((node: any): any => {
      if (node.id === nodeId) {
        return { ...node, children: newChildren };
      } else if (node.children) {
        return {
          ...node,
          children: updateChildrenById(node.children, nodeId, newChildren),
        };
      }
      return node;
    });
  }

  const openEditor = () => {
    setIsEditingNodeDetail(true);
  };

  // Call this function to close the editor and hide the overlay
  const closeEditor = () => {
    setIsEditingNodeDetail(false);
  };

  const openInfoDetail = () => {
    setIsEditingNode(true);
  };

  // Call this function to close the editor and hide the overlay
  const closeInfoDetail = () => {
    setIsEditingNode(false);
  };

  const handleReset = () => {
    Swal.fire({
      title: "Are you sure you want to reset the changes?",
      showDenyButton: false,
      showCancelButton: true,
      confirmButtonText: "Reset Changes",
      denyButtonText: "Discard Changes",
    }).then((result) => {
      if (result.isConfirmed) {
        setTargetTreeData(category.children);
        setChange(false);
      } else if (result.isDenied) {
        return;
      }
    });
  };

  const handleSubmition = async (submissionData: any) => {
    try {
      const submitResponse = await axios.post(
        `https://mocarps.azurewebsites.net/information`,
        submissionData
      );
      if (submitResponse.status === 200) {
        console.log("Successfully changed");

        // Assuming the response includes the updated data
        // Update your state with this new data to refresh the component
        setTargetTreeData(submitResponse.data.updatedTreeData);

        setChange(false);
        Swal.fire({ title: "Successfully changed", icon: "success" });
      }
    } catch (submitError) {
      console.error("Error submitting tree data:", submitError);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong with the save operation!",
      });
    }
  };

  const handleSaveChanges = async () => {
    const newUpdateTreeData = updateChildrenById(
      updateTreeData,
      id,
      targetTreeData
    );

    console.log("NewUpdateTreeData:", newUpdateTreeData);

    const submissionData = prepareTreeDataForSubmission(newUpdateTreeData);

    try {
      await handleSubmition(submissionData);
    } catch (error) {
      // Handle any errors here
      console.error("Error during submission:", error);
    }
  };

  const handleSaveAndBackToCategory = async () => {
    const navigateBack = () => {
      // Navigate back to the Information page
      navigate("/information");
    };

    if (change) {
      Swal.fire({
        title: "Are you sure you want to save the changes?",
        showDenyButton: false,
        showCancelButton: true,
        confirmButtonText: "Save Changes",
        denyButtonText: "Discard Changes",
      }).then((result) => {
        if (result.isConfirmed) {
          handleSaveChanges();
          navigateBack();
        } else if (result.isDenied) {
          // Discard changes and navigate back
          navigateBack();
        } else {
          return;
        }
      });
    } else {
      // No changes to save, just navigate back
      navigateBack();
    }
  };

  const handleBackToCategory = async () => {
    const navigateBack = () => {
      // Navigate back to the Information page
      navigate("/information");
    };

    if (change) {
      Swal.fire({
        title:
          "You have some unsaved edits, are you sure you want to leave or save?",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Save Changes",
        denyButtonText: "Discard Changes",
      }).then((result) => {
        if (result.isConfirmed) {
          handleSaveChanges();
          navigateBack();
        } else if (result.isDenied) {
          // Discard changes and navigate back
          navigateBack();
        } else {
          return;
        }
      });
    } else {
      // No changes to save, just navigate back
      navigateBack();
    }
  };

  function editNode(rowInfo: { node: any; path: any[]; treeIndex: number }) {
    const { node } = rowInfo;
    setEditableNode(node);
    setTitle(node.title || "");
    setSubtitle(node.subtitle || "");
    setResourceType(node.resourceType || "");
    setOriginalFileUrl(node.resourceUri || "");
    // Reset new file selection states when a different node is edited
    setFile(null);
    setNewFileUrl(null);
  }

  async function saveNode() {
    if (editableNode === null) {
      console.error("No node selected for editing");
      return;
    }

    // If a file has been selected, prepare to upload it
    let newResourceUri = editableNode.resourceUri;
    if (file) {
      const fileFormData = new FormData();
      fileFormData.append("file", file); // 'file' is the field name you'll access on the server

      try {
        // Send the file to the server
        const uploadResponse = await axios.post(
          "https://mocarps.azurewebsites.net/uploadFile",
          fileFormData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        // Handle the response, assuming the server responds with the URL of the uploaded file
        newResourceUri = uploadResponse.data.blobUrl;
      } catch (error) {
        console.error("Error uploading file:", error);
        alert("Failed to upload file.");
        return;
      }
    }

    const updatedNode: TreeNode = {
      ...editableNode,
      title: title,
      subtitle: subtitle, // assuming you have renamed subtitle to description
      resourceType: resourceType,
      resourceUri: newResourceUri,
      sections: editableNode.sections || [],
    };

    // Function to recursively update the node in the tree data
    const updateNodeInTree = (
      nodes: TreeNode[],
      updatedNode: TreeNode
    ): TreeNode[] => {
      return nodes.map((node) => {
        if (node.id === updatedNode.id) {
          // Found the node to update
          return updatedNode;
        }
        if (node.children && node.children.length > 0) {
          // Recursively update children
          return {
            ...node,
            children: updateNodeInTree(node.children, updatedNode),
          };
        }
        // Node is not a match and doesn't have children, return as is
        return node;
      });
    };

    // Update the state with the new node information
    setTargetTreeData((prevData) => updateNodeInTree(prevData, updatedNode));

    // Reset editableNode to null to close the edit form
    setEditableNode(null);

    // Optionally, send the update to the server
    setChange(true);
  }

  // handleFileChange function
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];

    // Revoke the old new file URL to clean up resources
    if (newFileUrl) {
      URL.revokeObjectURL(newFileUrl);
      setNewFileUrl(null);
    }

    if (!selectedFile) {
      setFile(null);
      return;
    }

    // Check for 'video' resource type
    if (resourceType === "video") {
      const video = document.createElement("video");
      video.preload = "metadata";

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        const videoHeight = video.videoHeight;

        if (videoHeight > 480) {
          alert(
            "Video resolution should be limited to 480p (720x480) or below."
          );
        } else {
          setFile(selectedFile);
          setNewFileUrl(URL.createObjectURL(selectedFile));
        }
      };

      video.src = URL.createObjectURL(selectedFile);
    } else if (
      resourceType === "image" &&
      selectedFile.size > 1024 * 1024 * 2
    ) {
      alert("Image file size should be limited to 2MB.");
    } else if (
      resourceType === "audio" &&
      selectedFile.size > 1024 * 1024 * 5
    ) {
      alert("Audio file size should be limited to 5MB.");
    } else {
      setFile(selectedFile);
      setNewFileUrl(URL.createObjectURL(selectedFile));
    }
  };

  const renderMediaPreview = (url: any, type: any) => {
    switch (type) {
      case "image":
        return (
          <img
            src={url}
            alt="Preview"
            style={{ maxWidth: "200px", maxHeight: "200px" }}
          />
        );
      case "audio":
        return <audio controls src={url} />;
      case "video":
        return (
          <video
            controls
            src={url}
            style={{ maxWidth: "200px", maxHeight: "200px" }}
          />
        );
      default:
        return <p>No preview available</p>;
    }
  };

  const handleFileAcceptance = (conditionValue: string) => {
    if (conditionValue === "image") {
      return ".jpg, .jpeg, .png";
    } else if (conditionValue === "audio") {
      return ".mp3, .m4a, .aac";
    } else if (conditionValue === "video") {
      return ".mp4";
    } else {
      return "";
    }
  };

  return (
    <div className="informationDetails">
      <div className="info">
        <h1>{category.title}</h1>
        <button
          onClick={() => {
            handleBackToCategory();
          }}
        >
          <img src={ReturnIcon} alt="Menu Icon" className="addButton" />
          Back to Category
        </button>
      </div>
      <>
        <div className="information-container">
          <div className="tree-container">
            <div className="toolBar">
              {/* <div className="searchBox"> */}
              {/* <input
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
                </button> */}
              {/* </div> */}
              <div className="otherButtons">
                <button
                  className="toolsButton  "
                  onClick={() => {
                    setOpenAddNewNode(true);
                    setNodeInfo(null); // Explicitly setting nodeInfo to null
                  }}
                >
                  Add New Item &nbsp;
                  <img src={AddNodeIcon} alt="Add Icon" />
                </button>
                <button className="toolsButton" onClick={expandAll}>
                  Expand All
                </button>
                <button className="toolsButton" onClick={collapseAll}>
                  Collapse All
                </button>
                <button
                  className="toolsButton"
                  onClick={handleSaveAndBackToCategory}
                >
                  Save
                </button>
                <button className="toolsButton" onClick={handleReset}>
                  Reset
                </button>
              </div>
            </div>
            <SortableTree
              treeData={targetTreeData}
              onChange={(targetTreeData) =>
                updateTargetTreeData(targetTreeData)
              }
              // searchQuery={searchString}
              searchFocusOffset={searchFocusIndex}
              searchFinishCallback={(matches) => {
                // setSearchFoundCount(matches.length);
                setSearchFocusIndex(
                  matches.length > 0 ? searchFocusIndex % matches.length : 0
                );
              }}
              canDrag={({ node }) => !node.dragDisabled}
              generateNodeProps={(rowInfo) => ({
                buttons: [
                  <div className="actionSet">
                    <button
                      onClick={() => {
                        editNode(rowInfo);
                        openEditor();
                        closeInfoDetail();
                      }}
                    >
                      <img src={EditIcon} alt="Edit Icon" />
                    </button>
                    {/* <button onClick={() => alertNodeInfo(rowInfo)}>
                      <img src={EditIcon} alt="Info Icon" />
                    </button> */}
                    {(rowInfo.node.children?.length === 0 ||
                      !rowInfo.node.children) && (
                      <button onClick={() => removeNode(rowInfo)}>
                        <img src={DeleteIcon} alt="Info Icon" />
                      </button>
                    )}
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
            {editableNode && (
              <div className="edit-form">
                <label htmlFor="title">Title</label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  placeholder="Enter title"
                  onChange={(e) => setTitle(e.target.value)}
                />

                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={subtitle}
                  placeholder="Enter description"
                  onChange={(e) => setSubtitle(e.target.value)}
                />

                <label htmlFor="resourceType">Media Type</label>
                <select
                  id="resourceType"
                  value={resourceType}
                  onChange={(e) => {
                    setResourceType(e.target.value);
                    setNewFileUrl(""); // Reset the resourceUri when resourceType changes
                  }}
                >
                  {resourceTypes.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <div className="media-preview-container">
                  {originalFileUrl && (
                    <div>
                      <label>Uploaded File:</label>
                      {originalFileUrl &&
                        renderMediaPreview(originalFileUrl, resourceType)}
                    </div>
                  )}
                  <div>
                    {resourceType !== "none" && (
                      <div>
                        <label htmlFor="resourceUri">Media</label>
                        <input
                          className="edit-form-fileSelection"
                          id="resourceUri"
                          type="file"
                          onChange={handleFileChange}
                          accept={handleFileAcceptance(resourceType)}
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <label>New File:</label>
                    {newFileUrl && renderMediaPreview(newFileUrl, resourceType)}
                  </div>
                </div>
                <div className="button-group">
                  <button
                    className="save-button"
                    onClick={() => {
                      saveNode();
                      closeEditor();
                      openInfoDetail();
                    }}
                  >
                    Save Draft
                  </button>
                  <button
                    className="cancel-button"
                    onClick={() => {
                      setEditableNode(null);
                      closeEditor();
                      openInfoDetail();
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        {isEditingNodeDetail && <div className="nodeOverlay"></div>}
        {isEditingNode && <div className="treeOverlay"></div>}
        {openAddNewNode ? (
          <AddNode
            largestID={largestId.current}
            columns={categoryColumns}
            setOpen={setOpenAddNewNode}
            nodeInfo={nodeInfo}
            treeData={targetTreeData}
            setTargetTreeData={setTargetTreeData} // Pass a function to update the tree data in Information
            setChange={setChange} // Pass the state variable to AddNode
          />
        ) : null}
      </>
    </div>
  );
};

export default InformationDetails;
