import { MouseEvent, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import {
    drawDataHistory,
    scaleData,
    selectedDrawnData,
} from '../../ChartUtils/chartUtils';

interface DragCanvasProps {
    scaleData: scaleData;
    selectedDrawnShape: selectedDrawnData | undefined;
    drawnShapeHistory: drawDataHistory[];
    canUserDragDrawnShape: boolean;
    setIsUpdatingShape: React.Dispatch<React.SetStateAction<boolean>>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setCrossHairDataFunc: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    render: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mousemove: any;
}

export default function DragCanvas(props: DragCanvasProps) {
    const d3DragCanvas = useRef<HTMLDivElement | null>(null);

    const {
        selectedDrawnShape,
        drawnShapeHistory,
        render,
        setIsUpdatingShape,
        mousemove,
        scaleData,
        canUserDragDrawnShape,
        setCrossHairDataFunc,
    } = props;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dragLine = (movemementX: number, movemementY: number) => {
        if (selectedDrawnShape) {
            const index = drawnShapeHistory.findIndex(
                (item) => item === selectedDrawnShape?.data,
            );

            const lastData = [
                {
                    x: scaleData.xScale.invert(
                        scaleData.xScale(selectedDrawnShape?.data?.data[0].x) +
                            movemementX,
                    ),
                    y: scaleData.yScale.invert(
                        scaleData.yScale(selectedDrawnShape.data?.data[0].y) +
                            movemementY,
                    ),
                    ctx: selectedDrawnShape.data?.data[0].ctx,
                },
                {
                    x: scaleData.xScale.invert(
                        scaleData.xScale(selectedDrawnShape.data.data[1].x) +
                            movemementX,
                    ),
                    y: scaleData.yScale.invert(
                        scaleData.yScale(selectedDrawnShape.data.data[1].y) +
                            movemementY,
                    ),
                    ctx: selectedDrawnShape.data?.data[1].ctx,
                },
            ];
            drawnShapeHistory[index].data = lastData;
            selectedDrawnShape.data.data = lastData;

            render();
        }
    };

    function updateDrawLine(offsetX: number, offsetY: number) {
        const index = drawnShapeHistory.findIndex(
            (item) => item === selectedDrawnShape?.data,
        );

        const previosData = drawnShapeHistory[index].data;

        const lastDataIndex = previosData.findIndex(
            (item) => item === selectedDrawnShape?.selectedCircle,
        );
        previosData[lastDataIndex].x = scaleData.xScale.invert(offsetX);
        previosData[lastDataIndex].y = scaleData.yScale.invert(offsetY);
        drawnShapeHistory[index].data = previosData;
    }

    function updateDrawRect(
        offsetX: number,
        offsetY: number,
        rectDragDirection: string,
    ) {
        const index = drawnShapeHistory.findIndex(
            (item) => item === selectedDrawnShape?.data,
        );

        const previosData = drawnShapeHistory[index].data;

        const newX = scaleData.xScale.invert(offsetX);
        const newY = scaleData.yScale.invert(offsetY);

        previosData[0].x = rectDragDirection.includes('Left')
            ? newX
            : previosData[0].x;
        previosData[0].y = rectDragDirection.includes('top')
            ? newY
            : previosData[0].y;

        previosData[1].x = rectDragDirection.includes('Right')
            ? newX
            : previosData[1].x;
        previosData[1].y = rectDragDirection.includes('bottom')
            ? newY
            : previosData[1].y;

        drawnShapeHistory[index].data = previosData;
        if (selectedDrawnShape) {
            selectedDrawnShape.selectedCircle = {
                x: newX,
                y: newY,
                ctx: undefined,
            };
        }
    }

    // mousemove
    useEffect(() => {
        d3.select(d3DragCanvas.current).on(
            'mousemove',
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            function (event: MouseEvent<HTMLDivElement>) {
                mousemove(event);
            },
        );
    }, []);

    useEffect(() => {
        d3.select(d3DragCanvas.current).style(
            'cursor',
            canUserDragDrawnShape ? 'pointer' : 'default',
        );
    }, [canUserDragDrawnShape]);

    useEffect(() => {
        const canvas = d3
            .select(d3DragCanvas.current)
            .select('canvas')
            .node() as HTMLCanvasElement;
        const canvasRect = canvas.getBoundingClientRect();
        let offsetY = 0;
        let offsetX = 0;
        let movemementX = 0;
        let movemementY = 0;

        let tempMovemementX = 0;
        let tempMovemementY = 0;
        let rectDragDirection = '';

        const dragDrawnShape = d3
            .drag<d3.DraggedElementBaseType, unknown, d3.SubjectPosition>()
            .on('start', (event) => {
                if (event.sourceEvent instanceof TouchEvent) {
                    tempMovemementY =
                        event.sourceEvent.touches[0].clientY - canvasRect?.top;
                    tempMovemementX =
                        event.sourceEvent.touches[0].clientX - canvasRect?.left;
                }
                if (
                    selectedDrawnShape &&
                    selectedDrawnShape.data.type === 'Square'
                ) {
                    const index = drawnShapeHistory.findIndex(
                        (item) => item === selectedDrawnShape?.data,
                    );

                    const previosData = drawnShapeHistory[index].data;

                    const selectedCircle = selectedDrawnShape.selectedCircle;

                    if (selectedCircle) {
                        const direction =
                            previosData[0].y <= selectedCircle.y
                                ? 'top'
                                : 'bottom';

                        rectDragDirection =
                            previosData[0].x >= selectedCircle.x
                                ? direction + 'Left'
                                : direction + 'Right';
                    }
                }
            })
            .on('drag', function (event) {
                (async () => {
                    if (event.sourceEvent instanceof TouchEvent) {
                        offsetY =
                            event.sourceEvent.touches[0].clientY -
                            canvasRect?.top;
                        offsetX =
                            event.sourceEvent.touches[0].clientX -
                            canvasRect?.left;
                        movemementX = offsetX - tempMovemementX;
                        movemementY = offsetY - tempMovemementY;
                    } else {
                        offsetY = event.sourceEvent.clientY - canvasRect?.top;
                        offsetX = event.sourceEvent.clientX - canvasRect?.left;

                        movemementX = event.sourceEvent.movementX;
                        movemementY = event.sourceEvent.movementY;
                    }
                    setCrossHairDataFunc(offsetX, offsetY);
                    if (
                        selectedDrawnShape &&
                        selectedDrawnShape.data.type === 'Brush'
                    ) {
                        if (!selectedDrawnShape.selectedCircle) {
                            dragLine(movemementX, movemementY);
                        } else {
                            setIsUpdatingShape(true);
                            updateDrawLine(offsetX, offsetY);
                        }
                    }

                    if (
                        selectedDrawnShape &&
                        selectedDrawnShape.data.type === 'Square'
                    ) {
                        if (!selectedDrawnShape.selectedCircle) {
                            dragLine(movemementX, movemementY);
                        } else {
                            setIsUpdatingShape(true);
                            updateDrawRect(offsetX, offsetY, rectDragDirection);
                        }
                    }
                })().then(() => {
                    if (event.sourceEvent instanceof TouchEvent) {
                        tempMovemementX =
                            event.sourceEvent.touches[0].clientX -
                            canvasRect?.left;
                        tempMovemementY =
                            event.sourceEvent.touches[0].clientY -
                            canvasRect?.top;
                    }
                });
            })
            .on('end', () => {
                tempMovemementX = 0;
                tempMovemementY = 0;
                setIsUpdatingShape(false);
            });

        if (d3DragCanvas.current) {
            d3.select<d3.DraggedElementBaseType, unknown>(
                d3DragCanvas.current,
            ).call(dragDrawnShape);
        }
    }, [selectedDrawnShape]);

    return <d3fc-canvas ref={d3DragCanvas} />;
}
