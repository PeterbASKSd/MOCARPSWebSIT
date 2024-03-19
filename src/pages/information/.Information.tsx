import React, { useState, useEffect } from "react";
import SortableTree, {
  addNodeUnderParent,
  removeNodeAtPath,
  changeNodeAtPath,
  toggleExpandedForAll,
} from "@nosferatu500/react-sortable-tree";
import axios from "axios";
import "@nosferatu500/react-sortable-tree/style.css";
import { TreeNode, InfoNode } from "../../data"; // Import the types
import InfoIcon from "../../assets/info.svg";
import EditIcon from "../../assets/edit.svg";
import DeleteIcon from "../../assets/delete.svg";

const Information: React.FC = () => {
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<InfoNode | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sectionToTreeNode = (treeNode: TreeNode): any => {
    return {
      id: treeNode.id,
      title: treeNode.title,
      subtitle: treeNode.description,
      imageUri: treeNode.imageUri,
      children: treeNode.sections.map(sectionToTreeNode), // recursively convert the children sections
      resource: {
        media: treeNode.resource.media,
        uri: treeNode.resource.uri,
      },
      expanded: false,
    };
  };

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        "https://mocarps.azurewebsites.net/information/"
      );
      const jsonValue = response.data[0]?.jsonValue;
      const data = JSON.parse(jsonValue).sections;
      setTreeData(data.map(sectionToTreeNode));
    } catch (error) {
      setError("Failed to fetch data");
      console.error("There was an error fetching the data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const selectNode = (node: InfoNode) => {
    setSelectedNode(node);
  };

  // No need for handleNodeSelect if using generateNodeProps

  const getNodeKey = ({ node }: { node: TreeNode }) => node.id;

  // You don't need transformNode if you have sectionToTreeNode

  const handleRemoveNode = (path: number[]) => {
    setTreeData(removeNodeAtPath({ treeData, path, getNodeKey }));
  };

  function removeNode(rowInfo: any) {
    const { path } = rowInfo;
    setTreeData(
      removeNodeAtPath({
        treeData,
        path,
        getNodeKey, // Provide an initializer for the getNodeKey property that returns an empty string
      })
    );
  }

  function updateTreeData(treeData: any[]) {
    setTreeData(treeData);
  }

  function expandForRow(rowInfo: any) {
    const { node } = rowInfo;
    const updatedNode = {
      ...node,
      expanded: !node.expanded,
    };
    // Update the treeData with the updated node
    setTreeData(
      changeNodeAtPath({
        treeData,
        path: rowInfo.path,
        newNode: updatedNode,
        getNodeKey,
      })
    );
  }

  function expand(expanded: boolean) {
    setTreeData(
      toggleExpandedForAll({
        treeData,
        expanded,
      })
    );
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

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="information">
      <div className="tree-container">
        {isLoading ? (
          <div>Loading...</div>
        ) : error ? (
          <div>Error: {error}</div>
        ) : (
          <SortableTree
            treeData={treeData}
            onChange={setTreeData}
            canDrag={({ node }) => !node.noDragging}
            canDrop={({ nextParent }) => !nextParent || !nextParent.noChildren}
            generateNodeProps={({ node, path }) => ({
              buttons: [
                <button key="info" onClick={() => alertNodeInfo(node, path)}>
                  <img src={InfoIcon} alt="Info" />
                </button>,
                <button
                  key="edit"
                  onClick={() => setSelectedNode(node as InfoNode)}
                >
                  <img src={EditIcon} alt="Edit" />
                </button>,
                <button key="delete" onClick={() => removeNode(path)}>
                  <img src={DeleteIcon} alt="Delete" />
                </button>,
              ],
            })}
            getNodeKey={getNodeKey}
          />
        )}
      </div>
      <div className="edit-container">
        {selectedNode ? (
          <div>Edit node: {selectedNode.title}</div>
        ) : (
          <div>Select a node to edit</div>
        )}
      </div>
    </div>
  );
};

export default Information;
