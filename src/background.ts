import {FLSettingsBackend} from "./settings";
import { SETTINGS_SCHEMA } from "./constants";
import { WikiApi } from "./wiki";
import { debug, log } from "./logging";

const settingsBackend = new FLSettingsBackend(SETTINGS_SCHEMA);
const wikiApi = new WikiApi();

chrome.runtime.onMessage.addListener((request, _sender, _sendResponse) => {
    if (settingsBackend.isMessageRelevant(request)) {
        settingsBackend.handleMessage(request);
    }
    if (wikiApi.isMessageRelevant(request)) {
        wikiApi.handleMessage(request)
    }
});
