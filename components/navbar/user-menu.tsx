"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { AiOutlineMenu } from "react-icons/ai";

import { SafeUser } from "@/types";

import useRegisterModal from "@/hooks/use-register-modal";
import useLoginModal from "@/hooks/use-login-modal";
import useRentModal from "@/hooks/use-rent-modal";

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
  const toggleOpen = React.useCallback(() => setIsOpen((value) => !value), []);

  const isGuide = currentUser?.role === "GUIDE";
  const isTourist = !currentUser || currentUser.role === "TOURIST";
  const isAdmin = currentUser?.email === "suruihan07@gmail.com";

  const onRent = React.useCallback(() => {
    if (!currentUser) {
      return loginModal.onOpen();
    }
    rentModal.onOpen();
  }, [currentUser, loginModal, rentModal]);

  return (
    <div className="relative">
      <div className="flex items-center gap-3">
        {/* Top navbar button: tourist sees "Add a property", guide sees "发布体验" */}
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

      {isOpen && (
        <div className="absolute right-0 top-12 overflow-hidden w-[40vw] md:w-3/4 bg-white rounded-xl shadow-md text-sm">
          <div className="flex flex-col cursor-pointer">
            {currentUser ? (
              <React.Fragment>
                {/* User info header */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {currentUser.name}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {currentUser.email}
                  </p>
                  <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                    {isGuide ? "导游" : "Tourist"}
                  </span>
                </div>

                {/* ── TOURIST menu items ── */}
                {isTourist && (
                  <>
                    <MenuItem
                      label="My trips"
                      onClick={() => { router.push("/trips"); setIsOpen(false); }}
                    />
                    <MenuItem
                      label="My favorites"
                      onClick={() => { router.push("/favorites"); setIsOpen(false); }}
                    />
                    <MenuItem
                      label="My properties"
                      onClick={() => { router.push("/properties"); setIsOpen(false); }}
                    />
                    <MenuItem
                      label="Add a property"
                      onClick={() => { rentModal.onOpen(); setIsOpen(false); }}
                    />
                  </>
                )}

                {/* ── GUIDE menu items (Chinese) ── */}
                {isGuide && (
                  <>
                    <MenuItem
                      label="我的工单"
                      onClick={() => { router.push("/guide"); setIsOpen(false); }}
                    />
                    <MenuItem
                      label="客人预订"
                      onClick={() => { router.push("/reservations"); setIsOpen(false); }}
                    />
                    <MenuItem
                      label="我的体验"
                      onClick={() => { router.push("/properties"); setIsOpen(false); }}
                    />
                    <MenuItem
                      label="发布体验"
                      onClick={() => { rentModal.onOpen(); setIsOpen(false); }}
                    />
                  </>
                )}

                {/* ── ADMIN Dashboard ── */}
                {isAdmin && (
                  <>
                    <hr />
                    <MenuItem
                      label="Admin Dashboard"
                      onClick={() => { router.push("/admin"); setIsOpen(false); }}
                    />
                  </>
                )}

                <hr />
                <MenuItem label={isGuide ? "退出登录" : "Logout"} onClick={() => signOut()} />
              </React.Fragment>
            ) : (
              <React.Fragment>
                <MenuItem label="Login" onClick={loginModal.onOpen} />
                <MenuItem label="Sign Up" onClick={registerModal.onOpen} />
              </React.Fragment>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
