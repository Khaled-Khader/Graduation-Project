
export function formatAge(months) {
    if (months < 12) {
        return `${months} month${months === 1 ? "" : "s"}`;
    } else {
        const years = (months / 12).toFixed(1); // one decimal place
        return `${years} year${years === "1.0" ? "" : "s"}`;
    }
}