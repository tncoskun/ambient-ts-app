// START: Import React and Dongles
import { Dispatch, SetStateAction, useContext, useState } from 'react';

// START: Import JSX Components
import Button from '../../Form/Button';

// START: Import Other Local Files
import { TokenIF } from '../../../ambient-utils/types';
import { UserPreferenceContext } from '../../../contexts/UserPreferenceContext';
import {
    getFormattedNumber,
    uriToHttp,
} from '../../../ambient-utils/dataLayer';
import ConfirmationModalControl from '../../Global/ConfirmationModalControl/ConfirmationModalControl';
import TokenIcon from '../../Global/TokenIcon/TokenIcon';
import SubmitTransaction from './SubmitTransaction/SubmitTransaction';
import { FlexContainer, Text } from '../../../styled/Common';
import {
    ConfirmationDetailsContainer,
    ConfirmationQuantityContainer,
} from '../../../styled/Components/TradeModules';
import { FiPlus } from 'react-icons/fi';
import { TradeDataContext } from '../../../contexts/TradeDataContext';

interface propsIF {
    type: 'Swap' | 'Limit' | 'Range' | 'Reposition';
    tokenA: { token: TokenIF; quantity?: string };
    tokenB: { token: TokenIF; quantity?: string };
    transactionHash: string;
    txErrorCode: string;
    txErrorMessage: string;
    showConfirmation: boolean;
    setShowConfirmation?: Dispatch<SetStateAction<boolean>>;
    statusText: string;
    onClose?: () => void;
    initiate: () => Promise<void>;
    resetConfirmation: () => void;
    poolTokenDisplay?: React.ReactNode;
    transactionDetails?: React.ReactNode;
    acknowledgeUpdate?: React.ReactNode;
    extraNotes?: React.ReactNode;
    activeStep?: number;
    setActiveStep?: React.Dispatch<React.SetStateAction<number>>;
    steps?: {
        label: string;
    }[];
    handleSetActiveContent?: (newActiveContent: string) => void;
    showStepperComponent: boolean;
    setShowStepperComponent: React.Dispatch<React.SetStateAction<boolean>>;
    poolPrice?: string;
    minPrice?: string;
    maxPrice?: string;
    fillEnd?: string;
}

