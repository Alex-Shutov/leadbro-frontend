import React from 'react';
import { useDrag } from 'react-dnd';
import {businessTypeStyles} from "../../../calendar.types";

const withBusinessItem = (WrappedComponent, dragType = 'business') => {
    return function ({
                                                  business,
                                                  showTime = false,
                                                  customDragProps = {},
                                                  ...props
                                              }) {
        const [{ isDragging }, drag] = useDrag(() => ({
            type: dragType,
            item: {
                id: business.id,
                type: business.type,
                startDate: business.startDate,
                endDate: business.endDate,
                ...customDragProps
            },
            collect: (monitor) => ({
                isDragging: !!monitor.isDragging(),
            }),
        }));

        return (
            <WrappedComponent
                business={business}
                isDragging={isDragging}
                showTime={showTime}
                businessTypeStyles={businessTypeStyles}
                {...props}
                ref={drag}

            />
        );
    };
};

export default withBusinessItem;