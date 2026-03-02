import { useState, useEffect } from "react";
import { Button } from "@mui/joy";
import Modal from "@mui/joy/Modal";
import ModalDialog from "@mui/joy/ModalDialog";
import Typography from "@mui/joy/Typography";
import Box from "@mui/joy/Box";
import { useDeleteRecordMutation } from "../../../services/form";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useCheckIfCanDeleteMutation } from "../../../services/tables";

const DeleteRecord = ({ feature }) => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [deleteRecord, result] = useDeleteRecordMutation();
    const [checkIfCanDeleteMutation] = useCheckIfCanDeleteMutation();

    const [openModal, setOpenModal] = useState(false);
    const [canDelete, setCanDelete] = useState(false);

    const { fields } =
        useSelector((state) => state[feature]?.form || { fields: {} });

    const redirectAfterSave = useSelector((state) => 
        state[feature]?.form?.redirectAfterSave
    );
    
    const { checkBeforeDeletion, deletionConfirmationMessage } =
        useSelector((state) => state[feature]?.table || {
            checkBeforeDeletion: false,
            deletionConfirmationMessage: null,
        });

    const relationships = Object.values(fields).reduce((acc, field) => {
        if (field.relationship) {
            acc[field.relationship.split("/")[1]] = field.value.map(
                (item) => item.id
            );
        }
        return acc;
    }, {});

    // ---- DELETE + CHECK LOGIC ----

    const checkIfCanDelete = () => {
        checkIfCanDeleteMutation({
            url: `${feature}/${id}/canDelete`,
        })
            .unwrap()
            .then((response) => {
                setCanDelete(response.can_delete);
                setOpenModal(true);
            });
    };

    const handleDelete = () => {
        deleteRecord({
            url: `${feature}/${id}`,
            data: { relationships },
        });
        setOpenModal(false);
    };

    useEffect(() => {
        if (result.isSuccess) {
            // Check if there's a custom redirect configured
            if (redirectAfterSave?.shouldRedirect) {
                const { targetPage, contextData } = redirectAfterSave;
                navigate(`/${targetPage}`, { state: contextData });
            } else {
                // Default behavior: go to list
                navigate(`/${feature}/list`);
            }
        }
    }, [result, redirectAfterSave]);

    return (
        <>
            <Button
                onClick={
                    checkBeforeDeletion
                        ? checkIfCanDelete
                        : handleDelete
                }
                sx={{ marginTop: "2rem", backgroundColor: "#ff2355" }}
            >
                削除
            </Button>

            {openModal && (
                <Modal
                    open
                    onClose={() => setOpenModal(false)}
                    sx={{
                        "--Modal-backdrop-filter": "blur(2px)",
                        "--Modal-backdrop-bg": "rgba(0,0,0,0.2)",
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
                            sx={{
                                mt: 2,
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: 1,
                            }}
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

export default DeleteRecord;
