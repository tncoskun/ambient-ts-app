import { CrocEnv, toDisplayQty } from '@crocswap-libs/sdk';
import { TokenIF } from '../../../../utils/interfaces/exports';
import styles from './Transfer.module.css';
import TransferAddressInput from './TransferAddressInput/TransferAddressInput';
import TransferButton from './TransferButton/TransferButton';
import TransferCurrencySelector from './TransferCurrencySelector/TransferCurrencySelector';
// import { defaultTokens } from '../../../../utils/data/defaultTokens';
import { useAppDispatch } from '../../../../utils/hooks/reduxToolkit';
import {
    Dispatch,
    ReactNode,
    SetStateAction,
    useEffect,
    useMemo,
    useState,
} from 'react';
// import { setToken } from '../../../../utils/state/temp';
import {
    addPendingTx,
    addReceipt,
    addTransactionByType,
    removePendingTx,
} from '../../../../utils/state/receiptDataSlice';
import {
    isTransactionFailedError,
    isTransactionReplacedError,
    TransactionError,
} from '../../../../utils/TransactionError';
import { BigNumber } from 'ethers';
import { checkBlacklist } from '../../../../utils/data/blacklist';
import { FaGasPump } from 'react-icons/fa';
import { ZERO_ADDRESS } from '../../../../constants';

interface propsIF {
    crocEnv: CrocEnv | undefined;
    // connectedAccount: string;
    openGlobalModal: (content: ReactNode, title?: string) => void;
    closeGlobalModal: () => void;
    selectedToken: TokenIF;
    tokenDexBalance: string;
    setRecheckTokenBalances: Dispatch<SetStateAction<boolean>>;
    lastBlockNumber: number;
    sendToAddress: string | undefined;
    resolvedAddress: string | undefined;
    setSendToAddress: Dispatch<SetStateAction<string | undefined>>;
    secondaryEnsName: string | undefined;
    openTokenModal: () => void;
    ethMainnetUsdPrice: number | undefined;
    gasPriceInGwei: number | undefined;
}

