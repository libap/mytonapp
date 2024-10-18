'use client'

import { useState, useEffect, useCallback } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { Address } from "@ton/core";

interface Token {
  display_name: string;
  balance: string;
  decimals: number;
  image_url: string;
  contract_address?: string; // Changé de 'address' à 'contract_address' et rendu optionnel
}

export default function Home() {
  const [tonConnectUI] = useTonConnectUI();
  const [tonWalletAddress, setTonWalletAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tokens, setTokens] = useState<Token[]>([]);

  const handleWalletConnection = useCallback((address: string) => {
    setTonWalletAddress(address);
    console.log("Wallet connected successfully!");
    setIsLoading(false);
  }, []);

  const handleWalletDisconnection = useCallback(() => {
    setTonWalletAddress(null);
    console.log("Wallet disconnected successfully!");
    setIsLoading(false);
    setTokens([]);
  }, []);

  useEffect(() => {
    const checkWalletConnection = async () => {
      if (tonConnectUI.account?.address) {
        handleWalletConnection(tonConnectUI.account?.address);
      } else {
        handleWalletDisconnection();
      }
    };

    checkWalletConnection();

    const unsubscribe = tonConnectUI.onStatusChange((wallet) => {
      if (wallet) {
        handleWalletConnection(wallet.account.address);
      } else {
        handleWalletDisconnection();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [tonConnectUI, handleWalletConnection, handleWalletDisconnection]);

  useEffect(() => {
    if (tonWalletAddress) {
      fetchTokens(tonWalletAddress);
    }
  }, [tonWalletAddress]);

  const handleWalletAction = async () => {
    if (tonConnectUI.connected) {
      setIsLoading(true);
      await tonConnectUI.disconnect();
    } else {
      await tonConnectUI.openModal();
    }
  };

  const formatAddress = (address: string | undefined) => {
    if (!address) return 'Adresse inconnue';
    try {
      const tempAddress = Address.parse(address).toString();
      return `${tempAddress.slice(0, 4)}...${tempAddress.slice(-4)}`;
    } catch (error) {
      console.error('Erreur lors du formatage de l\'adresse:', error);
      return 'Adresse invalide';
    }
  };

  const fetchTokens = async (walletAddress: string) => {
    try {
      const res = await fetch('https://rpc.ston.fi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'asset.balance_list',
          params: {
            optimize_load: true,
            load_community: false,
            wallet_address: walletAddress
          }
        })
      });

      const data = await res.json();
      console.log('Données reçues de l\'API:', data); // Ajout d'un log pour déboguer

      const assetsList = data.result.assets;
      const assets = assetsList.filter(
        (item: Token) => item.balance && BigInt(item.balance) > 0
      );
      console.log('Assets filtrés:', assets); // Ajout d'un log pour déboguer
      setTokens(assets);
    } catch (error) {
      console.error('Erreur lors de la récupération des assets:', error);
      setTokens([]);
    }
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <div className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded">
          Loading...
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8">TON Connect Demo</h1>
      {tonWalletAddress ? (
        <div className="flex flex-col items-center">
          <p className="mb-4">Connected: {formatAddress(tonWalletAddress)}</p>
          <button
            onClick={handleWalletAction}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mb-4"
          >
            Disconnect Wallet
          </button>
          <table className="w-full max-w-md border-collapse">
            <thead>
              <tr>
                <th className="border p-2">Image</th>
                <th className="border p-2">Token</th>
                <th className="border p-2">Balance</th>
              </tr>
            </thead>
            <tbody>
              {tokens.map((token, index) => (
                <tr key={index}>
                  <td className="border p-2">
                    <img src={token.image_url} alt={token.display_name} className="w-10 h-10 mx-auto" />
                  </td>
                  <td className="border p-2">
                    {token.display_name}
                    <br />
                    <span className="text-xs text-gray-500">
                      {token.contract_address ? formatAddress(token.contract_address) : 'Adresse non disponible'}
                    </span>
                  </td>
                  <td className="border p-2">{(parseFloat(token.balance) / Math.pow(10, token.decimals)).toFixed(6)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <button
          onClick={handleWalletAction}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Connect TON Wallet
        </button>
      )}
    </main>
  );
}
