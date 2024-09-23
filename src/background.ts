import {FLSettingsBackend} from "./settings";
import { SETTINGS_SCHEMA } from "./constants";
import { WikiApi } from "./wiki";
import { TthApi } from "./tth_api";
import { debug, log } from "./logging";

const settingsBackend = new FLSettingsBackend(SETTINGS_SCHEMA);
const wikiApi = new WikiApi();
const tthApi = new TthApi();

chrome.runtime.onMessage.addListener((request, _sender, _sendResponse) => {
    if (settingsBackend.isMessageRelevant(request)) {
        settingsBackend.handleMessage(request);
    }
    if (wikiApi.isMessageRelevant(request)) {
        wikiApi.handleMessage(request)
    }
    if (tthApi.isMessageRelevant(request)) {
        tthApi.handleMessage(request)
    }
});
