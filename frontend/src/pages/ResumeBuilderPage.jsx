import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import jsPDF from "jspdf";

// ── Step definitions ──────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Personal",       icon: "👤" },
  { id: 2, label: "Education",      icon: "🎓" },
  { id: 3, label: "Skills",         icon: "⚙️" },
  { id: 4, label: "Projects",       icon: "🛠️" },
  { id: 5, label: "Experience",     icon: "💼" },
  { id: 6, label: "Certifications", icon: "📜" },
  { id: 7, label: "Template",       icon: "🎨" },
];

const EMPTY_DATA = {
  personal: { name: "", email: "", phone: "", location: "", linkedin: "", github: "", objective: "" },
  education: [{ degree: "", college: "", year: "", gpa: "", relevant: "" }],
  skills:    { technical: "", soft: "", languages: "" },
  projects:  [{ title: "", description: "", tech: "", link: "" }],
  experience:[{ company: "", role: "", duration: "", description: "" }],
  certs:     [{ name: "", issuer: "", year: "" }],
  template:  "classic",
};

export default function ResumeBuilderPage() {
  const { theme, isDark } = useTheme();
  const [step, setStep]   = useState(1);
  const [data, setData]   = useState(EMPTY_DATA);
  const [preview, setPreview] = useState(false);

  const card = {
    background: theme.surface, border: `1px solid ${theme.border}`,
    borderRadius: "16px", padding: "28px",
    boxShadow: isDark ? "none" : "0 2px 16px rgba(0,0,0,0.07)",
  };

  const inputStyle = {
    width: "100%", background: theme.input,
    border: `1px solid ${theme.border}`, borderRadius: "10px",
    padding: "11px 14px", color: theme.textPrimary,
    fontSize: "13.5px", fontFamily: "inherit",
    outline: "none", boxSizing: "border-box",
    transition: "border-color 0.2s",
  };

  const labelStyle = {
    color: theme.textMuted, fontSize: "11px",
    fontWeight: 700, letterSpacing: "1px",
    textTransform: "uppercase", display: "block", marginBottom: "6px",
  };

  const fieldGroup = (children, cols = 1) => (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "14px", marginBottom: "14px" }}>
      {children}
    </div>
  );

  function updatePersonal(field, val) {
    setData(d => ({ ...d, personal: { ...d.personal, [field]: val } }));
  }

  function updateSkills(field, val) {
    setData(d => ({ ...d, skills: { ...d.skills, [field]: val } }));
  }

  function updateArrayItem(key, index, field, val) {
    setData(d => {
      const arr = [...d[key]];
      arr[index] = { ...arr[index], [field]: val };
      return { ...d, [key]: arr };
    });
  }

  function addArrayItem(key, empty) {
    setData(d => ({ ...d, [key]: [...d[key], { ...empty }] }));
  }

  function removeArrayItem(key, index) {
    setData(d => ({ ...d, [key]: d[key].filter((_, i) => i !== index) }));
  }

  // ── PDF Download ──────────────────────────────────────────────────────────
  function downloadPDF() {
    const doc = new jsPDF();
    const m = 20;
    const pw = doc.internal.pageSize.getWidth();
    const mw = pw - m * 2;
    let y = 20;

    function addPage() { doc.addPage(); y = 20; }
    function check(h = 10) { if (y + h > 270) addPage(); }

    // Header
    doc.setFontSize(22); doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text(data.personal.name || "Your Name", m, y); y += 9;

    doc.setFontSize(9); doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    const contact = [data.personal.email, data.personal.phone, data.personal.location].filter(Boolean).join(" · ");
    doc.text(contact, m, y); y += 5;
    if (data.personal.linkedin) { doc.text(`LinkedIn: ${data.personal.linkedin}`, m, y); y += 5; }
    if (data.personal.github)   { doc.text(`GitHub: ${data.personal.github}`, m, y);   y += 5; }

    doc.setDrawColor(99, 102, 241);
    doc.setLineWidth(0.5);
    doc.line(m, y + 2, pw - m, y + 2); y += 8;

    // Objective
    if (data.personal.objective) {
      doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(30, 41, 59);
      doc.text("OBJECTIVE", m, y); y += 6;
      doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(71, 85, 105);
      const lines = doc.splitTextToSize(data.personal.objective, mw);
      doc.text(lines, m, y); y += lines.length * 5 + 6;
    }

    // Education
    if (data.education?.some(e => e.degree || e.college)) {
      check(20);
      doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(30, 41, 59);
      doc.text("EDUCATION", m, y); y += 2;
      doc.setDrawColor(200, 200, 200); doc.line(m, y + 2, pw - m, y + 2); y += 6;
      data.education.forEach(e => {
        if (!e.degree && !e.college) return;
        check(12);
        doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.setTextColor(30, 41, 59);
        doc.text(e.degree || "", m, y);
        doc.setFont("helvetica", "normal"); doc.setTextColor(100, 116, 139);
        doc.text(e.year || "", pw - m, y, { align: "right" }); y += 5;
        doc.setFontSize(9);
        doc.text(`${e.college || ""}${e.gpa ? ` · GPA: ${e.gpa}` : ""}`, m, y); y += 8;
      });
    }

    // Skills
    if (data.skills.technical || data.skills.soft) {
      check(20);
      doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(30, 41, 59);
      doc.text("SKILLS", m, y); y += 2;
      doc.setDrawColor(200, 200, 200); doc.line(m, y + 2, pw - m, y + 2); y += 6;
      doc.setFontSize(9); doc.setFont("helvetica", "normal");
      if (data.skills.technical) {
        doc.setFont("helvetica", "bold"); doc.setTextColor(30, 41, 59);
        doc.text("Technical: ", m, y);
        doc.setFont("helvetica", "normal"); doc.setTextColor(71, 85, 105);
        const tl = doc.splitTextToSize(data.skills.technical, mw - 25);
        doc.text(tl, m + 25, y); y += tl.length * 5 + 2;
      }
      if (data.skills.soft) {
        doc.setFont("helvetica", "bold"); doc.setTextColor(30, 41, 59);
        doc.text("Soft Skills: ", m, y);
        doc.setFont("helvetica", "normal"); doc.setTextColor(71, 85, 105);
        const sl = doc.splitTextToSize(data.skills.soft, mw - 28);
        doc.text(sl, m + 28, y); y += sl.length * 5 + 2;
      }
      y += 4;
    }

    // Projects
    if (data.projects?.some(p => p.title)) {
      check(20);
      doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(30, 41, 59);
      doc.text("PROJECTS", m, y); y += 2;
      doc.setDrawColor(200, 200, 200); doc.line(m, y + 2, pw - m, y + 2); y += 6;
      data.projects.forEach(p => {
        if (!p.title) return;
        check(16);
        doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.setTextColor(30, 41, 59);
        doc.text(p.title, m, y);
        if (p.tech) {
          doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(99, 102, 241);
          doc.text(`[${p.tech}]`, pw - m, y, { align: "right" });
        }
        y += 5;
        if (p.description) {
          doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(71, 85, 105);
          const dl = doc.splitTextToSize(p.description, mw);
          doc.text(dl, m, y); y += dl.length * 5;
        }
        if (p.link) {
          doc.setFontSize(8); doc.setTextColor(99, 102, 241);
          doc.text(p.link, m, y); y += 4;
        }
        y += 4;
      });
    }

    // Experience
    if (data.experience?.some(e => e.company || e.role)) {
      check(20);
      doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(30, 41, 59);
      doc.text("EXPERIENCE", m, y); y += 2;
      doc.setDrawColor(200, 200, 200); doc.line(m, y + 2, pw - m, y + 2); y += 6;
      data.experience.forEach(e => {
        if (!e.company && !e.role) return;
        check(16);
        doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.setTextColor(30, 41, 59);
        doc.text(e.role || "", m, y);
        doc.setFont("helvetica", "normal"); doc.setTextColor(100, 116, 139);
        doc.text(e.duration || "", pw - m, y, { align: "right" }); y += 5;
        doc.setFontSize(9); doc.setTextColor(71, 85, 105);
        doc.text(e.company || "", m, y); y += 5;
        if (e.description) {
          const dl = doc.splitTextToSize(e.description, mw);
          doc.text(dl, m, y); y += dl.length * 5 + 4;
        }
      });
    }

    // Certifications
    if (data.certs?.some(c => c.name)) {
      check(16);
      doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(30, 41, 59);
      doc.text("CERTIFICATIONS", m, y); y += 2;
      doc.setDrawColor(200, 200, 200); doc.line(m, y + 2, pw - m, y + 2); y += 6;
      data.certs.forEach(c => {
        if (!c.name) return;
        check(8);
        doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(71, 85, 105);
        doc.text(`• ${c.name}${c.issuer ? ` — ${c.issuer}` : ""}${c.year ? ` (${c.year})` : ""}`, m, y);
        y += 6;
      });
    }

    doc.save(`${data.personal.name || "resume"}_PlacementAI.pdf`);
  }

  // ── Step renders ──────────────────────────────────────────────────────────
  function renderStep() {
    switch (step) {

      case 1: return (
        <div>
          <h2 style={{ color: theme.textPrimary, fontWeight: 700, fontSize: "18px", marginBottom: "20px" }}>Personal Information</h2>
          {fieldGroup(<>
            <div><label style={labelStyle}>Full Name *</label><input style={inputStyle} placeholder="John Doe" value={data.personal.name} onChange={e => updatePersonal("name", e.target.value)} /></div>
            <div><label style={labelStyle}>Email *</label><input style={inputStyle} placeholder="john@email.com" value={data.personal.email} onChange={e => updatePersonal("email", e.target.value)} /></div>
          </>, 2)}
          {fieldGroup(<>
            <div><label style={labelStyle}>Phone</label><input style={inputStyle} placeholder="+91 9876543210" value={data.personal.phone} onChange={e => updatePersonal("phone", e.target.value)} /></div>
            <div><label style={labelStyle}>Location</label><input style={inputStyle} placeholder="Chennai, India" value={data.personal.location} onChange={e => updatePersonal("location", e.target.value)} /></div>
          </>, 2)}
          {fieldGroup(<>
            <div><label style={labelStyle}>LinkedIn URL</label><input style={inputStyle} placeholder="linkedin.com/in/johndoe" value={data.personal.linkedin} onChange={e => updatePersonal("linkedin", e.target.value)} /></div>
            <div><label style={labelStyle}>GitHub URL</label><input style={inputStyle} placeholder="github.com/johndoe" value={data.personal.github} onChange={e => updatePersonal("github", e.target.value)} /></div>
          </>, 2)}
          <div style={{ marginBottom: "14px" }}>
            <label style={labelStyle}>Career Objective</label>
            <textarea style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }} placeholder="A motivated software developer with passion for building scalable web applications…" value={data.personal.objective} onChange={e => updatePersonal("objective", e.target.value)} />
          </div>
        </div>
      );

      case 2: return (
        <div>
          <h2 style={{ color: theme.textPrimary, fontWeight: 700, fontSize: "18px", marginBottom: "20px" }}>Education</h2>
          {data.education.map((edu, i) => (
            <div key={i} style={{ ...card, marginBottom: "16px", background: theme.bg }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px" }}>
                <span style={{ color: theme.textSecondary, fontWeight: 600, fontSize: "13px" }}>Education {i + 1}</span>
                {i > 0 && <button onClick={() => removeArrayItem("education", i)} style={{ background: "transparent", border: "none", color: theme.danger, cursor: "pointer", fontSize: "12px" }}>✕ Remove</button>}
              </div>
              {fieldGroup(<>
                <div><label style={labelStyle}>Degree / Course *</label><input style={inputStyle} placeholder="B.E. Computer Science" value={edu.degree} onChange={e => updateArrayItem("education", i, "degree", e.target.value)} /></div>
                <div><label style={labelStyle}>Year</label><input style={inputStyle} placeholder="2020 - 2024" value={edu.year} onChange={e => updateArrayItem("education", i, "year", e.target.value)} /></div>
              </>, 2)}
              {fieldGroup(<>
                <div><label style={labelStyle}>College / University *</label><input style={inputStyle} placeholder="XYZ University" value={edu.college} onChange={e => updateArrayItem("education", i, "college", e.target.value)} /></div>
                <div><label style={labelStyle}>GPA / Percentage</label><input style={inputStyle} placeholder="8.5 / 10" value={edu.gpa} onChange={e => updateArrayItem("education", i, "gpa", e.target.value)} /></div>
              </>, 2)}
              <div><label style={labelStyle}>Relevant Coursework</label><input style={inputStyle} placeholder="Data Structures, DBMS, Networks, OS" value={edu.relevant} onChange={e => updateArrayItem("education", i, "relevant", e.target.value)} /></div>
            </div>
          ))}
          <button onClick={() => addArrayItem("education", { degree: "", college: "", year: "", gpa: "", relevant: "" })} style={{ width: "100%", padding: "11px", background: "transparent", color: theme.primary, border: `1px dashed ${theme.primary}`, borderRadius: "10px", cursor: "pointer", fontWeight: 600, fontSize: "13px" }}>
            + Add Education
          </button>
        </div>
      );

      case 3: return (
        <div>
          <h2 style={{ color: theme.textPrimary, fontWeight: 700, fontSize: "18px", marginBottom: "20px" }}>Skills</h2>
          <div style={{ marginBottom: "14px" }}>
            <label style={labelStyle}>Technical Skills *</label>
            <textarea style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }} placeholder="Python, JavaScript, React, FastAPI, SQL, Git, Docker, AWS…" value={data.skills.technical} onChange={e => updateSkills("technical", e.target.value)} />
            <div style={{ color: theme.textMuted, fontSize: "11px", marginTop: "4px" }}>Separate with commas</div>
          </div>
          <div style={{ marginBottom: "14px" }}>
            <label style={labelStyle}>Soft Skills</label>
            <textarea style={{ ...inputStyle, minHeight: "70px", resize: "vertical" }} placeholder="Problem Solving, Team Collaboration, Communication, Leadership…" value={data.skills.soft} onChange={e => updateSkills("soft", e.target.value)} />
          </div>
          <div style={{ marginBottom: "14px" }}>
            <label style={labelStyle}>Languages Known</label>
            <input style={inputStyle} placeholder="English (Fluent), Tamil (Native), Hindi (Basic)" value={data.skills.languages} onChange={e => updateSkills("languages", e.target.value)} />
          </div>
        </div>
      );

      case 4: return (
        <div>
          <h2 style={{ color: theme.textPrimary, fontWeight: 700, fontSize: "18px", marginBottom: "20px" }}>Projects</h2>
          {data.projects.map((p, i) => (
            <div key={i} style={{ ...card, marginBottom: "16px", background: theme.bg }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px" }}>
                <span style={{ color: theme.textSecondary, fontWeight: 600, fontSize: "13px" }}>Project {i + 1}</span>
                {i > 0 && <button onClick={() => removeArrayItem("projects", i)} style={{ background: "transparent", border: "none", color: theme.danger, cursor: "pointer", fontSize: "12px" }}>✕ Remove</button>}
              </div>
              {fieldGroup(<>
                <div><label style={labelStyle}>Project Title *</label><input style={inputStyle} placeholder="E-Commerce Platform" value={p.title} onChange={e => updateArrayItem("projects", i, "title", e.target.value)} /></div>
                <div><label style={labelStyle}>Tech Stack</label><input style={inputStyle} placeholder="React, FastAPI, PostgreSQL" value={p.tech} onChange={e => updateArrayItem("projects", i, "tech", e.target.value)} /></div>
              </>, 2)}
              <div style={{ marginBottom: "14px" }}>
                <label style={labelStyle}>Description *</label>
                <textarea style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }} placeholder="Built a full-stack e-commerce platform with payment integration, reducing checkout time by 30%…" value={p.description} onChange={e => updateArrayItem("projects", i, "description", e.target.value)} />
              </div>
              <div><label style={labelStyle}>Project Link / GitHub</label><input style={inputStyle} placeholder="github.com/johndoe/project" value={p.link} onChange={e => updateArrayItem("projects", i, "link", e.target.value)} /></div>
            </div>
          ))}
          <button onClick={() => addArrayItem("projects", { title: "", description: "", tech: "", link: "" })} style={{ width: "100%", padding: "11px", background: "transparent", color: theme.primary, border: `1px dashed ${theme.primary}`, borderRadius: "10px", cursor: "pointer", fontWeight: 600, fontSize: "13px" }}>
            + Add Project
          </button>
        </div>
      );

      case 5: return (
        <div>
          <h2 style={{ color: theme.textPrimary, fontWeight: 700, fontSize: "18px", marginBottom: "20px" }}>Work Experience</h2>
          {data.experience.map((e, i) => (
            <div key={i} style={{ ...card, marginBottom: "16px", background: theme.bg }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px" }}>
                <span style={{ color: theme.textSecondary, fontWeight: 600, fontSize: "13px" }}>Experience {i + 1}</span>
                {i > 0 && <button onClick={() => removeArrayItem("experience", i)} style={{ background: "transparent", border: "none", color: theme.danger, cursor: "pointer", fontSize: "12px" }}>✕ Remove</button>}
              </div>
              {fieldGroup(<>
                <div><label style={labelStyle}>Company Name</label><input style={inputStyle} placeholder="ABC Tech Pvt Ltd" value={e.company} onChange={ev => updateArrayItem("experience", i, "company", ev.target.value)} /></div>
                <div><label style={labelStyle}>Role / Position</label><input style={inputStyle} placeholder="Software Developer Intern" value={e.role} onChange={ev => updateArrayItem("experience", i, "role", ev.target.value)} /></div>
              </>, 2)}
              <div style={{ marginBottom: "14px" }}>
                <label style={labelStyle}>Duration</label>
                <input style={inputStyle} placeholder="June 2023 – August 2023 (3 months)" value={e.duration} onChange={ev => updateArrayItem("experience", i, "duration", ev.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Key Responsibilities & Achievements</label>
                <textarea style={{ ...inputStyle, minHeight: "90px", resize: "vertical" }} placeholder="• Developed REST APIs using FastAPI reducing response time by 40%&#10;• Collaborated with a 5-member team using Agile methodology&#10;• Improved database query performance by 30%" value={e.description} onChange={ev => updateArrayItem("experience", i, "description", ev.target.value)} />
              </div>
            </div>
          ))}
          <button onClick={() => addArrayItem("experience", { company: "", role: "", duration: "", description: "" })} style={{ width: "100%", padding: "11px", background: "transparent", color: theme.primary, border: `1px dashed ${theme.primary}`, borderRadius: "10px", cursor: "pointer", fontWeight: 600, fontSize: "13px" }}>
            + Add Experience
          </button>
          <p style={{ color: theme.textMuted, fontSize: "12px", marginTop: "12px", textAlign: "center" }}>
            No experience yet? Leave blank — internships, freelance projects, or open source contributions count too.
          </p>
        </div>
      );

      case 6: return (
        <div>
          <h2 style={{ color: theme.textPrimary, fontWeight: 700, fontSize: "18px", marginBottom: "20px" }}>Certifications</h2>
          {data.certs.map((c, i) => (
            <div key={i} style={{ ...card, marginBottom: "16px", background: theme.bg }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px" }}>
                <span style={{ color: theme.textSecondary, fontWeight: 600, fontSize: "13px" }}>Certification {i + 1}</span>
                {i > 0 && <button onClick={() => removeArrayItem("certs", i)} style={{ background: "transparent", border: "none", color: theme.danger, cursor: "pointer", fontSize: "12px" }}>✕ Remove</button>}
              </div>
              {fieldGroup(<>
                <div><label style={labelStyle}>Certificate Name</label><input style={inputStyle} placeholder="AWS Cloud Practitioner" value={c.name} onChange={e => updateArrayItem("certs", i, "name", e.target.value)} /></div>
                <div><label style={labelStyle}>Issuing Organization</label><input style={inputStyle} placeholder="Amazon Web Services" value={c.issuer} onChange={e => updateArrayItem("certs", i, "issuer", e.target.value)} /></div>
              </>, 2)}
              <div><label style={labelStyle}>Year</label><input style={inputStyle} placeholder="2024" value={c.year} onChange={e => updateArrayItem("certs", i, "year", e.target.value)} /></div>
            </div>
          ))}
          <button onClick={() => addArrayItem("certs", { name: "", issuer: "", year: "" })} style={{ width: "100%", padding: "11px", background: "transparent", color: theme.primary, border: `1px dashed ${theme.primary}`, borderRadius: "10px", cursor: "pointer", fontWeight: 600, fontSize: "13px" }}>
            + Add Certification
          </button>
        </div>
      );

      case 7: return (
        <div>
          <h2 style={{ color: theme.textPrimary, fontWeight: 700, fontSize: "18px", marginBottom: "8px" }}>Choose Template</h2>
          <p style={{ color: theme.textSecondary, fontSize: "13px", marginBottom: "20px" }}>Select a template and download your resume as PDF.</p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", marginBottom: "28px" }}>
            {[
              { id: "classic", name: "Classic",  desc: "Traditional single-column format. Best for service companies and MNCs.", color: "#3b82f6" },
              { id: "modern",  name: "Modern",   desc: "Two-column layout with skills sidebar. Best for product companies.", color: "#6366f1" },
              { id: "minimal", name: "Minimal",  desc: "Clean typography-focused design. Best for startups and FAANG.", color: "#22c55e" },
            ].map(t => (
              <div key={t.id} onClick={() => setData(d => ({ ...d, template: t.id }))} style={{
                background: data.template === t.id
                  ? isDark ? `rgba(${t.color === "#3b82f6" ? "59,130,246" : t.color === "#6366f1" ? "99,102,241" : "34,197,94"},0.15)` : `${t.color}10`
                  : theme.surface,
                border: `2px solid ${data.template === t.id ? t.color : theme.border}`,
                borderRadius: "14px", padding: "20px", cursor: "pointer",
                transition: "all 0.2s", textAlign: "center",
                boxShadow: data.template === t.id ? `0 4px 16px ${t.color}33` : "none",
              }}>
                {/* Template preview */}
                <div style={{ height: "80px", background: theme.bg, borderRadius: "8px", marginBottom: "12px", padding: "8px", display: "flex", flexDirection: "column", gap: "4px", overflow: "hidden" }}>
                  {t.id === "classic" && <>
                    <div style={{ height: "8px", background: t.color, borderRadius: "2px", width: "70%", margin: "0 auto" }} />
                    <div style={{ height: "4px", background: theme.border, borderRadius: "2px", width: "50%", margin: "0 auto" }} />
                    <div style={{ height: "3px", background: theme.border, borderRadius: "2px", width: "90%" }} />
                    <div style={{ height: "3px", background: theme.border, borderRadius: "2px", width: "80%" }} />
                    <div style={{ height: "3px", background: theme.border, borderRadius: "2px", width: "85%" }} />
                    <div style={{ height: "5px", background: t.color + "44", borderRadius: "2px", width: "40%", marginTop: "2px" }} />
                    <div style={{ height: "3px", background: theme.border, borderRadius: "2px", width: "90%" }} />
                  </>}
                  {t.id === "modern" && <div style={{ display: "flex", gap: "4px", height: "100%" }}>
                    <div style={{ width: "35%", background: t.color + "22", borderRadius: "4px", padding: "4px", display: "flex", flexDirection: "column", gap: "3px" }}>
                      <div style={{ height: "12px", width: "12px", borderRadius: "50%", background: t.color, margin: "0 auto 2px" }} />
                      <div style={{ height: "3px", background: t.color + "66", borderRadius: "2px" }} />
                      <div style={{ height: "3px", background: t.color + "44", borderRadius: "2px" }} />
                      <div style={{ height: "3px", background: t.color + "44", borderRadius: "2px" }} />
                    </div>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "3px", padding: "2px" }}>
                      <div style={{ height: "6px", background: t.color, borderRadius: "2px", width: "80%" }} />
                      <div style={{ height: "3px", background: theme.border, borderRadius: "2px" }} />
                      <div style={{ height: "3px", background: theme.border, borderRadius: "2px", width: "70%" }} />
                      <div style={{ height: "4px", background: t.color + "44", borderRadius: "2px", width: "50%", marginTop: "2px" }} />
                      <div style={{ height: "3px", background: theme.border, borderRadius: "2px" }} />
                    </div>
                  </div>}
                  {t.id === "minimal" && <>
                    <div style={{ height: "6px", background: theme.textPrimary, borderRadius: "2px", width: "60%", opacity: 0.8 }} />
                    <div style={{ height: "1px", background: t.color, width: "100%", marginBottom: "2px" }} />
                    <div style={{ height: "3px", background: theme.border, borderRadius: "2px", width: "85%" }} />
                    <div style={{ height: "3px", background: theme.border, borderRadius: "2px", width: "70%" }} />
                    <div style={{ height: "1px", background: theme.border, width: "100%", marginTop: "2px", marginBottom: "2px" }} />
                    <div style={{ height: "4px", background: theme.textPrimary, borderRadius: "2px", width: "35%", opacity: 0.6 }} />
                    <div style={{ height: "3px", background: theme.border, borderRadius: "2px", width: "90%" }} />
                    <div style={{ height: "3px", background: theme.border, borderRadius: "2px", width: "75%" }} />
                  </>}
                </div>
                <div style={{ color: data.template === t.id ? t.color : theme.textPrimary, fontWeight: 700, fontSize: "14px", marginBottom: "4px" }}>{t.name}</div>
                <div style={{ color: theme.textMuted, fontSize: "11px", lineHeight: "1.5" }}>{t.desc}</div>
                {data.template === t.id && (
                  <div style={{ marginTop: "8px", color: t.color, fontSize: "11px", fontWeight: 700 }}>✓ Selected</div>
                )}
              </div>
            ))}
          </div>

          {/* Summary */}
          <div style={{ ...card, background: theme.bg, marginBottom: "20px" }}>
            <h3 style={{ color: theme.textPrimary, fontWeight: 700, fontSize: "14px", marginBottom: "14px" }}>Resume Summary</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
              {[
                ["Name",          data.personal.name    || "Not filled"],
                ["Email",         data.personal.email   || "Not filled"],
                ["Education",     `${data.education.filter(e => e.degree).length} entries`],
                ["Projects",      `${data.projects.filter(p => p.title).length} entries`],
                ["Experience",    `${data.experience.filter(e => e.company || e.role).length} entries`],
                ["Certifications",`${data.certs.filter(c => c.name).length} entries`],
              ].map(([label, value]) => (
                <div key={label} style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: "8px", padding: "10px 12px" }}>
                  <div style={{ color: theme.textMuted, fontSize: "10px", fontWeight: 700, marginBottom: "3px" }}>{label.toUpperCase()}</div>
                  <div style={{ color: theme.textPrimary, fontSize: "12px", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          <button onClick={downloadPDF} style={{
            width: "100%", padding: "14px",
            background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent1})`,
            color: "#fff", border: "none", borderRadius: "12px",
            fontSize: "15px", fontWeight: 700, cursor: "pointer",
            boxShadow: `0 4px 20px ${theme.primaryGlow}`,
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
          }}>
            📥 Download Resume PDF
          </button>
        </div>
      );

      default: return null;
    }
  }

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto", padding: "36px 28px 80px", fontFamily: "'Inter','Segoe UI', sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{ display: "inline-block", background: theme.primaryGlow, color: theme.primary, border: `1px solid ${theme.primary}33`, padding: "3px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: 700, letterSpacing: "2px", marginBottom: "10px" }}>
          RESUME BUILDER
        </div>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: theme.textPrimary, marginBottom: "6px", letterSpacing: "-0.5px" }}>
          Build Your Resume
        </h1>
        <p style={{ color: theme.textSecondary, fontSize: "14px" }}>
          Fill in each section and download a professional PDF resume.
        </p>
      </div>

      {/* Step indicator */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: "32px", overflowX: "auto", paddingBottom: "4px" }}>
        {STEPS.map((s, i) => {
          const isActive   = step === s.id;
          const isComplete = step > s.id;
          return (
            <div key={s.id} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
              <div
                onClick={() => step > s.id && setStep(s.id)}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  cursor: step > s.id ? "pointer" : "default",
                }}
              >
                <div style={{
                  width: "40px", height: "40px", borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "16px", fontWeight: 700,
                  background: isComplete
                    ? theme.primary
                    : isActive
                    ? `linear-gradient(135deg, ${theme.primary}, ${theme.accent1})`
                    : theme.surface,
                  border: isActive || isComplete
                    ? "none"
                    : `2px solid ${theme.border}`,
                  color: isComplete || isActive ? "#fff" : theme.textMuted,
                  boxShadow: isActive ? `0 4px 12px ${theme.primaryGlow}` : "none",
                  transition: "all 0.2s",
                }}>
                  {isComplete ? "✓" : s.icon}
                </div>
                <div style={{ color: isActive ? theme.primary : isComplete ? theme.textSecondary : theme.textMuted, fontSize: "10px", fontWeight: isActive ? 700 : 400, marginTop: "4px", whiteSpace: "nowrap" }}>
                  {s.label}
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ width: "32px", height: "2px", background: step > s.id ? theme.primary : theme.border, margin: "0 4px 16px", flexShrink: 0, transition: "background 0.3s" }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step content */}
      <div style={card}>
        {renderStep()}
      </div>

      {/* Navigation buttons */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px", gap: "12px" }}>
        <button
          onClick={() => setStep(s => Math.max(1, s - 1))}
          disabled={step === 1}
          style={{
            padding: "11px 28px", background: "transparent",
            color: step === 1 ? theme.textMuted : theme.textSecondary,
            border: `1px solid ${step === 1 ? theme.border : theme.border}`,
            borderRadius: "10px", fontSize: "14px", fontWeight: 600,
            cursor: step === 1 ? "not-allowed" : "pointer",
            transition: "all 0.2s",
          }}
        >← Previous</button>

        <div style={{ color: theme.textMuted, fontSize: "12px", alignSelf: "center" }}>
          Step {step} of {STEPS.length}
        </div>

        {step < STEPS.length ? (
          <button
            onClick={() => setStep(s => Math.min(STEPS.length, s + 1))}
            style={{
              padding: "11px 28px",
              background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent1})`,
              color: "#fff", border: "none", borderRadius: "10px",
              fontSize: "14px", fontWeight: 700, cursor: "pointer",
              boxShadow: `0 4px 12px ${theme.primaryGlow}`,
              transition: "all 0.2s",
            }}
          >Next →</button>
        ) : (
          <button onClick={downloadPDF} style={{
            padding: "11px 28px",
            background: `linear-gradient(135deg, #22c55e, #16a34a)`,
            color: "#fff", border: "none", borderRadius: "10px",
            fontSize: "14px", fontWeight: 700, cursor: "pointer",
            boxShadow: "0 4px 12px rgba(34,197,94,0.3)",
          }}>📥 Download PDF</button>
        )}
      </div>
    </div>
  );
}