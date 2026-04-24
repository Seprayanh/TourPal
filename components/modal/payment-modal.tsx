"use client";

import * as React from "react";
import { IoMdClose } from "react-icons/io";
import { MdToken, MdTimer, MdCheckCircle } from "react-icons/md";

import Button from "@/components/button";

interface PaymentModalProps {
  isOpen: boolean;
  totalPrice: number;
  tokenBalance: number;
  holdExpiresAt: string | null; // ISO string
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
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
    const id = setInterval(() => {
      if (calc() === 0) clearInterval(id);
    }, 1000);

    return () => clearInterval(id);
  }, [expiresAt]);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  return { secondsLeft, display: `${mm}:${ss}` };
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  totalPrice,
  tokenBalance,
  holdExpiresAt,
  isLoading,
  onConfirm,
  onCancel,
}) => {
  const { secondsLeft, display } = useCountdown(isOpen ? holdExpiresAt : null);
  const expired = secondsLeft === 0 && isOpen;
  const insufficient = tokenBalance < totalPrice;
  const canPay = !expired && !insufficient && !isLoading;

  const urgentColor =
    secondsLeft > 0 && secondsLeft <= 60
      ? "text-red-500"
      : "text-amber-600";

  if (!isOpen) return null;

  return (
    <div className="flex items-center justify-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none bg-neutral-800/70">
      <div className="relative w-full md:w-4/6 lg:w-3/6 xl:w-2/5 my-6 mx-auto">
        <div className="relative flex flex-col border-0 rounded-lg shadow-lg w-full bg-white outline-none focus:outline-none">
          {/* Header */}
          <div className="flex items-center justify-center relative p-6 rounded-t border-b-[1px]">
            <div className="text-lg font-semibold">确认支付</div>
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="absolute right-9 p-1 border-0 transition hover:opacity-70"
            >
              <IoMdClose size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="relative flex-auto p-6 space-y-5">
            {/* Hold countdown */}
            <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <MdTimer size={22} className={expired ? "text-red-500" : urgentColor} />
              <div>
                <p className="text-sm font-medium text-neutral-700">档期锁定倒计时</p>
                {expired ? (
                  <p className="text-sm text-red-500 font-semibold">锁定已超时，请关闭后重新选择日期</p>
                ) : (
                  <p className={`text-xl font-mono font-bold ${urgentColor}`}>{display}</p>
                )}
              </div>
            </div>

            {/* Payment info */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                <div className="flex items-center gap-2 text-neutral-600">
                  <MdToken size={20} />
                  <span className="text-sm">当前 Token 余额</span>
                </div>
                <span className="font-semibold text-neutral-800">
                  {tokenBalance.toLocaleString()} T
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                <span className="text-sm text-neutral-600">本次费用</span>
                <span className="font-semibold text-neutral-800">
                  {totalPrice.toLocaleString()} T
                </span>
              </div>

              <hr />

              <div className="flex items-center justify-between px-1">
                <span className="text-sm font-medium text-neutral-700">支付后余额</span>
                <span
                  className={`font-bold text-lg ${
                    insufficient ? "text-red-500" : "text-green-600"
                  }`}
                >
                  {(tokenBalance - totalPrice).toLocaleString()} T
                </span>
              </div>
            </div>

            {insufficient && !expired && (
              <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
                <span className="text-red-500 text-sm">
                  Token 余额不足，当前余额 {tokenBalance} T，需要 {totalPrice} T。
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <MdCheckCircle size={14} />
              <span>平台 Token 为虚拟货币，1 Token = $1，无需绑定真实银行卡</span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col gap-2 p-6 pt-0">
            <div className="flex items-center gap-4 w-full">
              <Button outline disabled={isLoading} label="取消" onClick={onCancel} />
              <Button
                disabled={!canPay}
                label={isLoading ? "支付中…" : "确认支付"}
                onClick={onConfirm}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
