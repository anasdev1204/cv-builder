import { health } from "./api/health";
import { useApiRequest } from "./hooks/useAPI";

function App() {
    const {
        data,
        loading,
        error,
        execute: checkHealth,
    } = useApiRequest(health);


    return (
        <div>
            <h1>Health Check</h1>
            {loading && <p>Loading...</p>}
            {error && <p>Error: {error}</p>}
            <p>{data?.status}</p>

            <button onClick={checkHealth}>Check Health</button>
        </div>
    )
}

export default App;