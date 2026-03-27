import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, Search, Menu, X, LogOut,
  ChevronRight, GraduationCap, IndianRupee, Clock,
  CheckCircle2, AlertCircle, Eye, Edit3, Save, XCircle
} from "lucide-react";

const API = "http://localhost:5000/api";

interface Student {
  applicationNumber: string;
  studentName: string;
  studentPhone: string;
  dateOfBirth: string;
  parentName: string;
  parentPhone: string;
  parentOccupation: string;
  existingSchool: string;
  busRequired: string;
  address: string;
  status: string;
  fees: {
    total: number;
    paid: number;
    pending: number;
  };
  submittedAt: string;
}

interface Stats {
  totalStudents: number;
  pending: number;
  accepted: number;
  rejected: number;
  totalFeesCollected: number;
}

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<Student | null>(null);
  const [searchError, setSearchError] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  // Student Detail Modal
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Fees Modal - FIXED
  const [showFeesModal, setShowFeesModal] = useState(false);
  const [feesStudent, setFeesStudent] = useState<Student | null>(null);
  const [feesForm, setFeesForm] = useState({ feesTotal: "", feesPaid: "", additionalPayment: "" });
  const [feesLoading, setFeesLoading] = useState(false);
  const [feesSuccess, setFeesSuccess] = useState("");
  const [isPayingRemaining, setIsPayingRemaining] = useState(false);

  // Status Update
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/admission`);
      const data = await res.json();
      if (data.success) {
        const students = data.data;
        setAllStudents(students);
        calculateStats(students);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (students: any[]) => {
    const totalFeesCollected = students.reduce(
      (sum: number, s: any) => sum + parseFloat(s.fees?.paid || s.fees_paid || 0), 0
    );
    setStats({
      totalStudents: students.length,
      pending: students.filter(s => s.status === "pending").length,
      accepted: students.filter(s => s.status === "accepted").length,
      rejected: students.filter(s => s.status === "rejected").length,
      totalFeesCollected,
    });
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    setSearchError("");
    setSearchResult(null);

    try {
      const res = await fetch(`${API}/admission/search/${searchQuery.trim()}`);
      const data = await res.json();
      if (data.success) {
        setSearchResult(data.data);
      } else {
        setSearchError("No student found with this application number.");
      }
    } catch {
      setSearchError("Server error. Please try again.");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleStatusUpdate = async (studentId: string, newStatus: string) => {
    setStatusLoading(true);
    try {
      const student = allStudents.find(
        (s: any) => s.application_number === studentId
      ) as any;
      if (!student) return;

      const res = await fetch(`${API}/admission/${student.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        // Refresh all data to sync state
        await fetchAll();
        
        // If search result exists, refresh it too
        if (searchResult?.applicationNumber === studentId) {
          const updated = await fetch(`${API}/admission/search/${studentId}`);
          const updatedData = await updated.json();
          if (updatedData.success) setSearchResult(updatedData.data);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setStatusLoading(false);
    }
  };

  // FIXED: Open fees modal with proper existing values
  const openFeesModal = (student: any) => {
    setFeesStudent(student);
    const currentTotal = student.fees?.total || student.fees_total || 0;
    const currentPaid = student.fees?.paid || student.fees_paid || 0;
    const currentPending = student.fees?.pending || student.fees_pending || 0;

    // Check if this is initial setup or paying remaining
    const hasExistingFees = currentTotal > 0;
    
    setFeesForm({
      feesTotal: currentTotal.toString(),
      feesPaid: currentPaid.toString(),
      additionalPayment: currentPending > 0 ? currentPending.toString() : ""
    });
    
    setIsPayingRemaining(hasExistingFees && currentPending > 0);
    setFeesSuccess("");
    setShowFeesModal(true);
  };

  // FIXED: Handle fees update with proper logic
  const handleFeesUpdate = async () => {
    if (!feesStudent) return;
    setFeesLoading(true);
    setFeesSuccess("");

    try {
      const student = allStudents.find(
        (s: any) =>
          s.application_number ===
          (feesStudent.applicationNumber || (feesStudent as any).application_number)
      ) as any;
      if (!student) return;

      let finalTotal = parseFloat(feesForm.feesTotal);
      let finalPaid = parseFloat(feesForm.feesPaid);

      // If paying remaining fees, add to existing paid amount
      if (isPayingRemaining && feesForm.additionalPayment) {
        finalPaid = parseFloat(feesForm.feesPaid) + parseFloat(feesForm.additionalPayment);
      }

      const res = await fetch(`${API}/admission/${student.id}/fees`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feesTotal: finalTotal,
          feesPaid: finalPaid,
        }),
      });
      
      const data = await res.json();
      if (data.success) {
        const pendingAmount = finalTotal - finalPaid;
        
        if (pendingAmount === 0) {
          setFeesSuccess("✅ Fees Paid Successfully!");
          
          // Auto-update status to accepted if fully paid
          await handleStatusUpdate(
            student.application_number,
            "accepted"
          );
        } else {
          setFeesSuccess("Fees updated successfully!");
        }

        // Refresh all data to sync state
        await fetchAll();

        // Close modal after success
        setTimeout(() => {
          setShowFeesModal(false);
          setFeesSuccess("");
          setIsPayingRemaining(false);
        }, 1500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFeesLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted": return "text-emerald-700 bg-emerald-50 border-emerald-200";
      case "rejected": return "text-red-700 bg-red-50 border-red-200";
      case "reviewed": return "text-blue-700 bg-blue-50 border-blue-200";
      default: return "text-amber-700 bg-amber-50 border-amber-200";
    }
  };

  const formatDate = (date: string) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric"
    });
  };

  const formatCurrency = (amount: number) => {
    return `₹${parseFloat(amount as any || 0).toLocaleString("en-IN")}`;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f9f7f4]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-maroon border-t-transparent rounded-full animate-spin" />
        <p className="text-maroon font-medium font-serif animate-pulse">
          Loading Admin Dashboard...
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f9f7f4] flex overflow-hidden">

      {/* ── Sidebar ── */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? "270px" : "76px" }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="bg-maroon flex flex-col z-30 h-screen sticky top-0 shadow-xl overflow-hidden"
      >
        {/* Logo */}
        <div className="p-5 flex items-center justify-between border-b border-white/10">
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center gap-2.5"
            >
              <div className="w-9 h-9 rounded-xl bg-gold flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-serif font-bold text-white text-sm leading-tight">
                  TLS Admin
                </p>
                <p className="text-white/50 text-[10px]">Management Portal</p>
              </div>
            </motion.div>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/70"
          >
            {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-6 space-y-1.5">
          {[
            { id: "overview", label: "Overview", icon: LayoutDashboard },
            { id: "students", label: "All Students", icon: Users },
            { id: "search", label: "Search Student", icon: Search },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-white text-maroon shadow-lg"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <tab.icon className="w-5 h-5 shrink-0" />
              {isSidebarOpen && (
                <>
                  <span className="text-sm">{tab.label}</span>
                  {activeTab === tab.id && (
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  )}
                </>
              )}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-white/10">
          <button className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-white/60 hover:bg-white/10 hover:text-white transition-colors">
            <LogOut className="w-5 h-5 shrink-0" />
            {isSidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* ── Main Content ── */}
      <main className="flex-1 overflow-y-auto">

        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-100 px-8 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gold uppercase tracking-widest">
              Admin Portal
            </p>
            <h1 className="text-2xl font-serif font-bold text-maroon">
              The Learning School
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-800">Administrator</p>
              <p className="text-xs text-gray-400">Full Access</p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-maroon flex items-center justify-center text-white font-bold text-lg font-serif">
              A
            </div>
          </div>
        </header>

        <div className="p-8">
          <AnimatePresence mode="wait">

            {/* ── OVERVIEW TAB ── */}
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-2xl font-serif font-bold text-gray-900">
                    Dashboard Overview
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    Admission statistics at a glance
                  </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    {
                      label: "Total Applications",
                      value: stats?.totalStudents || 0,
                      icon: GraduationCap,
                      color: "bg-maroon",
                      light: "bg-maroon/5",
                      text: "text-maroon"
                    },
                    {
                      label: "Pending Review",
                      value: stats?.pending || 0,
                      icon: Clock,
                      color: "bg-amber-500",
                      light: "bg-amber-50",
                      text: "text-amber-600"
                    },
                    {
                      label: "Accepted",
                      value: stats?.accepted || 0,
                      icon: CheckCircle2,
                      color: "bg-emerald-500",
                      light: "bg-emerald-50",
                      text: "text-emerald-600"
                    },
                    {
                      label: "Fees Collected",
                      value: formatCurrency(stats?.totalFeesCollected || 0),
                      icon: IndianRupee,
                      color: "bg-gold",
                      light: "bg-gold/5",
                      text: "text-gold-dark"
                    },
                  ].map((s, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-gray-500 text-sm font-medium mb-1">
                            {s.label}
                          </p>
                          <h3 className={`text-3xl font-bold font-serif ${s.text}`}>
                            {s.value}
                          </h3>
                        </div>
                        <div className={`${s.color} p-3 rounded-2xl`}>
                          <s.icon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Recent Applications */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
                    <h3 className="font-serif font-bold text-gray-900 text-lg">
                      Recent Applications
                    </h3>
                    <button
                      onClick={() => setActiveTab("students")}
                      className="text-sm text-maroon font-semibold hover:underline"
                    >
                      View All →
                    </button>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {allStudents.slice(0, 5).map((s: any, i) => (
                      <motion.div
                        key={s.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-maroon/10 flex items-center justify-center font-bold text-maroon font-serif">
                            {s.student_name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">
                              {s.student_name}
                            </p>
                            <p className="text-xs text-gray-400 font-mono">
                              {s.application_number}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusColor(s.status)}`}>
                            {s.status}
                          </span>
                          <button
                            onClick={() => {
                              setSelectedStudent(s);
                              setShowDetailModal(true);
                            }}
                            className="p-1.5 hover:bg-maroon/5 rounded-lg transition-colors text-maroon"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── ALL STUDENTS TAB ── */}
            {activeTab === "students" && (
              <motion.div
                key="students"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-serif font-bold text-gray-900">
                    All Students
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    {allStudents.length} total applications
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50/80 border-b border-gray-100">
                        {["App No.", "Student", "Parent", "Bus", "Status", "Fees", "Actions"].map(h => (
                          <th key={h} className="px-6 py-4 text-gray-400 font-semibold text-xs uppercase tracking-wider">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {allStudents.map((s: any) => {
                        const feesPending = parseFloat(s.fees_total || 0) - parseFloat(s.fees_paid || 0);
                        return (
                          <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <span className="font-mono text-xs font-bold text-maroon bg-maroon/5 px-2 py-1 rounded-lg">
                                {s.application_number}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <p className="font-semibold text-gray-900 text-sm">
                                  {s.student_name}
                                </p>
                                <p className="text-xs text-gray-400">{s.student_phone}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <p className="text-sm text-gray-700">{s.parent_name}</p>
                                <p className="text-xs text-gray-400">{s.parent_phone}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                s.bus_required === "yes"
                                  ? "bg-blue-50 text-blue-600"
                                  : "bg-gray-50 text-gray-500"
                              }`}>
                                {s.bus_required === "yes" ? "Yes" : "No"}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <select
                                value={s.status}
                                onChange={(e) =>
                                  handleStatusUpdate(s.application_number, e.target.value)
                                }
                                disabled={statusLoading}
                                className={`text-xs font-bold px-3 py-1.5 rounded-full border cursor-pointer focus:outline-none ${getStatusColor(s.status)}`}
                              >
                                <option value="pending">Pending</option>
                                <option value="reviewed">Reviewed</option>
                                <option value="accepted">Accepted</option>
                                <option value="rejected">Rejected</option>
                              </select>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <p className="text-xs text-gray-400">
                                  Paid: <span className="text-emerald-600 font-bold">
                                    {formatCurrency(s.fees_paid)}
                                  </span>
                                </p>
                                <p className="text-xs text-gray-400">
                                  Due: <span className={`font-bold ${feesPending > 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                                    {formatCurrency(feesPending)}
                                  </span>
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedStudent(s);
                                    setShowDetailModal(true);
                                  }}
                                  className="p-1.5 hover:bg-maroon/5 rounded-lg transition-colors text-maroon"
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => openFeesModal(s)}
                                  className="p-1.5 hover:bg-gold/10 rounded-lg transition-colors text-gold-dark"
                                  title="Update Fees"
                                >
                                  <IndianRupee className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {allStudents.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-6 py-20 text-center">
                            <GraduationCap className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                            <p className="text-gray-400 text-sm">No applications yet</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* ── SEARCH TAB ── FIXED: Removed Update Fees button */}
            {activeTab === "search" && (
              <motion.div
                key="search"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 max-w-3xl"
              >
                <div>
                  <h2 className="text-2xl font-serif font-bold text-gray-900">
                    Search Student
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    Enter application number to find student
                  </p>
                </div>

                {/* Search Box */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      placeholder="Enter Application Number (e.g. APP-5001)"
                      className="input-field flex-1 font-mono"
                    />
                    <button
                      onClick={handleSearch}
                      disabled={searchLoading}
                      className="btn-primary flex items-center gap-2 px-6"
                    >
                      {searchLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Search className="w-4 h-4" />
                      )}
                      Search
                    </button>
                  </div>

                  {searchError && (
                    <div className="mt-4 flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {searchError}
                    </div>
                  )}
                </div>

                {/* Search Result */}
                {searchResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                  >
                    {/* Result Header */}
                    <div className="bg-maroon px-6 py-5 flex items-center justify-between">
                      <div>
                        <p className="text-white/60 text-xs font-medium uppercase tracking-widest">
                          Application Found
                        </p>
                        <h3 className="font-serif font-bold text-white text-xl mt-0.5">
                          {searchResult.studentName}
                        </h3>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-bold text-gold text-lg">
                          {searchResult.applicationNumber}
                        </p>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border mt-1 inline-block ${getStatusColor(searchResult.status)}`}>
                          {searchResult.status}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 space-y-6">
                      {/* Student Info */}
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                          Student Details
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { label: "Phone", value: searchResult.studentPhone },
                            { label: "Date of Birth", value: formatDate(searchResult.dateOfBirth) },
                            { label: "Existing School", value: searchResult.existingSchool },
                            { label: "Bus Required", value: searchResult.busRequired === "yes" ? "Yes" : "No" },
                            { label: "Address", value: searchResult.address },
                            { label: "Applied On", value: formatDate(searchResult.submittedAt) },
                          ].map(item => (
                            <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                              <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                              <p className="text-sm font-semibold text-gray-800">{item.value}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Parent Info */}
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                          Parent Details
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { label: "Parent Name", value: searchResult.parentName },
                            { label: "Parent Phone", value: searchResult.parentPhone },
                            { label: "Occupation", value: searchResult.parentOccupation },
                          ].map(item => (
                            <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                              <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                              <p className="text-sm font-semibold text-gray-800">{item.value}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Fees Section - SYNCED */}
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                          Fees Status
                        </p>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-gray-50 rounded-xl p-4 text-center">
                            <p className="text-xs text-gray-400 mb-1">Total Fees</p>
                            <p className="text-xl font-bold font-serif text-gray-800">
                              {formatCurrency(searchResult.fees?.total || 0)}
                            </p>
                          </div>
                          <div className="bg-emerald-50 rounded-xl p-4 text-center">
                            <p className="text-xs text-emerald-500 mb-1">Paid</p>
                            <p className="text-xl font-bold font-serif text-emerald-600">
                              {formatCurrency(searchResult.fees?.paid || 0)}
                            </p>
                          </div>
                          <div className={`rounded-xl p-4 text-center ${
                            (searchResult.fees?.pending || 0) > 0 ? 'bg-red-50' : 'bg-emerald-50'
                          }`}>
                            <p className={`text-xs mb-1 ${
                              (searchResult.fees?.pending || 0) > 0 ? 'text-red-400' : 'text-emerald-500'
                            }`}>Pending</p>
                            <p className={`text-xl font-bold font-serif ${
                              (searchResult.fees?.pending || 0) > 0 ? 'text-red-500' : 'text-emerald-600'
                            }`}>
                              {formatCurrency(searchResult.fees?.pending || 0)}
                            </p>
                          </div>
                        </div>
                        {(searchResult.fees?.pending || 0) === 0 && searchResult.status === "accepted" && (
                          <div className="mt-3 flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600 text-sm font-medium">
                            <CheckCircle2 className="w-4 h-4" />
                            ✅ Fees Paid Successfully
                          </div>
                        )}
                      </div>

                      {/* REMOVED: Update Fees button - only in All Students section */}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      {/* ── Student Detail Modal ── */}
      <AnimatePresence>
        {showDetailModal && selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowDetailModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="bg-maroon px-6 py-5 rounded-t-3xl flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-xs uppercase tracking-widest">Student Profile</p>
                  <h3 className="font-serif font-bold text-white text-xl">
                    {(selectedStudent as any).student_name}
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-gold font-bold text-sm">
                    {(selectedStudent as any).application_number}
                  </span>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="p-2 hover:bg-white/10 rounded-xl text-white/70"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {[
                  { title: "Student Info", fields: [
                    ["Phone", (selectedStudent as any).student_phone],
                    ["Date of Birth", formatDate((selectedStudent as any).date_of_birth)],
                    ["Existing School", (selectedStudent as any).existing_school],
                    ["Bus Required", (selectedStudent as any).bus_required === "yes" ? "Yes" : "No"],
                    ["Address", (selectedStudent as any).address],
                  ]},
                  { title: "Parent Info", fields: [
                    ["Name", (selectedStudent as any).parent_name],
                    ["Phone", (selectedStudent as any).parent_phone],
                    ["Occupation", (selectedStudent as any).parent_occupation],
                  ]},
                ].map(section => (
                  <div key={section.title}>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                      {section.title}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {section.fields.map(([label, value]) => (
                        <div key={label} className="bg-gray-50 rounded-xl p-3">
                          <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                          <p className="text-sm font-semibold text-gray-800">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Fees */}
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                    Fees Status
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-400">Total</p>
                      <p className="font-bold text-gray-800 font-serif">
                        {formatCurrency((selectedStudent as any).fees_total)}
                      </p>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-emerald-500">Paid</p>
                      <p className="font-bold text-emerald-600 font-serif">
                        {formatCurrency((selectedStudent as any).fees_paid)}
                      </p>
                    </div>
                    <div className="bg-red-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-red-400">Pending</p>
                      <p className="font-bold text-red-500 font-serif">
                        {formatCurrency((selectedStudent as any).fees_pending)}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    openFeesModal(selectedStudent);
                  }}
                  className="btn-gold w-full flex items-center justify-center gap-2 text-sm"
                >
                  <Edit3 className="w-4 h-4" /> Update Fees
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── FIXED Fees Modal with "Pay Remaining" Option ── */}
      <AnimatePresence>
        {showFeesModal && feesStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowFeesModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-serif font-bold text-gray-900 text-xl">
                    {isPayingRemaining ? "Pay Remaining Fees" : "Update Fees"}
                  </h3>
                  <p className="text-gray-400 text-sm mt-0.5">
                    {(feesStudent as any).student_name || feesStudent.studentName}
                  </p>
                </div>
                <button
                  onClick={() => setShowFeesModal(false)}
                  className="p-2 hover:bg-gray-50 rounded-xl text-gray-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Show existing fees as readonly when paying remaining */}
                {isPayingRemaining ? (
                  <>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">Total Fees:</span>
                        <span className="font-bold text-gray-900">
                          {formatCurrency(parseFloat(feesForm.feesTotal))}
                        </span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-emerald-600">Already Paid:</span>
                        <span className="font-bold text-emerald-600">
                          {formatCurrency(parseFloat(feesForm.feesPaid))}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray-200">
                        <span className="text-sm font-semibold text-red-600">Remaining:</span>
                        <span className="font-bold text-red-600">
                          {formatCurrency(
                            parseFloat(feesForm.feesTotal) - parseFloat(feesForm.feesPaid)
                          )}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Payment Amount (₹)
                      </label>
                      <input
                        type="number"
                        value={feesForm.additionalPayment}
                        onChange={(e) =>
                          setFeesForm({ ...feesForm, additionalPayment: e.target.value })
                        }
                        placeholder={`Max: ${parseFloat(feesForm.feesTotal) - parseFloat(feesForm.feesPaid)}`}
                        className="input-field"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Total Fees (₹)
                      </label>
                      <input
                        type="number"
                        value={feesForm.feesTotal}
                        onChange={(e) =>
                          setFeesForm({ ...feesForm, feesTotal: e.target.value })
                        }
                        placeholder="e.g. 50000"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Amount Paid (₹)
                      </label>
                      <input
                        type="number"
                        value={feesForm.feesPaid}
                        onChange={(e) =>
                          setFeesForm({ ...feesForm, feesPaid: e.target.value })
                        }
                        placeholder="e.g. 20000"
                        className="input-field"
                      />
                    </div>
                  </>
                )}

                {/* Preview */}
                {feesForm.feesTotal && (isPayingRemaining ? feesForm.additionalPayment : feesForm.feesPaid) && (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wider">
                      Preview
                    </p>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">
                        {isPayingRemaining ? "New" : ""} Pending Amount:
                      </span>
                      <span className={`font-bold ${
                        isPayingRemaining 
                          ? (parseFloat(feesForm.feesTotal) - parseFloat(feesForm.feesPaid) - parseFloat(feesForm.additionalPayment)) === 0
                            ? 'text-emerald-600'
                            : 'text-red-500'
                          : (parseFloat(feesForm.feesTotal) - parseFloat(feesForm.feesPaid)) === 0
                            ? 'text-emerald-600'
                            : 'text-red-500'
                      }`}>
                        {isPayingRemaining 
                          ? formatCurrency(
                              parseFloat(feesForm.feesTotal) - parseFloat(feesForm.feesPaid) - parseFloat(feesForm.additionalPayment)
                            )
                          : formatCurrency(
                              parseFloat(feesForm.feesTotal) - parseFloat(feesForm.feesPaid)
                            )
                        }
                      </span>
                    </div>
                  </div>
                )}

                {feesSuccess && (
                  <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600 text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4" /> {feesSuccess}
                  </div>
                )}

                <button
                  onClick={handleFeesUpdate}
                  disabled={
                    feesLoading || 
                    !feesForm.feesTotal || 
                    (isPayingRemaining ? !feesForm.additionalPayment : !feesForm.feesPaid)
                  }
                  className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {feesLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {isPayingRemaining ? "Submit Payment" : "Save Fees"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AdminDashboard;