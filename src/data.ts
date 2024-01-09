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

export type CustomGridColDef = GridColDef & {
  required?: boolean;
  input?: boolean;
  inputHint?: string;
  inputOptions?: string[];
};

export const dictionaryColumns: CustomGridColDef[] = [
  {
    field: "id",
    headerName: "ID",
    width: 80,
    input: false,
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
    input: false,
  },
  {
    field: "resourceUri",
    headerName: "Media",
    type: "file",
    width: 150,
    editable: false,
    input: true,
    renderCell: renderCellUrl,
  },
  {
    field: "resourceType",
    headerName: "Media Type",
    type: "options",
    width: 150,
    editable: false,
    input: true,
    inputOptions: ["image", "audio", "video"],
  },
];
