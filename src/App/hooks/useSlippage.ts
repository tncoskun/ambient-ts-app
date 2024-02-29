// START: Import React and Dongles
import { useContext, useEffect, useMemo, useState } from 'react';
import {
    slippageDefaultsIF,
    slippagePresetsType,
} from '../../ambient-utils/constants';
import { ChainDataContext } from '../../contexts/ChainDataContext';

// interface for object returned by this hook
export interface SlippageMethodsIF {
    stable: number;
    volatile: number;
    updateStable: (val: number) => void;
    updateVolatile: (val: number) => void;
    presets: { stable: slippagePresetsType; volatile: slippagePresetsType };
}

export interface allSlippageMethodsIF {
    swapSlippage: SlippageMethodsIF;
    mintSlippage: SlippageMethodsIF;
    repoSlippage: SlippageMethodsIF;
}

// !important:  this hook supports differential values on L2 networks, this is not
// !important:  ... written in the prettiest way but is allows for differential
// !important:  ... handling without changing any fn calls in the app proper

// custom hook to manage and interact a given slippage pair
// @param slippageType ➡ denotes swap, mint, or reposition
// @param defaults ➡ default values to use for slippage
export const useSlippage = (
    slippageType: 'swap' | 'mint' | 'repo',
    defaults: slippageDefaultsIF,
): SlippageMethodsIF => {
    // keygen logic for local storage
    const LS_KEY: string = 'slippage_' + slippageType;

    // check if active network is an L2 for differential handling
    const { isActiveNetworkL2 } = useContext(ChainDataContext);

    // fn to get relevant slippage pair from local storage and return
    // ... a value to use productively for stable or volatile slippage
    const getSlippage = (whichOne: 'stable' | 'volatile' | 'l2'): number => {
        // retrieve the relevant slippage pair from local storage
        // query will return `null` if the key-value pair does not exist
        const pair: slippageDefaultsIF | null = JSON.parse(
            localStorage.getItem(LS_KEY) as string,
        );
        // declare an output value for the function
        let output: number;
        // router to get the stable or volatile value as specified by params
        // will use default value if local storage did not have a key-val pair
        switch (whichOne) {
            case 'stable':
                output = pair?.stable ?? defaults.stable;
                break;
            case 'volatile':
                output = pair?.volatile ?? defaults.volatile;
                break;
            case 'l2':
                output = pair?.l2 ?? defaults.l2;
                break;
            default:
                output = 0;
        }
        // return output value
        return output;
    };

    // hooks to hold different slippage values in state
    // l2 is stored separately but preferentially consumed when relevant
    // do NOT refactor these as useMemo() hooks, it will not work
    const [stable, setStable] = useState<number>(getSlippage('stable'));
    const [volatile, setVolatile] = useState<number>(getSlippage('volatile'));
    const [l2, setL2] = useState<number>(getSlippage('l2'));

    // update persisted value in local storage whenever user changes slippage tolerance
    useEffect(() => {
        localStorage.setItem(LS_KEY, JSON.stringify({ stable, volatile, l2 }));
    }, [stable, volatile, l2]);

    // return data object
    // stable ➡ number, active slippage value for stable pairs
    // volatile ➡ number, active slippage value for non-stable pairs
    // updateStable ➡ accepts a new `stable` value from the DOM
    // updateVolatile ➡ accepts a new `volatile` value from the DOM
    // !important:  most fields will preferentially consume an L2 value as relevant
    return useMemo(
        () => ({
            stable: isActiveNetworkL2 ? stable : l2,
            volatile: isActiveNetworkL2 ? volatile : l2,
            updateStable: isActiveNetworkL2 ? setStable : setL2,
            updateVolatile: isActiveNetworkL2 ? setVolatile : setL2,
            presets: defaults.presets,
        }),
        [stable, volatile, l2],
    );
};
