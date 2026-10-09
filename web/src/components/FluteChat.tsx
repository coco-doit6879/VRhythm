import { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { api, chatErrorMessage, type AuthResponse, type ChatReply } from '../services/api';
import './flute-chat.css';

type Turn = { question: string; reply: ChatReply };
export function FluteChat({ user, onAuth }: { user: AuthResponse | null; onAuth: () => void }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'Loading' | 'Demo' | 'Unavailable' | 'Error'>('Loading');
  const [question, setQuestion] = useState('');
  const [turns, setTurns] = useState<Turn[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const input = useRef<HTMLTextAreaElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const pending = useRef<AbortController | null>(null);
  const working = useRef(false);
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; pending.current?.abort(); }; }, []);
  useEffect(() => {
    if (!open) return;
    let active = true;
    const controller = new AbortController();
    setMode('Loading');
    void api.getChatStatus(controller.signal).then(result => { if (active) setMode(result.mode); })
      .catch(() => { if (active) setMode('Error'); });
    return () => { active = false; controller.abort(); };
  }, [open, retry]);
  useEffect(() => { if (open && mode === 'Demo') input.current?.focus(); }, [open, mode]);
  useEffect(() => { if (log.current) log.current.scrollTop = log.current.scrollHeight; }, [turns, busy, open]);
  const close = () => { setOpen(false); requestAnimationFrame(() => launcher.current?.focus()); };
  const submit = async () => {
    const value = question.trim();
    if (working.current || value.length < 3 || !user || mode !== 'Demo') return;
    working.current = true; setBusy(true); setError('');
    const controller = new AbortController(); pending.current = controller;
    const timer = setTimeout(() => { if (alive.current) setError('Chat phản hồi quá lâu. Vui lòng thử lại.'); controller.abort(); }, 35000);
    try {
      const reply = await api.askFluteChat(value, controller.signal);
      if (controller.signal.aborted || !alive.current) return;
      setTurns(current => [...current.slice(-7), { question: value, reply }]);
      setQuestion('');
    } catch (err) { if (!controller.signal.aborted && alive.current) setError(chatErrorMessage(err)); }
    finally {
      clearTimeout(timer);
      if (pending.current === controller) { pending.current = null; working.current = false; if (alive.current) setBusy(false); }
    }
  };
  return <div className="flute-chat">
    {!open ? <button className="flute-chat-launch" ref={launcher} aria-expanded="false" aria-controls="flute-chat-panel" onClick={() => setOpen(true)}><MessageCircle size={20} aria-hidden="true" /> Hỏi về sáo</button>
      : <aside id="flute-chat-panel" className="flute-chat-panel" aria-labelledby="flute-chat-title" onKeyDown={event => { if (event.key === 'Escape') { event.stopPropagation(); close(); } }}>
        <header><h2 id="flute-chat-title">Hỏi về sáo trúc</h2><button aria-label="Đóng chat" onClick={close}><X size={20} aria-hidden="true" /></button></header>
        <div className="flute-chat-log" ref={log} role="log" aria-live="polite" aria-relevant="additions text">
          {!turns.length && <p>Hỏi về nội dung bạn đang học. Câu trả lời có nguồn để bạn đọc lại.</p>}
          {turns.map((turn, index) => <div className="flute-chat-turn" key={index}>
            <p className="flute-chat-question"><strong>Bạn</strong>{turn.question}</p>
            <p className="flute-chat-answer"><strong>Trợ lý AI</strong>{turn.reply.answer}</p>
            {!!turn.reply.sources.length && <nav aria-label={`Nguồn tham khảo câu ${index + 1}`}>{turn.reply.sources.filter(source => /^\/(learn\/sao|lesson\/\d+\/chapter\/\d+\/lesson\/\d+)$/.test(source.url)).map(source => <a key={source.id} href={source.url}>{source.title}</a>)}</nav>}
          </div>)}
          {busy && <p role="status">Đang tìm nội dung và trả lời…</p>}
        </div>
        <div className="flute-chat-compose">
          {mode === 'Loading' && <p role="status">Đang tải chat…</p>}
          {mode === 'Error' && <p role="alert">Không tải được Chat. <button onClick={() => setRetry(value => value + 1)}>Thử lại</button></p>}
          {mode === 'Unavailable' && <p>Chat Plus chưa mở. <a href="/packages">Xem gói học</a></p>}
          {mode === 'Demo' && (!user ? <button className="flute-chat-send" onClick={onAuth}>Đăng nhập để hỏi</button> : <>
            <p className="flute-chat-note">AI dùng thử · Chỉ tham khảo tài liệu bạn được xem.</p>
            <form onSubmit={event => { event.preventDefault(); void submit(); }}>
              <label htmlFor="flute-chat-question">Câu hỏi của bạn</label>
              <textarea id="flute-chat-question" ref={input} value={question} maxLength={600} rows={3} disabled={busy} onChange={event => setQuestion(event.target.value)} placeholder="Làm sao giữ hơi đều khi chuyển nốt?" />
              <button className="flute-chat-send" disabled={busy || question.trim().length < 3} type="submit"><Send size={18} aria-hidden="true" /> Gửi câu hỏi</button>
            </form>
          </>)}
          {error && <p className="flute-chat-error" role="alert">{error}</p>}
        </div>
      </aside>}
  </div>;
}
