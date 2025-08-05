import React from "react";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import CallsPage from "./Pages/Calls/CallsPage.tsx";

const App: React.FC = () => {
    return (
        <div className="container">
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<CallsPage />} />
                </Routes>
            </BrowserRouter>
        </div>
    );
};

export default App
