//Menu List
import HomeIcon from "./assets/home.svg";
import UserListIcon from "./assets/userList.svg";
import DictionaryIcon from "./assets/dictionary.svg";
import InformationIcon from "./assets/information.svg";
import QuestionIcon from "./assets/question.svg";
import QuizIcon from "./assets/quiz.svg";
import ValueIcon from "./assets/value.svg";
import { GridColDef } from "@mui/x-data-grid";
import { renderCellUrl } from "./dataGridPlugin";

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
        id: 3,
        title: "Question Set",
        url: "question",
        icon: QuestionIcon,
      },
      {
        id: 4,
        title: "Quiz Result",
        url: "quiz",
        icon: QuizIcon,
      },
      {
        id: 5,
        title: "Value Checking",
        url: "value",
        icon: ValueIcon,
      },
    ],
  },
];

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

/* 
CustomGridColDef{
  field: string
  headerName: string
  type: string || longText || number || file || options
  width: number
  required: boolean
  input: boolean
  inputHint: string
  inputOptions: string[]
}
*/

// const myColors = [
//   "purple",
//   "#785412",
//   "#452632",
//   "#856325",
//   "#963254",
//   "#254563",
//   "white",
// ];

export type UserType = {
  id: number;
  email: string;
  name: string;
  cardNumber: string;
  verified: boolean;
  disabled: boolean;
  priority: number;
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

export type CustomGridColDef = GridColDef & {
  required?: boolean;
  input?: boolean;
  inputHint?: string;
  inputOptions?: string[];
  preCondition?: boolean;
  isCondition?: boolean;
  showInForm?: boolean;
};

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
    field: "keyword",
    headerName: "Keyword",
    type: "string",
    width: 120,
    editable: false,
    required: true,
    input: true,
    inputHint: "Enter a keyword",
  },
  {
    field: "description",
    headerName: "Description",
    type: "string",
    width: 250,
    editable: false,
    required: true,
    input: true,
    inputHint: "Please enter a defined description",
  },
  {
    field: "htmlDescription",
    headerName: "Html Description",
    type: "longText",
    width: 250,
    editable: false,
    required: true,
    input: true,
    inputHint: "Please enter a defined description in html format",
  },
  {
    field: "example",
    headerName: "Example",
    type: "longText",
    width: 250,
    editable: false,
    required: true,
    input: true,
    inputHint: "Please enter an example",
    // renderCell: renderCellExpand,
  },
  {
    field: "count",
    headerName: "Count",
    type: "number",
    width: 80,
    editable: false,
    input: true,
    required: true,
  },
  {
    field: "resourceType",
    headerName: "Media Type",
    type: "options",
    width: 120,
    editable: false,
    input: true,
    inputOptions: ["image", "audio", "video"],
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
    width: 130,
    input: false,
    editable: false,
    showInForm: false,
  },
  {
    field: "updatedAt",
    headerName: "Updated Time",
    width: 130,
    input: false,
    editable: false,
    showInForm: false,
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
    field: "keyword",
    headerName: "Keyword",
    type: "string",
    width: 120,
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
  },
  {
    field: "unit",
    headerName: "Unit",
    type: "string",
    width: 120,
    editable: false,
    required: true,
    input: true,
    inputHint: "Enter a keyword",
    // renderCell: renderCellExpand,
  },
  {
    field: "normalDesc",
    headerName: "Normal Description",
    type: "string",
    width: 250,
    editable: false,
    required: true,
    input: true,
    inputHint: "Please enter a defined description",
  },
  {
    field: "higherDesc",
    headerName: "Description of Higher than Max Value",
    type: "string",
    width: 250,
    editable: false,
    required: true,
    input: true,
    inputHint: "Please enter a defined description",
  },
  {
    field: "maxValue",
    headerName: "Max Value",
    type: "number",
    width: 80,
    editable: false,
    required: true,
    input: true,
  },
  {
    field: "lowerDesc",
    headerName: "Description of Lower than Min Value",
    type: "string",
    width: 250,
    editable: false,
    required: true,
    input: true,
    inputHint: "Please enter a defined description",
  },
  {
    field: "minValue",
    headerName: "Min Value",
    type: "number",
    width: 80,
    editable: false,
    required: true,
    input: true,
  },
  {
    field: "createdAt",
    headerName: "Create Time",
    width: 130,
    input: false,
    editable: false,
    showInForm: false,
  },
  {
    field: "updatedAt",
    headerName: "Updated Time",
    width: 130,
    input: false,
    editable: false,
    showInForm: false,
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
    width: 120,
    editable: false,
    required: true,
    input: true,
  },
  {
    field: "verified",
    headerName: "Verified",
    type: "boolean",
    width: 80,
    input: false,
    editable: false,
  },
  {
    field: "disabled",
    headerName: "Active",
    type: "boolean",
    width: 80,
    editable: false,
    required: true,
    input: true,
  },
  {
    field: "priority",
    headerName: "Priority",
    type: "string",
    width: 80,
    input: false,
    editable: false,
    showInForm: false,
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
