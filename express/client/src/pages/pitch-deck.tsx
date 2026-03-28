import { ChevronRight, Smartphone, Monitor, Shield, FileDown, Users, ClipboardList, History, MapPin, Building2, Wrench, LogIn, CheckCircle2, BarChart3, Mail, Database } from "lucide-react";

const BRAND = {
  green: "#2d5016",
  greenLight: "#4a7c2e",
  greenBg: "#f0f7ec",
  dark: "#1a1a1a",
  gray: "#6b7280",
  lightGray: "#f3f4f6",
  white: "#ffffff",
  border: "#e5e7eb",
  accent: "#22c55e",
};

function PhoneMockup({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ 
      width: 280, 
      margin: "0 auto",
      border: `3px solid ${BRAND.dark}`, 
      borderRadius: 32, 
      overflow: "hidden",
      boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
      background: BRAND.white,
    }}>
      <div style={{ 
        height: 28, 
        background: BRAND.dark, 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        position: "relative",
      }}>
        <div style={{ width: 60, height: 6, borderRadius: 3, background: "#333" }} />
      </div>
      <div style={{ minHeight: 460, position: "relative", overflow: "hidden" }}>
        {children}
      </div>
      <div style={{ 
        height: 52, 
        background: BRAND.white, 
        borderTop: `1px solid ${BRAND.border}`,
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-around",
        padding: "0 16px",
      }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <ClipboardList size={16} color={BRAND.greenLight} />
          <span style={{ fontSize: 9, color: BRAND.greenLight, fontWeight: 600 }}>Log Job</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <History size={16} color={BRAND.gray} />
          <span style={{ fontSize: 9, color: BRAND.gray }}>History</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <Users size={16} color={BRAND.gray} />
          <span style={{ fontSize: 9, color: BRAND.gray }}>Team</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <LogIn size={16} color={BRAND.gray} />
          <span style={{ fontSize: 9, color: BRAND.gray }}>Out</span>
        </div>
      </div>
    </div>
  );
}

function DesktopMockup({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      maxWidth: 700,
      margin: "0 auto",
      border: `2px solid ${BRAND.border}`,
      borderRadius: 12,
      overflow: "hidden",
      boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
      background: BRAND.white,
    }}>
      <div style={{
        height: 32,
        background: BRAND.lightGray,
        display: "flex",
        alignItems: "center",
        padding: "0 12px",
        gap: 6,
        borderBottom: `1px solid ${BRAND.border}`,
      }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444" }} />
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#eab308" }} />
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e" }} />
        <div style={{ 
          marginLeft: 20, 
          flex: 1, 
          height: 18, 
          background: BRAND.white, 
          borderRadius: 4, 
          display: "flex", 
          alignItems: "center", 
          padding: "0 8px",
          fontSize: 10,
          color: BRAND.gray,
        }}>
          absolutepestservices.com/admin/reports
        </div>
      </div>
      <div style={{ minHeight: 380 }}>
        {children}
      </div>
    </div>
  );
}

function SelectMockup({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: BRAND.dark, marginBottom: 4 }}>{label}</div>
      <div style={{ 
        height: 36, 
        border: `1.5px solid ${highlight ? BRAND.greenLight : BRAND.border}`, 
        borderRadius: 6, 
        display: "flex", 
        alignItems: "center", 
        padding: "0 10px",
        fontSize: 12,
        color: value ? BRAND.dark : BRAND.gray,
        background: highlight ? BRAND.greenBg : BRAND.white,
      }}>
        {value || "Select..."}
        <ChevronRight size={14} style={{ marginLeft: "auto", transform: "rotate(90deg)" }} color={BRAND.gray} />
      </div>
    </div>
  );
}

function InputMockup({ label, value, type }: { label: string; value: string; type?: string }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: BRAND.dark, marginBottom: 4 }}>{label}</div>
      <div style={{ 
        height: type === "textarea" ? 60 : 36, 
        border: `1.5px solid ${BRAND.border}`, 
        borderRadius: 6, 
        display: "flex", 
        alignItems: type === "textarea" ? "flex-start" : "center", 
        padding: type === "textarea" ? "8px 10px" : "0 10px",
        fontSize: 12,
        color: value ? BRAND.dark : BRAND.gray,
      }}>
        {value || "Enter..."}
      </div>
    </div>
  );
}

function ButtonMockup({ text, primary, fullWidth }: { text: string; primary?: boolean; fullWidth?: boolean }) {
  return (
    <div style={{
      height: 40,
      background: primary ? BRAND.green : BRAND.lightGray,
      color: primary ? BRAND.white : BRAND.dark,
      borderRadius: 6,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 600,
      fontSize: 13,
      width: fullWidth ? "100%" : "auto",
      padding: fullWidth ? 0 : "0 20px",
    }}>
      {text}
    </div>
  );
}

function SectionTitle({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div style={{ textAlign: "center", marginBottom: 40 }}>
      <div style={{ 
        width: 56, height: 56, borderRadius: 16, 
        background: BRAND.greenBg, 
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 16px",
      }}>
        {icon}
      </div>
      <h2 style={{ fontSize: 28, fontWeight: 700, color: BRAND.dark, margin: "0 0 8px" }}>{title}</h2>
      <p style={{ fontSize: 16, color: BRAND.gray, margin: 0, maxWidth: 500, marginLeft: "auto", marginRight: "auto" }}>{subtitle}</p>
    </div>
  );
}

