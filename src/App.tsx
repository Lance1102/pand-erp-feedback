import React, { useState } from 'react';
import {
  FileText,
  Download,
  Database,
  BrainCircuit,
  Cpu,
  Wrench,
  Truck,
  HardHat,
  Save,
  CheckCircle,
  FileCheck,
  ChevronRight,
  ExternalLink,
  AlertCircle,
  CloudUpload,
  Loader2,
} from 'lucide-react';
import { commitFeedbackFile, isGitHubEnabled } from './github';

// 定義規劃書中的核心模組數據
// 內容嚴格參照文件 9b8a1d73-95e4-4bbe-9b69-a035a4080e60
const MODULES = [
  {
    id: 'P-CIA',
    name: 'P-CIA 設計智動化',
    icon: <Cpu className="w-6 h-6" />,
    description: '技術護城河與自動估價核心',
    details: 'CAD 圖檔解析、特徵提取估價、ECN 設計變更與紅屏硬攔截聯動。',
    keywords: ['四大金剛', '參數化報價', 'BOM表自動化'],
    color: 'blue',
  },
  {
    id: 'P-MES',
    name: 'P-MES 製造執行',
    icon: <Wrench className="w-6 h-6" />,
    description: '工廠現場指揮中樞',
    details: '條碼化倉管、剩料資產化 (QR Code)、委外預警紅綠燈、機台聯網。',
    keywords: ['剩料回抵', '紅屏攔截', '條碼管理'],
    color: 'emerald',
  },
  {
    id: 'P-DTS',
    name: 'P-DTS 動態追蹤',
    icon: <Truck className="w-6 h-6" />,
    description: '跨地域神經傳導系統',
    details: '案號生命週期管理、非同步交班、物流責任邊界拍照存證、防空趟機制。',
    keywords: ['案號管理', '物流追蹤', '地理圍欄'],
    color: 'violet',
  },
  {
    id: 'P-FHR',
    name: 'P-FHR 財務人資',
    icon: <BrainCircuit className="w-6 h-6" />,
    description: '大腦決策與信任中樞',
    details: '穿透式財報、三方核勾 (3-Way Matching)、雙軌制計薪 (點數分潤)、資金治理。',
    keywords: ['三方核勾', '穿透式看板', '真實毛利'],
    color: 'amber',
  },
  {
    id: 'SALES_ASSIST',
    name: '業務助理模組',
    icon: <FileText className="w-6 h-6" />,
    description: '報價與接單前台',
    details: '四大金剛報價模型、智慧防護罩 (A/B/C)、毛利門檻監控、稅前稅後切換。',
    keywords: ['20分鐘報價', '利潤防護', '防呆機制'],
    color: 'rose',
  },
  {
    id: 'PROCUREMENT',
    name: '採購與通訊模組',
    icon: <Database className="w-6 h-6" />,
    description: '供應鏈自動化',
    details: 'LINE 模板自動生成、切口管理 (預付款)、折上折計算引擎、數位握手協議。',
    keywords: ['自動產單', '切口餘額', '數位證據'],
    color: 'cyan',
  },
  {
    id: 'SITE_OPS',
    name: '現場執行 App',
    icon: <HardHat className="w-6 h-6" />,
    description: '最後一哩路交付',
    details: '師傅掃碼領料、完工拍照驗收、維修案 (E號) 關聯 PD 號、庫存安全水位預警。',
    keywords: ['行動領料', '維修閉環', '驗收單'],
    color: 'orange',
  },
];

interface FileRecord {
  filename: string;
  module: string;
  content: string;
  timestamp: string;
}

const ICON_BG: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-600',
  emerald: 'bg-emerald-100 text-emerald-600',
  violet: 'bg-violet-100 text-violet-600',
  amber: 'bg-amber-100 text-amber-600',
  rose: 'bg-rose-100 text-rose-600',
  cyan: 'bg-cyan-100 text-cyan-600',
  orange: 'bg-orange-100 text-orange-600',
};

const BORDER_ACTIVE: Record<string, string> = {
  blue: 'border-blue-500 ring-blue-200',
  emerald: 'border-emerald-500 ring-emerald-200',
  violet: 'border-violet-500 ring-violet-200',
  amber: 'border-amber-500 ring-amber-200',
  rose: 'border-rose-500 ring-rose-200',
  cyan: 'border-cyan-500 ring-cyan-200',
  orange: 'border-orange-500 ring-orange-200',
};

