import styles from './TokenSelectContainer.module.css';
import { useState, SetStateAction } from 'react';
import TokenSelect from '../TokenSelect/TokenSelect';
import { TokenIF, TokenPairIF } from '../../../utils/interfaces/exports';
import Button from '../../Global/Button/Button';
import TokenList from '../../Global/TokenList/TokenList';
import searchTokens from './searchTokens';

interface TokenSelectContainerPropsIF {
    tokenPair: TokenPairIF;
    tokensBank: Array<TokenIF>;
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
        chainId,
        tokenToUpdate,
        closeModal,
        reverseTokens,
        showManageTokenListContent,
        setShowManageTokenListContent,
    } = props;
    console.log(chainId);
    
    const [searchTerm] = useState('');

    // TODO:  @Emily add the setter function back in to the useState() call
    const [tL] = useState(
        JSON.parse(localStorage.getItem('user') as string).tokens
            .filter((tkn:TokenIF) => tkn.chainId === parseInt(chainId))
    );

    console.log(tL);

    const searchInput = (
        <div className={styles.search_input}>
            <input
                type='text'
                placeholder='Search name or paste address'
                onChange={(event) => searchTokens(event.target.value)}
            />
        </div>
    );

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
        </>
    );

    const tokenListContainer = (
        <>
            {searchInput}
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
