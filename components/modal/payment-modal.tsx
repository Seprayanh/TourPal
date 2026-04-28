"use client";

import * as React from "react";
import { IoMdClose } from "react-icons/io";
import { MdToken, MdTimer, MdCheckCircle } from "react-icons/md";

import Button from "@/components/button";

interface ReceiptData {
  amount: number;
  paidAt: string;
  newBalance: number;
  listingTitle?: string;
}

interface PaymentModalProps {
  isOpen: boolean;
  totalPrice: number;
  tokenBalance: number;
  holdExpiresAt: string | null;
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  receipt?: ReceiptData | null;
}

function useCountdown(expiresAt: string | null) {
  const [secondsLeft, setSecondsLeft] = React.useState<number>(0);

  React.useEffect(() => {
    if (!expiresAt) return;
    const calc = () => {
      const diff = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
      setSecondsLeft(diff);
      return diff;
    };
    calc();
    const id = setInterval(() => { if (calc() === 0) clearInterval(id); }, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  return { secondsLeft, display: `${mm}:${ss}` };
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen, totalPrice, tokenBalance, holdExpiresAt,
  isLoading, onConfirm, onCancel, receipt,
}) => {
  const { secondsLeft, display } = useCountdown(isOpen && !receipt ? holdExpiresAt : null);
  const expired = secondsLeft === 0 && isOpen && !receipt;
  const insufficient = tokenBalance < totalPrice;
  const canPay = !expired && !insufficient && !isLoading;
  const urgentColor = secondsLeft > 0 && secondsLeft <= 60 ? "text-red-500" : "text-amber-600";

  if (!isOpen) return null;

  if (receipt) {
    const paidAt = new Date(receipt.paidAt).toLocaleString("zh-CN", {
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit",
    });
    return (
      <div className="flex items-center justify-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none bg-neutral-800/70">
        <div className="relative w-full md:w-4/6 lg:w-3/6 xl:w-2/5 my-6 mx-auto">
          <div className="relative flex flex-col border-0 rounded-lg shadow-lg w-full bg-white outline-none focus:outline-none">
            <div className="flex items-center justify-center relative p-6 rounded-t border-b-[1px]">
              <div className="text-lg font-semibold">Payment Receipt</div>
              <button onClick={onCancel} className="absolute right-9 p-1 border-0 transition hover:opacity-70">
                <IoMdClose size={18} />
              </button>
            </div>
            <div className="relative flex-auto p-6 space-y-5">
              <div className="flex flex-col items-center gap-2 py-2">
                <MdCheckCircle size={48} className="text-green-500" />
                <p className="text-lg font-semibold text-neutral-800">Payment Successful</p>
                {receipt.listingTitle && (
                  <p className="text-sm text-neutral-500 text-center">{receipt.listingTitle}</p>
                )}
              </div>
              <div className="space-y-2 bg-neutral-50 rounded-lg p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Amount Paid</span>
                  <span className="font-semibold text-neutral-800">{receipt.amount.toLocaleString()} T</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Remaining Balance</span>
                  <span className="font-semibold text-green-600">{receipt.newBalance.toLocaleString()} T</span>
                </div>
                <hr className="my-1" />
                <div className="flex justify-between text-xs text-neutral-400">
                  <span>Paid at</span>
                  <span>{paidAt}</span>
                </div>
              </div>
              <p className="text-xs text-neutral-400 text-center">
                Your booking is confirmed. The guide will be notified shortly.
              </p>
            </div>
            <div className="flex flex-col gap-2 p-6 pt-0">
              <Button label="Done" onClick={onCancel} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none bg-neutral-800/70">
      <div className="relative w-full md:w-4/6 lg:w-3/6 xl:w-2/5 my-6 mx-auto">
        <div className="relative flex flex-col border-0 rounded-lg shadow-lg w-full bg-white outline-none focus:outline-none">
          <div className="flex items-center justify-center relative p-6 rounded-t border-b-[1px]">
            <div className="text-lg font-semibold">Confirm Payment</div>
            <button onClick={onCancel} disabled={isLoading} className="absolute right-9 p-1 border-0 transition hover:opacity-70">
              <IoMdClose size={18} />
            </button>
          </div>
          <div className="relative flex-auto p-6 space-y-5">
            <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <MdTimer size={22} className={expired ? "text-red-500" : urgentColor} />
              <div>
                <p className="text-sm font-medium text-neutral-700">Schedule Hold Countdown</p>
                {expired ? (
                  <p className="text-sm text-red-500 font-semibold">Hold expired — please close and choose new dates.</p>
                ) : (
                  <p className={`text-xl font-mono font-bold ${urgentColor}`}>{display}</p>
                )}
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                <div className="flex items-center gap-2 text-neutral-600">
                  <MdToken size={20} />
                  <span className="text-sm">Current Token Balance</span>
                </div>
                <span className="font-semibold text-neutral-800">{tokenBalance.toLocaleString()} T</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                <span className="text-sm text-neutral-600">Amount Due</span>
                <span className="font-semibold text-neutral-800">{totalPrice.toLocaleString()} T</span>
              </div>
              <hr />
              <div className="flex items-center justify-between px-1">
                <span className="text-sm font-medium text-neutral-700">Balance After Payment</span>
                <span className={`font-bold text-lg ${insufficient ? "text-red-500" : "text-green-600"}`}>
                  {(tokenBalance - totalPrice).toLocaleString()} T
                </span>
              </div>
            </div>
            {insufficient && !expired && (
              <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
                <span className="text-red-500 text-sm">
                  Insufficient balance. You have {tokenBalance.toLocaleString()} T but need {totalPrice.toLocaleString()} T.
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <MdCheckCircle size={14} />
              <span>Platform Tokens are virtual currency. 1 Token = $1. No real bank card required.</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 p-6 pt-0">
            <div className="flex items-center gap-4 w-full">
              <Button outline disabled={isLoading} label="Cancel" onClick={onCancel} />
              <Button disabled={!canPay} label={isLoading ? "Processing…" : "Confirm Payment"} onClick={onConfirm} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
