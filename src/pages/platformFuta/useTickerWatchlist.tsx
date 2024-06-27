import { useState } from 'react';

export type tickerVersions = 'v1';

export interface tickerWatchlistIF {
    data: string[];
    version: tickerVersions;
    add: (t: string) => void;
    remove: (t: string) => void;
    toggle: (t: string) => void;
}

export function useTickerWatchlist(
    version: tickerVersions,
    defaultWatchlist: string[] = [],
): tickerWatchlistIF {
    const LS_KEY: string = 'ticker_watchlist_' + version;

    const [watchlist, setWatchlist] = useState<string[]>(getPersisted());

    function getPersisted(): string[] {
        let output;
        const persistedRaw: string | null = localStorage.getItem(LS_KEY);
        if (persistedRaw) {
            const parsed: string[] = JSON.parse(persistedRaw);
            if (Array.isArray(parsed)) {
                output = parsed;
            } else {
                localStorage.setItem(LS_KEY, JSON.stringify(defaultWatchlist));
                output = defaultWatchlist;
            }
        } else {
            localStorage.setItem(LS_KEY, JSON.stringify(defaultWatchlist));
            output = defaultWatchlist;
        }
        return output;
    }

    function processUpdate(tickers: string[]): void {
        setWatchlist(tickers);
        localStorage.setItem(LS_KEY, JSON.stringify(tickers));
    }

    function watchTicker(t: string): void {
        const currentList: string[] = [...watchlist];
        if (!currentList.includes(t)) {
            processUpdate(currentList.concat([t]));
        }
    }

    function unwatchTicker(t: string): void {
        if (watchlist.includes(t)) {
            processUpdate(watchlist.filter((e: string) => e !== t));
        }
    }

    function toggleWatching(t: string): void {
        console.log('toggling!');
        watchlist.includes(t) ? unwatchTicker(t) : watchTicker(t);
    }

    return {
        data: watchlist,
        version: version,
        add: watchTicker,
        remove: unwatchTicker,
        toggle: toggleWatching,
    };
}
