import * as React from 'react'
import { BrowserRouter, useSearchParams } from "react-router-dom";

export const DateContext = React.createContext();

export default DateProvider = ({children}) => {
    return (
        <DateContext value={1}>
            {children}
        </DateContext>
    )
};

