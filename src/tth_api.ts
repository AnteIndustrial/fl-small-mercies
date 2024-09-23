import { MSG_TYPE_TTH_API_CALL, MSG_TYPE_TTH_API_RESPONSE } from "./constants";
import { debug, log } from "./logging";
import Tab = chrome.tabs.Tab;

type TthRequestObject = { action: string, authToken: string };


class TthApi {
    private static lock = 0;// for now, this prevents multiple API calls. In future it will need to be not a permanent block
    private token = "";
    constructor() {
        ;
    }

    private getFallenLondonTabs(): Promise<Array<Tab>> {
        return new Promise((resolve, _) => {
            chrome.windows.getCurrent((w) => {
                chrome.tabs.query({ windowId: w.id, url: "*://*.fallenlondon.com/*" }, function (tabs) {
                    resolve(tabs);
                });
            });
        });
    }

    private sendResultsToTabs(result: string) {
        debug(`Sending tth to tabs: ${result}`);
        this.getFallenLondonTabs().then((tabs) => {
            tabs.map((t) => {
                if (t.id == null) {
                    return;
                }

                const message = { action: MSG_TYPE_TTH_API_RESPONSE, result: result}
                chrome.tabs.sendMessage(t.id, message);
            });
        });
    }

    handleMessage(message: TthRequestObject) {
        if (TthApi.lock == 0) {
            TthApi.lock = 1;
            if (message.authToken) {
                this.token = message.authToken;
            }
            if (!this.token) {
                return;
            }
            fetch("https://api.fallenlondon.com/api/settings/timethehealer",
                { headers: { "Authorization": "Bearer " + this.token } })
                .then(response => response.json())
                .then(data => this.sendResultsToTabs(data.dateTimeToExecute))
                .then(() => TthApi.lock = 0)
                .catch(error => log(error));
        } else {
            //TODO something while it's locked...? It isn't an issue yet.
        }
    }

    isMessageRelevant(message: TthRequestObject): boolean {
        return message.action === MSG_TYPE_TTH_API_CALL
    }

}
export { TthApi };