export default function Transfer(props: propsIF) {
    const {
        crocEnv,
        // openGlobalModal,
        // closeGlobalModal,
        selectedToken,
        // tokenAllowance,
        tokenDexBalance,
        // setRecheckTokenAllowance,
        setRecheckTokenBalances,
        lastBlockNumber,
        sendToAddress,
        resolvedAddress,
        setSendToAddress,
        secondaryEnsName,
        openTokenModal,
        ethMainnetUsdPrice,
        gasPriceInGwei,
    } = props;

    const dispatch = useAppDispatch();

    const selectedTokenDecimals = selectedToken.decimals;

    const tokenExchangeDepositsDisplay = tokenDexBalance
        ? toDisplayQty(tokenDexBalance, selectedTokenDecimals)
        : undefined;

    const tokenExchangeDepositsDisplayNum = tokenExchangeDepositsDisplay
        ? parseFloat(tokenExchangeDepositsDisplay)
        : undefined;

    const tokenDexBalanceTruncated = tokenExchangeDepositsDisplayNum
        ? tokenExchangeDepositsDisplayNum < 0.0001
            ? tokenExchangeDepositsDisplayNum.toExponential(2)
            : tokenExchangeDepositsDisplayNum < 2
            ? tokenExchangeDepositsDisplayNum.toPrecision(3)
            : // : tokenDexBalanceNum >= 100000
              // ? formatAmountOld(tokenDexBalanceNum)
              tokenExchangeDepositsDisplayNum.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              })
        : undefined;

    const [transferQtyNonDisplay, setTransferQtyNonDisplay] = useState<
        string | undefined
    >();
    const [buttonMessage, setButtonMessage] = useState<string>('...');
    const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(true);
    const [isCurrencyFieldDisabled, setIsCurrencyFieldDisabled] =
        useState<boolean>(true);
    const [isAddressFieldDisabled, setIsAddressFieldDisabled] =
        useState<boolean>(true);
    const [sendToAddressDexBalance, setSendToAddressDexBalance] =
        useState<string>('');
    const [recheckSendToAddressDexBalance, setRecheckSendToAddressDexBalance] =
        useState<boolean>(false);

    const sendToAddressDexBalanceDisplay = sendToAddressDexBalance
        ? toDisplayQty(sendToAddressDexBalance, selectedTokenDecimals)
        : undefined;

    const sendToAddressDexBalanceDisplayNum = sendToAddressDexBalanceDisplay
        ? parseFloat(sendToAddressDexBalanceDisplay)
        : undefined;

    const sendToAddressBalanceTruncated = sendToAddressDexBalanceDisplayNum
        ? sendToAddressDexBalanceDisplayNum < 0.0001
            ? sendToAddressDexBalanceDisplayNum.toExponential(2)
            : sendToAddressDexBalanceDisplayNum < 2
            ? sendToAddressDexBalanceDisplayNum.toPrecision(3)
            : // : tokenWalletBalanceNum >= 100000
              // ? formatAmountOld(tokenWalletBalanceNum)
              sendToAddressDexBalanceDisplayNum.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              })
        : undefined;

    const isResolvedAddressValid = useMemo(() => {
        if (!resolvedAddress) return false;

        const isResolvedAddressBlacklisted = checkBlacklist(resolvedAddress);

        return (
            !isResolvedAddressBlacklisted &&
            resolvedAddress?.length === 42 &&
            resolvedAddress.startsWith('0x')
        );
    }, [resolvedAddress]);

    useEffect(() => {
        if (
            crocEnv &&
            selectedToken.address &&
            resolvedAddress &&
            isResolvedAddressValid
        ) {
            crocEnv
                .token(selectedToken.address)
                .balance(resolvedAddress)
                .then((bal: BigNumber) => {
                    setSendToAddressDexBalance(bal.toString());
                })
                .catch(console.log);
        } else {
            setSendToAddressDexBalance('');
        }
        setRecheckSendToAddressDexBalance(false);
    }, [
        crocEnv,
        selectedToken.address,
        resolvedAddress,
        lastBlockNumber,
        recheckSendToAddressDexBalance,
    ]);

    const isDexBalanceSufficient = useMemo(
        () =>
            tokenDexBalance && !!transferQtyNonDisplay
                ? BigNumber.from(tokenDexBalance).gte(
                      BigNumber.from(transferQtyNonDisplay),
                  )
                : false,
        [tokenDexBalance, transferQtyNonDisplay],
    );

    const isTransferQtyValid = useMemo(
        () => transferQtyNonDisplay !== undefined,
        [transferQtyNonDisplay],
    );

    // const [isApprovalPending, setIsApprovalPending] = useState(false);
    const [isTransferPending, setIsTransferPending] = useState(false);

    useEffect(() => {
        setIsTransferPending(false);
    }, [JSON.stringify(selectedToken)]);

    // const chooseToken = (tok: TokenIF) => {
    //     console.log(tok);
    //     dispatch(setToken(tok));
    //     closeGlobalModal();
    // };

    useEffect(() => {
        // console.log({ isDepositQtyValid });
        // console.log({ isTokenAllowanceSufficient });
        if (!isResolvedAddressValid) {
            setIsButtonDisabled(true);
            setIsAddressFieldDisabled(false);
            setIsCurrencyFieldDisabled(false);
            setButtonMessage('Please Enter a Valid Address');
        } else if (!transferQtyNonDisplay) {
            setIsButtonDisabled(true);
            setIsAddressFieldDisabled(false);
            setIsCurrencyFieldDisabled(false);
            setButtonMessage('Enter a Transfer Amount');
        } else if (!isDexBalanceSufficient) {
            setIsButtonDisabled(true);
            setIsAddressFieldDisabled(false);
            setIsCurrencyFieldDisabled(false);
            setButtonMessage(
                `${selectedToken.symbol} Exchange Balance Insufficient`,
            );
        } else if (isTransferPending) {
            setIsButtonDisabled(true);
            setIsAddressFieldDisabled(true);
            setIsCurrencyFieldDisabled(true);
            setButtonMessage(`${selectedToken.symbol} Transfer Pending`);
        } else if (isTransferQtyValid) {
            setIsButtonDisabled(false);
            setIsAddressFieldDisabled(false);
            setIsCurrencyFieldDisabled(false);
            setButtonMessage('Transfer');
        }
    }, [
        isTransferPending,
        isDexBalanceSufficient,
        isTransferQtyValid,
        selectedToken.symbol,
        isResolvedAddressValid,
    ]);

    const transfer = async (transferQty: string) => {
        if (crocEnv && transferQty && resolvedAddress) {
            try {
                const transferQtyDisplay = toDisplayQty(
                    transferQty,
                    selectedTokenDecimals,
                );

                setIsTransferPending(true);
                const tx = await crocEnv
                    .token(selectedToken.address)
                    .transfer(transferQtyDisplay, resolvedAddress);
                dispatch(addPendingTx(tx?.hash));
                if (tx?.hash)
                    dispatch(
                        addTransactionByType({
                            txHash: tx.hash,
                            txType: `Transfer ${selectedToken.symbol}`,
                        }),
                    );
                let receipt;
                try {
                    if (tx) receipt = await tx.wait();
                } catch (e) {
                    const error = e as TransactionError;
                    console.log({ error });
                    // The user used "speed up" or something similar
                    // in their client, but we now have the updated info
                    if (isTransactionReplacedError(error)) {
                        console.log('repriced');
                        dispatch(removePendingTx(error.hash));

                        const newTransactionHash = error.replacement.hash;
                        dispatch(addPendingTx(newTransactionHash));

                        console.log({ newTransactionHash });
                        receipt = error.receipt;

                        //  if (newTransactionHash) {
                        //      fetch(
                        //          newSwapCacheEndpoint +
                        //              new URLSearchParams({
                        //                  tx: newTransactionHash,
                        //                  user: account ?? '',
                        //                  base: isSellTokenBase ? sellTokenAddress : buyTokenAddress,
                        //                  quote: isSellTokenBase
                        //                      ? buyTokenAddress
                        //                      : sellTokenAddress,
                        //                  poolIdx: (await env.context).chain.poolIndex.toString(),
                        //                  isBuy: isSellTokenBase.toString(),
                        //                  inBaseQty: inBaseQty.toString(),
                        //                  qty: crocQty.toString(),
                        //                  override: 'false',
                        //                  chainId: chainId,
                        //                  limitPrice: '0',
                        //                  minOut: '0',
                        //              }),
                        //      );
                        //  }
                    } else if (isTransactionFailedError(error)) {
                        // console.log({ error });
                        receipt = error.receipt;
                    }
                }

                if (receipt) {
                    dispatch(addReceipt(JSON.stringify(receipt)));
                    dispatch(removePendingTx(receipt.transactionHash));
                    resetTransferQty();
                }
            } catch (error) {
                if (
                    error.reason === 'sending a transaction requires a signer'
                ) {
                    location.reload();
                }
                console.warn({ error });
            } finally {
                setIsTransferPending(false);
                setRecheckTokenBalances(true);
                setRecheckSendToAddressDexBalance(true);
            }
        }
    };

    const transferFn = async () => {
        if (transferQtyNonDisplay) await transfer(transferQtyNonDisplay);
    };

    const isResolvedAddressDifferent = resolvedAddress !== sendToAddress;

    const resolvedAddressOrNull = isResolvedAddressDifferent ? (
        <div className={styles.info_text_non_clickable}>
            Resolved Destination Address:
            <div className={styles.hex_address}>{resolvedAddress}</div>
        </div>
    ) : null;

    const secondaryEnsOrNull = secondaryEnsName ? (
        <div className={styles.info_text_non_clickable}>
            Destination ENS Address: {secondaryEnsName}
            {/* <div className={styles.hex_address}>{secondaryEnsName}</div> */}
        </div>
    ) : null;

    // const transferInput = document.getElementById(
    //     'exchange-balance-transfer-exchange-balance-transfer-quantity',
    // ) as HTMLInputElement;

    const resetTransferQty = () => {
        // if (transferInput) {
        //     transferInput.value = '';
        // }
        setTransferQtyNonDisplay(undefined);
        setInputValue('');
    };

    useEffect(() => {
        resetTransferQty();
    }, [selectedToken.address]);

    const isTokenDexBalanceGreaterThanZero = parseFloat(tokenDexBalance) > 0;

    const [inputValue, setInputValue] = useState('');

    const handleBalanceClick = () => {
        if (isTokenDexBalanceGreaterThanZero) {
            setTransferQtyNonDisplay(tokenDexBalance);

            // if (transferInput && tokenExchangeDepositsDisplay)
            //     transferInput.value = tokenExchangeDepositsDisplay;
            if (tokenExchangeDepositsDisplay)
                setInputValue(tokenExchangeDepositsDisplay);
        }
    };

    const [transferGasPriceinDollars, setTransferGasPriceinDollars] = useState<
        string | undefined
    >();

    const isTokenEth = selectedToken.address === ZERO_ADDRESS;

    const averageGasUnitsForEthTransfer = 45000;
    const averageGasUnitsForErc20Transfer = 45000;
    const gweiInWei = 1e-9;

    // calculate price of gas for exchange balance transfer
    useEffect(() => {
        if (gasPriceInGwei && ethMainnetUsdPrice) {
            const gasPriceInDollarsNum =
                gasPriceInGwei *
                gweiInWei *
                ethMainnetUsdPrice *
                (isTokenEth
                    ? averageGasUnitsForEthTransfer
                    : averageGasUnitsForErc20Transfer);

            setTransferGasPriceinDollars(
                '$' +
                    gasPriceInDollarsNum.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    }),
            );
        }
    }, [gasPriceInGwei, ethMainnetUsdPrice, isTokenEth]);

    return (
        <div className={styles.deposit_container}>
            <div className={styles.info_text_non_clickable}>
                Transfer deposited collateral to another deposit account:
            </div>
            <TransferAddressInput
                fieldId='exchange-balance-transfer-address'
                setTransferToAddress={setSendToAddress}
                sendToAddress={sendToAddress}
                disable={isAddressFieldDisabled}
            />
            <TransferCurrencySelector
                fieldId='exchange-balance-transfer'
                onClick={() => openTokenModal()}
                selectedToken={selectedToken}
                setTransferQty={setTransferQtyNonDisplay}
                inputValue={inputValue}
                setInputValue={setInputValue}
                disable={isCurrencyFieldDisabled}
            />
            <div
                onClick={handleBalanceClick}
                className={
                    isTokenDexBalanceGreaterThanZero
                        ? styles.info_text_clickable
                        : styles.info_text_non_clickable
                }
            >
                Your Exchange Balance ({selectedToken.symbol}):{' '}
                {tokenDexBalanceTruncated || '0.0'}
            </div>
            <div className={styles.info_text_non_clickable}>
                Destination Exchange Balance ({selectedToken.symbol}):{' '}
                {sendToAddressBalanceTruncated || '0.0'}
            </div>
            {resolvedAddressOrNull}
            {secondaryEnsOrNull}
            <TransferButton
                onClick={() => {
                    // console.log('clicked');
                    transferFn();
                }}
                disabled={isButtonDisabled}
                buttonMessage={buttonMessage}
            />
            <div className={styles.gas_pump}>
                <div className={styles.svg_container}>
                    <FaGasPump size={12} />{' '}
                </div>
                {transferGasPriceinDollars ? transferGasPriceinDollars : '…'}
            </div>
        </div>
    );
}
