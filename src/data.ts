//Menu List
import HomeIcon from "./assets/home.svg";
import UserListIcon from "./assets/userList.svg";
import DictionaryIcon from "./assets/dictionary.svg";
import InformationIcon from "./assets/information.svg";
import QuestionIcon from "./assets/question.svg";
import QuizIcon from "./assets/quiz.svg";
import ValueIcon from "./assets/value.svg";
import { GridColDef } from "@mui/x-data-grid";
import {
  renderCellUrl,
  renderCellWithMathJax,
  renderCellWithDateTime,
  renderCellWithPriority,
  renderCellWithDisabled,
  renderCellWithVerify,
} from "./dataGridPlugin";

export const menu = [
  {
    id: 1,
    title: "MAIN",
    listItem: [
      {
        id: 1,
        title: "Home",
        url: "/",
        icon: HomeIcon,
      },
      {
        id: 2,
        title: "User",
        url: "user",
        icon: UserListIcon,
      },
    ],
  },
  {
    id: 2,
    title: "FUNCTION",
    listItem: [
      {
        id: 1,
        title: "Dictionary",
        url: "dictionary",
        icon: DictionaryIcon,
      },
      {
        id: 2,
        title: "Information",
        url: "information",
        icon: InformationIcon,
      },
      {
        id: 5,
        title: "Value Checking",
        url: "value",
        icon: ValueIcon,
      },
      {
        id: 3,
        title: "Quiz",
        url: "questionset",
        icon: QuestionIcon,
      },
      {
        id: 4,
        title: "Quiz Result",
        url: "quiz",
        icon: QuizIcon,
      },
    ],
  },
];

// export interface TreeNodeData {
//   id: number;
//   jsonValue: string;
//   createdAt: string;
// }

export interface Option {
  id: number;
  keyword: string;
  description: string;
  isCorrect: boolean;
  jumpTo: number; // Changed type from string to number
  questionId: number;
}

export interface Question {
  id: number;
  description: string;
  resourceUri: string;
  resourceType: string;
  questionSetId: number;
  score: number;
  questionType: string;
  options: Option[];
}

export interface TreeNode {
  id: string;
  title: string;
  description: string;
  sections: TreeNode[];
  resourceType: string;
  resourceUri: string;
  expanded?: boolean;
  subtitle?: string;
  children?: TreeNode[];
}

export interface QuestionNode {
  id: string;
  description: string;
  resourceType: string;
  resourceUri: string;
  questionSetId: number;
  questionType: string;
  score: number;
  options?: OptionsNode[];
}

export interface OptionsNode {
  id: string;
  description: string;
  isCorrect: boolean;
  jumpTo: number;
  keyword: string;
  questionId: number;
}

export interface GenerateNodePropsParams {
  node: TreeNode; // Or whatever type your nodes are
  path: (string | number)[];
  treeIndex: number;
  // Add other properties if needed
}

export interface InfoNode extends TreeNode {
  selected: boolean;
}

export type CustomGridColDef = GridColDef & {
  required?: boolean;
  input?: boolean;
  inputHint?: string;
  inputOptions?: string[];
  preCondition?: boolean;
  isCondition?: boolean;
  showInForm?: boolean;
  unqiue?: boolean;
};

export type UserType = {
  id: number;
  email: string;
  name: string;
  cardNumber: string;
  verified: boolean;
  disabled: boolean;
  priority: number;
};

export function prepareTreeDataForSubmission(treeData: any) {
  const transformNode = (node: any) => {
    // Create a new node with the structure that matches TreeNode
    return {
      id: node.id.toString(),
      title: node.title,
      description: node.subtitle, // Use subtitle as the description
      sections: node.children ? node.children.map(transformNode) : [], // Recursively transform children
      resourceType: node.resourceType || "none",
      resourceUri: node.resourceUri || "",
      expanded: node.expanded || false,
    };
  };

  console.log("Please check here treeData:", treeData);

  // Transform each node in the treeData array
  const transformedTreeData = treeData.map(transformNode);

  // Convert the transformedTreeData to a JSON string
  const jsonValueObject = {
    jsonValue: JSON.stringify({ sections: transformedTreeData }),
  };

  console.log(jsonValueObject.jsonValue);

  return jsonValueObject;
}

