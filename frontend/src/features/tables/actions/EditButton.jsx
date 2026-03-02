// src/features/tables/actions/EditButton.jsx
import Button from "@mui/joy/Button";
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import { useNavigate } from "react-router";
import { useContext } from "react";
import { FeatureContext } from "../../../context/FeatureContext";

const EditButton = (props) => {
  const navigate = useNavigate();
  const { feature } = useContext(FeatureContext);

  return (
    <Button
      variant="plain"
      sx={{ width: "35px" }}
      onClick={() => navigate(`/${feature}/${props.id}/edit`, { replace: true })}
    >
      <EditTwoToneIcon />
    </Button>
  );
};

export default EditButton;