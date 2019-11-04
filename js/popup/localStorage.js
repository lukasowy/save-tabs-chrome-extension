export function saveUrlsInLocalStorage(data) {
    let randomTitle = `urls_${Date.now()}`;
    let index = countData() + 1;
    data.push({ 'cardTitle': `New Card ${index}` })
    localStorage.setItem(randomTitle, JSON.stringify(data));
    return JSON.parse(localStorage.getItem(randomTitle));
}

export function getAllData() {
    return Object.keys(localStorage)
        .reduce((obj, k) => {
            return { ...obj, [k]: localStorage.getItem(k) }
        }, {});
}

export function updateCardTitle(keyName, title) {
    let values = JSON.parse(localStorage.getItem(keyName));
    console.log(values);
    values[values.length - 1].cardTitle = title;
    localStorage.setItem(keyName, JSON.stringify(values));

}

export function getUrlsFromLocalStorage(keyName) {
    return JSON.parse(localStorage.getItem(keyName))
}

export function deleteUrlsFromLocalStorage(keyName) {
    console.log(keyName);
    localStorage.removeItem(keyName);
}

export function countData() {
    return Object.keys(localStorage).length;
}
