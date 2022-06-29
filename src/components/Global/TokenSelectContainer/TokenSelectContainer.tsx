import styles from './TokenSelectContainer.module.css';
import { useState, SetStateAction, useEffect } from 'react';
import TokenSelect from '../TokenSelect/TokenSelect';
// import TokenSelectSearchable from '../TokenSelect/TokenSelectSearchable';
import { TokenIF, TokenPairIF, TokenListIF } from '../../../utils/interfaces/exports';
import Button from '../../Global/Button/Button';
import TokenList from '../../Global/TokenList/TokenList';
// import searchTokens from './searchTokens';

interface TokenSelectContainerPropsIF {
    tokenPair: TokenPairIF;
    tokensBank: Array<TokenIF>;
    searchableTokens: Array<TokenIF>;
    tokenList?: Array<TokenIF>;
    chainId: string;
    tokenToUpdate: string;
    closeModal: () => void;
    reverseTokens: () => void;
    showManageTokenListContent: boolean;
    setShowManageTokenListContent: React.Dispatch<SetStateAction<boolean>>;
}

export default function TokenSelectContainer(props: TokenSelectContainerPropsIF) {
    const {
        tokenPair,
        tokensBank,
        searchableTokens,
        chainId,
        tokenToUpdate,
        closeModal,
        reverseTokens,
        showManageTokenListContent,
        setShowManageTokenListContent,
    } = props;
    console.log(chainId)

    const [searchTerm] = useState('');

    const [matchingSearchableTokens, setMatchingSearchableTokens] = useState<Array<TokenIF>>([]);

    useEffect(() => {
        console.log(matchingSearchableTokens);
    }, [matchingSearchableTokens]);

    const tokenListContent = (
        <>
            {tokensBank
                .filter((val) => {
                    if (searchTerm === '') {
                        return val;
                    } else if (
                        val.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        val.symbol.toLowerCase().includes(searchTerm.toLowerCase())
                    ) {
                        return val;
                    }
                })
                .map((token, idx) => {
                    return (
                        <TokenSelect
                            key={idx}
                            token={token}
                            tokenToUpdate={tokenToUpdate}
                            closeModal={closeModal}
                            tokenPair={tokenPair}
                            reverseTokens={reverseTokens}
                        />
                    );
                })}
                {/* {searchableTokens.map((tkn:TokenIF, idx:number) => (
                    <TokenSelectSearchable
                        key={`tss_${idx}`}
                        token={tkn}
                        closeModal={closeModal}
                    />
                ))} */}
        </>
    );

    function searchTokens(searchStr:string) {
        console.log('trigger func searchTokens() for: ' + searchStr);
        const matchingTokens = searchableTokens.filter((token:TokenIF) => 
                token.symbol.toLowerCase().includes(searchStr.toLowerCase())
        );
        setMatchingSearchableTokens(matchingTokens);
    }

    const tokenListContainer = (
        <>
            <div className={styles.search_input}>
                <input
                    type='text'
                    placeholder='Search name or paste address'
                    onChange={(event) => searchTokens(event.target.value)}
                />
            </div>
            {tokenListContent}
        </>
    );

    const manageTokenListContainer = (
        <>
            <TokenList />
        </>
    );

    const manageTokenListButton = (
        <Button title='Manage Token List' action={() => setShowManageTokenListContent(true)} />
    );

    return (
        <div className={styles.token_select_container}>
            {showManageTokenListContent ? manageTokenListContainer : tokenListContainer}
            {showManageTokenListContent ? null : manageTokenListButton}
        </div>
    );
}
