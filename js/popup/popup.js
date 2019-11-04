import {
    saveUrlsInLocalStorage, countData,
    getAllData, updateCardTitle, getUrlsFromLocalStorage,
    deleteUrlsFromLocalStorage
} from './localStorage.js';
import { notifyUrlsCopied, notifyUrlsSaved } from './notifications.js'

let getUrlsButton = document.getElementById('copy');

let typingTimer;

(function () {
    let object = getAllData();
    Object.keys(object).forEach((key) => {
        createUrlsList(JSON.parse(object[key]), key);
    })
})();

document.addEventListener("click", (event) => {
    if (event.target && event.target.id == 'item-panel') {
        var content = event.target.nextElementSibling;

        if (content.className === "collapse") {
            content.classList.remove('collapse');
        } else {
            content.className = 'collapse'
        }
    }
});

document.addEventListener("click", (event) => {
    if (event.target && event.target.id == 'open') {
        let content;
        if (event.target.parentNode.id == 'open') {
            content = event.target.parentNode.parentNode.nextElementSibling;
        } else {
            content = event.target.parentNode.nextElementSibling;
        }

        chrome.extension.sendMessage({ type: "OPEN_TABS_FROM_CARD", urlsList: getUrlsFromLocalStorage(content.getAttribute('cardid')) });
    }
});

document.addEventListener("click", (event) => {
    if (event.target && event.target.id == 'delete') {
        let content;
        let removeElement;
        if (event.target.parentNode.id == 'delete') {
            content = event.target.parentNode.parentNode.nextElementSibling;
        } else {
            content = event.target.parentNode.nextElementSibling;
        }
        removeElement = content.parentNode.parentNode

        deleteUrlsFromLocalStorage(content.getAttribute('cardid'));

        removeElement.style.display = 'none'
    }
});

document.addEventListener("keyup", (event) => {
    if (event.target && event.target.id == 'item-panel-input') {
        if (document.activeElement == event.target) {
            clearTimeout(typingTimer);
            if (event.target.value) {
                typingTimer = setTimeout(() => {
                    updateCardTitle(event.target.getAttribute('cardid'), event.target.value);
                }, 0)
            }
        }
    }
});

getUrlsButton.addEventListener("click", buttonClicked);

chrome.runtime.onMessage.addListener(function (request, sender) {
    if (request.type == 'GET_URL_LIST') {
        createUrlsList(request.urls);
        saveUrlsInLocalStorage(request.urls);
    } else if (request.type == 'CLEAR_URL_LIST') {
        clearUrlsList();
    }
});

function buttonClicked() {
    chrome.extension.sendMessage({ type: "GET_URLS_FROM_ALL_TABS" });
    chrome.notifications.create(notifyUrlsCopied);
}

function createUrlsList(urls, cardId) {
    document.getElementById('urls').insertAdjacentElement('afterbegin', createLinkList(urls, cardId));
}

function clearUrlsList() {
    document.getElementById('urls').innerHTML = "";
}

function createLinkList(array, cardId) {
    let divContainer = createCard();
    let divPanel = creteCardPanel();
    let ulList = createListContent('ul', 'item-content', 'ftlform');
    let cardTitle = createCardTitleInput(array[array.length - 1].cardTitle, cardId);

    divContainer.appendChild(divPanel)
    divContainer.appendChild(ulList);

    divPanel.appendChild(cardTitle);

    for (var i = 0; i < array.length; i++) {

        if (array[i].title != undefined) {
            var liRow = document.createElement('li');
            // var icon = creteIcon('fa', 'fa-times', 'fa-sm');
            ulList.appendChild(liRow);
            liRow.className = 'card';

            var aLink = document.createElement('a');
            var aLinkTxt = document.createTextNode(array[i].title);
            aLink.appendChild(aLinkTxt);
            aLink.title = array[i].title;
            aLink.href = array[i].url;
            aLink.setAttribute('id', 'ftlform');
            aLink.target = "_blank"
            liRow.appendChild(aLink);
            // liRow.appendChild(icon);
        }
    }
    return divContainer;
}

function createCard() {
    let card = document.createElement('div');
    card.className = 'item-container';
    return card;
}

function creteCardPanel() {
    let panel = document.createElement('div');
    let optionsIcon = creteIcon('fa', 'fa-ellipsis-v', 'fa-lg', 'item-panel-inside', 'btn-on-right', 'icon-in-panel-v-center', 'icon-in-panel');
    let dropdown = createDropdown();
    panel.classList.add('collapsible', 'item-panel');
    panel.setAttribute('id', 'item-panel');
    panel.appendChild(optionsIcon);
    panel.appendChild(dropdown);
    return panel;
}

function createListContent(htmlTag, className, idName) {
    let list = document.createElement(htmlTag);
    list.className = className;
    list.setAttribute('id', idName);
    return list;
}

function creteIcon(...classNames) {
    let icon = document.createElement('i');
    classNames.forEach((className) => {
        icon.className += className + " ";
    });
    return icon;
}

function createCardTitleInput(title, cardId) {
    let index = countData() + 1;
    let titleInput = document.createElement('input');
    titleInput.className += 'item-panel-inside'
    titleInput.className += ' v-center'
    titleInput.setAttribute('id', 'item-panel-input');
    titleInput.setAttribute('cardid', cardId);

    if (title) {
        titleInput.setAttribute('value', title);
    }
    else {
        titleInput.setAttribute('value', `New Card ${index}`);
    }

    return titleInput;
}

function createDropdown() {
    let dropdown = document.createElement('div');

    let dropdownDeleteItem = document.createElement('a');
    let dropdownDeleteItemIcon = creteIcon('fa', 'fa-trash', 'btn-on-right');
    dropdownDeleteItemIcon.setAttribute('id', 'delete');

    let dropdownOpenItem = document.createElement('a');
    let dropdownOpenItemIcon = creteIcon('fa', 'fa-folder-open', 'btn-on-right');
    dropdownOpenItemIcon.setAttribute('id', 'open');

    dropdown.className += 'dropdown-content'

    dropdownDeleteItem.textContent = 'Remove';
    dropdownDeleteItem.insertAdjacentElement('beforeend', dropdownDeleteItemIcon)
    dropdownDeleteItem.setAttribute('id', 'delete')

    dropdownOpenItem.textContent = 'Open';
    dropdownOpenItem.insertAdjacentElement('beforeend', dropdownOpenItemIcon)
    dropdownOpenItem.setAttribute('id', 'open')

    dropdown.appendChild(dropdownOpenItem);
    dropdown.appendChild(dropdownDeleteItem);

    return dropdown
}