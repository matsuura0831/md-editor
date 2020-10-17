function toCamelCase(str, first = true) {
    const ret = str.split('_').map((w, i) => {
        if (i === 0) {
            return w.toLowerCase();
        }
        return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    }).join('');

    if (first) {
        return ret.charAt(0).toUpperCase() + ret.slice(1);
    }
    return ret;
}

export { toCamelCase }