export default function PitchDeck() {
  const slides = [
    {
      id: "hero",
      content: (
        <div style={{ 
          minHeight: "100vh", 
          display: "flex", 
          flexDirection: "column" as const, 
          alignItems: "center", 
          justifyContent: "center",
          background: `linear-gradient(135deg, ${BRAND.green} 0%, ${BRAND.greenLight} 100%)`,
          padding: "40px 20px",
          color: BRAND.white,
          textAlign: "center" as const,
        }}>
          <div style={{ 
            width: 80, height: 80, borderRadius: 20, 
            background: "rgba(255,255,255,0.2)", 
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 24,
            backdropFilter: "blur(10px)",
          }}>
            <ClipboardList size={40} color={BRAND.white} />
          </div>
          <h1 style={{ fontSize: 42, fontWeight: 800, margin: "0 0 12px", lineHeight: 1.1 }}>
            APS Field Service
          </h1>
          <h2 style={{ fontSize: 42, fontWeight: 800, margin: "0 0 12px", lineHeight: 1.1 }}>
            Job Log System
          </h2>
          <p style={{ fontSize: 18, opacity: 0.9, maxWidth: 500, margin: "0 0 32px", lineHeight: 1.5 }}>
            A complete mobile-first job logging platform built for Absolute Pest Services
          </p>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" as const, justifyContent: "center" }}>
            <div style={{ 
              background: "rgba(255,255,255,0.15)", 
              borderRadius: 12, padding: "16px 24px",
              backdropFilter: "blur(10px)",
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <Smartphone size={20} />
              <span style={{ fontSize: 14, fontWeight: 600 }}>Mobile Employee Portal</span>
            </div>
            <div style={{ 
              background: "rgba(255,255,255,0.15)", 
              borderRadius: 12, padding: "16px 24px",
              backdropFilter: "blur(10px)",
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <Monitor size={20} />
              <span style={{ fontSize: 14, fontWeight: 600 }}>Admin Dashboard</span>
            </div>
          </div>
          <div style={{ marginTop: 48, fontSize: 14, opacity: 0.7 }}>
            Scroll down for a full walkthrough
          </div>
          <ChevronRight size={24} style={{ transform: "rotate(90deg)", marginTop: 8, opacity: 0.7, animation: "bounce 2s infinite" }} />
        </div>
      ),
    },
    {
      id: "employee-step1",
      content: (
        <div style={{ padding: "60px 20px", maxWidth: 900, margin: "0 auto" }}>
          <SectionTitle 
            icon={<Smartphone size={28} color={BRAND.green} />}
            title="Employee Mobile Portal"
            subtitle="Your team logs jobs right from their phone - fast, simple, no training needed"
          />
          
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 60, 
            flexWrap: "wrap" as const,
            justifyContent: "center",
          }}>
            <PhoneMockup>
              <div style={{ 
                background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)", 
                minHeight: 460, 
                display: "flex", 
                flexDirection: "column" as const,
                alignItems: "center", 
                justifyContent: "center",
                padding: 24,
              }}>
                <div style={{ 
                  background: BRAND.white, 
                  borderRadius: 12, 
                  padding: 24, 
                  width: "100%",
                  textAlign: "center" as const,
                }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: BRAND.dark, margin: "0 0 4px" }}>APS Field Service</h3>
                  <p style={{ fontSize: 11, color: BRAND.gray, margin: "0 0 16px" }}>Enter your 4-digit PIN</p>
                  <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 20 }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{ 
                        width: 36, height: 36, borderRadius: "50%", 
                        border: `2px solid ${i <= 2 ? BRAND.green : BRAND.border}`,
                        background: i <= 2 ? BRAND.green : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: BRAND.white, fontSize: 16, fontWeight: 700,
                      }}>
                        {i <= 2 ? "\u2022" : ""}
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                    {["1","2","3","4","5","6","7","8","9","","0","<"].map((d, i) => (
                      <div key={i} style={{ 
                        height: 36, 
                        border: d ? `1px solid ${BRAND.border}` : "none", 
                        borderRadius: 6,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 16, fontWeight: 600, color: BRAND.dark,
                      }}>
                        {d}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </PhoneMockup>

            <div style={{ flex: 1, minWidth: 280 }}>
              <div style={{ 
                background: BRAND.greenBg, 
                borderLeft: `4px solid ${BRAND.green}`,
                borderRadius: "0 8px 8px 0",
                padding: "16px 20px",
                marginBottom: 16,
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: BRAND.green, marginBottom: 4 }}>STEP 1</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: BRAND.dark }}>PIN Login</div>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {[
                  "Each employee gets their own unique 4-digit PIN",
                  "No email or password to remember - just tap and go",
                  "PIN auto-submits after 4 digits are entered",
                  "Employees see a personalized greeting after login",
                  "Session stays active so they don't need to re-enter every time",
                ].map((item, i) => (
                  <li key={i} style={{ 
                    display: "flex", gap: 10, alignItems: "flex-start",
                    padding: "8px 0", fontSize: 14, color: BRAND.dark, lineHeight: 1.4,
                  }}>
                    <CheckCircle2 size={18} color={BRAND.accent} style={{ flexShrink: 0, marginTop: 1 }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "employee-step2",
      content: (
        <div style={{ padding: "60px 20px", maxWidth: 900, margin: "0 auto", background: BRAND.lightGray }}>
          <SectionTitle 
            icon={<ClipboardList size={28} color={BRAND.green} />}
            title="Log a Job"
            subtitle="Smart dropdowns remember past entries - the more you use it, the faster it gets"
          />
          
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 60, 
            flexWrap: "wrap" as const,
            justifyContent: "center",
          }}>
            <div style={{ flex: 1, minWidth: 280, order: 2 }}>
              <div style={{ 
                background: BRAND.greenBg, 
                borderLeft: `4px solid ${BRAND.green}`,
                borderRadius: "0 8px 8px 0",
                padding: "16px 20px",
                marginBottom: 16,
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: BRAND.green, marginBottom: 4 }}>STEP 2</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: BRAND.dark }}>Submit Job Details</div>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {[
                  "Customer - Pick from previous customers or add a new one",
                  "Site Location - Cascading dropdown filtered by selected customer",
                  "Serviced Area - Automatically filtered by selected location",
                  "Work Performed - Free-text description of the service done",
                  "Job Date - Defaults to today, can backdate if needed",
                  "All three dropdowns support \"+ New\" to add entries on the fly",
                ].map((item, i) => (
                  <li key={i} style={{ 
                    display: "flex", gap: 10, alignItems: "flex-start",
                    padding: "8px 0", fontSize: 14, color: BRAND.dark, lineHeight: 1.4,
                  }}>
                    <CheckCircle2 size={18} color={BRAND.accent} style={{ flexShrink: 0, marginTop: 1 }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <PhoneMockup>
              <div style={{ padding: 16, minHeight: 460 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: BRAND.dark }}>Log Job</span>
                  <span style={{ fontSize: 11, color: BRAND.gray }}>Hi, Frank</span>
                </div>
                <div style={{ 
                  border: `1px solid ${BRAND.border}`, 
                  borderRadius: 8, 
                  padding: 14,
                }}>
                  <SelectMockup label="Customer" value="Peco Energy" highlight />
                  <SelectMockup label="Site Location" value="1200 Market St" />
                  <SelectMockup label="Serviced Area" value="Loading Dock" />
                  <InputMockup label="Work Performed" value="Applied treatment to perimeter walls and bait stations" type="textarea" />
                  <InputMockup label="Job Date" value="2026-03-05" />
                  <ButtonMockup text="Submit Job Log" primary fullWidth />
                </div>
              </div>
            </PhoneMockup>
          </div>
        </div>
      ),
    },
    {
      id: "employee-step3",
      content: (
        <div style={{ padding: "60px 20px", maxWidth: 900, margin: "0 auto" }}>
          <SectionTitle 
            icon={<CheckCircle2 size={28} color={BRAND.green} />}
            title="Confirmation & Smart Memory"
            subtitle="After submission, the system learns and remembers entries for next time"
          />
          
          <div style={{ 
            display: "flex", 
            gap: 40, 
            flexWrap: "wrap" as const,
            justifyContent: "center",
          }}>
            <PhoneMockup>
              <div style={{ 
                minHeight: 460, 
                display: "flex", 
                flexDirection: "column" as const,
                alignItems: "center", 
                justifyContent: "center",
                padding: 24,
              }}>
                <CheckCircle2 size={64} color={BRAND.accent} />
                <h3 style={{ fontSize: 18, fontWeight: 700, color: BRAND.dark, margin: "16px 0 4px" }}>Job Logged!</h3>
                <p style={{ fontSize: 13, color: BRAND.gray }}>Entry saved successfully</p>
              </div>
            </PhoneMockup>

            <PhoneMockup>
              <div style={{ padding: 16, minHeight: 460 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: BRAND.dark }}>Log Job</span>
                  <span style={{ fontSize: 11, color: BRAND.gray }}>Hi, Frank</span>
                </div>
                <div style={{ 
                  border: `1px solid ${BRAND.border}`, 
                  borderRadius: 8, 
                  padding: 14,
                }}>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: BRAND.dark, marginBottom: 4 }}>Customer</div>
                    <div style={{ 
                      border: `1.5px solid ${BRAND.border}`, 
                      borderRadius: 6, 
                      overflow: "hidden",
                    }}>
                      <div style={{ 
                        height: 36, display: "flex", alignItems: "center", padding: "0 10px",
                        fontSize: 12, color: BRAND.dark, background: BRAND.greenBg,
                      }}>
                        Peco Energy
                        <ChevronRight size={14} style={{ marginLeft: "auto", transform: "rotate(90deg)" }} color={BRAND.gray} />
                      </div>
                      <div style={{ borderTop: `1px solid ${BRAND.border}` }}>
                        {["Peco Energy", "Giant Eagle", "PNC Bank"].map((c, i) => (
                          <div key={i} style={{ 
                            padding: "8px 10px", fontSize: 11, color: BRAND.dark,
                            background: i === 0 ? BRAND.greenBg : BRAND.white,
                            borderBottom: `1px solid ${BRAND.border}`,
                          }}>
                            {c}
                          </div>
                        ))}
                        <div style={{ 
                          padding: "8px 10px", fontSize: 11, color: BRAND.greenLight, fontWeight: 600,
                          borderTop: `1px solid ${BRAND.border}`,
                        }}>
                          + New Customer
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{ 
                    background: BRAND.greenBg, borderRadius: 6, padding: 10, 
                    fontSize: 11, color: BRAND.green, lineHeight: 1.5,
                    marginTop: 8,
                  }}>
                    <strong>Smart Memory:</strong> Previously entered customers, locations, and areas automatically appear as dropdown options. The more jobs you log, the faster it becomes.
                  </div>
                </div>
              </div>
            </PhoneMockup>
          </div>
        </div>
      ),
    },
    {
      id: "employee-step4",
      content: (
        <div style={{ padding: "60px 20px", maxWidth: 900, margin: "0 auto", background: BRAND.lightGray }}>
          <SectionTitle 
            icon={<History size={28} color={BRAND.green} />}
            title="Job History"
            subtitle="Employees can review all their past submissions at any time"
          />
          
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 60, 
            flexWrap: "wrap" as const,
            justifyContent: "center",
          }}>
            <PhoneMockup>
              <div style={{ padding: 16, minHeight: 460 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: BRAND.dark, display: "block", marginBottom: 12 }}>Job History</span>
                {[
                  { customer: "Peco Energy", location: "1200 Market St", area: "Loading Dock", date: "Mar 5, 2026", work: "Applied perimeter treatment" },
                  { customer: "Giant Eagle", location: "500 Grant Ave", area: "Kitchen", date: "Mar 4, 2026", work: "Bait station inspection" },
                  { customer: "PNC Bank", location: "One PNC Plaza", area: "Basement", date: "Mar 3, 2026", work: "Rodent exclusion work" },
                ].map((log, i) => (
                  <div key={i} style={{ 
                    border: `1px solid ${BRAND.border}`, 
                    borderRadius: 8, 
                    padding: 12, 
                    marginBottom: 8,
                    background: BRAND.white,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: BRAND.dark }}>{log.customer}</span>
                      <span style={{ fontSize: 10, color: BRAND.gray }}>{log.date}</span>
                    </div>
                    <div style={{ display: "flex", gap: 4, alignItems: "center", marginBottom: 3 }}>
                      <MapPin size={10} color={BRAND.gray} />
                      <span style={{ fontSize: 10, color: BRAND.gray }}>{log.location}</span>
                    </div>
                    <div style={{ display: "flex", gap: 4, alignItems: "center", marginBottom: 3 }}>
                      <Building2 size={10} color={BRAND.gray} />
                      <span style={{ fontSize: 10, color: BRAND.gray }}>{log.area}</span>
                    </div>
                    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                      <Wrench size={10} color={BRAND.gray} />
                      <span style={{ fontSize: 10, color: BRAND.gray }}>{log.work}</span>
                    </div>
                  </div>
                ))}
              </div>
            </PhoneMockup>

            <div style={{ flex: 1, minWidth: 280 }}>
              <div style={{ 
                background: BRAND.greenBg, 
                borderLeft: `4px solid ${BRAND.green}`,
                borderRadius: "0 8px 8px 0",
                padding: "16px 20px",
                marginBottom: 16,
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: BRAND.green, marginBottom: 4 }}>STEP 3</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: BRAND.dark }}>View Job History</div>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {[
                  "Each employee sees only their own job submissions",
                  "Shows customer, location, area, and work performed",
                  "Most recent entries appear first",
                  "Quick reference if they need to recall past work",
                  "Accessible anytime from the bottom navigation bar",
                ].map((item, i) => (
                  <li key={i} style={{ 
                    display: "flex", gap: 10, alignItems: "flex-start",
                    padding: "8px 0", fontSize: 14, color: BRAND.dark, lineHeight: 1.4,
                  }}>
                    <CheckCircle2 size={18} color={BRAND.accent} style={{ flexShrink: 0, marginTop: 1 }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "employee-step5",
      content: (
        <div style={{ padding: "60px 20px", maxWidth: 900, margin: "0 auto" }}>
          <SectionTitle 
            icon={<Users size={28} color={BRAND.green} />}
            title="Team Management"
            subtitle="Managers can add, edit, and remove employees right from their phone"
          />
          
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 60, 
            flexWrap: "wrap" as const,
            justifyContent: "center",
          }}>
            <div style={{ flex: 1, minWidth: 280 }}>
              <div style={{ 
                background: BRAND.greenBg, 
                borderLeft: `4px solid ${BRAND.green}`,
                borderRadius: "0 8px 8px 0",
                padding: "16px 20px",
                marginBottom: 16,
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: BRAND.green, marginBottom: 4 }}>STEP 4</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: BRAND.dark }}>Manage Team</div>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {[
                  "Only visible to employees with manager privileges",
                  "Add new team members with a name and 4-digit PIN",
                  "Toggle employees active/inactive without deleting",
                  "Grant or revoke \"Can Manage Team\" permission",
                  "Edit PINs if someone forgets theirs",
                  "Shield icon indicates who has manager access",
                ].map((item, i) => (
                  <li key={i} style={{ 
                    display: "flex", gap: 10, alignItems: "flex-start",
                    padding: "8px 0", fontSize: 14, color: BRAND.dark, lineHeight: 1.4,
                  }}>
                    <CheckCircle2 size={18} color={BRAND.accent} style={{ flexShrink: 0, marginTop: 1 }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <PhoneMockup>
              <div style={{ padding: 16, minHeight: 460 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: BRAND.dark }}>Team Members</span>
                  <div style={{ 
                    background: BRAND.dark, color: BRAND.white, 
                    fontSize: 11, fontWeight: 600, padding: "6px 12px", borderRadius: 6,
                    display: "flex", alignItems: "center", gap: 4,
                  }}>
                    + Add
                  </div>
                </div>
                {[
                  { name: "Frank", pin: "2121", manager: true, active: true },
                  { name: "Rob", pin: "1234", manager: false, active: true },
                  { name: "Mike", pin: "5678", manager: false, active: true },
                ].map((emp, i) => (
                  <div key={i} style={{ 
                    border: `1px solid ${BRAND.border}`, 
                    borderRadius: 8, 
                    padding: 12, 
                    marginBottom: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: BRAND.white,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ 
                        width: 32, height: 32, borderRadius: "50%", 
                        background: BRAND.greenBg, 
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <Users size={14} color={BRAND.green} />
                      </div>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: BRAND.dark }}>{emp.name}</span>
                          {emp.manager && <Shield size={12} color={BRAND.green} />}
                        </div>
                        <span style={{ fontSize: 10, color: BRAND.gray }}>PIN: {emp.pin}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: 12 }}>&#9998;</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </PhoneMockup>
          </div>
        </div>
      ),
    },
    {
      id: "admin-overview",
      content: (
        <div style={{ 
          padding: "80px 20px", 
          background: `linear-gradient(135deg, #1e293b 0%, #0f172a 100%)`,
          color: BRAND.white,
          textAlign: "center" as const,
        }}>
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <Monitor size={48} color={BRAND.accent} style={{ marginBottom: 20 }} />
            <h2 style={{ fontSize: 36, fontWeight: 800, margin: "0 0 12px" }}>Admin Portal</h2>
            <p style={{ fontSize: 18, opacity: 0.8, maxWidth: 500, margin: "0 auto 40px" }}>
              Everything you need to manage field data, generate reports, and track operations from your computer
            </p>
            
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 20,
              maxWidth: 700,
              margin: "0 auto",
            }}>
              {[
                { icon: <BarChart3 size={24} />, title: "Reports", desc: "Filter and download PDF reports by customer, date, employee, location" },
                { icon: <Database size={24} />, title: "Field Data", desc: "Manage customers, locations, serviced areas, and employees" },
                { icon: <Mail size={24} />, title: "Email Alerts", desc: "Automatic email notifications when jobs are logged" },
                { icon: <FileDown size={24} />, title: "PDF Export", desc: "Professional branded reports ready to send to clients" },
                { icon: <Users size={24} />, title: "Employee Mgmt", desc: "Add/remove employees, manage PINs and permissions" },
                { icon: <ClipboardList size={24} />, title: "Job Log Editing", desc: "Edit any submitted job log - fix typos, update details" },
              ].map((feature, i) => (
                <div key={i} style={{
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: 12,
                  padding: 20,
                  border: "1px solid rgba(255,255,255,0.1)",
                  textAlign: "left" as const,
                }}>
                  <div style={{ marginBottom: 10, color: BRAND.accent }}>{feature.icon}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{feature.title}</div>
                  <div style={{ fontSize: 12, opacity: 0.7, lineHeight: 1.4 }}>{feature.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "admin-reports",
      content: (
        <div style={{ padding: "60px 20px", maxWidth: 900, margin: "0 auto" }}>
          <SectionTitle 
            icon={<BarChart3 size={28} color={BRAND.green} />}
            title="Reports & PDF Export"
            subtitle="Filter job logs by any criteria and download professional PDF reports"
          />
          
          <DesktopMockup>
            <div style={{ display: "flex" }}>
              <div style={{ 
                width: 180, 
                background: "#f8fafc", 
                borderRight: `1px solid ${BRAND.border}`,
                padding: 16,
                minHeight: 380,
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: BRAND.dark, marginBottom: 16 }}>Admin Portal</div>
                {["Clients", "Service", "Milestones", "Dashboards", "Blog", "Reports", "Field Data"].map((item, i) => (
                  <div key={i} style={{ 
                    padding: "8px 10px", 
                    fontSize: 12, 
                    borderRadius: 6,
                    marginBottom: 2,
                    color: item === "Reports" ? BRAND.white : BRAND.gray,
                    background: item === "Reports" ? BRAND.green : "transparent",
                    fontWeight: item === "Reports" ? 600 : 400,
                  }}>
                    {item}
                  </div>
                ))}
              </div>
              <div style={{ flex: 1, padding: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: BRAND.dark, margin: "0 0 16px" }}>Job Log Reports</h3>
                
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 10,
                  marginBottom: 12,
                }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: BRAND.gray, marginBottom: 4 }}>Customer</div>
                    <div style={{ height: 30, border: `1px solid ${BRAND.border}`, borderRadius: 4, display: "flex", alignItems: "center", padding: "0 8px", fontSize: 11 }}>All Customers</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: BRAND.gray, marginBottom: 4 }}>Date From</div>
                    <div style={{ height: 30, border: `1px solid ${BRAND.border}`, borderRadius: 4, display: "flex", alignItems: "center", padding: "0 8px", fontSize: 11 }}>03/01/2026</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: BRAND.gray, marginBottom: 4 }}>Date To</div>
                    <div style={{ height: 30, border: `1px solid ${BRAND.border}`, borderRadius: 4, display: "flex", alignItems: "center", padding: "0 8px", fontSize: 11 }}>03/31/2026</div>
                  </div>
                </div>

                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 10,
                  marginBottom: 16,
                }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: BRAND.gray, marginBottom: 4 }}>Employee</div>
                    <div style={{ height: 30, border: `1px solid ${BRAND.border}`, borderRadius: 4, display: "flex", alignItems: "center", padding: "0 8px", fontSize: 11 }}>All Employees</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: BRAND.gray, marginBottom: 4 }}>Location</div>
                    <div style={{ height: 30, border: `1px solid ${BRAND.border}`, borderRadius: 4, display: "flex", alignItems: "center", padding: "0 8px", fontSize: 11 }}>All Locations</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: BRAND.gray, marginBottom: 4 }}>Serviced Area</div>
                    <div style={{ height: 30, border: `1px solid ${BRAND.border}`, borderRadius: 4, display: "flex", alignItems: "center", padding: "0 8px", fontSize: 11 }}>All Areas</div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                  <div style={{ 
                    padding: "6px 16px", background: BRAND.green, color: BRAND.white, 
                    borderRadius: 4, fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 
                  }}>
                    Search
                  </div>
                  <div style={{ 
                    padding: "6px 16px", background: BRAND.greenBg, color: BRAND.green, 
                    borderRadius: 4, fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 
                  }}>
                    <FileDown size={12} /> Download PDF
                  </div>
                </div>

                <div style={{ border: `1px solid ${BRAND.border}`, borderRadius: 6, overflow: "hidden" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 0.8fr 1fr 0.8fr 1.5fr", background: "#f8fafc", borderBottom: `1px solid ${BRAND.border}` }}>
                    {["Date", "Employee", "Location", "Area", "Work Performed"].map(h => (
                      <div key={h} style={{ padding: "8px 10px", fontSize: 10, fontWeight: 700, color: BRAND.gray }}>{h}</div>
                    ))}
                  </div>
                  {[
                    ["03/05", "Frank", "1200 Market", "Loading Dock", "Perimeter treatment applied"],
                    ["03/04", "Frank", "500 Grant", "Kitchen", "Bait station inspection"],
                    ["03/03", "Rob", "One PNC Plaza", "Basement", "Rodent exclusion work"],
                  ].map((row, i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 0.8fr 1fr 0.8fr 1.5fr", borderBottom: i < 2 ? `1px solid ${BRAND.border}` : "none" }}>
                      {row.map((cell, j) => (
                        <div key={j} style={{ padding: "8px 10px", fontSize: 10, color: BRAND.dark }}>{cell}</div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DesktopMockup>

          <div style={{ 
            maxWidth: 700, margin: "24px auto 0",
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16,
          }}>
            {[
              "Filter by customer, employee, date range, location, or serviced area",
              "Search results display in a sortable data table",
              "Download professional branded PDF with company header",
              "PDF includes summary stats and detailed job entries",
            ].map((item, i) => (
              <div key={i} style={{ 
                display: "flex", gap: 8, alignItems: "flex-start",
                fontSize: 13, color: BRAND.dark, lineHeight: 1.4,
              }}>
                <CheckCircle2 size={16} color={BRAND.accent} style={{ flexShrink: 0, marginTop: 2 }} />
                {item}
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "admin-fielddata",
      content: (
        <div style={{ padding: "60px 20px", maxWidth: 900, margin: "0 auto", background: BRAND.lightGray }}>
          <SectionTitle 
            icon={<Database size={28} color={BRAND.green} />}
            title="Field Data Management"
            subtitle="Full control over customers, locations, areas, employees, and job log entries"
          />
          
          <DesktopMockup>
            <div style={{ display: "flex" }}>
              <div style={{ 
                width: 180, 
                background: "#f8fafc", 
                borderRight: `1px solid ${BRAND.border}`,
                padding: 16,
                minHeight: 380,
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: BRAND.dark, marginBottom: 16 }}>Admin Portal</div>
                {["Clients", "Service", "Milestones", "Dashboards", "Blog", "Reports", "Field Data"].map((item, i) => (
                  <div key={i} style={{ 
                    padding: "8px 10px", 
                    fontSize: 12, 
                    borderRadius: 6,
                    marginBottom: 2,
                    color: item === "Field Data" ? BRAND.white : BRAND.gray,
                    background: item === "Field Data" ? BRAND.green : "transparent",
                    fontWeight: item === "Field Data" ? 600 : 400,
                  }}>
                    {item}
                  </div>
                ))}
              </div>
              <div style={{ flex: 1, padding: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: BRAND.dark, margin: "0 0 16px" }}>Field Data Management</h3>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                  {[
                    { title: "Employees", count: "3 active", items: ["Frank (Manager)", "Rob", "Mike"] },
                    { title: "Customers", count: "5 total", items: ["Peco Energy", "Giant Eagle", "PNC Bank"] },
                  ].map((section, i) => (
                    <div key={i} style={{ border: `1px solid ${BRAND.border}`, borderRadius: 8, padding: 12, background: BRAND.white }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: BRAND.dark }}>{section.title}</div>
                        <div style={{ fontSize: 9, color: BRAND.gray }}>{section.count}</div>
                      </div>
                      {section.items.map((item, j) => (
                        <div key={j} style={{ fontSize: 10, color: BRAND.gray, padding: "3px 0", borderTop: j > 0 ? `1px solid ${BRAND.lightGray}` : "none" }}>{item}</div>
                      ))}
                    </div>
                  ))}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                  {[
                    { title: "Site Locations", count: "8 total", items: ["1200 Market St", "500 Grant Ave", "One PNC Plaza"] },
                    { title: "Serviced Areas", count: "12 total", items: ["Loading Dock", "Kitchen", "Basement"] },
                  ].map((section, i) => (
                    <div key={i} style={{ border: `1px solid ${BRAND.border}`, borderRadius: 8, padding: 12, background: BRAND.white }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: BRAND.dark }}>{section.title}</div>
                        <div style={{ fontSize: 9, color: BRAND.gray }}>{section.count}</div>
                      </div>
                      {section.items.map((item, j) => (
                        <div key={j} style={{ fontSize: 10, color: BRAND.gray, padding: "3px 0", borderTop: j > 0 ? `1px solid ${BRAND.lightGray}` : "none" }}>{item}</div>
                      ))}
                    </div>
                  ))}
                </div>

                <div style={{ border: `1px solid ${BRAND.border}`, borderRadius: 8, padding: 12, background: BRAND.white }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: BRAND.dark }}>Recent Job Log Submissions</div>
                  </div>
                  <div style={{ fontSize: 10, color: BRAND.gray }}>
                    <div style={{ padding: "4px 0" }}>Frank - Peco Energy - 1200 Market St - 03/05/26 <span style={{ color: BRAND.greenLight, cursor: "pointer" }}>Edit</span></div>
                    <div style={{ padding: "4px 0", borderTop: `1px solid ${BRAND.lightGray}` }}>Frank - Giant Eagle - 500 Grant Ave - 03/04/26 <span style={{ color: BRAND.greenLight, cursor: "pointer" }}>Edit</span></div>
                    <div style={{ padding: "4px 0", borderTop: `1px solid ${BRAND.lightGray}` }}>Rob - PNC Bank - One PNC Plaza - 03/03/26 <span style={{ color: BRAND.greenLight, cursor: "pointer" }}>Edit</span></div>
                  </div>
                </div>
              </div>
            </div>
          </DesktopMockup>

          <div style={{ 
            maxWidth: 700, margin: "24px auto 0",
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16,
          }}>
            {[
              "Add, edit, and delete employees with PIN management",
              "Manage customers separately from website form submissions",
              "Create and organize site locations linked to customers",
              "Define serviced areas for each location",
              "Edit any submitted job log inline - fix customer, location, area, or work details",
              "Full CRUD operations on all field data tables",
            ].map((item, i) => (
              <div key={i} style={{ 
                display: "flex", gap: 8, alignItems: "flex-start",
                fontSize: 13, color: BRAND.dark, lineHeight: 1.4,
              }}>
                <CheckCircle2 size={16} color={BRAND.accent} style={{ flexShrink: 0, marginTop: 2 }} />
                {item}
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "email-notifications",
      content: (
        <div style={{ padding: "60px 20px", maxWidth: 900, margin: "0 auto" }}>
          <SectionTitle 
            icon={<Mail size={28} color={BRAND.green} />}
            title="Email Notifications"
            subtitle="Get notified instantly when your team logs a job"
          />
          
          <div style={{ maxWidth: 500, margin: "0 auto" }}>
            <div style={{ 
              border: `1px solid ${BRAND.border}`, 
              borderRadius: 12, 
              overflow: "hidden",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            }}>
              <div style={{ 
                background: BRAND.lightGray, 
                padding: "12px 20px", 
                borderBottom: `1px solid ${BRAND.border}`,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}>
                <Mail size={16} color={BRAND.gray} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: BRAND.dark }}>New Job Log Submitted</div>
                  <div style={{ fontSize: 10, color: BRAND.gray }}>from: noreply@absolutepestservices.com</div>
                </div>
              </div>
              <div style={{ padding: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: BRAND.dark, marginBottom: 12 }}>
                  New Job Log Entry
                </div>
                <div style={{ fontSize: 12, color: BRAND.gray, lineHeight: 2 }}>
                  <div><strong>Employee:</strong> Frank</div>
                  <div><strong>Customer:</strong> Peco Energy</div>
                  <div><strong>Site Location:</strong> 1200 Market St</div>
                  <div><strong>Serviced Area:</strong> Loading Dock</div>
                  <div><strong>Work Performed:</strong> Applied perimeter treatment to loading dock area, checked and refilled bait stations</div>
                  <div><strong>Job Date:</strong> March 5, 2026</div>
                </div>
              </div>
            </div>

            <div style={{ 
              marginTop: 20, 
              background: BRAND.greenBg, 
              borderRadius: 8, 
              padding: 16,
              fontSize: 13,
              color: BRAND.dark,
              lineHeight: 1.6,
            }}>
              <strong>Recipients:</strong> Email notifications are sent automatically to Rob, Mike, and rmitch21 every time a job log is submitted. No action needed - it just works.
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "quickref",
      content: (
        <div style={{ padding: "60px 20px", maxWidth: 900, margin: "0 auto", background: BRAND.lightGray }}>
          <SectionTitle 
            icon={<Shield size={28} color={BRAND.green} />}
            title="Quick Reference"
            subtitle="Everything you need to get started"
          />
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, maxWidth: 700, margin: "0 auto" }}>
            <div style={{ background: BRAND.white, borderRadius: 12, padding: 24, border: `1px solid ${BRAND.border}` }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: BRAND.dark, margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>
                <Smartphone size={18} color={BRAND.green} /> Employee Portal
              </h3>
              <div style={{ fontSize: 13, color: BRAND.dark, lineHeight: 2 }}>
                <div><strong>URL:</strong> absolutepestservices.com<strong>/field</strong></div>
                <div><strong>Login:</strong> 4-digit PIN</div>
                <div><strong>Features:</strong></div>
                <ul style={{ margin: "4px 0 0", paddingLeft: 20, lineHeight: 2 }}>
                  <li>Log jobs with smart dropdowns</li>
                  <li>View your job history</li>
                  <li>Manage team (managers only)</li>
                </ul>
              </div>
            </div>
            
            <div style={{ background: BRAND.white, borderRadius: 12, padding: 24, border: `1px solid ${BRAND.border}` }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: BRAND.dark, margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>
                <Monitor size={18} color={BRAND.green} /> Admin Portal
              </h3>
              <div style={{ fontSize: 13, color: BRAND.dark, lineHeight: 2 }}>
                <div><strong>URL:</strong> absolutepestservices.com<strong>/admin</strong></div>
                <div><strong>Login:</strong> rob@absolutepestservices.com</div>
                <div><strong>Key Pages:</strong></div>
                <ul style={{ margin: "4px 0 0", paddingLeft: 20, lineHeight: 2 }}>
                  <li><strong>Reports</strong> - Filter & download PDFs</li>
                  <li><strong>Field Data</strong> - Manage all field data</li>
                </ul>
              </div>
            </div>
          </div>

          <div style={{ 
            maxWidth: 700, 
            margin: "30px auto 0", 
            background: BRAND.white, 
            borderRadius: 12, 
            padding: 24, 
            border: `1px solid ${BRAND.border}` 
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: BRAND.dark, margin: "0 0 16px" }}>How the Smart Dropdowns Work</h3>
            <div style={{ fontSize: 13, color: BRAND.dark, lineHeight: 1.8 }}>
              <p style={{ margin: "0 0 12px" }}>
                The job log form uses <strong>cascading smart dropdowns</strong> that learn from past entries:
              </p>
              <ol style={{ paddingLeft: 20, margin: 0 }}>
                <li style={{ marginBottom: 8 }}>
                  <strong>Customer</strong> - Shows all previously used customers. Pick one or tap "+ New Customer" to type a new name.
                </li>
                <li style={{ marginBottom: 8 }}>
                  <strong>Site Location</strong> - Filters to show only locations used for the selected customer. Tap "+ New Site Location" to add one.
                </li>
                <li style={{ marginBottom: 8 }}>
                  <strong>Serviced Area</strong> - Filters to show only areas used at the selected location. Tap "+ New Serviced Area" to add one.
                </li>
              </ol>
              <p style={{ margin: "12px 0 0", color: BRAND.gray }}>
                The admin can also pre-load customers, locations, and areas from the Field Data page so they appear as options immediately.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "footer",
      content: (
        <div style={{ 
          padding: "60px 20px", 
          background: BRAND.dark,
          color: BRAND.white,
          textAlign: "center" as const,
        }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 8px" }}>Ready to Get Started</h2>
          <p style={{ fontSize: 16, opacity: 0.7, margin: "0 0 32px" }}>
            Your team can start logging jobs right now
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" as const }}>
            <a 
              href="/field" 
              style={{ 
                background: BRAND.accent, color: BRAND.dark,
                padding: "14px 32px", borderRadius: 8, 
                fontSize: 15, fontWeight: 700, textDecoration: "none",
                display: "flex", alignItems: "center", gap: 8,
              }}
            >
              <Smartphone size={18} /> Open Employee Portal
            </a>
            <a 
              href="/admin" 
              style={{ 
                background: "rgba(255,255,255,0.1)", color: BRAND.white,
                padding: "14px 32px", borderRadius: 8, 
                fontSize: 15, fontWeight: 700, textDecoration: "none",
                border: "1px solid rgba(255,255,255,0.2)",
                display: "flex", alignItems: "center", gap: 8,
              }}
            >
              <Monitor size={18} /> Open Admin Portal
            </a>
          </div>
          <div style={{ marginTop: 48, fontSize: 12, opacity: 0.4 }}>
            Absolute Pest Services &middot; Field Service Job Log System
          </div>
        </div>
      ),
    },
  ];

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {slides.map((slide) => (
        <div key={slide.id}>
          {slide.content}
        </div>
      ))}
    </div>
  );
}
