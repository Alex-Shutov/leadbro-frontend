import React, {useEffect, useRef} from 'react';
import { useDrag } from 'react-dnd';
import {businessTypeStyles} from "../../../calendar.types";

const withBusinessItem = (WrappedComponent, dragType = 'business') => {
    return React.forwardRef(function BusinessItemWithDrag({
                                                              business,
                                                              showTime = false,
                                                              customDragProps = {},
                                                              ...props
                                                          }, externalRef) {
        // Создаем локальный ref для drag-n-drop
        const dragRef = useRef(null);

        const [{ isDragging }, drag] = useDrag(() => ({
            type: dragType,
            item: () => {
                props?.onDrag && props?.onDrag(props.dayIndex)
                return {
                    id: business.id,
                    type: business.type,
                    startDate: business.startDate,
                    endDate: business.endDate,
                    ...customDragProps
                };
            },
            end: () => {


                if (props.onDragEnd) {
                    props.onDragEnd();
                }
            },
            hover:()=>{
                console.log('hover')


            },
            collect: (monitor) => {
                console.log('monitor', monitor);
                return {
                    isDragging: !!monitor.isDragging()
                }}
        }))

        // Объединяем refs
        useEffect(() => {
            if (dragRef.current) {
                drag(dragRef.current);
                if (typeof externalRef === 'function') {
                    externalRef(dragRef.current);
                } else if (externalRef) {
                    externalRef.current = dragRef.current;
                }
            }
        }, [drag, externalRef]);

        return (
            <WrappedComponent
                ref={dragRef}
                business={business}
                isDragging={isDragging}
                showTime={showTime}
                businessTypeStyles={businessTypeStyles}
                {...props}
            />
        );
    });
};

export default withBusinessItem;