export default function TradeConfirmationSkeleton(props: propsIF) {
    const {
        type,
        initiate,
        tokenA: { token: tokenA, quantity: tokenAQuantity },
        tokenB: { token: tokenB, quantity: tokenBQuantity },
        transactionDetails,
        transactionHash,
        txErrorCode,
        txErrorMessage,
        statusText,
        showConfirmation,

        resetConfirmation,
        poolTokenDisplay,
        acknowledgeUpdate,
        extraNotes,
        activeStep,
        setActiveStep,
        steps,
        handleSetActiveContent,
        showStepperComponent,
        setShowStepperComponent,
        minPrice,
        maxPrice,
        fillEnd,
    } = props;

    const {
        bypassConfirmLimit,
        bypassConfirmRange,
        bypassConfirmRepo,
        bypassConfirmSwap,
    } = useContext(UserPreferenceContext);

    const [skipFutureConfirmation, setSkipFutureConfirmation] =
        useState<boolean>(false);

    const { activateConfirmation } = useContext(TradeDataContext);

    const formattedTokenAQuantity = getFormattedNumber({
        value: tokenAQuantity ? parseFloat(tokenAQuantity) : undefined,
        abbrevThreshold: 1000000000,
    });

    const formattedTokenBQuantity = getFormattedNumber({
        value: tokenBQuantity ? parseFloat(tokenBQuantity) : undefined,
        abbrevThreshold: 1000000000,
    });

    const svgArrow = (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            width='24'
            height='15'
            viewBox='0 0 24 15'
            fill='none'
        >
            <path
                d='M2.82 -0.000175476L12 9.15982L21.18 -0.000175476L24 2.81982L12 14.8198L0 2.81982L2.82 -0.000175476Z'
                fill='#7371FC'
            />
        </svg>
    );

    const tokenDisplay = (
        <>
            <ConfirmationQuantityContainer>
                <Text fontSize='header2' color='text1'>
                    {formattedTokenAQuantity}
                </Text>
                <FlexContainer
                    alignItems='center'
                    justifyContent='space-between'
                    margin='0 0 0 1rem'
                >
                    <TokenIcon
                        token={tokenA}
                        src={uriToHttp(tokenA.logoURI)}
                        alt={tokenA.symbol}
                        size='2xl'
                    />
                    <Text fontSize='header2' color='text1'>
                        {tokenA.symbol}
                    </Text>
                </FlexContainer>
            </ConfirmationQuantityContainer>
            <FlexContainer
                fullWidth
                justifyContent='center'
                alignItems='center'
                padding='8px 0'
                style={{ pointerEvents: 'none' }}
            >
                {svgArrow}
            </FlexContainer>
            <ConfirmationQuantityContainer>
                <Text fontSize='header2' color='text1'>
                    {formattedTokenBQuantity}
                </Text>
                <FlexContainer
                    alignItems='center'
                    justifyContent='space-between'
                    margin='0 0 0 1rem'
                >
                    <TokenIcon
                        token={tokenB}
                        src={uriToHttp(tokenB.logoURI)}
                        alt={tokenB.symbol}
                        size='2xl'
                    />
                    <Text fontSize='header2' color='text1'>
                        {tokenB.symbol}
                    </Text>
                </FlexContainer>
            </ConfirmationQuantityContainer>
        </>
    );

    const confirmationContent = (
        <>
            {type === 'Swap' || type === 'Limit'
                ? tokenDisplay
                : poolTokenDisplay}
            {transactionDetails && (
                <ConfirmationDetailsContainer
                    flexDirection='column'
                    gap={8}
                    padding='8px'
                >
                    {transactionDetails}
                </ConfirmationDetailsContainer>
            )}

            {extraNotes && extraNotes}
        </>
    );
    const rangeTokensDisplay = (
        <FlexContainer gap={8} alignItems='center' flexDirection='column'>
            <FlexContainer gap={8} alignItems='center'>
                <TokenIcon
                    token={tokenA}
                    src={uriToHttp(tokenA.logoURI)}
                    alt={tokenA.symbol}
                    size='s'
                />
                <Text fontSize='body' color='text2' align='center'>
                    {formattedTokenAQuantity} {tokenA.symbol}
                </Text>
                <FiPlus />

                <TokenIcon
                    token={tokenB}
                    src={uriToHttp(tokenB.logoURI)}
                    alt={tokenB.symbol}
                    size='s'
                />
                <Text fontSize='body' color='text2' align='center'>
                    {formattedTokenBQuantity} {tokenB.symbol}
                </Text>
            </FlexContainer>
            <FlexContainer gap={8} alignItems='center'>
                <Text fontSize='body' color='text2' align='center'>
                    {' '}
                    {minPrice}
                </Text>
                →
                <Text fontSize='body' color='text2' align='center'>
                    {' '}
                    {maxPrice}
                </Text>
            </FlexContainer>
        </FlexContainer>
    );

    const tokensDisplay =
        type === 'Range' ? (
            rangeTokensDisplay
        ) : (
            <FlexContainer gap={8} alignItems='center' flexDirection='column'>
                <FlexContainer gap={8} alignItems='center'>
                    <TokenIcon
                        token={tokenA}
                        src={uriToHttp(tokenA.logoURI)}
                        alt={tokenA.symbol}
                        size='s'
                    />
                    <Text fontSize='body' color='text2' align='center'>
                        {formattedTokenAQuantity} {tokenA.symbol}
                    </Text>
                    →
                    <TokenIcon
                        token={tokenB}
                        src={uriToHttp(tokenB.logoURI)}
                        alt={tokenB.symbol}
                        size='s'
                    />
                    <Text fontSize='body' color='text2' align='center'>
                        {formattedTokenBQuantity} {tokenB.symbol}
                    </Text>
                </FlexContainer>
                {fillEnd && (
                    <Text fontSize='body' color='text2' align='center'>
                        @ {fillEnd}
                    </Text>
                )}
            </FlexContainer>
        );

    return (
        <FlexContainer
            flexDirection='column'
            gap={8}
            background='dark1'
            aria-label='Transaction Confirmation modal'
            height='100%'
        >
            {!showStepperComponent && confirmationContent}
            {/* <footer style={{marginTop: 'auto'}}> */}

            {!showConfirmation ? (
                !acknowledgeUpdate ? (
                    <footer style={{ marginTop: 'auto', padding: '0 32px' }}>
                        <ConfirmationModalControl
                            tempBypassConfirm={skipFutureConfirmation}
                            setTempBypassConfirm={setSkipFutureConfirmation}
                        />
                        <Button
                            title={statusText}
                            action={() => {
                                // if this modal is launched we can infer user wants confirmation
                                // if user enables bypass, update all settings in parallel
                                // otherwise do not not make any change to persisted preferences
                                if (skipFutureConfirmation) {
                                    bypassConfirmSwap.enable();
                                    bypassConfirmLimit.enable();
                                    bypassConfirmRange.enable();
                                    bypassConfirmRepo.enable();
                                }
                                setShowStepperComponent(true);
                                initiate();
                                activateConfirmation(type);
                            }}
                            flat
                            disabled={!!acknowledgeUpdate}
                            idForDOM='trade_conf_skeleton_btn'
                        />
                    </footer>
                ) : (
                    acknowledgeUpdate
                )
            ) : (
                <FlexContainer flexDirection='column' height='100%'>
                    <SubmitTransaction
                        type={type}
                        newTransactionHash={transactionHash}
                        txErrorCode={txErrorCode}
                        txErrorMessage={txErrorMessage}
                        resetConfirmation={resetConfirmation}
                        sendTransaction={initiate}
                        transactionPendingDisplayString={statusText}
                        disableSubmitAgain
                        activeStep={activeStep}
                        setActiveStep={setActiveStep}
                        steps={steps}
                        stepperComponent
                        stepperTokensDisplay={tokensDisplay}
                        handleSetActiveContent={handleSetActiveContent}
                        setShowStepperComponent={setShowStepperComponent}
                    />
                </FlexContainer>
            )}
            {/* </footer> */}
        </FlexContainer>
    );
}
