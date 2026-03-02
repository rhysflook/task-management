const getFocusable = (form) =>
    Array.from(
        form.querySelectorAll(
            'input:not([aria-hidden="true"]), select, textarea, button:not([disabled]):not(.MuiAutocomplete-clearIndicator), [tabindex]:not([tabindex="-1"])'
        )
    ).filter(el => !el.hidden && el.offsetParent !== null
    );

const setFocusToFirst = (form) => {
    setTimeout(() => {
        if (!form) return;
        const focusable = getFocusable(form);
        if (focusable.length > 0) {
        focusable[0].focus();
        }
    }, 0);
}

export { setFocusToFirst, getFocusable };