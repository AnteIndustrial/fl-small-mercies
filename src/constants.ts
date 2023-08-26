import {SettingsSchema} from "./settings.js";

const EXTENSION_NAME = "FL Small Mercies";
const EXTENSION_ID = "FL_SM";

const MSG_TYPE_SAVE_SETTINGS = `${EXTENSION_ID}_saveSettings`;
const MSG_TYPE_CURRENT_SETTINGS = `${EXTENSION_ID}_currentSettings`;

const SETTINGS_SCHEMA: SettingsSchema = [
    {
        title: "UI Fixes",
        settings: {
            fix_journal_navigation: {
                description: "Fix color and alignment of the navigation buttons in Journal.",
                default: true,
            },
            discrete_scrollbars: {
                description: "Remove progress bars from discrete sidebar qualities.",
                default: true,
            },
            maxed_out_scrollbars: {
                description: "Remove progress bars from maxed-out sidebar qualities.",
                default: true,
            },
            scrip_icon: {
                description: "Add Hinterlands Scrip Icon to a sidebar indicator.",
                default: true,
            },
            sort_city_mysteries: {
                description: "Sort 'Mystery of the ... City' qualities.",
                default: true,
            },
            sort_discordance_seals: {
                description: "Sort ███████████ █████.",
                default: true,
            },
            sort_dreams: {
                description: "Sort advanced dreams (Stormy-Eyed, Seeing in Apocyan, Haunted by Stairs) below their base qualities.",
                default: true,
            },
            sort_neathbow_boxes: {
                description: "Sort Neathbow boxes in your inventory.",
                default: true,
            },
            fix_empty_requirements: {
                description: "Remove empty requirements bar in social storylets.",
                default: true,
            },
            hide_nonlocal_qualities: {
                description: "Hide qualities not appropriate for the current location.",
                default: true,
            },
            track_shop_transactions: {
                description: "Update relevant currencies on shop transactions.",
                default: true,
            }
        },
    },
    {
        title: "UI Improvements",
        settings: {
            add_thousands_separator: {
                description: "Add a comma after thousands in the currency indicators.",
                default: true,
            },
            remove_mask_banner: {
                description: "Remove the 'Mask of the Rose' banner.",
                default: false,
            },
            remove_sidebar_snippets: {
                description: "Remove 'Snippets' from the right sidebar.",
                default: true,
            },
            add_profile_link: {
                description: "Add button that points to your profile.",
                default: true,
            },
            display_favour_tracker: {
                description: "Display Favours in the right sidebar.",
                default: true,
            },
            auto_scroll_back: {
                description: "Auto-scroll to the storylet after choosing a branch.",
                default: true,
            },
            quick_share_button: {
                description: "Replace the usual 'Share snippet' button with a quicker alternative.",
                default: true,
            },
            display_more_currencies: {
                description: "Show more currencies in the left sidebar.",
                default: true,
            },
            two_step_confirmations: {
                description: "Protect certain 'dangerous' branches with a two-step confirmation process.",
                default: false,
            },
            hide_single_item_icon: {
                description: "Hide the '1' icon next to single items in your inventory.",
                default: true,
            },
            shop_price_totals: {
                description: "Display total value when hovering over 'Sell' button.",
                default: true,
            },
            shortcut_another_time: {
                description: "Shortcut 'Another time' branch in Labyrinth of Tigers.",
                default: true,
            },
            persistent_premium: {
                description: 'Move gold-framed storylets into "Fifth City Stories".',
                default: false,
            }
        },
    },
    {
        title: "Whimsical stuff",
        settings: {
            ship_saver: {
                description: "Disable storylet that lets you sell your Ship.",
                default: true,
            },
            remove_plan_buttons: {
                description: "Remove the 'Plans' button & related buttonlets",
                default: false,
            },
            ascetic_mode: {
                description: "Remove both location banner and candles.",
                default: false,
            },
            remove_fate_counter: {
                description: "Remove Fate counter from the sidebar.",
                default: false,
            },
            show_af_year: {
                description: "Show After Fall years on Journal snippets.",
                default: false,
            },
            enable_khanate_oracle: {
                description: "Show prospects for recruitment when cycling 'Airs of Khanate'.",
                default: false,
            },
            top_exit_buttons: {
                description: "Show 'Perhaps Not' button at the top in storylets that have 4 branches or more.",
                default: false,
            },
        },
    },
    {
        title: "Fine-tuning",
        settings: {
            show_zero_favours: {
                description: "Show factions with zero Favours.",
                default: false,
            },
            scroll_back_behavior: {
                description: "Scroll back mode",
                default: "auto",
                choices: [
                    ["auto", "Instant"],
                    ["smooth", "Smooth"],
                ],
            },
            top_exit_buttons_always: {
                description: "Show the button regardless of the number of branches in a storylet.",
                default: false,
            },
            display_currencies_everywhere: {
                description: "Show indicators for additional currencies regardless of location.",
                default: false,
            },
        },
    },
];

export {EXTENSION_NAME, EXTENSION_ID, MSG_TYPE_SAVE_SETTINGS, MSG_TYPE_CURRENT_SETTINGS, SETTINGS_SCHEMA};
