const setDeadPiRedStyle = (row) => {
    if (row.data_kbn === '死活：死') {
        return { color: '#ff0000ff' }; // light red background
    }
    return {};
}

export const styleCallbacks = {
    setDeadPiRedStyle,
};