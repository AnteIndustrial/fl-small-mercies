import { MSG_TYPE_WIKI_API_CALL, MSG_TYPE_WIKI_API_RESPONSE } from "./constants";
import { debug, log } from "./logging";
import Tab = chrome.tabs.Tab;

type WikiRequestObject = { action: string, missingQualities: string };
type WikiResult = {name: string, value: string, timestamp: number}


class WikiApi {
    private static lock = 0;// for now, this prevents multiple API calls. In future it will need to be not a permanent block
    private static currentQuery = [];

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

    private sendResultsToTabs(parsedResults: Map<string, WikiResult>) {
        debug(`Sending results to tabs: ${JSON.stringify(Object.fromEntries(parsedResults)) }`);
        this.getFallenLondonTabs().then((tabs) => {
            tabs.map((t) => {
                if (t.id == null) {
                    return;
                }

                const message = { action: MSG_TYPE_WIKI_API_RESPONSE, results: JSON.stringify(Object.fromEntries(parsedResults)) }
                chrome.tabs.sendMessage(t.id, message);
            });
        });
    }

    handleMessage(message: WikiRequestObject) {
        if (WikiApi.lock == 0) {
            WikiApi.lock = 1;
            let url = "https://fallenlondon.wiki/w/api.php?action=ask&format=json&query=[["
            const missingWorldQualities: string[] = JSON.parse(message.missingQualities)
            
            for (const qualityName of missingWorldQualities) {
                url += qualityName;
                url += "||"
            }
            url = url.slice(0, -2); //remove the last delimiter
            url += "]]"
            url += "|?Has current value"
            url = encodeURI(url)
            fetch(url)
                .then(response => response.json())
                .then(data => new Map(Object.entries(data.query.results)))
                .then(results => this.parseResults(results))
                .then(parsedResults => this.sendResultsToTabs(parsedResults))
                .then(() => WikiApi.lock = 0)
                .catch(error => log(error));
        } else {
            //TODO something while it's locked...? It isn't an issue yet.
        }
    }

    private parseResults(results: Map<string, string | number | unknown>): Map<string, WikiResult>{
        const parsedResults: Map<string, WikiResult> = new Map();
        const timestamp = Date.now();
        results.forEach((val, key) => {
            // eslint-disable-next-line @typescript-eslint/ban-types
            const valAsMap: Map<string, string | number | unknown> = new Map(Object.entries(val as Object));
            valAsMap.forEach((innerVal, _innerKey) => {
                if (typeof innerVal !== "string" && typeof innerVal !== "number") {
                    // eslint-disable-next-line @typescript-eslint/ban-types
                    const entry: Map<string, string[]> = new Map(Object.entries(innerVal as Object))
                    try {
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        const value = entry.get("Has current value")![0];
                        parsedResults.set(key, { name: key, value: value, timestamp: timestamp })
                    } catch (e: unknown) {
                        log("error parsing result")
                        log(key)
                        log(JSON.stringify(entry))
                        if (typeof e === "string") {
                            log(e)
                        } else if (e instanceof Error) {
                            log(e.message)
                        }
                    }
                }
            });

        });
        debug(`Parsed wiki results: ${parsedResults}`)
        return parsedResults;
    }

    isMessageRelevant(message: WikiRequestObject): boolean {
        return message.action === MSG_TYPE_WIKI_API_CALL
    }

}
export { WikiApi, WikiResult }