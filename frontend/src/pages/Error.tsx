import { useRouteError, isRouteErrorResponse } from "react-router";

const Error = () => {
    const error = useRouteError() as { status?: number; data?: string; message?: string };

    if (isRouteErrorResponse(error)) {
        return (
            <>
                <h1>ErrorPage</h1>
                <p>{error.data}</p>
            </>
        );
    }

    const err = error as { message?: string };

    return (
        <>
            <h1>ErrorPage</h1>
            <p>{err.message ?? "Error desconocido"}</p>
        </>
    );
};

export default Error;