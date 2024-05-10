import React, { useEffect, useState, useRef } from "react";
import "./information.scss";
import {
  TreeNode,
  categoryColumns,
  prepareTreeDataForSubmission,
} from "../../data";
import "@nosferatu500/react-sortable-tree/style.css";
import axios from "axios"; // Import the axios library
// import InfoIcon from "../../assets/info.svg";
import EditIcon from "../../assets/edit.svg";
import DeleteIcon from "../../assets/delete.svg";
import AddIcon from "../../assets/add.svg";
import Swal from "sweetalert2";
import Add from "../../components/add/Add";
import Edit from "../../components/edit/Add";
import { useNavigate } from "react-router-dom";

const parseSection = (treeNode: TreeNode): any => {
  return {
    id: treeNode.id,
    title: treeNode.title,
    subtitle: treeNode.description,
    children: treeNode.sections?.map(parseSection) ?? [], // Safely map over sections
    resourceType: treeNode.resourceType,
    resourceUri: treeNode.resourceUri,
    expanded: false,
  };
};

// Define the component
const Information: React.FC = () => {
  // Define the state for the sections
  const [treeData, setTreeData] = useState<any[]>([]);
  // const [targetCategory, setTargetCategory] = useState<TreeNode | null>(null);
  const [targetCategoryID, setTargetCategoryID] = useState<string>("");
  const [openAddCategory, setOpenAddCategory] = useState<boolean>(false);
  const [openEditCategory, setEditCategory] = useState<boolean>(false);
  const largestId = useRef<number>(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://mocarps.azurewebsites.net/information/latest"
      );
      const parsedData = JSON.parse(response.data.jsonValue);
      const transformedSections = parsedData.sections?.map(parseSection) || [];
      setTreeData(transformedSections);

      // Find the largest ID and set it
      const maxIdFound = findLargestId(transformedSections);
      largestId.current = maxIdFound;
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Start polling
    const interval = setInterval(fetchData, 10000); // Poll every 10 seconds

    // Stop polling
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (treeData.length > 0) {
      // Assuming findLargestId is correctly implemented to find the max id in the tree.
      largestId.current = findLargestId(treeData);
    }
    console.log("Loading: ", loading);
  }, [treeData]);

  const findLargestId = (nodes: TreeNode[]): number => {
    let maxId = -Infinity;

    const traverseNodes = (nodes: any[]) => {
      nodes.forEach((node) => {
        // Convert ID to number and compare
        const currentId = parseInt(node.id, 10);
        if (!isNaN(currentId)) {
          maxId = Math.max(maxId, currentId);
        }

        // Recursively traverse if children are present
        if (node.children && node.children.length > 0) {
          traverseNodes(node.children);
        }
      });
    };

    traverseNodes(nodes);
    return maxId;
  };

  useEffect(() => {
    console.log("treeData:", treeData);
    console.log("largestId:", largestId);
  }, [treeData]);

  const handleCategoryClick = (category: TreeNode) => {
    navigate(`/information/${category.id}`, {
      state: {
        category: category,
        largestId: largestId.current,
        treeData: treeData,
        id: category.id,
      },
    });
  };

  const handleAddCategory = () => {
    setOpenAddCategory(true);
  };

  const handleEditCategory = (id: string) => {
    setTargetCategoryID(id);
    setEditCategory(true);
  };

  const handleRemoveCategory = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure you want to delete the empty category?",
      showDenyButton: false,
      showCancelButton: true,
      confirmButtonText: "Delete Category",
    });

    if (result.isConfirmed) {
      // Filter out the category first before setting the state
      const updatedTreeData = treeData.filter((category) => category.id !== id);

      // Update the state with the filtered data
      setTreeData(updatedTreeData);

      // Now prepare and post the updated data
      const submissionData = prepareTreeDataForSubmission(updatedTreeData);

      try {
        await axios.post(
          `https://mocarps.azurewebsites.net/information`,
          submissionData
        );
        console.log(`${id} has been deleted`);
      } catch (error: any) {
        console.error(
          "Error deleting row:",
          error.response ? error.response.data : error
        );
        Swal.fire({
          title: "Error",
          text: "Failed to delete the category. Please try again.",
          icon: "error",
        });
      }
    }
  };

  return (
    <div className="information">
      <div className="info">
        <h1>Information</h1>
        <button onClick={handleAddCategory}>
          {" "}
          <img src={AddIcon} alt="Menu Icon" className="addButton" />
          Add Category
        </button>
      </div>
      <>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="information-menu-container">
            <div className="selection-title">
              <h2>Select a Category</h2>
            </div>
            <div className="selection-container">
              {treeData.map((category) => (
                <div key={category.id} className="category-item">
                  <button onClick={() => [handleCategoryClick(category)]}>
                    {category.title}
                  </button>
                  <div className="categoryTools">
                    <img
                      src={EditIcon}
                      alt="Edit icon"
                      onClick={() => handleEditCategory(category.id)}
                    />
                    {(category.children?.length === 0 ||
                      category.sections?.length === 0) && (
                      <img
                        src={DeleteIcon}
                        alt="Delete icon"
                        onClick={() => handleRemoveCategory(category.id)}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {openAddCategory ? (
          <Add
            slug="information"
            columns={categoryColumns}
            setOpen={setOpenAddCategory}
            handleAfterAddRow={setTreeData}
            largestId={largestId.current + 1}
            treeData={treeData}
            setTreeData={setTreeData}
          />
        ) : null}
        {openEditCategory ? (
          <Edit
            slug="information"
            columns={categoryColumns}
            setOpen={setEditCategory}
            handleAfterAddRow={setTreeData}
            targetId={Number(targetCategoryID)}
            treeData={treeData}
            rows={treeData.find((row) => row.id === targetCategoryID)}
            setTreeData={setTreeData}
          />
        ) : null}
      </>
    </div>
  );
};

export default Information;
