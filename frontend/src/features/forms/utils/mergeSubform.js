// utils/mergeSubform.js

import { store } from "../../../stores/store";

export function mergeSubform(parentData, subFeature, feature) {
    const repeaterItems = store.getState()[feature]?.repeaters?.[subFeature] ?? [];

    if (repeaterItems.length > 0) {
        parentData[subFeature] = repeaterItems;
    }
    return parentData;
}