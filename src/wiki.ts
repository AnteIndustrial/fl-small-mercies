import { MSG_TYPE_CURRENT_SETTINGS, MSG_TYPE_WIKI_API_CALL } from "./constants";
import { debug, log } from "./logging";

type WikiRequestObject = { action: string, missingQualities: string, callback: (results: Map<string, unknown>) => void};

class WikiApi {
    private i = 1;
    private results: Map<string, unknown> = new Map();
    constructor() {
        ;
    }

    handleMessage(message: WikiRequestObject) {
        console.log("wiki handle message")
        log(JSON.stringify(message))
        let url = "https://fallenlondon.wiki/w/api.php?action=ask&format=json&query=[["
        const missingWorldQualities: string[] = JSON.parse(message.missingQualities)
        for (const qualityName of missingWorldQualities) {
            url += qualityName;
            url += "||"
        }
        url = url.slice(0, -2)
        url += "]]"
        url += "|?Has current value"
        url = encodeURI(url)
        log(url);
        if (this.i == 0) {
            this.i = 1;
            fetch(url)
                .then(response => response.json())
                .then(data => this.results = data.query.results)
                .then(() => message.callback(this.results))
                .catch(error => log(error));

        }
    }

    isMessageRelevant(message: WikiRequestObject): boolean {
        return message.action === MSG_TYPE_WIKI_API_CALL
    }

}

export {WikiApi }