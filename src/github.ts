const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN as string | undefined;
const OWNER = 'Lance1102';
const REPO = 'pand-erp-feedback';
const EXPORT_DIR = 'data/exports';

export function isGitHubEnabled(): boolean {
  return Boolean(GITHUB_TOKEN);
}

export async function commitFeedbackFile(
  filename: string,
  content: string,
): Promise<{ success: boolean; message: string }> {
  if (!GITHUB_TOKEN) {
    return { success: false, message: 'GitHub Token 未設定，僅本機下載' };
  }

  const path = `${EXPORT_DIR}/${filename}`;
  const encoded = btoa(unescape(encodeURIComponent(content)));

  try {
    const res = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `feedback: ${filename}`,
          content: encoded,
          branch: 'master',
        }),
      },
    );

    if (res.ok) {
      return { success: true, message: '已同步至 Git 儲存庫' };
    }

    const err = await res.json().catch(() => ({}));
    const detail = (err as Record<string, string>).message || res.statusText;
    return { success: false, message: `Git 同步失敗: ${detail}` };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { success: false, message: `網路錯誤: ${msg}` };
  }
}
