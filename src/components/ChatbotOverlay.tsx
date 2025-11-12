/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";

const INLINE_LOADER_ID = "chatbase-inline-loader";
const REMOTE_SCRIPT_ID = "wDI8uyXUvlyQNHYuVv3nM";
const CHATBASE_LOADER = `(function(){if(!window.chatbase||window.chatbase("getState")!=="initialized"){window.chatbase=(...arguments)=>{if(!window.chatbase.q){window.chatbase.q=[]}window.chatbase.q.push(arguments)};window.chatbase=new Proxy(window.chatbase,{get(target,prop){if(prop==="q"){return target.q}return(...args)=>target(prop,...args)}})}const onLoad=function(){if(document.getElementById("${REMOTE_SCRIPT_ID}")) return;const script=document.createElement("script");script.src="https://www.chatbase.co/embed.min.js";script.id="${REMOTE_SCRIPT_ID}";script.domain="www.chatbase.co";document.body.appendChild(script)};if(document.readyState==="complete"){onLoad()}else{window.addEventListener("load",onLoad)}})();`;

function injectChatbase() {
  if (typeof window === "undefined") return;
  if (document.getElementById(INLINE_LOADER_ID)) return;

  const inline = document.createElement("script");
  inline.id = INLINE_LOADER_ID;
  inline.type = "text/javascript";
  inline.innerHTML = CHATBASE_LOADER;
  document.body.appendChild(inline);
}

function teardownChatbase() {
  if (typeof window === "undefined") return;

  document.getElementById(INLINE_LOADER_ID)?.remove();
  document.getElementById(REMOTE_SCRIPT_ID)?.remove();

  document
    .querySelectorAll('[id^="chatbase"], iframe[src*="chatbase.co"], script[src*="chatbase.co"]')
    .forEach(node => node.remove());

  if (typeof window !== "undefined" && (window as any).chatbase) {
    try {
      (window as any).chatbase("destroy");
    } catch (_err) {
      // ignore
    }
    delete (window as any).chatbase;
  }
}

export default function ChatbotOverlay() {
  useEffect(() => {
    let active = true;
    const supabase = getSupabaseClient();

    const handleAuthState = (_event: string, session: { user: unknown } | null) => {
      if (!active) return;
      if (session?.user) {
        injectChatbase();
      } else {
        teardownChatbase();
      }
    };

    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      if (data?.user) {
        injectChatbase();
      } else {
        teardownChatbase();
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(handleAuthState);

    return () => {
      active = false;
      listener?.subscription.unsubscribe();
      teardownChatbase();
    };
  }, []);

  return null;
}

