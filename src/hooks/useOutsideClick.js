import { useEffect } from 'react';

// Custom hook to detect clicks outside a specified element
const useOutsideClick = (ref, handler) => {
    useEffect(() => {
        // Listener function to handle click events
        const listener = (event) => {
            const confirmModal = document.getElementById('confirmModal');
            // If the ref is not set or the click is inside the element, do nothing
            if (!ref.current || ref.current.contains(event.target) || (confirmModal && confirmModal.contains(event.target))) {
                return;
            }
            // Call the handler if the click is outside the element
            handler();
        };

        // Add event listener for 'mousedown' events
        document.addEventListener('mousedown', listener);

        // Cleanup function to remove the event listener
        return () => {
            document.removeEventListener('mousedown', listener);
        };
    }, [ref, handler]); // Dependency array ensures effect runs when `ref` or `handler` changes
};

export default useOutsideClick;
