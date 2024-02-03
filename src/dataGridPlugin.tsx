import { GridRenderCellParams } from "@mui/x-data-grid";
import { MathJaxContext, MathJax } from "better-react-mathjax";

export const renderCellUrl = (params: GridRenderCellParams<any, string>) => {
  if (typeof params.value === "string") {
    const openNewPage = (
      event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
    ) => {
      event.preventDefault();
      window.open(params.value, "_blank");
    };

    return (
      <a
        href={params.value}
        target="_blank"
        rel="noopener noreferrer"
        onClick={openNewPage}
      >
        {params.value}
      </a>
    );
  }

  return null; // Handle the case when params.value is not a string
};

export const renderCellWithMathJax = (
  params: GridRenderCellParams<any, string>
) => {
  const text = params.value || "";

  // Create a temporary div element
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = text;

  // Extract the text content from the div element
  const content = tempDiv.textContent || "";

  return (
    <MathJaxContext>
      <MathJax>{content}</MathJax>
    </MathJaxContext>
  );
};

export const renderCellWithDateTime = (
  params: GridRenderCellParams<any, string>
) => {
  const dateTimeString = params.value || "";
  const dateTime = new Date(dateTimeString);

  let formattedDateTime = "";

  if (!isNaN(dateTime.getTime())) {
    formattedDateTime = `${dateTime.getFullYear()}-${(dateTime.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${dateTime.getDate().toString().padStart(2, "0")}`;

    if (
      dateTime.getHours() !== 0 ||
      dateTime.getMinutes() !== 0 ||
      dateTime.getSeconds() !== 0
    ) {
      formattedDateTime += ` ${dateTime
        .getHours()
        .toString()
        .padStart(2, "0")}:${dateTime
        .getMinutes()
        .toString()
        .padStart(2, "0")}:${dateTime
        .getSeconds()
        .toString()
        .padStart(2, "0")}`;
    }
  }

  return formattedDateTime;
};

export const renderCellWithPriority = (
  params: GridRenderCellParams<any, number>
) => {
  const priority = params.value;

  let priorityText = "";

  switch (priority) {
    case 0:
      priorityText = "Admin";
      break;
    case 1:
      priorityText = "Teaching Assistant";
      break;
    case 2:
      priorityText = "Student";
      break;
    default:
      priorityText = "";
      break;
  }

  return priorityText;
};

export const renderCellWithDisabled = (
  params: GridRenderCellParams<any, boolean>
) => {
  const disabled = params.value;

  return disabled ? "Yes" : "No";
};
