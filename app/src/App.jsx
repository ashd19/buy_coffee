import { createClient, autoDiscover } from '@solana/client';
import { SolanaProvider, useWalletConnection, useSolTransfer } from '@solana/react-hooks';
import { useState, useEffect, useRef } from 'react';
import './index.css';

// Random receiver address for demonstration
const RECEIVER_ADDRESS = "86xCnPeV69n6t3DnyGvkKobf9FdN2H9oiVDdaMpo2MMY";

// Create Solana client for localnet
const client = createClient({
  endpoint: "http://127.0.0.1:8899",
  walletConnectors: autoDiscover(),
});

function BuyCoffeeApp() {
  const { connectors, connect, disconnect, wallet, status } = useWalletConnection();
  const { send, isSending, status: txStatus, signature, error } = useSolTransfer();
  const [logs, setLogs] = useState([]);

  // Track previous values to detect changes
  const prevSignatureRef = useRef();
  const prevErrorRef = useRef();

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev]);
  };

  const handleConnect = async (connectorId) => {
    try {
      await connect(connectorId);
      addLog(`Connected to wallet`);
    } catch (err) {
      addLog(`Connection failed: ${err.message}`);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    addLog('Disconnected from wallet');
  };

  const buyCoffee = async () => {
    addLog("Initiating transaction...");
    try {
      await send({
        destination: RECEIVER_ADDRESS,
        amount: 1_000_000n // 0.001 SOL in lamports
      });
      addLog("Transaction sent! Waiting for confirmation...");
    } catch (err) {
      console.error("Full transaction error:", err);
      console.error("Error details:", {
        message: err.message,
        transactionPlanResult: err.transactionPlanResult,
        cause: err.cause
      });
      addLog(`Transaction failed: ${err.message}`);

      // Log more specific error details if available
      if (err.transactionPlanResult) {
        addLog(`Plan result: ${JSON.stringify(err.transactionPlanResult)}`);
      }
    }
  };

  // Log transaction status changes using useEffect to prevent infinite re-renders
  useEffect(() => {
    if (signature && signature !== prevSignatureRef.current && txStatus === 'success') {
      addLog(`Transaction confirmed! Signature: ${signature}`);
      prevSignatureRef.current = signature;
    }
  }, [signature, txStatus]);

  useEffect(() => {
    if (error && error !== prevErrorRef.current) {
      console.error("Transaction hook error:", error);
      addLog(`Transaction error: ${error.message}`);

      // Log additional error details if available
      if (error.transactionPlanResult) {
        console.error("Transaction plan result:", error.transactionPlanResult);
      }

      prevErrorRef.current = error;
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-gray-900 to-gray-900 animate-pulse-slow"></div>
      </div>

      <div className="z-10 w-full max-w-md bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-gray-700 p-8 shadow-2xl">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-2 text-center">
          Buy Me a Coffee
        </h1>
        <p className="text-gray-400 text-center mb-8">Support the project with 0.001 SOL</p>

        <div className="flex flex-col gap-4">
          {status !== "connected" ? (
            <div className="flex flex-col gap-3">
              {connectors.map((connector) => (
                <button
                  key={connector.id}
                  onClick={() => handleConnect(connector.id)}
                  className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl font-bold text-lg shadow-lg transform transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Connect {connector.name}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="bg-gray-700/50 rounded-lg p-3 text-sm text-center font-mono text-gray-300 break-all border border-gray-600">
                {wallet?.account.address}
              </div>
              <button
                onClick={buyCoffee}
                disabled={isSending}
                className={`w-full py-4 px-6 rounded-xl font-bold text-lg shadow-lg transform transition-all 
                  ${isSending
                    ? 'bg-gray-600 cursor-not-allowed opacity-70'
                    : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 hover:scale-[1.02] active:scale-[0.98]'
                  }`}
              >
                {isSending ? "Processing..." : "Buy Coffee (0.001 SOL) ☕"}
              </button>
              <button
                onClick={handleDisconnect}
                className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>

        <div className="mt-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Transaction Logs</h2>
          <div className="bg-black/40 rounded-xl p-4 h-48 overflow-y-auto font-mono text-xs border border-gray-800 scrollbar-thin scrollbar-thumb-gray-700">
            {logs.length === 0 ? (
              <span className="text-gray-600 italic">No activity yet. Connect wallet to start.</span>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-2 last:mb-0 border-b border-gray-800/50 pb-2 last:border-0 last:pb-0">
                  <span className="text-purple-400 mr-2">➜</span>
                  <span className="text-gray-300">{log}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <SolanaProvider client={client}>
      <BuyCoffeeApp />
    </SolanaProvider>
  );
}

export default App;
