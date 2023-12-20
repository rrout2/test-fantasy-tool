import {useEffect, useState} from 'react';

export function useScreenWidth() {
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);

    useEffect(() => {
        const updateDimension = () => {
            setScreenWidth(window.innerWidth);
        };
        window.addEventListener('resize', updateDimension);

        return () => {
            window.removeEventListener('resize', updateDimension);
        };
    }, []);
    return screenWidth;
}
