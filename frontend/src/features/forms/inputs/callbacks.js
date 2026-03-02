import { store } from "../../../stores/store";

const getRoomsByUnitChange = (fields, unitId) => {
    const rooms = fields['room_id'] || [];
    if (rooms) {
        const filteredOptions = rooms.allOptions.filter(
            (room) => room.unit_id === unitId
        );
        const value = filteredOptions.find(option => option.id === fields['room_id'].value) ? fields['room_id'].value : "";
        return {
            room_id: {
                ...rooms,
                options: filteredOptions,
                value: value,
                errors: [],
            },
        }
    } else {
        return {};
    }
    // return {'room_id': rooms};
}

const getRoomsByUnitLoad = (form, state, repeaterContext) => {
    const selectedUnitId = form.fields['unit_id'].value;
    // const selectedRoomId = form.fields['room_id'].value;
    const rooms = form.fields['room_id'] || [];
    if (rooms) {
        const options = rooms.options ?? rooms.allOptions;
        const filteredOptions = options.filter(
            (room) => room.unit_id === selectedUnitId
        );
        return { newOptions: filteredOptions, idToUpdate: 'room_id'};
    } else {
        return {};
    }
}

const getBedsByUnit = (fields, unitId) => {
    // We want to empty the bed_id field when the unit_id field is changed
    // same for bed_id options
    // It will be filled when the room_id field is changed
    return {'bed_id': {
        ...fields['bed_id'],
        options: [],
        value: "",
        errors: [],
    }};
}

const getBedsByRoomChange = (fields, roomId) => {
    const beds = fields['bed_id'] || [];
    if (beds) {
        const filteredOptions = beds.allOptions.filter(
            (bed) => bed.room_id === roomId
        );
        const value = filteredOptions.find(option => option.id === fields['bed_id'].value) ? fields['bed_id'].value : "";
        return {
            bed_id: {
                ...beds,
                options: filteredOptions,
                value: value,
                errors: [],
            },
        }
    } else {
        return {};
    }
    // return {'bed_id': beds};
}

const getBedsByRoomLoad = (form, state, repeaterContext) => {
    const selectedRoomId = form.fields['room_id'].value;
    const beds = form.fields['bed_id'] || [];
    if (beds) {
        const options = beds.options ?? beds.allOptions;
        const filteredOptions = options.filter(
            (bed) => bed.room_id === selectedRoomId
        );
        return { newOptions: filteredOptions, idToUpdate: 'bed_id'};
    } else {
        return {};
    }
}

const setPatientStatusOptions = (form, state) => {
    if (!form.extraData?.section_options) return { newOptions: [{ value: "1", name:"空床" }, { value: "2", name: "入所" }], idToUpdate: 'section', newValue: form.fields['section'].value || '' };
    return {
        newOptions: form.extraData.section_options,
        idToUpdate: 'section',
        newValue: form.fields['section'].value || '',
    }
}

const getBirthDay60YearsAgo = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 60);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

const setNextPatientNo = (form, mode) => {
    // Implementation to set the next patient number

    // We don't want to update staff_id when edit
    if (mode === 'edit') return form.fields['patient_no'].value;
    // Case after record is created: we let Create.jsx handling the staff_id value getting from backend
    if (form.initialLoad == false) return null;
    const nextNo = form.extraData?.next_patient_no || '';
    return nextNo
}

const setNextRoomNo = (form, mode) => {
    // Implementation to set the next room number

    // We don't want to update room_no when edit
    if (mode === 'edit') return form.fields['number'].value;
    // Case after record is created: we let Create.jsx handling the room_no value getting from backend
    if (form.initialLoad == false) return null;

    const nextNo = form.extraData?.next_room_no || '';
    return nextNo
}

const setNextStaffNo = (form, mode) => {
    // Implementation to set the next staff number

    // We don't want to update staff_id when edit
    if (mode === 'edit') return null;
    // Case after record is created: we let Create.jsx handling the staff_id value getting from backend
    if (form.initialLoad == false) return null;

    const nextNo = form.extraData?.next_staff_id || '';
    return nextNo
}

const disableIfBlank = (form, mode, state, id=null, repeaterContext=null) => {
    return state.repeaters['beds']?.[repeaterContext.index]?.['is_blank'] || false;  
}
// const toggleBedBlankStatus = (form, mode, checkBoxId) => {
//     form.fields['beds'].fields['bed_no']
//     return !currentValue;
// }

