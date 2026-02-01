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
  FileCheck
} from 'lucide-react';

// 定義規劃書中的核心模組數據
// 內容嚴格參照文件 9b8a1d73-95e4-4bbe-9b69-a035a4080e60
const MODULES = [
  {
    id: 'P-CIA',
    name: 'P-CIA 設計智動化',
    icon: <Cpu className="w-6 h-6" />,
    description: '技術護城河與自動估價核心',
    details: 'CAD 圖檔解析、特徵提取估價、ECN 設計變更與紅屏硬攔截聯動。',
    keywords: ['四大金剛', '參數化報價', 'BOM表自動化']
  },
  {
    id: 'P-MES',
    name: 'P-MES 製造執行',
    icon: <Wrench className="w-6 h-6" />,
    description: '工廠現場指揮中樞',
    details: '條碼化倉管、剩料資產化 (QR Code)、委外預警紅綠燈、機台聯網。',
    keywords: ['剩料回抵', '紅屏攔截', '條碼管理']
  },
  {
    id: 'P-DTS',
    name: 'P-DTS 動態追蹤',
    icon: <Truck className="w-6 h-6" />,
    description: '跨地域神經傳導系統',
    details: '案號生命週期管理、非同步交班、物流責任邊界拍照存證、防空趟機制。',
    keywords: ['案號管理', '物流追蹤', '地理圍欄']
  },
  {
    id: 'P-FHR',
    name: 'P-FHR 財務人資',
    icon: <BrainCircuit className="w-6 h-6" />,
    description: '大腦決策與信任中樞',
    details: '穿透式財報、三方核勾 (3-Way Matching)、雙軌制計薪 (點數分潤)、資金治理。',
    keywords: ['三方核勾', '穿透式看板', '真實毛利']
  },
  {
    id: 'SALES_ASSIST',
    name: '業務助理模組',
    icon: <FileText className="w-6 h-6" />,
    description: '報價與接單前台',
    details: '四大金剛報價模型、智慧防護罩 (A/B/C)、毛利門檻監控、稅前稅後切換。',
    keywords: ['20分鐘報價', '利潤防護', '防呆機制']
  },
  {
    id: 'PROCUREMENT',
    name: '採購與通訊模組',
    icon: <Database className="w-6 h-6" />,
    description: '供應鏈自動化',
    details: 'LINE 模板自動生成、切口管理 (預付款)、折上折計算引擎、數位握手協議。',
    keywords: ['自動產單', '切口餘額', '數位證據']
  },
  {
    id: 'SITE_OPS',
    name: '現場執行 App',
    icon: <HardHat className="w-6 h-6" />,
    description: '最後一哩路交付',
    details: '師傅掃碼領料、完工拍照驗收、維修案 (E號) 關聯 PD 號、庫存安全水位預警。',
    keywords: ['行動領料', '維修閉環', '驗收單']
  }
];

// 模擬檔案系統的介面
interface FileRecord {
  filename: string;
  module: string;
  content: string;
  timestamp: string;
}

