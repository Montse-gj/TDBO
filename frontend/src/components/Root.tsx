import NavBar from "./NavBar";
import { Outlet } from "react-router";

const Root = () => {
    return (
        <div className="app">
            <NavBar />

            <main className="app-main">
                <Outlet />
            </main>
        </div>
    );
}

export default Root;
