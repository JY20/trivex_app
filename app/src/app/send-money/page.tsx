"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import CombinedRecipientSelector from "@/components/CombinedRecipientSelector";
import Image from 'next/image';
import { convert } from '@/lib/currency-conversion';
import { User } from '@/types/user';
import { convertXLMToCurrency, getExchangeRates, convertCurrencyToXLM } from '@/lib/currency-converter';

export default function SendMoneyPage() {
  const { user, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState("1000");
  const [toAmount, setToAmount] = useState("");
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const lastEdited = useRef<'from' | 'to'>('from');
  const [balance, setBalance] = useState('');
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [feePercentage] = useState(1); // 1% fee

  const handleCombinedRecipientSelect = (recipient: any) => {
    setSelectedRecipient(recipient);
  };

  // Fetch balance function for use in multiple places
  const fetchBalance = async () => {
    setBalanceLoading(true);
    if (user && user.stellarPublicKey) {
      const res = await fetch(`/api/account/balance?publicKey=${user.stellarPublicKey}`);
      const data = await res.json();
      const xlmObj = data.balances?.find((b: any) => b.asset_type === 'native');
      if (xlmObj) {
        const xlm = parseFloat(xlmObj.balance);
        const preferredCurrency = (user as any).preferredCurrency || 'CAD';
        try {
          await getExchangeRates();
          const convertedValue = convertXLMToCurrency(xlm, preferredCurrency);
          setBalance(convertedValue);
        } catch (err) {
          setBalance('N/A');
        }
      } else {
        setBalance('N/A');
      }
    }
    setBalanceLoading(false);
  };

  useEffect(() => {
    fetchBalance();
  }, [user]);

  useEffect(() => {
    if (lastEdited.current === 'from' && paymentAmount) {
      // Calculate beneficiary amount by subtracting the fee
      const amount = parseFloat(paymentAmount);
      if (!isNaN(amount)) {
        const fee = amount * (feePercentage / 100);
        const beneficiaryAmount = amount - fee;
        setToAmount(beneficiaryAmount.toFixed(2));
      } else {
        setToAmount("");
      }
    }
  }, [paymentAmount, feePercentage]);

  useEffect(() => {
    if (lastEdited.current === 'to' && toAmount) {
      // If user edits the "to" amount, calculate what they need to send including the fee
      const amount = parseFloat(toAmount);
      if (!isNaN(amount)) {
        // Formula: senderAmount = recipientAmount / (1 - fee%)
        const senderAmount = amount / (1 - feePercentage / 100);
        setPaymentAmount(senderAmount.toFixed(2));
      } else {
        setPaymentAmount("");
      }
    }
  }, [toAmount, feePercentage]);

  const sendMoney = async () => {
    if (!user || !selectedRecipient) return;
    setIsSubmitting(true);
    setPaymentResult(null);
    try {
      const preferredCurrency = user.preferredCurrency || 'CAD';
      const amountInXLM = Number ((convertCurrencyToXLM(parseFloat(paymentAmount), preferredCurrency)).toFixed(7));
      const amountValue = parseFloat(paymentAmount);

      const res = await fetch("/api/payment/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destinationPublicKey: selectedRecipient.publicKey,
          amount: amountInXLM.toString(),
          amountInFiat: amountValue.toString(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPaymentResult(data);
        // Refresh balance after successful payment
        fetchBalance();
      } else {
        setPaymentResult({ error: data.error || 'Failed to send money' });
      }
    } catch (error) {
      console.error("API call failed:", error);
      setPaymentResult({ error: "An error occurred. Please try again later." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !user) {
    return <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <main className="flex-grow lg:ml-0 transition-all duration-300">
        {/* Mobile header */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Image src="/kavodax-round-logo-white.png" alt="Kavodax Logo" width={40} height={40} />
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>

        {/* Navy Header Section */}
        <div className="p-6 lg:p-10 bg-navy text-white">
          <h1 className="text-2xl lg:text-3xl font-bold">Send Money</h1>
          <p className="text-sm lg:text-base text-gray-300 mt-1">Transfer funds to another user or recipient instantly</p>
        </div>

        <div className="p-6 lg:p-10">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-md p-6 lg:p-8">
              <h2 className="text-xl lg:text-2xl font-bold text-navy mb-6">Send Money</h2>
              {/* Balance Display */}
              <div className="bg-navy text-white p-6 rounded-xl mb-6">
                <p className="text-sm text-gray-300 mb-2">Current Wallet Balance</p>
                {balanceLoading ? (
                  <div className="h-10 w-48 bg-white/30 rounded animate-pulse mt-2" />
                ) : (
                  <div className="text-3xl lg:text-4xl font-bold">
                    {balance || '0'} {user && (user as any).preferredCurrency ? (user as any).preferredCurrency : 'CAD'}
                  </div>
                )}
              </div>
              {/* Recipient Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-2">Recipient</label>
                <CombinedRecipientSelector
                  onRecipientSelect={handleCombinedRecipientSelect}
                  placeholder="Search users or select saved recipient..."
                  className="mb-4"
                />
              </div>

              {/* Selected Recipient Display */}
              {selectedRecipient && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-blue-600 mr-2">👤</span>
                    <span className="font-medium text-blue-900 text-sm lg:text-base">Sending to: {selectedRecipient.name}</span>
                  </div>
                </div>
              )}

              {/* Amount Fields */}
              <div className="space-y-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">You send</label>
                  <div className="flex w-full">
                    <input
                      type="number"
                      placeholder="Amount"
                      value={paymentAmount}
                      onChange={(e) => {
                        lastEdited.current = 'from';
                        setPaymentAmount(e.target.value);
                      }}
                      className="w-full rounded-r-none p-3 lg:p-4 bg-gray-50 border border-gray-300 border-r-0 rounded-l-lg focus:ring-2 focus:ring-orange-main focus:border-orange-main text-sm lg:text-base"
                    />
                    <div className="flex items-center px-4 py-3 bg-gray-200 border border-l-0 border-gray-300 rounded-r-lg">
                      <span className="text-gray-800 font-medium text-sm lg:text-base">
                        {user.preferredCurrency || 'CAD'}
                      </span>
                    </div>
                  </div>
                </div>
                {/* To Amount */}
                {selectedRecipient && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Your beneficiary receives <span className="text-xs text-gray-500">(after 1% fee)</span>
                    </label>
                    <div className="flex w-full">
                      <input
                        type="number"
                        value={toAmount}
                        onChange={(e) => {
                          lastEdited.current = 'to';
                          setToAmount(e.target.value);
                        }}
                        className="w-full rounded-r-none p-3 lg:p-4 bg-gray-50 border border-gray-300 border-r-0 rounded-l-lg focus:ring-2 focus:ring-orange-main focus:border-orange-main text-sm lg:text-base"
                      />
                      <div className="flex items-center px-4 py-3 bg-gray-200 border border-l-0 border-gray-300 rounded-r-lg">
                        <span className="text-gray-800 font-medium text-sm lg:text-base">
                          {user.preferredCurrency || 'CAD'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-center">
                <button
                  onClick={sendMoney}
                  disabled={!selectedRecipient || !paymentAmount || isSubmitting}
                  className="w-full font-bold text-white bg-orange-main rounded-lg hover:bg-orange-hover transition-colors duration-300 py-3 lg:py-4 text-sm lg:text-base disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Send Money
                </button>
              </div>

              {/* Loading/Processing State */}
              {isSubmitting && (
                <div className="mt-6 flex flex-col items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-main mb-2"></div>
                  <p className="text-orange-main font-medium text-base">Processing...</p>
                </div>
              )}

              {/* Result State */}
              {!isSubmitting && paymentResult && (
                <div className="mt-6 p-4 lg:p-6 bg-green-50 border border-green-200 rounded-xl">
                  {paymentResult.error ? (
                    <p className="text-red-600">{paymentResult.error}</p>
                  ) : (
                    <div className="space-y-3 text-sm lg:text-base text-green-700">
                      <h3 className="text-lg lg:text-xl font-bold text-green-800 mb-4">Payment Successful!</h3>
                      <div className="space-y-1">
                        <p><span className="font-medium">Transaction ID:</span></p>
                        <div className="bg-white p-3 rounded-lg border border-green-200">
                          <a 
                            href={`/history?tx=${paymentResult.transactionId}`}
                            className="text-blue-600 hover:underline font-mono text-xs lg:text-sm break-all"
                          >
                            {paymentResult.transactionId}
                          </a>
                          <p className="text-gray-600 text-xs mt-1">
                            View transaction details to see the complete transfer flow (on-ramp, transfer, off-ramp)
                          </p>
                        </div>
                      </div>
                      <p><span className="font-medium">Amount Sent:</span> {paymentAmount} {user.preferredCurrency || 'CAD'}</p>
                      <p><span className="font-medium">Fee (1%):</span> {(parseFloat(paymentAmount) * 0.01).toFixed(2)} {user.preferredCurrency || 'CAD'}</p>
                      <p><span className="font-medium">Recipient:</span> {selectedRecipient?.name || 'Unknown'}</p>
                      {toAmount && (
                        <p><span className="font-medium">Recipient Receives:</span> {toAmount} {user.preferredCurrency || 'CAD'}</p>
                      )}
                      {paymentResult.stellarTransactionHash && (
                        <p>
                          <span className="font-medium">Stellar Hash:</span>{" "}
                          <a
                            href={`https://stellar.expert/explorer/testnet/tx/${paymentResult.stellarTransactionHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-xs lg:text-sm break-all text-blue-600 hover:underline"
                          >
                            {paymentResult.stellarTransactionHash}
                          </a>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 