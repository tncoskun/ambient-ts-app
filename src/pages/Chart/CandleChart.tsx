import { useContext, useEffect, useRef, useState } from 'react';
import {
    chartItemStates,
    renderCanvasArray,
    setCanvasResolution,
} from './Chart';
import { IS_LOCAL_ENV } from '../../constants';
import { diffHashSig } from '../../utils/functions/diffHashSig';
import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import { TradeTableContext } from '../../contexts/TradeTableContext';
import { CandleData } from '../../utils/state/graphDataSlice';

interface candlePropsIF {
    chartItemStates: chartItemStates;
    setBandwidth: React.Dispatch<number>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    scaleData: any;
    selectedDate: number | undefined;
    showLatest: boolean | undefined;
    denomInBase: boolean;
    data: CandleData[];
    period: number;
    lastCandleData: CandleData;
}

export default function CandleChart(props: candlePropsIF) {
    const {
        chartItemStates,
        setBandwidth,
        scaleData,
        selectedDate,
        showLatest,
        denomInBase,
        data,
        period,
        lastCandleData,
    } = props;
    const d3CanvasCandle = useRef<HTMLInputElement | null>(null);
    const [firstCandle, setFirstCandle] = useState<number>();
    const { expandTradeTable } = useContext(TradeTableContext);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [candlestick, setCandlestick] = useState<any>();

    useEffect(() => {
        IS_LOCAL_ENV && console.debug('re-rending chart');
        if (expandTradeTable) return;

        if (data && data.length > 0) {
            if (!showLatest && firstCandle && data[0].time !== firstCandle) {
                // setIsCandleAdded(false);
                setFirstCandle(() => {
                    return data[0].time;
                });

                const domainLeft = scaleData?.xScale.domain()[0];
                const domainRight = scaleData?.xScale.domain()[1];

                scaleData?.xScale.domain([
                    domainLeft + period * 1000,
                    domainRight + period * 1000,
                ]);
            } else if (firstCandle === undefined) {
                setFirstCandle(() => {
                    return data[0].time;
                });
            }
        }

        renderCanvasArray([d3CanvasCandle]);
    }, [
        diffHashSig(chartItemStates),
        expandTradeTable,
        lastCandleData,
        firstCandle,
    ]);

    useEffect(() => {
        if (scaleData !== undefined) {
            const canvasCandlestick = d3fc
                .autoBandwidth(d3fc.seriesCanvasCandlestick())
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .decorate((context: any, d: any) => {
                    const close = denomInBase
                        ? d.invPriceCloseExclMEVDecimalCorrected
                        : d.priceCloseExclMEVDecimalCorrected;

                    const open = denomInBase
                        ? d.invPriceOpenExclMEVDecimalCorrected
                        : d.priceOpenExclMEVDecimalCorrected;

                    context.fillStyle =
                        selectedDate !== undefined &&
                        selectedDate === d.time * 1000
                            ? '#E480FF'
                            : close > open
                            ? '#CDC1FF'
                            : '#24243e';

                    context.strokeStyle =
                        selectedDate !== undefined &&
                        selectedDate === d.time * 1000
                            ? '#E480FF'
                            : close > open
                            ? '#CDC1FF'
                            : '#7371FC';

                    context.cursorStyle = 'pointer';
                })
                .xScale(scaleData?.xScale)
                .yScale(scaleData?.yScale)
                .crossValue((d: CandleData) => d.time * 1000)
                .highValue((d: CandleData) =>
                    denomInBase
                        ? d.invMinPriceExclMEVDecimalCorrected
                        : d.maxPriceExclMEVDecimalCorrected,
                )
                .lowValue((d: CandleData) =>
                    denomInBase
                        ? d.invMaxPriceExclMEVDecimalCorrected
                        : d.minPriceExclMEVDecimalCorrected,
                )
                .openValue((d: CandleData) =>
                    denomInBase
                        ? d.invPriceOpenExclMEVDecimalCorrected
                        : d.priceOpenExclMEVDecimalCorrected,
                )
                .closeValue((d: CandleData) =>
                    denomInBase
                        ? d.invPriceCloseExclMEVDecimalCorrected
                        : d.priceCloseExclMEVDecimalCorrected,
                );

            setCandlestick(() => canvasCandlestick);
            renderCanvasArray([d3CanvasCandle]);
        }
    }, [diffHashSig(scaleData), selectedDate]);

    useEffect(() => {
        const canvas = d3
            .select(d3CanvasCandle.current)
            .select('canvas')
            .node() as HTMLCanvasElement;
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

        if (candlestick) {
            d3.select(d3CanvasCandle.current)
                .on('draw', () => {
                    setCanvasResolution(canvas);
                    if (data !== undefined) {
                        candlestick(data);
                    }
                })
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .on('measure', (event: any) => {
                    scaleData?.xScale.range([0, event.detail.width]);
                    scaleData?.yScale.range([event.detail.height, 0]);
                    candlestick.context(ctx);
                });
        }
    }, [data, candlestick]);

    useEffect(() => {
        if (candlestick) {
            setBandwidth(candlestick?.bandwidth());
        }
    }, [candlestick?.bandwidth()]);

    return (
        <d3fc-canvas
            ref={d3CanvasCandle}
            className='candle-canvas'
        ></d3fc-canvas>
    );
}
