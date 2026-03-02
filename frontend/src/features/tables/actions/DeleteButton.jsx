// src/features/tables/actions/DeleteButton.jsx
import { useState, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "@mui/joy/Button";
import DeleteForeverTwoToneIcon from "@mui/icons-material/DeleteForeverTwoTone";
import { FeatureContext } from "../../../context/FeatureContext";
import { actions } from "../../../stores/store";
import {
  useCheckIfCanDeleteMutation,
  useDeleteRecordMutation,
} from "../../../services/tables";
import Modal from "@mui/joy/Modal";
import ModalDialog from "@mui/joy/ModalDialog";
import Typography from "@mui/joy/Typography";
import Box from "@mui/joy/Box";

const DeleteButton = (props) => {
  const dispatch = useDispatch();
  const { feature } = useContext(FeatureContext);

  const [deleteRecord] = useDeleteRecordMutation();
  const [checkIfCanDeleteMutation] = useCheckIfCanDeleteMutation();

  const [openModal, setOpenModal] = useState(false);
  const [canDelete, setCanDelete] = useState(false);

  const { fields } =
    useSelector((state) => {
      if (!state[feature].form) {
        return { fields: {} };
      }
      return state[feature].form;
    }) || {};

  const { checkBeforeDeletion, deletionConfirmationMessage } =
    useSelector((state) => {
      if (!state[feature].table) {
        return { checkBeforeDeletion: false, deletionConfirmationMessage: null };
      }
      return state[feature].table;
    }) || {};

  const relationships = Object.values(fields).reduce((acc, field) => {
    if (field.relationship) {
      acc[field.relationship.split("/")[1]] = field.value.map(
        (item) => item.id,
      );
    }
    return acc;
  }, {});

  const checkIfCanDelete = () => {
    checkIfCanDeleteMutation({
      url: `${feature}/${props.id}/canDelete`,
    })
      .unwrap()
      .then((response) => {
        setCanDelete(response.can_delete);
        setOpenModal(true);
      })
      .catch((error) => {
        console.error("Error checking if can delete:", error);
      });
  };


  const handleDelete = () => {
    deleteRecord({
      url: `${feature}/${props.id}`,
      data: {
        relationships,
      },
    });
    setOpenModal(false);

  };

  return (
    <>
      <Button
        variant="plain"
        color="danger"
        onClick={checkBeforeDeletion ? checkIfCanDelete : handleDelete}
        sx={{
          "&:hover": {
            backgroundColor: "rgba(255, 0, 0, 0.08)",
          },
          width: "35px",
        }}
      >
        <DeleteForeverTwoToneIcon />
      </Button>

      {openModal && (
        <Modal open onClose={() => setOpenModal(false)}
          sx={{
            '--Modal-backdrop-filter': 'blur(2px)',  // default ~8px
            '--Modal-backdrop-bg': 'rgba(0, 0, 0, 0.2)', // adjust if needed
          }}
        >
          <ModalDialog
            variant="outlined"
            color={canDelete ? "danger" : "warning"}
          >
            <Typography>
              {canDelete
                ? "本当にこの項目を削除しますか？"
                : deletionConfirmationMessage}
            </Typography>

            <Box
              sx={{ mt: 2, display: "flex", gap: 1, justifyContent: "flex-end" }}
            >
              <Button variant="plain" onClick={() => setOpenModal(false)}>
                キャンセル
              </Button>
              <Button color="danger" onClick={handleDelete}>
                削除
              </Button>
            </Box>
          </ModalDialog>
        </Modal>
      )}
    </>
  );
};

export default DeleteButton;
