import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { Loader2 } from "lucide-react";

const BUCKET = "documentos";
const cache = new Map();

export default function SignedImage({ path, alt, className, style, onClick }) {
  const [url, setUrl] = useState(cache.get(path) || null);
  const [loading, setLoading] = useState(!cache.has(path));

  useEffect(() => {
    let active = true;
    if (!path) return;
    if (cache.has(path)) { setUrl(cache.get(path)); setLoading(false); return; }
    setLoading(true);
    supabase.storage.from(BUCKET).createSignedUrl(path, 3600).then(({ data, error }) => {
      if (!active) return;
      if (data?.signedUrl) { cache.set(path, data.signedUrl); setUrl(data.signedUrl); }
      setLoading(false);
    });
    return () => { active = false; };
  }, [path]);

  if (!path) return null;
  if (loading) return <div className={className} style={{ ...style, display: "flex", alignItems: "center", justifyContent: "center" }}><Loader2 size={16} className="spin" /></div>;
  return <img src={url} alt={alt} className={className} style={style} onClick={onClick} />;
}
