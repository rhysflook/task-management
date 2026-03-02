import { mergeSubform } from "../utils/mergeSubform";
import EditAndOpen from "./EditAndOpen";

const EditWithSubFeature = ({ feature, subFeature }) => {

  const handleEdit = (feature, baseData) => {
    const merged = mergeSubform({ ...baseData }, subFeature, feature);
    return merged;
  };

  return <EditAndOpen feature={feature} transformData={handleEdit} />;
};

export default EditWithSubFeature;