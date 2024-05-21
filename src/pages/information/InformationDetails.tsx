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
  const [searchFocusIndex, setSearchFocusIndex] = useState(0);
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
    if (!change) {
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

  useEffect(() => {
    if (editableNode?.resourceUri) {
      setOriginalFileUrl(editableNode.resourceUri);
    } else {
      setOriginalFileUrl(null);
    }
    setNewFileUrl(null);
    setFile(null);
  }, [editableNode]);

  function removeNode(rowInfo: any) {
    const { path } = rowInfo;
    Swal.fire({
      title: "Are you sure you want to delete the item?",
      showDenyButton: false,
      showCancelButton: true,
      confirmButtonText: "Delete",
    }).then((result) => {
      if (result.isConfirmed) {
        setTargetTreeData((currentTreeData) =>
          removeNodeAtPath({
            treeData: currentTreeData,
            path,
            getNodeKey: ({ treeIndex }) => treeIndex,
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
    const updatedTreeData = toggleExpandedForAll({
      treeData: targetTreeData,
      expanded,
    });
    setTargetTreeData(updatedTreeData);
  }

  function expandAll() {
    expand(true);
  }

  function collapseAll() {
    expand(false);
  }

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

  const closeEditor = () => {
    setIsEditingNodeDetail(false);
  };

  const openInfoDetail = () => {
    setIsEditingNode(true);
  };

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
    const submissionData = prepareTreeDataForSubmission(newUpdateTreeData);
    try {
      await handleSubmition(submissionData);
    } catch (error) {
      console.error("Error during submission:", error);
    }
  };

  const handleSaveAndBackToCategory = async () => {
    const navigateBack = () => {
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
          navigateBack();
        } else {
          return;
        }
      });
    } else {
      navigateBack();
    }
  };

  const handleBackToCategory = async () => {
    const navigateBack = () => {
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
          navigateBack();
        } else {
          return;
        }
      });
    } else {
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
    setFile(null);
    setNewFileUrl(null);
  }

  async function saveNode() {
    if (editableNode === null) {
      console.error("No node selected for editing");
      return;
    }

    let newResourceUri = editableNode.resourceUri;
    if (file) {
      const fileFormData = new FormData();
      fileFormData.append("file", file);

      try {
        const uploadResponse = await axios.post(
          "https://mocarps.azurewebsites.net/uploadFile",
          fileFormData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
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
      subtitle: subtitle,
      resourceType: resourceType,
      resourceUri: newResourceUri,
      sections: editableNode.sections || [],
    };

    const updateNodeInTree = (
      nodes: TreeNode[],
      updatedNode: TreeNode
    ): TreeNode[] => {
      return nodes.map((node) => {
        if (node.id === updatedNode.id) {
          return updatedNode;
        }
        if (node.children && node.children.length > 0) {
          return {
            ...node,
            children: updateNodeInTree(node.children, updatedNode),
          };
        }
        return node;
      });
    };

    setTargetTreeData((prevData) => updateNodeInTree(prevData, updatedNode));
    setEditableNode(null);
    setChange(true);
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (newFileUrl) {
      URL.revokeObjectURL(newFileUrl);
      setNewFileUrl(null);
    }
    if (!selectedFile) {
      setFile(null);
      return;
    }
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
        <button onClick={handleBackToCategory}>
          <img src={ReturnIcon} alt="Menu Icon" className="addButton" />
          Back to Category
        </button>
      </div>
      <div className="information-container">
        <div className="tree-container">
          <div className="toolBar">
            <div className="otherButtons">
              <button
                className="toolsButton"
                onClick={() => {
                  setOpenAddNewNode(true);
                  setNodeInfo(null);
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
            onChange={(treeData) => updateTargetTreeData(treeData)}
            searchFocusOffset={searchFocusIndex}
            searchFinishCallback={(matches) => {
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
                  {(rowInfo.node.children?.length === 0 ||
                    !rowInfo.node.children) && (
                    <button onClick={() => removeNode(rowInfo)}>
                      <img src={DeleteIcon} alt="Delete Icon" />
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

              <label htmlFor="resourceUri">Media</label>
              <input
                className="edit-form-fileSelection"
                id="resourceUri"
                type="file"
                onChange={handleFileChange}
                accept={handleFileAcceptance(resourceType)}
              />

              {originalFileUrl && (
                <div className="media-preview-container">
                  <label>Uploaded File:</label>
                  {originalFileUrl &&
                    renderMediaPreview(originalFileUrl, resourceType)}
                </div>
              )}

              {newFileUrl && (
                <div className="media-preview-container">
                  <label>New File:</label>
                  {newFileUrl && renderMediaPreview(newFileUrl, resourceType)}
                </div>
              )}

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
          setTargetTreeData={setTargetTreeData}
          setChange={setChange}
        />
      ) : null}
    </div>
  );
};

export default InformationDetails;