/** Remove filesystem-illegal chars, collapse whitespace, cap length. */
function sanitizeForFilename(raw: string): string {
  return raw
    .trim()
    .replace(/[\\/:*?"<>|#%&{}$!@`=+^~\n\r\t]/g, '')  // illegal / risky chars
    .replace(/\.{2,}/g, '')                              // prevent path traversal
    .replace(/\s+/g, '')                                 // remove all whitespace
    .slice(0, 30);                                       // cap length
}

export default function PandFeedbackSystem() {
  const [selectedModule, setSelectedModule] = useState<typeof MODULES[0] | null>(null);
  const [reviewerName, setReviewerName] = useState('');
  const [feedbackType, setFeedbackType] = useState('建議');
  const [feedbackContent, setFeedbackContent] = useState('');
  const [generatedFiles, setGeneratedFiles] = useState<FileRecord[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commitStatus, setCommitStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  const getFormattedTimestamp = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    return {
      date: `${yyyy}-${mm}-${dd}`,
      time: `${hh}-${min}`,
      full: now.toLocaleString('zh-TW', { hour12: false }),
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModule || isSubmitting) return;

    setIsSubmitting(true);
    setCommitStatus(null);

    const ts = getFormattedTimestamp();
    const reviewer = sanitizeForFilename(reviewerName) || '匿名';
    const filename = `${ts.date}_${ts.time}_${selectedModule.name.replace(/\s+/g, '')}_${reviewer}_${feedbackType}.txt`;

    const fileContent = `
【磐德國際 ERP 建構需求規畫書 - 意見反饋單】
--------------------------------------------------
建檔日期：${ts.full}
模塊名稱：${selectedModule.name}
模塊代碼：${selectedModule.id}
--------------------------------------------------
反饋人員：${reviewerName || '匿名'}
反饋類型：${feedbackType}
--------------------------------------------------
【反饋內容詳述】
${feedbackContent}

--------------------------------------------------
【系統自動生成資訊】
參考依據：ERP 需求規畫書細節展開 (9b8a1d73)
核心功能關聯：${selectedModule.details}
關鍵字標籤：${selectedModule.keywords.join(', ')}
    `.trim();

    const newFile: FileRecord = {
      filename,
      module: selectedModule.name,
      content: fileContent,
      timestamp: ts.full,
    };
    setGeneratedFiles([newFile, ...generatedFiles]);
    downloadFile(filename, fileContent);

    // Commit to GitHub repo
    const result = await commitFeedbackFile(filename, fileContent);
    setCommitStatus({ ok: result.success, msg: result.message });

    setShowSuccess(true);
    setFeedbackContent('');
    setIsSubmitting(false);
    setTimeout(() => {
      setShowSuccess(false);
      setCommitStatus(null);
    }, 5000);
  };

  const downloadFile = (filename: string, content: string) => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/20 ring-1 ring-blue-400/30">
                <Database className="w-7 h-7 text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  磐德國際ERP系統建置專案動態回饋系統
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  本系統存在週期僅於規劃需求階段
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm bg-white/5 backdrop-blur px-4 py-2 rounded-full ring-1 ring-white/10">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500"></span>
              </span>
              <span className="text-slate-300">系統在線</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left: Module Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Report Link */}
            <div className="rounded-2xl bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200/60 overflow-hidden">
              <a
                href={`${import.meta.env.BASE_URL}ERP-MES-requirement-report.pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 hover:bg-indigo-100/40 transition-all group"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 group-hover:bg-indigo-200 transition-colors flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-indigo-900">
                      ERP / MES 建構需求規劃書 - 全域整合架構與功能細節深度研究報告
                    </p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-amber-400 text-amber-900 shadow-sm">
                      2026-02-01 V1
                    </span>
                  </div>
                  <p className="text-xs text-indigo-500 mt-0.5">
                    點擊開啟完整報告 (PDF)
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-indigo-400 group-hover:text-indigo-600 flex-shrink-0 transition-colors" />
              </a>
              <div className="px-4 pb-3 -mt-1">
                <p className="text-xs text-slate-500 leading-relaxed bg-white/60 rounded-lg px-3 py-2 border border-indigo-100">
                  文件動態更新，更新文件會有日期標記，請詳閱文件以確認提交可更貼近貴公司需求的意見
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-200">
                <BrainCircuit className="w-4 h-4 text-slate-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">
                請選擇欲反饋的系統模塊
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MODULES.map((mod) => {
                const isActive = selectedModule?.id === mod.id;
                return (
                  <button
                    key={mod.id}
                    onClick={() => setSelectedModule(mod)}
                    className={`
                      relative text-left p-5 rounded-2xl border-2 transition-all duration-200
                      hover:shadow-lg hover:-translate-y-0.5 cursor-pointer
                      ${isActive
                        ? `${BORDER_ACTIVE[mod.color]} ring-4 bg-white shadow-lg`
                        : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-2.5 rounded-xl ${ICON_BG[mod.color]}`}>
                        {mod.icon}
                      </div>
                      {isActive && (
                        <CheckCircle className="w-5 h-5 text-blue-500" />
                      )}
                    </div>
                    <h3 className="font-bold text-base text-slate-800 mb-1">{mod.name}</h3>
                    <p className="text-sm text-slate-500 mb-3">{mod.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {mod.keywords.map((kw) => (
                        <span
                          key={kw}
                          className="inline-block text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Form & File List */}
          <div className="space-y-6">

            {/* Feedback Form */}
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200/60 p-6 sticky top-6">
              <div className="flex items-center gap-2 mb-5">
                <FileText className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-slate-800">提交意見詳情</h2>
              </div>

              {selectedModule ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Selected module info */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/60 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <ChevronRight className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-semibold text-blue-800">{selectedModule.name}</span>
                    </div>
                    <p className="text-xs text-blue-600/80 ml-6">{selectedModule.details}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      您的姓名 / 部門
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all"
                      placeholder="例如：採購部 Jill"
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      反饋類型
                    </label>
                    <select
                      className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all appearance-none"
                      value={feedbackType}
                      onChange={(e) => setFeedbackType(e.target.value)}
                    >
                      <option value="建議">功能優化建議</option>
                      <option value="風險">風險 / 漏洞預警</option>
                      <option value="效益">效益評估回饋</option>
                      <option value="疑問">邏輯疑問</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      詳細內容
                    </label>
                    <textarea
                      required
                      rows={5}
                      className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none resize-none transition-all"
                      placeholder={`請針對 ${selectedModule.name} 提出具體意見...\n例如：建議在${selectedModule.keywords[0]}增加二次確認機制。`}
                      value={feedbackContent}
                      onChange={(e) => setFeedbackContent(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-400 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        提交中...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        提交並生成檔案
                      </>
                    )}
                  </button>

                  {showSuccess && (
                    <div className="space-y-2">
                      <div className="bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 p-3 rounded-xl text-sm flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 flex-shrink-0" />
                        意見已提交，檔案自動下載中...
                      </div>
                      {commitStatus && (
                        <div className={`p-3 rounded-xl text-sm flex items-center gap-2 ${
                          commitStatus.ok
                            ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                            : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                        }`}>
                          {commitStatus.ok
                            ? <CloudUpload className="w-4 h-4 flex-shrink-0" />
                            : <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          }
                          {commitStatus.msg}
                        </div>
                      )}
                    </div>
                  )}

                  {isGitHubEnabled() && !showSuccess && (
                    <p className="text-xs text-slate-400 text-center">
                      提交後將同步儲存至 Git 儲存庫
                    </p>
                  )}
                </form>
              ) : (
                <div className="text-center py-12 text-slate-400 bg-slate-50/50 rounded-xl border-2 border-dashed border-slate-200">
                  <BrainCircuit className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm leading-relaxed">
                    請從左側選擇一個模塊
                    <br />
                    開始填寫意見
                  </p>
                </div>
              )}
            </div>

            {/* Generated Files */}
            {generatedFiles.length > 0 && (
              <div className="bg-slate-900 rounded-2xl p-5 shadow-xl ring-1 ring-white/5">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-700/50">
                  <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                    <Database className="w-4 h-4 text-slate-400" />
                    已生成檔案紀錄
                  </h3>
                  <span className="text-xs bg-slate-800 px-2.5 py-1 rounded-full text-slate-400 ring-1 ring-slate-700">
                    {generatedFiles.length} 筆
                  </span>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {generatedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="group flex items-start gap-3 p-2.5 hover:bg-slate-800/60 rounded-lg transition-colors text-sm"
                    >
                      <FileCheck className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-emerald-300 text-xs truncate">
                          {file.filename}
                        </p>
                        <div className="flex justify-between items-center text-xs text-slate-500 mt-1">
                          <span>{file.timestamp}</span>
                          <button
                            onClick={() => downloadFile(file.filename, file.content)}
                            className="hover:text-white flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          >
                            <Download className="w-3 h-3" /> 下載
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-200 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-xs text-slate-400">
          磐德國際 ERP 系統建置專案 &middot; 動態回饋系統
        </div>
      </footer>
    </div>
  );
}
