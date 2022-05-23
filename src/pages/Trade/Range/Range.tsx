import { useEffect, useState } from 'react';
import ContentContainer from '../../../components/Global/ContentContainer/ContentContainer';
import RangeButton from '../../../components/Trade/Range/RangeButton/RangeButton';
import RangeCurrencyConverter from '../../../components/Trade/Range/RangeCurrencyConverter/RangeCurrencyConverter';
import RangePriceInfo from '../../../components/Trade/Range/RangePriceInfo/RangePriceInfo';
import RangeWidth from '../../../components/Trade/Range/RangeWidth/RangeWidth';
import styles from './Range.module.css';
import {
    contractAddresses,
    sendAmbientMint,
    liquidityForBaseQty,
    fromDisplayQty,
    getSpotPrice,
    POOL_PRIMARY,
    // sendConcMint,
    // toFixedNumber,
    parseMintEthersReceipt,
    EthersNativeReceipt,
    // toDisplayPrice,
    getSpotPriceDisplay,
    // ParsedSwapReceipt,
    // contractAddresses,
    ambientPosSlot,
    // concPosSlot,
} from '@crocswap-libs/sdk';

import { isTransactionReplacedError, TransactionError } from '../../../utils/TransactionError';

import { handleParsedReceipt } from '../../../utils/HandleParsedReceipt';

import { JsonRpcProvider } from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import RangeHeader from '../../../components/Trade/Range/RangeHeader/RangeHeader';
import RangeDenominationSwitch from '../../../components/Trade/Range/RangeDenominationSwitch/RangeDenominationSwitch';
import AdvancedModeToggle from '../../../components/Trade/Range/AdvancedModeToggle/AdvancedModeToggle';
import MinMaxPrice from '../../../components/Trade/Range/AdvancedModeComponents/MinMaxPrice/MinMaxPrice';
import AdvancedPriceInfo from '../../../components/Trade/Range/AdvancedModeComponents/AdvancedPriceInfo/AdvancedPriceInfo';

interface IRangeProps {
    provider: JsonRpcProvider;
    lastBlockNumber: number;
}

import { useMoralis, useNewMoralisObject } from 'react-moralis';

import truncateDecimals from '../../../utils/data/truncateDecimals';

