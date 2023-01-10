import { useEffect, useState } from 'react';
import { TokenIF, TempPoolIF } from '../../../../../utils/interfaces/exports';

interface propsIF {
    pool: TempPoolIF;
    getTokenByAddress: (addr: string, chn: string) => TokenIF | undefined;
}

export default function PoolLI(props: propsIF) {
    const { pool, getTokenByAddress } = props;

    // hold base and quote token data objects in local state
    const [baseToken, setBaseToken] = useState<TokenIF|null>();
    const [quoteToken, setQuoteToken] = useState<TokenIF|null>();

    // get data objects for base and quote tokens after initial render
    useEffect(() => {
        // array of acknowledged tokens from user data obj in local storage
        const { ackTokens } = JSON.parse(localStorage.getItem('user') as string);
        // fn to check local storage and token map for token data
        const findTokenData = (addr:string, chn:string): TokenIF => {
            // look for token data obj in token map
            const tokenFromMap = getTokenByAddress(addr.toLowerCase(), chn);
            // look for token data obj in acknowledged token list
            const tokenFromAckList = ackTokens.find(
                (ackToken: TokenIF) => (
                    ackToken.chainId === parseInt(chn) &&
                    ackToken.address.toLowerCase() === addr.toLowerCase()
                )
            );
            // single variable to hold either retrieved token
            const outputToken = tokenFromMap ?? tokenFromAckList;
            // return retrieved token data object
            return outputToken;
        }
        // use addresses from pool data to get token data objects
        const baseTokenDataObj = findTokenData(pool.base, pool.chainId);
        const quoteTokenDataObj = findTokenData(pool.quote, pool.chainId);
        // send token data objects to local state
        baseTokenDataObj && setBaseToken(baseTokenDataObj);
        quoteTokenDataObj && setQuoteToken(quoteTokenDataObj);
    }, []);

    return (
        <div
            // className={styles.card_container}
        >
            <div>{baseToken?.symbol ?? '--'} + {quoteToken?.symbol ?? '--'}</div>
            <div>Price</div>
            <div>Gain</div>
        </div>
    );
}