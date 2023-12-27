import {Dispatch, SetStateAction, useEffect, useState} from 'react';

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

export function useScreenHeight() {
    const [screenHeight, setScreenHeight] = useState(window.innerHeight);

    useEffect(() => {
        const updateDimension = () => {
            setScreenHeight(window.innerHeight);
        };
        window.addEventListener('resize', updateDimension);

        return () => {
            window.removeEventListener('resize', updateDimension);
        };
    }, []);
    return screenHeight;
}

export function useToday(): [Date, Dispatch<SetStateAction<Date>>] {
    const [today, setToday] = useState<Date>(new Date());
    useEffect(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        setToday(d);
    }, []);
    return [today, setToday];
}
export const MOBILE_BREAKPOINT = 700;
export function useIsSmallScreen() {
    const screenWidth = useScreenWidth();
    const [isSmallScreen, setIsSmallScreen] = useState(
        screenWidth <= MOBILE_BREAKPOINT
    );
    useEffect(() => {
        setIsSmallScreen(screenWidth <= MOBILE_BREAKPOINT);
    }, [screenWidth]);
    return isSmallScreen;
}