const loadBlankBeds = (state, action) => {

    const beds = [...action.payload.data.beds]; // clone to avoid mutation

    const positions = beds.map(bed => bed.position);
    const maxPos = Math.max(...positions);

    // Fill missing positions
    for (let pos = 1; pos <= maxPos; pos++) {
        if (!beds.some(bed => bed.position === pos)) {
            beds.push({
                id: `blank-${pos}`,
                bed_no: '',
                extension: '',
                status: '1',
                is_blank: true,
                position: pos,
            });
        }
    }

    // Sort by position
    beds.sort((a, b) => a.position - b.position);

    // Write back into state (without mutation)
    action.payload.data.beds = beds;

    return state;
}

const removeUsedClientFromOptions = (fields, deviceId, state, repeaterContext) => {
    const { repeater, index: currentIndex } = repeaterContext;
    const allRepeaterItems = state?.repeaters?.[repeater] || [];
    
    const indexUpdates = {};
    
    // Update options for ALL items EXCEPT the current one
    allRepeaterItems.forEach((item, itemIndex) => {
        // Skip the item that just changed
        if (itemIndex === currentIndex) return;
        
        // Get filtered options for this specific item (excluding its own selection)
        const { newOptions } = updateClientOptions(null, null, state.form, state, null, [itemIndex]);
        
        indexUpdates[itemIndex] = {
            client_id: {
                options: newOptions
            }
        };
    });
    
    return { indexUpdates };
}

const updateClientOptions = (fields, clientId, form, state, repeaterContext = null, excludeIndex = []) => {
    let currentIndex = null;
    if (repeaterContext) {
        currentIndex = repeaterContext.index;
    }

    const beds = form.fields?.beds;
    const clientOptions = beds?.fields?.client_id?.options || [];
    const bedsRepeaterItems = state?.repeaters?.beds || [];

    // Gather all selected client_ids except for currentIndex (we KEEP the selection at currentIndex)
    const filteredOptions = bedsRepeaterItems
        .map((item, idx) => {
            // Do not consider the value of the currentIndex (allow user to keep their own selection)
            if (idx === currentIndex) return null;
            // excludeIndex could contain multiple indices
            if (Array.isArray(excludeIndex) && excludeIndex.includes(idx)) return null;
            if (!Array.isArray(excludeIndex) && idx === excludeIndex) return null;
            return item.client_id;
        })
        .filter(id => id != null && id !== '');

    const newOptions = clientOptions.filter(opt => !filteredOptions.includes(opt.id));
    return { newOptions: newOptions, newValue: '' };
}

const updateAllClientOptions = (state, repeater) => {
    const repeaterFields = state.form?.fields?.[repeater]?.fields || {};
    const remainingItems = state.repeaters?.[repeater] || [];
    
    remainingItems.forEach((item, itemIndex) => {
        Object.entries(repeaterFields).forEach(([fieldKey, fieldDef]) => {
            if (fieldDef.id === "client_id") {
                // Get updated options for this item
                const { newOptions } = updateClientOptions(null, null, state.form, state, null, [itemIndex]);
                
                if (!fieldDef.optionsByIndex) {
                    fieldDef.optionsByIndex = {};
                }
                
                fieldDef.optionsByIndex[itemIndex] = newOptions;
            }
        });
    });
};

export const callbacks = {
    'getRoomsByUnitChange': getRoomsByUnitChange,
    'getRoomsByUnitLoad': getRoomsByUnitLoad,
    'getBedsByRoomChange': getBedsByRoomChange,
    'getBedsByRoomLoad': getBedsByRoomLoad,
    'getBedsByUnit': getBedsByUnit,
    'setBirthDayTo60YearsAgo': getBirthDay60YearsAgo,
    'setNextPatientNo': setNextPatientNo,
    'disableIfBlank': disableIfBlank,
    'loadBlankBeds': loadBlankBeds,
    'setNextStaffNo': setNextStaffNo,
    'removeUsedClientFromOptions': removeUsedClientFromOptions,
    'updateClientOptions': updateClientOptions,
    'updateAllClientOptions': updateAllClientOptions,
    'setNextRoomNo': setNextRoomNo,
    'setPatientStatusOptions': setPatientStatusOptions,
};