export default function PandFeedbackSystem() {
  const [selectedModule, setSelectedModule] = useState<typeof MODULES[0] | null>(null);
  const [reviewerName, setReviewerName] = useState('');
  const [feedbackType, setFeedbackType] = useState('建議');
  const [feedbackContent, setFeedbackContent] = useState('');
  const [generatedFiles, setGeneratedFiles] = useState<FileRecord[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  // 格式化時間戳用於檔名
  const getFormattedTimestamp = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const time = now.toTimeString().split(' ')[0].replace(/:/g, ''); // HHMMSS
    return {
      date: `${yyyy}-${mm}-${dd}`,
      time: time,
      full: now.toLocaleString('zh-TW', { hour12: false })
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModule) return;

    const ts = getFormattedTimestamp();
    // 檔名格式：YYYY-MM-DD_時間戳_模塊名稱
    const filename = `${ts.date}_${ts.time}_${selectedModule.name.replace(/\s+/g, '')}.txt`;

    // 構建檔案內容 (模擬寫入內容)
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

    // 1. 更新虛擬檔案列表 (UI顯示用)
    const newFile: FileRecord = {
      filename,
      module: selectedModule.name,
      content: fileContent,
      timestamp: ts.full
    };
    setGeneratedFiles([newFile, ...generatedFiles]);

    // 2. 觸發真實下載 (模擬寫入動作)
    downloadFile(filename, fileContent);

    // 3. 重置表單與顯示成功訊息
    setShowSuccess(true);
    setFeedbackContent('');
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const downloadFile = (filename: string, content: string) => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* 頂部導航 */}
      <header className="bg-slate-900 text-white p-4 shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database className="w-8 h-8 text-blue-400" />
            <div>
              <h1 className="text-xl font-bold tracking-wide">磐德國際ERP系統建置專案動態回饋系統</h1>
              <p className="text-xs text-slate-400">本系統存在週期僅於規劃需求階段</p>
            </div>
          </div>
          <div className="text-sm bg-slate-800 px-3 py-1 rounded border border-slate-700">
            <span className="text-green-400">●</span> 系統狀態：在線 (模擬環境)
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 左側：模組選擇區 */}
        <div className="lg:col-span-2 space-y-6">
          <section>
            <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
              <BrainCircuit className="w-5 h-5" />
              請選擇欲反饋的系統模塊
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MODULES.map((mod) => (
                <button
                  key={mod.id}
                  onClick={() => setSelectedModule(mod)}
                  className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 hover:shadow-lg group ${
                    selectedModule?.id === mod.id
                      ? 'border-blue-500 bg-blue-50 shadow-blue-100'
                      : 'border-white bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className={`p-2 rounded-lg ${selectedModule?.id === mod.id ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}`}>
                      {mod.icon}
                    </div>
                    {selectedModule?.id === mod.id && (
                      <CheckCircle className="w-5 h-5 text-blue-500 animate-in fade-in zoom-in" />
                    )}
                  </div>
                  <h3 className="font-bold text-lg text-slate-800">{mod.name}</h3>
                  <p className="text-sm text-slate-500 mb-2">{mod.description}</p>
                  <div className="text-xs text-slate-400 bg-slate-50 p-2 rounded border border-slate-100">
                    <span className="font-semibold text-slate-600">核心功能：</span>
                    {mod.details}
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* 右側：意見填寫與檔案列表 */}
        <div className="space-y-6">
          
          {/* 意見填寫表單 */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-24">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              提交意見詳情
            </h2>

            {selectedModule ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-4">
                  <p className="text-sm text-blue-800 font-medium">當前模塊：{selectedModule.name}</p>
                  <p className="text-xs text-blue-600 mt-1">{selectedModule.details}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">您的姓名/部門</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="例如：採購部 Jill"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">反饋類型</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={feedbackType}
                    onChange={(e) => setFeedbackType(e.target.value)}
                  >
                    <option value="建議">💡 功能優化建議</option>
                    <option value="風險">⚠️ 風險/漏洞預警</option>
                    <option value="效益">📈 效益評估回饋</option>
                    <option value="疑問">❓ 邏輯疑問</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">詳細內容</label>
                  <textarea
                    required
                    rows={5}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    placeholder={`請針對 ${selectedModule.name} 提出具體意見...\n例如：建議在${selectedModule.keywords[0]}增加二次確認機制。`}
                    value={feedbackContent}
                    onChange={(e) => setFeedbackContent(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <Save className="w-5 h-5" />
                  提交並生成檔案
                </button>

                {showSuccess && (
                  <div className="bg-green-100 text-green-700 p-3 rounded-lg text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                    <CheckCircle className="w-4 h-4" />
                    意見已提交，檔案自動下載中...
                  </div>
                )}
              </form>
            ) : (
              <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                <BrainCircuit className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>請從左側選擇一個模塊<br/>開始填寫意見</p>
              </div>
            )}
          </div>

          {/* 生成檔案列表模擬 */}
          {generatedFiles.length > 0 && (
            <div className="bg-slate-800 text-slate-300 rounded-xl p-4 shadow-lg overflow-hidden">
              <div className="flex items-center justify-between mb-3 border-b border-slate-700 pb-2">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  已生成檔案紀錄 (模擬路徑)
                </h3>
                <span className="text-xs bg-slate-700 px-2 py-0.5 rounded text-slate-400">
                  {generatedFiles.length} files
                </span>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-600">
                {generatedFiles.map((file, index) => (
                  <div key={index} className="group flex items-start gap-3 p-2 hover:bg-slate-700 rounded transition-colors text-sm">
                    <FileCheck className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-green-300 truncate">{file.filename}</p>
                      <div className="flex justify-between items-center text-xs text-slate-500 mt-1">
                        <span>{file.timestamp.split(' ')[1]}</span>
                        <button 
                          onClick={() => downloadFile(file.filename, file.content)}
                          className="hover:text-white flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
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
      </main>
    </div>
  );
}