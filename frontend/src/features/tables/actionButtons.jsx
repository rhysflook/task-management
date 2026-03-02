import { Box } from "@mui/joy";
import DeleteButton from "./actions/DeleteButton";
import EditButton from "./actions/EditButton";
import ShowButton from "./actions/ShowButton";

export const actionManager = {

  show: (payload) => <ShowButton key={`show-${payload.id}-${Math.random()}`} {...payload} />,
  edit: (payload) => <EditButton key={`edit-${payload.id}-${Math.random()}`} {...payload} />,
  editAndDelete: (payload) => (
    <Box sx={{ display: "flex" }}>
      <EditButton key={`edit-${payload.id}-${Math.random()}`} {...payload} />
      <DeleteButton key={`delete-${payload.id}-${Math.random()}`} {...payload} />
    </Box>
  ),
  delete: (payload) => <DeleteButton key={`delete-${payload.id}-${Math.random()}`} {...payload} />,
  // list: (payload) => <ListButton key={`list-${payload.id}-${Math.random()}`} {...payload} />,
  // Actions can be added here with its following component
};