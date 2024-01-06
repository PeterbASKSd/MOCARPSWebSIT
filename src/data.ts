//Menu List
import HomeIcon from "./assets/home.svg";
import UserListIcon from "./assets/userList.svg";
import DictionaryIcon from "./assets/dictionary.svg";
import InformationIcon from "./assets/information.svg";
import QuestionIcon from "./assets/question.svg";
import QuizIcon from "./assets/quiz.svg";
import ValueIcon from "./assets/value.svg";
import { GridColDef } from "@mui/x-data-grid";

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

export type CustomGridColDef = GridColDef & {
  required?: boolean;
  input?: boolean;
  inputHint?: string;
  inputOptions?: string[];
};
