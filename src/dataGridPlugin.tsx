import { GridRenderCellParams } from "@mui/x-data-grid";

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
