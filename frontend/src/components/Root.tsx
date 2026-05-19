import AppHeader from "./AppHeader";
import { Outlet } from "react-router";

const Root = () => {
    return (
        <div className="app">
            <header className="app-header">
                <h1 className="app-title">TDBO</h1>
                <AppHeader />
            </header>

            <main className="app-main">
                <Outlet />
            </main>
        </div>
    );
}

export default Root;