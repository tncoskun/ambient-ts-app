import styles from './TransactionDetails.module.css';
import { useState, useRef, useContext } from 'react';
import printDomToImage from '../../../utils/functions/printDomToImage';
import TransactionDetailsHeader from './TransactionDetailsHeader/TransactionDetailsHeader';
import TransactionDetailsPriceInfo from './TransactionDetailsPriceInfo/TransactionDetailsPriceInfo';
import TransactionDetailsGraph from './TransactionDetailsGraph/TransactionDetailsGraph';
import { TransactionIF } from '../../../utils/interfaces/exports';
import TransactionDetailsSimplify from './TransactionDetailsSimplify/TransactionDetailsSimplify';
import useCopyToClipboard from '../../../utils/hooks/useCopyToClipboard';
import { ChainSpec } from '@crocswap-libs/sdk';
import { AppStateContext } from '../../../contexts/AppStateContext';
import marketBackground from '../../../assets/images/backgrounds/background-modal.png';
import background from '../../../assets/images/backgrounds/background.png';

interface propsIF {
    account: string;
    tx: TransactionIF;
    closeGlobalModal: () => void;
    isBaseTokenMoneynessGreaterOrEqual: boolean;
    isOnPortfolioPage: boolean;
    chainData: ChainSpec;
}

export default function TransactionDetails(props: propsIF) {
    const {
        account,
        tx,
        isBaseTokenMoneynessGreaterOrEqual,
        isOnPortfolioPage,
        chainData,
    } = props;
    const {
        snackbar: { open: openSnackbar },
    } = useContext(AppStateContext);

    const [showSettings, setShowSettings] = useState(false);
    const [showShareComponent, setShowShareComponent] = useState(true);

    const detailsRef = useRef(null);
    const downloadAsImage = () => {
        if (detailsRef.current) {
            printDomToImage(detailsRef.current);
        }
    };

    const [controlItems] = useState([
        { slug: 'ticks', name: 'Show ticks', checked: true },
        { slug: 'liquidity', name: 'Show Liquidity', checked: true },
        { slug: 'value', name: 'Show value', checked: true },
    ]);

    const [_, copy] = useCopyToClipboard();

    function handleCopyAddress() {
        const txHash = tx.tx;
        copy(txHash);
        openSnackbar(`${txHash} copied`, 'info');
    }

    // const handleChange = (slug: string) => {
    //     const copyControlItems = [...controlItems];
    //     const modifiedControlItems = copyControlItems.map((item) => {
    //         if (slug === item.slug) {
    //             item.checked = !item.checked;
    //         }

    //         return item;
    //     });

    //     setControlItems(modifiedControlItems);
    // };

    // const controlDisplay = showSettings ? (
    //     <div className={styles.control_display_container}>
    //         {controlItems.map((item, idx) => (
    //             <RangeDetailsControl key={idx} item={item} handleChange={handleChange} />
    //         ))}
    //     </div>
    // ) : null;

    const shareComponent = (
        <div ref={detailsRef}>
            <div className={styles.main_content}>
                <div className={styles.left_container}>
                    <TransactionDetailsPriceInfo
                        account={account}
                        tx={tx}
                        controlItems={controlItems}
                    />
                </div>
                <div className={styles.right_container}>
                    <TransactionDetailsGraph
                        tx={tx}
                        transactionType={tx.entityType}
                        useTx={true}
                        isBaseTokenMoneynessGreaterOrEqual={
                            isBaseTokenMoneynessGreaterOrEqual
                        }
                        isOnPortfolioPage={isOnPortfolioPage}
                        chainData={chainData}
                    />
                </div>
            </div>
            <p className={styles.ambi_copyright}>ambient.finance</p>
        </div>
    );

    return (
        <div
            className={styles.tx_details_container}
            style={{
                backgroundImage: showShareComponent
                    ? tx.entityType === 'swap'
                        ? `url(${marketBackground})`
                        : `url(${background})`
                    : '',
            }}
        >
            <TransactionDetailsHeader
                tx={tx}
                onClose={props.closeGlobalModal}
                showSettings={showSettings}
                setShowSettings={setShowSettings}
                downloadAsImage={downloadAsImage}
                setShowShareComponent={setShowShareComponent}
                showShareComponent={showShareComponent}
                handleCopyAddress={handleCopyAddress}
            />

            {showShareComponent ? (
                shareComponent
            ) : (
                <TransactionDetailsSimplify
                    account={account}
                    tx={tx}
                    isOnPortfolioPage={isOnPortfolioPage}
                />
            )}
        </div>
    );
}
