import { CrocEnv } from '@crocswap-libs/sdk';
import { useEffect, useState } from 'react';
import {
    FetchContractDetailsFn,
    TokenPriceFn,
    TokenPriceFnReturn,
} from '../../ambient-utils/api';
import {
    DexTokenAggServerIF,
    getChainStats,
    getFormattedNumber,
    isWethToken,
} from '../../ambient-utils/dataLayer';
import { TokenIF } from '../../ambient-utils/types';
import { tokenMethodsIF } from '../../App/hooks/useTokens';
import { ethers } from 'ethers';

interface dexDataGeneric {
    raw: number;
    display: string;
}

export interface dexTokenData extends DexTokenAggServerIF {
    tokenMeta: TokenIF | undefined;
    normalized:
        | {
              dexTvlNorm: dexDataGeneric;
              dexFeesNorm: dexDataGeneric;
              dexVolNorm: dexDataGeneric;
          }
        | undefined;
}

export interface useTokenStatsIF {
    data: dexTokenData[];
    update: () => Promise<void>;
}

export const useTokenStats = (
    chainId: string,
    crocEnv: CrocEnv | undefined,
    backupEndpoint: string,
    cachedFetchTokenPrice: TokenPriceFn,
    cachedTokenDetails: FetchContractDetailsFn,
    tokenMethods: tokenMethodsIF,
    provider: ethers.providers.Provider,
): useTokenStatsIF => {
    const [dexTokens, setDexTokens] = useState<dexTokenData[]>([]);

    async function fetchData(): Promise<void> {
        dexTokens.length && setDexTokens([]);
        if (crocEnv) {
            try {
                const tokenStats = await getChainStats(
                    'expanded',
                    chainId,
                    crocEnv,
                    backupEndpoint,
                    cachedFetchTokenPrice,
                    20,
                    tokenMethods.allDefaultTokens,
                );

                if (tokenStats) {
                    const promises = tokenStats.map(
                        async (ts: DexTokenAggServerIF) => {
                            try {
                                const decoratedToken = await decorate(ts);
                                return decoratedToken;
                            } catch (error) {
                                console.error('Error decorating token:', error);
                                return null;
                            }
                        },
                    );

                    const settledPromises = await Promise.allSettled(promises);
                    const fulfilledResults = settledPromises
                        .filter((result) => result.status === 'fulfilled')
                        .map(
                            (result) =>
                                (result as { value: dexTokenData }).value,
                        )
                        .filter((t) => !isWethToken(t.tokenAddr));
                    setDexTokens(fulfilledResults);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
    }

    useEffect(() => {
        fetchData();
    }, [crocEnv]);

    const decorate = async (t: DexTokenAggServerIF): Promise<dexTokenData> => {
        const tokenMeta: TokenIF | undefined =
            tokenMethods.getTokenByAddress(t.tokenAddr) ??
            (await cachedTokenDetails(provider, t.tokenAddr, chainId));

        const tokenStatsNormalized = await expandTokenStats(t);

        async function expandTokenStats(token: DexTokenAggServerIF) {
            if (!crocEnv || !tokenMeta) return;
            const tokenPricePromise: Promise<TokenPriceFnReturn> =
                cachedFetchTokenPrice(token.tokenAddr, chainId, crocEnv);

            const price: number = (await tokenPricePromise)?.usdPrice || 0;

            const tvlUSD: number = normalizeToUSD(
                token.dexTvl,
                tokenMeta.decimals,
                price,
            );
            const tvlDisplay: string = getFormattedNumber({
                value: tvlUSD,
                isTvl: true,
                prefix: '$',
            });

            const feesUSD: number = normalizeToUSD(
                token.dexFees,
                tokenMeta.decimals,
                price,
            );
            const feesDisplay: string = getFormattedNumber({
                value: feesUSD,
                isTvl: true,
                prefix: '$',
            });

            const volumeUSD: number =
                normalizeToUSD(token.dexVolume, tokenMeta.decimals, price) / 2;
            const volumeDisplay: string = getFormattedNumber({
                value: volumeUSD,
                isTvl: true,
                prefix: '$',
            });

            function normalizeToUSD(
                num: number,
                decimals: number,
                price: number,
            ): number {
                return (num / Math.pow(10, decimals)) * price;
            }

            return {
                dexTvlNorm: {
                    raw: tvlUSD,
                    display: tvlDisplay,
                },
                dexFeesNorm: {
                    raw: feesUSD,
                    display: feesDisplay,
                },
                dexVolNorm: {
                    raw: volumeUSD,
                    display: volumeDisplay,
                },
            };
        }

        return {
            ...t,
            tokenMeta,
            normalized: tokenStatsNormalized,
        };
    };

    return {
        data: dexTokens,
        update: () => fetchData(),
    };
};