export default function Range(props: IRangeProps) {
    const { save } = useNewMoralisObject('UserPosition');

    // const sellTokenAddress = contractAddresses.ZERO_ADDR;
    const daiKovanAddress = '0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa';
    // const buyTokenAddress = daiKovanAddress;

    const [poolPriceNonDisplay, setPoolPriceNonDisplay] = useState(0);
    const [poolPriceDisplay, setPoolPriceDisplay] = useState('');
    const [liquidityForBase, setLiquidityForBase] = useState(BigNumber.from(0));
    const [denominationsInBase, setDenominationsInBase] = useState(false);

    const { Moralis, user, account, chainId } = useMoralis();
    const [advancedMode, setAdvancedMode] = useState<boolean>(false);

    const toggleAdvancedMode = () => setAdvancedMode(!advancedMode);

    useEffect(() => {
        (async () => {
            const spotPrice = await getSpotPrice(
                contractAddresses.ZERO_ADDR,
                daiKovanAddress,
                // usdcKovanAddress,
                POOL_PRIMARY,
                props.provider,
            );
            if (poolPriceNonDisplay !== spotPrice) {
                setPoolPriceNonDisplay(spotPrice);
            }
        })();
    }, [props.lastBlockNumber]);

    useEffect(() => {
        (async () => {
            const spotPriceDisplay = await getSpotPriceDisplay(
                contractAddresses.ZERO_ADDR,
                daiKovanAddress,
                // usdcKovanAddress,
                POOL_PRIMARY,
                props.provider,
            );
            const truncatedPriceWithDenonimationPreference = truncateDecimals(
                denominationsInBase ? spotPriceDisplay : 1 / spotPriceDisplay,
                4,
            ).toString();
            if (poolPriceDisplay !== truncatedPriceWithDenonimationPreference) {
                setPoolPriceDisplay(truncatedPriceWithDenonimationPreference);
            }
        })();
    }, [props.lastBlockNumber, denominationsInBase]);

    const qtyNonDisplay = fromDisplayQty('.00001', 18);

    useEffect(() => {
        if (poolPriceNonDisplay) {
            const liquidity = liquidityForBaseQty(poolPriceNonDisplay, qtyNonDisplay);
            setLiquidityForBase(liquidity);
        }
    }, [poolPriceNonDisplay]);

    const maxSlippage = 5;

    const poolWeiPriceLowLimit = poolPriceNonDisplay * (1 - maxSlippage / 100);
    const poolWeiPriceHighLimit = poolPriceNonDisplay * (1 + maxSlippage / 100);

    const signer = props.provider?.getSigner();

    const baseTokenAddress = contractAddresses.ZERO_ADDR;
    const quoteTokenAddress = daiKovanAddress;

    const sendTransaction = async () => {
        if (signer) {
            const tx = await sendAmbientMint(
                baseTokenAddress,
                quoteTokenAddress,
                liquidityForBase,
                poolWeiPriceLowLimit,
                poolWeiPriceHighLimit,
                0.0001,
                signer,
            );
            let newTransactionHash = tx.hash;
            console.log({ newTransactionHash });
            let parsedReceipt;

            try {
                const receipt = await tx.wait();
                console.log({ receipt });
                parsedReceipt = await parseMintEthersReceipt(
                    props.provider,
                    receipt as EthersNativeReceipt,
                );
            } catch (e) {
                const error = e as TransactionError;
                if (isTransactionReplacedError(error)) {
                    // The user used "speed up" or something similar
                    // in their client, but we now have the updated info

                    // dispatch(removePendingTx(tx.hash));
                    console.log('repriced');
                    newTransactionHash = error.replacement.hash;
                    console.log({ newTransactionHash });
                    // dispatch(setCurrentTxHash(replacementTxHash));
                    // dispatch(addPendingTx(replacementTxHash));

                    parsedReceipt = await parseMintEthersReceipt(
                        props.provider,
                        error.receipt as EthersNativeReceipt,
                    );
                }
            } finally {
                if (parsedReceipt)
                    handleParsedReceipt(Moralis, 'mint', newTransactionHash, parsedReceipt);

                const posHash = ambientPosSlot(
                    account as string,
                    baseTokenAddress,
                    quoteTokenAddress,
                );
                const txHash = newTransactionHash;

                save({ txHash, posHash, user, account, chainId });
            }
        }
    };

    const denominationSwitch = (
        <div className={styles.denomination_switch_container}>
            <AdvancedModeToggle
                toggleAdvancedMode={toggleAdvancedMode}
                advancedMode={advancedMode}
            />
            <RangeDenominationSwitch
                denominationsInBase={denominationsInBase}
                setDenominationsInBase={setDenominationsInBase}
            />
        </div>
    );

    const advancedModeContent = (
        <>
            <MinMaxPrice />
            <AdvancedPriceInfo />
        </>
    );

    // props for <Range/> React element
    const rangePriceInfoProps = {
        spotPriceDisplay: poolPriceDisplay,
    };

    const baseModeContent = (
        <>
            <RangeWidth />
            <RangePriceInfo {...rangePriceInfoProps} />
        </>
    );

    return (
        <section data-testid={'range'}>
            <ContentContainer isOnTradeRoute>
                <RangeHeader />
                {denominationSwitch}
                <RangeCurrencyConverter />
                {advancedMode ? advancedModeContent : baseModeContent}
                {/* 
                <RangeWidth />
                <RangePriceInfo /> */}
                <RangeButton onClickFn={sendTransaction} />
            </ContentContainer>
        </section>
    );
}
