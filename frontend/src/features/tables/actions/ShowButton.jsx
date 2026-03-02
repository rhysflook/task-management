// src/features/tables/actions/ShowButton.jsx
import Button from "@mui/joy/Button";
import VisibilityTwoToneIcon from '@mui/icons-material/VisibilityTwoTone';
import { useNavigate } from "react-router";
import { useContext } from "react";
import { FeatureContext } from "../../../context/FeatureContext";

const ShowButton = (props) => {
  const navigate = useNavigate();
  const { feature } = useContext(FeatureContext);

  return (
    <Button
      variant="plain"
      onClick={() => navigate(`/${feature}/${props.id}`, { replace: true })}
    >
      <VisibilityTwoToneIcon />
    </Button>
  );
};

export default ShowButton;