export const getNodeKey = ({ treeIndex }: { treeIndex: number }): number =>
  treeIndex;

export const addRowToAPI = async (
  url: string,
  data: any
): Promise<any | null> => {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add any additional headers if required
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to add row to API: ${response.status} ${response.statusText}`
      );
    }

    const row = await response.json();
    // Do something with the row data
    return row;
  } catch (error) {
    console.error("Error occurred while adding row to API:", error);
    return null;
  }
};

//Fetch data from API
export const fetchRowFromAPI = async (url: string): Promise<any | null> => {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Add any additional headers if required
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch row from API: ${response.status} ${response.statusText}`
      );
    }

    const row = await response.json();
    // Do something with the row data
    return row;
  } catch (error) {
    console.error("Error occurred while fetching row from API:", error);
    return null;
  }
};

export const EditorModules = {
  toolbar: [
    [{ font: [] }],
    [{ size: [] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [{ color: [] }, { background: [] }],
    [{ align: ["right", "center", "justify"] }],
    [
      { list: "ordered" },
      { list: "bullet" },
      { indent: "-1" },
      { indent: "+1" },
    ],
    ["formula"],
    [{ script: "sub" }, { script: "super" }],
  ],
};

export const EditorFormats = [
  "font",
  "size",
  "bold",
  "italic",
  "indent",
  "underline",
  "strike",
  "align",
  "color",
  "background",
  "blockquote",
  "list",
  "bullet",
  "indent",
  "formula",
  "script",
];

//edittable = can it edit in the table
//input = can it input in the form

//dictionary
export const dictionaryColumns: CustomGridColDef[] = [
  {
    field: "id",
    headerName: "ID",
    width: 80,
    input: false,
    editable: false,
  },
  {
    field: "title",
    headerName: "Title [Unique]",
    type: "string",
    width: 150,
    editable: false,
    required: true,
    input: true,
    unqiue: true,
    inputHint: "Enter a title",
  },
  {
    field: "keyword",
    headerName: "Keyword",
    type: "string",
    width: 150,
    editable: false,
    required: true,
    input: true,
    inputHint: "Enter a keyword",
  },
  {
    field: "description",
    headerName: "Description",
    type: "longText",
    width: 300,
    editable: false,
    required: true,
    input: true,
    inputHint: "Please enter a defined description",
    renderCell: renderCellWithMathJax,
  },
  {
    field: "example",
    headerName: "Example",
    type: "longText",
    width: 300,
    editable: false,
    required: false,
    input: true,
    inputHint: "Please enter an example",
    renderCell: renderCellWithMathJax,
  },
  {
    field: "count",
    headerName: "Count",
    type: "number",
    width: 80,
    editable: false,
    input: true,
    inputHint: "0",
    required: true,
  },
  {
    field: "resourceType",
    headerName: "Media Type",
    type: "options",
    width: 150,
    editable: false,
    input: true,
    required: true,
    inputOptions: ["none", "image", "audio", "video"],
    isCondition: true,
  },
  {
    field: "resourceUri",
    headerName: "Media",
    type: "file",
    width: 180,
    editable: false,
    input: true,
    preCondition: true,
    renderCell: renderCellUrl,
  },
  {
    field: "createdAt",
    headerName: "Create Time",
    width: 230,
    input: false,
    editable: false,
    showInForm: false,
    renderCell: renderCellWithDateTime,
  },
  {
    field: "updatedAt",
    headerName: "Updated Time",
    width: 230,
    input: false,
    editable: false,
    showInForm: false,
    renderCell: renderCellWithDateTime,
  },
];

//value
// "id": 3,
// "keyword": "Albumin",
// "description": "Albumin",
// "unit": "g/L",
// "maxValue": 48,
// "minValue": 36,
// "higherDesc": "dehydration",
// "lowerDesc": "Chronic liver disease, chronic infection, nephritic syndrome, severe burns, malabsorption",
// "normalDesc": "normal\r"

export const valueColumns: CustomGridColDef[] = [
  {
    field: "id",
    headerName: "ID",
    width: 80,
    input: false,
    editable: false,
  },
  {
    field: "title",
    headerName: "Title [Unique]",
    type: "string",
    width: 150,
    editable: false,
    required: true,
    input: true,
    unqiue: true,
    inputHint: "Enter a title",
  },
  {
    field: "keyword",
    headerName: "Keyword",
    type: "string",
    width: 150,
    editable: false,
    required: true,
    input: true,
    inputHint: "Enter a keyword",
  },
  {
    field: "description",
    headerName: "Description",
    type: "longText",
    width: 250,
    editable: false,
    required: true,
    input: true,
    inputHint: "Please enter a defined description",
    renderCell: renderCellWithMathJax,
  },
  {
    field: "unit",
    headerName: "Unit",
    type: "string",
    width: 120,
    editable: false,
    required: false,
    input: true,
    inputHint: "Enter a unit",
    // renderCell: renderCellExpand,
  },
  {
    field: "normalDesc",
    headerName: "Normal Description",
    type: "string",
    width: 200,
    editable: false,
    required: true,
    input: true,
    inputHint: "Please enter a defined description",
  },
  {
    field: "higherDesc",
    headerName: "Description of Higher than Max Value",
    type: "string",
    width: 380,
    editable: false,
    required: true,
    input: true,
    inputHint: "Please enter a defined description",
  },
  {
    field: "maxValue",
    headerName: "Max Value",
    type: "number",
    width: 120,
    editable: false,
    required: false,
    input: true,
    inputHint: "0",
  },
  {
    field: "lowerDesc",
    headerName: "Description of Lower than Min Value",
    type: "string",
    width: 380,
    editable: false,
    required: true,
    input: true,
    inputHint: "Please enter a defined description",
  },
  {
    field: "minValue",
    headerName: "Min Value",
    type: "number",
    width: 120,
    editable: false,
    required: false,
    input: true,
    inputHint: "0",
  },
  {
    field: "createdAt",
    headerName: "Create Time",
    width: 230,
    input: false,
    editable: false,
    showInForm: false,
    renderCell: renderCellWithDateTime,
  },
  {
    field: "updatedAt",
    headerName: "Updated Time",
    width: 230,
    input: false,
    editable: false,
    showInForm: false,
    renderCell: renderCellWithDateTime,
  },
];

//user
// "id": 2,
// "email": "Fangxuanmiao@me.com",
// "name": "StephenTest",
// "cardNumber": "22222222G",
// "verified": true,
// "disabled": false,
// "priority": 2

export const userColumns: CustomGridColDef[] = [
  {
    field: "name",
    headerName: "Name",
    type: "string",
    width: 150,
    editable: false,
    required: true,
    input: true,
    inputHint: "Please enter your name",
  },
  {
    field: "email",
    headerName: "Email",
    type: "email",
    width: 250,
    editable: false,
    required: true,
    input: true,
    inputHint: "Enter a email",
  },
  {
    field: "cardNumber",
    headerName: "Card Number",
    type: "string",
    width: 160,
    editable: false,
    required: true,
    input: true,
  },
  {
    field: "priority",
    headerName: "Role",
    type: "priority",
    width: 180,
    input: true,
    editable: false,
    required: true,
    inputHint: "Select a role",
    renderCell: renderCellWithPriority,
  },
  {
    field: "verified",
    headerName: "Verified",
    type: "boolean",
    width: 100,
    input: false,
    editable: false,
    showInForm: false,
    renderCell: renderCellWithVerify,
  },
  {
    field: "disabled",
    headerName: "Active",
    type: "boolean",
    width: 180,
    editable: false,
    required: false,
    input: false,
    showInForm: false,
    renderCell: renderCellWithDisabled,
  },
];

export const signUpColumns: CustomGridColDef[] = [
  {
    field: "email",
    headerName: "Email",
    type: "email",
    width: 250,
    editable: false,
    required: true,
    input: true,
    inputHint: "Enter a email",
  },
  {
    field: "name",
    headerName: "Name",
    type: "string",
    width: 150,
    editable: false,
    required: true,
    input: true,
    inputHint: "Please enter your name",
  },
  {
    field: "cardNumber",
    headerName: "Card Number",
    type: "string",
    width: 160,
    editable: false,
    required: true,
    input: true,
    inputHint: "Enter a card number",
  },
  {
    field: "password",
    headerName: "Password",
    type: "password",
    width: 250,
    editable: false,
    required: true,
    input: true,
    inputHint: "Enter a new password",
  },
  {
    field: "passwordConfirm",
    headerName: "Confirm Password",
    type: "password",
    width: 250,
    editable: false,
    required: true,
    input: true,
    inputHint: "Enter again the password",
  },
  {
    field: "priority",
    headerName: "Role",
    type: "priority",
    width: 180,
    input: true,
    editable: false,
    required: true,
    inputHint: "Select a role",
    renderCell: renderCellWithPriority,
  },
];

export const accountColumns: CustomGridColDef[] = [
  {
    field: "verified",
    headerName: "Verified",
    type: "boolean",
    width: 100,
    input: true,
    editable: false,
    showInForm: true,
  },
  {
    field: "disabled",
    headerName: "Active",
    type: "boolean",
    width: 180,
    editable: false,
    required: false,
    input: true,
    showInForm: true,
    renderCell: renderCellWithDisabled,
  },
];

export const passwordColumns: CustomGridColDef[] = [
  {
    field: "email",
    headerName: "Email",
    type: "email",
    width: 250,
    editable: false,
    required: true,
    input: false,
    inputHint: "Enter a email",
  },
  {
    field: "password",
    headerName: "Password",
    type: "password",
    width: 250,
    editable: false,
    required: true,
    input: true,
    inputHint: "Enter a new password",
  },
  {
    field: "passwordConfirm",
    headerName: "Confirm Password",
    type: "password",
    width: 250,
    editable: false,
    required: true,
    input: true,
    inputHint: "Enter again the password",
  },
];

export const categoryColumns: CustomGridColDef[] = [
  {
    field: "id",
    headerName: "ID",
    type: "id",
    width: 80,
    input: true,
    editable: false,
    required: false,
  },
  {
    field: "title",
    headerName: "Title",
    type: "string",
    width: 150,
    editable: false,
    required: true,
    input: true,
    inputHint: "Please enter your title",
  },
  {
    field: "subtitle",
    headerName: "Description",
    type: "string",
    width: 160,
    editable: false,
    required: true,
    input: true,
    inputHint: "Enter a description",
  },
  {
    field: "resourceType",
    headerName: "Media Type",
    type: "options",
    width: 150,
    editable: false,
    input: true,
    required: true,
    inputOptions: ["none", "image", "audio", "video"],
    isCondition: true,
  },
  {
    field: "resourceUri",
    headerName: "Media",
    type: "file",
    width: 180,
    editable: false,
    input: true,
    preCondition: true,
    renderCell: renderCellUrl,
  },
];

export const resourceTypes = [
  {
    value: "none",
    label: "none",
  },
  {
    value: "image",
    label: "image",
  },
  {
    value: "audio",
    label: "audio",
  },
  {
    value: "video",
    label: "video",
  },
];

export const questionTypes = [
  {
    value: "MAIN",
    label: "MAIN",
  },
  {
    value: "BRANCH",
    label: "BRANCH",
  },
];

export const priorityOptions = [
  {
    value: 0,
    label: "Admin",
  },
  {
    value: 1,
    label: "TA",
  },
  {
    value: 2,
    label: "Student",
  },
];

//question
export const questionColumns: CustomGridColDef[] = [
  {
    field: "id",
    headerName: "ID",
    width: 80,
    input: false,
    editable: false,
  },
  {
    field: "name",
    headerName: "Name",
    type: "string",
    width: 350,
    editable: false,
    required: true,
    input: true,
    unqiue: true,
    inputHint: "Enter a title",
  },
  {
    field: "description",
    headerName: "Description",
    type: "longText",
    width: 500,
    editable: false,
    required: false,
    input: true,
    inputHint: "Please enter an description",
    renderCell: renderCellWithMathJax,
  },
  {
    field: "published",
    headerName: "Publish",
    type: "boolean",
    width: 100,
    input: false,
    editable: false,
    showInForm: false,
  },
  {
    field: "publishedAt",
    headerName: "Published Date",
    width: 230,
    input: false,
    editable: false,
    showInForm: false,
    renderCell: renderCellWithDateTime,
  },
  {
    field: "createdAt",
    headerName: "Create Time",
    width: 230,
    input: false,
    editable: false,
    showInForm: false,
    renderCell: renderCellWithDateTime,
  },
  {
    field: "updatedAt",
    headerName: "Updated Time",
    width: 230,
    input: false,
    editable: false,
    showInForm: false,
    renderCell: renderCellWithDateTime,
  },
  {
    field: "questions",
    headerName: "Questions",
    width: 300,
    input: false,
    editable: false,
    showInForm: false,
  },
];

export const publishColumns: CustomGridColDef[] = [
  {
    field: "published",
    headerName: "Publish",
    type: "boolean",
    width: 100,
    input: true,
    editable: false,
    showInForm: true,
  },
];

export const questionDetailColumns: CustomGridColDef[] = [
  {
    field: "id",
    headerName: "ID",
    width: 80,
    input: false,
    editable: false,
  },
  {
    field: "questionSetId",
    headerName: "Question Set Id",
    type: "questionSetId",
    width: 300,
    editable: false,
    required: false,
    input: false,
  },
  {
    field: "description",
    headerName: "Description",
    type: "text",
    width: 500,
    editable: false,
    required: true,
    input: true,
    inputHint: "Please enter an description",
    renderCell: renderCellWithMathJax,
  },
  {
    field: "questionType",
    headerName: "Question Type",
    type: "questionType",
    width: 500,
    editable: false,
    required: true,
    input: true,
    inputHint: "Please enter an question type",
  },
  {
    field: "resourceType",
    headerName: "Media Type",
    type: "options",
    width: 150,
    editable: false,
    input: true,
    required: true,
    inputOptions: ["none", "image", "audio", "video"],
    isCondition: true,
  },
  {
    field: "resourceUri",
    headerName: "Media",
    type: "file",
    width: 180,
    editable: false,
    input: true,
    preCondition: true,
    renderCell: renderCellUrl,
  },
  {
    field: "score",
    headerName: "Score",
    type: "number",
    width: 120,
    editable: false,
    required: false,
    input: true,
    inputHint: "0",
  },
];

export const optionColumns: CustomGridColDef[] = [
  {
    field: "keyword",
    headerName: "Keyword",
    type: "keyword",
    width: 100,
    input: true,
    required: true,
    editable: false,
    inputHint: "Please enter a keyword",
  },
  {
    field: "description",
    headerName: "Description",
    type: "text",
    width: 100,
    editable: false,
    required: true,
    input: true,
    inputHint: "Please enter an description",
  },
  {
    field: "questionId",
    headerName: "Question Id",
    type: "questionId",
    width: 100,
    editable: false,
    required: false,
    input: false,
  },
  {
    field: "isCorrect",
    headerName: "Correct Option?",
    type: "boolean",
    width: 300,
    editable: false,
    required: true,
    input: true,
  },
  {
    field: "jumpTo",
    headerName: "Jump To",
    type: "options",
    width: 120,
    editable: false,
    required: false,
    input: false,
  },
];

export const quizResultColumns: CustomGridColDef[] = [
  {
    field: "userId",
    headerName: "User Id",
    type: "number",
    width: 100,
    editable: false,
    required: false,
    input: false,
  },
  {
    field: "answers",
    headerName: "Answers",
    type: "text",
    width: 100,
    editable: false,
    required: false,
    input: false,
  },
  {
    field: "questionSetId",
    headerName: "Question Set Id",
    type: "questionSetId",
    width: 100,
    editable: false,
    required: false,
    input: false,
  },
  {
    field: "questionSet",
    headerName: "Question Set",
    type: "text",
    width: 300,
    editable: false,
    required: false,
    input: false,
  },
  {
    field: "score",
    headerName: "Score",
    type: "number",
    width: 120,
    editable: false,
    required: false,
    input: true,
    inputHint: "0",
  },
  {
    field: "createdAt",
    headerName: "Create Time",
    width: 230,
    input: false,
    editable: false,
    showInForm: false,
    renderCell: renderCellWithDateTime,
  },
  {
    field: "completedAt",
    headerName: "Completed Time",
    width: 230,
    input: false,
    editable: false,
    showInForm: false,
    renderCell: renderCellWithDateTime,
  },
];
