import {FLSettingsBackend} from "./settings";
import {SETTINGS_SCHEMA} from "./constants";

const settingsBackend = new FLSettingsBackend(SETTINGS_SCHEMA);

chrome.runtime.onMessage.addListener((request, _sender, _sendResponse) => {
    console.log("listener")
    console.log(request)
    if (settingsBackend.isMessageRelevant(request)) {
        settingsBackend.handleMessage(request);
    }
    if (request.action == "GetWikiData") {
        console.log("got message")
        /*
        temp commenting this while I don't need it, so I don't hit the api too much
        // eslint-disable-next-line prefer-const
        let url = "https://fallenlondon.wiki/w/api.php?action=ask&format=json&query=[[Phase%20of%20the%20Rat-Moon:]]"
        fetch(url)
            .then(response => response.json())
            .then(data => console.log(data))
            .catch(error => console.log(error));*/
        return true;
    }
});
