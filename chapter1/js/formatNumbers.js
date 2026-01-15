function formatNumber(num) {
    // Allow toggling formatting via localStorage setting `formatNumbers` ("true"/"false").
    const pref = localStorage.getItem('formatNumbers');
    const useFormatting = pref === null ? true : (pref === 'true');
    if (!useFormatting) {
        // Show raw number with one decimal (matches round2 display precision)
        return Number(num.toFixed(1));
    }

    if (num < 1000) {
        return num.toFixed(1); // since round2 rounds to 1 decimal
    }
    const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc', 'Ud', 'Dd', 'Td', 'Qad', 'Qid', 'Sxd', 'Spd', 'Ocd', 'Nod', 'Vg'];
    let tier = Math.floor(Math.log10(Math.abs(num)) / 3);
    if (tier >= suffixes.length) {
        tier = suffixes.length - 1;
    }
    const scaled = num / Math.pow(10, tier * 3);
    return scaled.toFixed(2) + suffixes[tier];
}