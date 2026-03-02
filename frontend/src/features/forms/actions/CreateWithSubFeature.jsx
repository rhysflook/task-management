import { mergeSubform } from "../utils/mergeSubform";
import Create from "./Create";
// import CreateAndOpen from "./CreateAndOpen";

const CreateWithSubFeature = ({feature, subFeature}) => {
  
  const handleCreate = (feature, baseData) => {
    const merged = mergeSubform({ ...baseData }, subFeature, feature);
    return merged;
  };

  return <Create feature={feature} transformData={handleCreate} />;
};

export default CreateWithSubFeature;