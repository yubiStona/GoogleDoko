import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TopBar from "../components/TopBar";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import NotFound from "./NotFound";
import { api, type PublicWebsitePage } from "../api/client";

export default function PublishedContentPage() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState<PublicWebsitePage | null>(null);
  const [missing, setMissing] = useState(false);
  useEffect(() => {
    let active = true;
    setPage(null); setMissing(false);
    void api.getPublishedPage(slug).then((result) => {
      if (!active) return;
      if (result.redirect) { navigate(`/pages/${result.slug}`, { replace: true }); return; }
      setPage(result);
      document.title = result.seoTitle || result.title;
      let description = document.querySelector('meta[name="description"]');
      if (!description) { description = document.createElement("meta"); description.setAttribute("name", "description"); document.head.appendChild(description); }
      description.setAttribute("content", result.metaDescription || result.description);
    }).catch(() => { if (active) setMissing(true); });
    return () => { active = false; };
  }, [slug, navigate]);
  if (missing) return <NotFound />;
  return <><TopBar /><Navbar /><main className="shop-page" style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px", minHeight: "55vh" }}>
    {!page ? <p>Loading page…</p> : <article>
      <small>{page.slug.replaceAll("-", " ").toUpperCase()}</small>
      <h1>{page.title}</h1><p>{page.description}</p>
      {page.heroImage && <img src={page.heroImage} alt={page.imageAlt} style={{ width: "100%", maxHeight: 480, objectFit: "cover", borderRadius: 20, margin: "18px 0" }} />}
      <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}>{page.body}</div>
    </article>}
  </main><Footer /></>;
}
