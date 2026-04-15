"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { AiOutlineMenu } from "react-icons/ai";
import { IoClose } from "react-icons/io5";

import { SafeUser } from "@/types";

import useRegisterModal from "@/hooks/use-register-modal";
import useLoginModal from "@/hooks/use-login-modal";
import useRentModal from "@/hooks/use-rent-modal";
import { useSavedAccounts, getDisplayRole, SWITCH_EMAIL_KEY } from "@/hooks/use-saved-accounts";

import Avatar from "@/components/avatar";
import MenuItem from "@/components/navbar/menu-item";

interface UserMenuProps {
  currentUser?: SafeUser | null;
}

const UserMenu: React.FC<UserMenuProps> = ({ currentUser }) => {
  const router = useRouter();
  const registerModal = useRegisterModal();
  const loginModal = useLoginModal();
  const rentModal = useRentModal();
  const [isOpen, setIsOpen] = React.useState(false);
  const toggleOpen = React.useCallback(() => setIsOpen((v) => !v), []);

  const isGuide = currentUser?.role === "GUIDE";
  const isTourist = !currentUser || currentUser.role === "TOURIST";
  const isAdmin = currentUser?.email === "suruihan07@gmail.com";

  const { otherAccounts, removeAccount } = useSavedAccounts(currentUser);

  // Switch account without signing out — just open login modal with email pre-filled
  const handleSwitchAccount = React.useCallback((email: string) => {
    try { localStorage.setItem(SWITCH_EMAIL_KEY, email); } catch {}
    setIsOpen(false);
    loginModal.onOpen();
  }, [loginModal]);

  const onRent = React.useCallback(() => {
    if (!currentUser) return loginModal.onOpen();
    rentModal.onOpen();
  }, [currentUser, loginModal, rentModal]);

  // Close drawer on Escape key
  React.useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setIsOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  return (
    <>
      {/* Trigger buttons in navbar */}
      <div className="flex items-center gap-3">
        {(!currentUser || isTourist) && (
          <div
            onClick={onRent}
            className="hidden md:block font-semibold text-sm px-3 py-4 rounded-full hover:bg-neutral-100 transition cursor-pointer"
          >
            Add a property
          </div>
        )}
        {isGuide && (
          <div
            onClick={onRent}
            className="hidden md:block font-semibold text-sm px-3 py-4 rounded-full hover:bg-neutral-100 transition cursor-pointer"
          >
            发布体验
          </div>
        )}
        <div
          onClick={toggleOpen}
          className="flex items-center gap-3 p-4 md:py-1 md:px-2 border-[1px] border-neutral-200 rounded-full hover:shadow-md transition cursor-pointer"
        >
          <AiOutlineMenu size={18} />
          <div className="hidden md:block">
            <Avatar src={currentUser?.image} />
          </div>
        </div>
      </div>

      {/* Dim overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Side drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-80 z-50 bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <span className="font-semibold text-gray-800">Menu</span>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <IoClose size={20} className="text-gray-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col">
          {currentUser ? (
            <>
              {/* Current user info */}
              <div className="px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <Avatar src={currentUser.image} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{currentUser.name}</p>
                    <p className="text-xs text-gray-400 truncate">{currentUser.email}</p>
                  </div>
                </div>
                <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
                  {isAdmin ? "Admin" : isGuide ? "Guide" : "Tourist"}
                </span>
              </div>

              {/* Account switcher */}
              <div className="border-b border-gray-100 py-2">
                {otherAccounts.length > 0 && (
                  <>
                    <p className="px-5 pt-1 pb-1 text-xs text-gray-400 font-medium uppercase tracking-wide">
                      Other accounts
                    </p>
                    {otherAccounts.map((account) => (
                      <div
                        key={account.email}
                        className="flex items-center gap-3 px-5 py-2.5 hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleSwitchAccount(account.email)}
                      >
                        <Avatar src={account.image} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">
                            {account.name ?? account.email}
                          </p>
                          <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
                            {getDisplayRole(account)}
                          </span>
                        </div>
                        <button
                          type="button"
                          aria-label="Remove account"
                          onClick={(e) => { e.stopPropagation(); removeAccount(account.email); }}
                          className="text-gray-300 hover:text-gray-500 text-xl leading-none flex-shrink-0"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </>
                )}
                <div
                  className="flex items-center gap-3 px-5 py-2.5 hover:bg-gray-50 cursor-pointer"
                  onClick={() => { setIsOpen(false); loginModal.onOpen(); }}
                >
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-base font-bold text-gray-500 flex-shrink-0">
                    +
                  </div>
                  <span className="text-sm text-gray-600">Add another account</span>
                </div>
              </div>

              {/* Navigation items */}
              <div className="py-2 flex-1">
                {isTourist && (
                  <>
                    <MenuItem label="My trips" onClick={() => { router.push("/trips"); setIsOpen(false); }} />
                    <MenuItem label="My feedback" onClick={() => { router.push("/feedback"); setIsOpen(false); }} />
                    <MenuItem label="My favorites" onClick={() => { router.push("/favorites"); setIsOpen(false); }} />
                    <MenuItem label="My properties" onClick={() => { router.push("/properties"); setIsOpen(false); }} />
                    <MenuItem label="Add a property" onClick={() => { rentModal.onOpen(); setIsOpen(false); }} />
                  </>
                )}
                {isGuide && (
                  <>
                    <MenuItem label="我的工单" onClick={() => { router.push("/guide"); setIsOpen(false); }} />
                    <MenuItem label="我的评价" onClick={() => { router.push("/guide/reviews"); setIsOpen(false); }} />
                    <MenuItem label="客人预订" onClick={() => { router.push("/reservations"); setIsOpen(false); }} />
                    <MenuItem label="我的体验" onClick={() => { router.push("/properties"); setIsOpen(false); }} />
                    <MenuItem label="发布体验" onClick={() => { rentModal.onOpen(); setIsOpen(false); }} />
                  </>
                )}
                {isAdmin && (
                  <>
                    <hr className="my-1 border-gray-100" />
                    <MenuItem label="Admin Dashboard" onClick={() => { router.push("/admin"); setIsOpen(false); }} />
                  </>
                )}
              </div>

              {/* Logout pinned at bottom */}
              <div className="border-t border-gray-100 py-2 flex-shrink-0">
                <MenuItem
                  label={isGuide ? "退出登录" : "Logout"}
                  onClick={() => signOut()}
                />
              </div>
            </>
          ) : (
            <div className="py-2">
              <MenuItem label="Login" onClick={() => { loginModal.onOpen(); setIsOpen(false); }} />
              <MenuItem label="Sign Up" onClick={() => { registerModal.onOpen(); setIsOpen(false); }} />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UserMenu;
