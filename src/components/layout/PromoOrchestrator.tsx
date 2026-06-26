"use client";



import { useEffect, useMemo, useState } from "react";

import { AnimatePresence } from "framer-motion";

import { getPromosByPlacement, type PromoSlot } from "@/config/promos.config";

import { PromoSlotRenderer } from "./PromoSlotRenderer";

import { isFeatureEnabled } from "@/config/features.config";



function shouldSkipSession(key: string | undefined): boolean {

  if (!key) return false;

  if (process.env.NODE_ENV !== "production") return false;

  return sessionStorage.getItem(key) === "1";

}



function markSession(key: string | undefined) {

  if (key && process.env.NODE_ENV === "production") {

    sessionStorage.setItem(key, "1");

  }

}



export function PromoOrchestrator() {

  const [modalSlot, setModalSlot] = useState<PromoSlot | null>(null);

  const dopamineEnabled = isFeatureEnabled("dopamine");



  const modalSlots = useMemo(

    () =>

      getPromosByPlacement("modal").filter(

        (s) => s.id !== "onboarding-claim" && !(dopamineEnabled && s.id === "modal-training")

      ),

    [dopamineEnabled]

  );



  const trainingModal = useMemo(

    () => modalSlots.find((s) => s.id === "modal-training") ?? modalSlots[0],

    [modalSlots]

  );



  useEffect(() => {

    if (!trainingModal) return;

    const key = trainingModal.behavior?.sessionKey;

    if (shouldSkipSession(key)) return;



    const delay = trainingModal.behavior?.delayMs ?? 800;

    const timer = setTimeout(() => {

      markSession(key);

      setModalSlot(trainingModal);

    }, delay);



    return () => clearTimeout(timer);

  }, [trainingModal]);



  const handleCloseModal = () => {

    setModalSlot(null);

  };



  return (

    <AnimatePresence>

      {modalSlot && (

        <PromoSlotRenderer key={modalSlot.id} slot={modalSlot} onClose={handleCloseModal} />

      )}

    </AnimatePresence>

  );

}



export function GlobalTopPromo() {

  const slots = useMemo(() => getPromosByPlacement("global-top"), []);

  if (slots.length === 0) return null;

  return <PromoSlotRenderer slot={slots[0]} />;

}



export function GlobalFooterPromo() {

  const slots = useMemo(() => getPromosByPlacement("global-footer"), []);

  if (slots.length === 0) return null;

  return <PromoSlotRenderer slot={slots[0]} />;

}



export function SidebarPromos() {

  const slots = useMemo(() => getPromosByPlacement("sidebar"), []);

  if (slots.length === 0) return null;

  return (

    <div className="flex flex-col mx-1 sm:mx-2 mt-4 gap-2">

      <span className="text-[10px] font-bold tracking-[0.15em] text-[#45A29E]/70 uppercase px-2 mb-0.5">

        Exclusive Offers

      </span>

      {slots.map((slot) => (

        <PromoSlotRenderer key={slot.id} slot={slot} />

      ))}

    </div>

  );

}

