/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { CreateServerModal } from "@/components/modals/create-server-modal";
import { InviteModal } from "../modals/invite-modal";

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Return an empty fragment instead of 'null' to prevent layout shift
  if (!isMounted) {
    return <></>; 
  }

  return (
    <>
      <CreateServerModal />
      <InviteModal />
    </>
  );
};