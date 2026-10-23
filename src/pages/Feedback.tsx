import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  CheckCircle2, 
  MessageSquare, 
  Bug, 
  Lightbulb, 
  Tv, 
  Sparkles, 
  ExternalLink,
  Clock,
  ThumbsUp,
  RotateCcw
} from 'lucide-react';
import { FluentPersonFeedbackIcon, FluentDeleteIcon } from '../components/FluentIcons';

interface FeedbackProps {
  navigate: (route: string) => void;
}

interface SubmittedFeedback {
  id: string;
  category: string;
  title: string;
  description: string;
  email?: string;
  rating?: number;
  createdAt: number;
}

const CATEGORIES = [
  { id: 'suggestion', label: 'Feature Suggestion', icon: Lightbulb, color: 'text-amber-500' },
  { id: 'bug', label: 'Bug Report', icon: Bug, color: 'text-rose-500' },
  { id: 'channel', label: 'Channel / Content Request', icon: Tv, color: 'text-[#4cc2ff]' },
  { id: 'design', label: 'Design & UI/UX', icon: Sparkles, color: 'text-purple-400' },
  { id: 'other', label: 'General Feedback', icon: MessageSquare, color: 'text-emerald-500' },
];

export const Feedback: React.FC<FeedbackProps> = ({ navigate }) => {
  const [category, setCategory] = useState<string>('suggestion');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [savedFeedbacks, setSavedFeedbacks] = useState<SubmittedFeedback[]>(() => {
    try {
      const data = localStorage.getItem('waves_user_feedbacks');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('waves_user_feedbacks', JSON.stringify(savedFeedbacks));
    } catch {}
  }, [savedFeedbacks]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const newFeedback: SubmittedFeedback = {
        id: 'fb-' + Date.now(),
        category,
        title: title.trim(),
        description: description.trim(),
        email: email.trim() || undefined,
        rating,
        createdAt: Date.now(),
      };

      setSavedFeedbacks((prev) => [newFeedback, ...prev]);
      setIsSubmitting(false);
      setIsSubmitted(true);
      setTitle('');
      setDescription('');
    }, 600);
  };

  const handleDeleteFeedback = (id: string) => {
    setSavedFeedbacks((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="w-full min-h-[calc(100vh-64px)] pb-24 px-4 sm:px-6 lg:px-8 max-w-[1200px] mx-auto select-none pt-6">
      {/* Top Header Card */}
      <div className="relative overflow-hidden rounded-[14px] bg-white/[0.04] dark:bg-[#1f1f1f]/80 border border-black/10 dark:border-white/10 p-6 sm:p-8 backdrop-blur-2xl shadow-sm mb-6">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-[10px] bg-[#4cc2ff]/15 dark:bg-[#4cc2ff]/20 text-[#0078d4] dark:text-[#4cc2ff] flex items-center justify-center shrink-0 border border-[#0078d4]/20 dark:border-[#4cc2ff]/30 shadow-xs">
              <FluentPersonFeedbackIcon className="w-7 h-7 text-[#0078d4] dark:text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-[#111827] dark:text-white tracking-tight">
                Feedback & Góp ý
              </h1>
              <p className="mt-1 text-sm text-[#5f6368] dark:text-[#a0a0a0] leading-relaxed max-w-xl">
                Chia sẻ ý kiến đóng góp, báo cáo lỗi hoặc đề xuất kênh truyền hình mới để giúp chúng tôi hoàn thiện Sparkle.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://discord.gg/wcdjaDDayK"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 h-9 rounded-[6px] bg-[#5865F2] hover:bg-[#4752C4] text-white text-[13px] font-semibold transition-colors shadow-xs"
            >
              <span>Join Discord</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Feedback Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-[12px] bg-white/70 dark:bg-[#202020]/90 border border-black/10 dark:border-white/10 p-6 shadow-sm backdrop-blur-xl">
            <AnimatePresence mode="wait">
              {isSubmitted ? (
                <motion.div
                  key="feedback-success"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  className="py-10 text-center space-y-4"
                >
                  <div className="w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#111827] dark:text-white">
                    Cảm ơn bạn đã gửi phản hồi!
                  </h3>
                  <p className="text-sm text-[#666666] dark:text-[#a0a0a0] max-w-md mx-auto">
                    Ý kiến của bạn đã được ghi nhận. Đội ngũ phát triển Sparkle sẽ xem xét và phản hồi trong các bản cập nhật sắp tới.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsSubmitted(false)}
                    className="mt-4 inline-flex items-center gap-2 px-5 h-9 rounded-[6px] bg-[#0078d4] dark:bg-[#4cc2ff] text-white dark:text-black font-semibold text-[13px] hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Gửi thêm phản hồi khác</span>
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Category Picker */}
                  <div>
                    <label className="block text-[13px] font-semibold text-[#111827] dark:text-white mb-2.5">
                      Loại phản hồi
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIES.map((cat) => {
                        const Icon = cat.icon;
                        const isSelected = category === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setCategory(cat.id)}
                            className={`h-[34px] px-3.5 rounded-[6px] flex items-center gap-2 text-xs font-medium transition-all cursor-pointer border ${
                              isSelected
                                ? 'bg-[#0078d4] dark:bg-[#4cc2ff] text-white dark:text-black border-transparent shadow-xs font-semibold'
                                : 'bg-black/[0.03] dark:bg-white/[0.04] text-[#4b5563] dark:text-[#cccccc] border-black/10 dark:border-white/10 hover:bg-black/[0.06] dark:hover:bg-white/[0.08]'
                            }`}
                          >
                            <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white dark:text-black' : cat.color}`} />
                            <span>{cat.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Feedback Title */}
                  <div>
                    <label className="block text-[13px] font-semibold text-[#111827] dark:text-white mb-1.5">
                      Tiêu đề <span className="text-rose-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ví dụ: Thêm kênh VTV Cần Thơ, Lỗi phát lại video..."
                      maxLength={120}
                      className="w-full h-10 px-3.5 rounded-[6px] bg-black/[0.03] dark:bg-white/[0.05] border border-black/15 dark:border-white/15 text-sm text-[#111827] dark:text-white placeholder-[#888888] outline-none transition focus:border-b-2 focus:border-b-[#005fb8] dark:focus:border-b-[#4cc2ff]"
                    />
                  </div>

                  {/* Feedback Description */}
                  <div>
                    <label className="block text-[13px] font-semibold text-[#111827] dark:text-white mb-1.5">
                      Chi tiết phản hồi <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Mô tả chi tiết những gì bạn gặp phải, hoặc đề xuất cách cải thiện tính năng..."
                      className="w-full p-3.5 rounded-[6px] bg-black/[0.03] dark:bg-white/[0.05] border border-black/15 dark:border-white/15 text-sm text-[#111827] dark:text-white placeholder-[#888888] outline-none transition focus:border-b-2 focus:border-b-[#005fb8] dark:focus:border-b-[#4cc2ff] resize-y"
                    />
                  </div>

                  {/* Rating Satisfaction */}
                  <div>
                    <label className="block text-[13px] font-semibold text-[#111827] dark:text-white mb-2">
                      Mức độ hài lòng với Sparkle
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className={`w-9 h-9 rounded-[6px] flex items-center justify-center font-bold text-sm transition-all cursor-pointer ${
                            rating >= star
                              ? 'bg-amber-400 text-black shadow-xs'
                              : 'bg-black/5 dark:bg-white/5 text-[#888888] hover:bg-black/10 dark:hover:bg-white/10'
                          }`}
                        >
                          ★
                        </button>
                      ))}
                      <span className="text-xs text-[#777777] dark:text-[#aaaaaa] ml-2">
                        {rating === 5 ? 'Tuyệt vời (5/5)' : rating === 4 ? 'Hài lòng (4/5)' : rating === 3 ? 'Bình thường (3/5)' : 'Cần cải thiện'}
                      </span>
                    </div>
                  </div>

                  {/* Contact Email (Optional) */}
                  <div>
                    <label className="block text-[13px] font-semibold text-[#111827] dark:text-white mb-1.5">
                      Email liên hệ <span className="text-xs font-normal text-[#777777]">(Tùy chọn)</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@example.com (để chúng tôi thông báo khi tính năng hoàn thành)"
                      className="w-full h-10 px-3.5 rounded-[6px] bg-black/[0.03] dark:bg-white/[0.05] border border-black/15 dark:border-white/15 text-sm text-[#111827] dark:text-white placeholder-[#888888] outline-none transition focus:border-b-2 focus:border-b-[#005fb8] dark:focus:border-b-[#4cc2ff]"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="submit"
                      disabled={isSubmitting || !title.trim() || !description.trim()}
                      className="inline-flex items-center gap-2 px-6 h-10 rounded-[6px] bg-[#0078d4] dark:bg-[#4cc2ff] hover:bg-[#106ebe] dark:hover:bg-[#6bd0ff] text-white dark:text-black font-semibold text-[13.5px] shadow-sm transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                      <span>{isSubmitting ? 'Đang gửi...' : 'Gửi phản hồi'}</span>
                    </button>
                  </div>
                </form>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Sidebar Info & Recent Feedbacks */}
        <div className="space-y-6">
          {/* Sparkle Community card */}
          <div className="rounded-[12px] bg-white/70 dark:bg-[#202020]/90 border border-black/10 dark:border-white/10 p-5 shadow-sm backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-[6px] bg-[#5865F2]/15 text-[#5865F2] flex items-center justify-center">
                <ThumbsUp className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-[#111827] dark:text-white">
                Cộng đồng Sparkle
              </h3>
            </div>
            <p className="text-xs text-[#555555] dark:text-[#aaaaaa] leading-relaxed mb-4">
              Bạn muốn trao đổi trực tiếp hoặc thảo luận về luồng stream TV, cập nhật lịch phát sóng? Hãy ghé thăm máy chủ Discord của chúng tôi.
            </p>
            <a
              href="https://discord.gg/wcdjaDDayK"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-8.5 rounded-[6px] border border-black/15 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/5 text-[#111827] dark:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <span>Tham gia máy chủ Discord</span>
              <ExternalLink className="w-3 h-3 text-neutral-400" />
            </a>
          </div>

          {/* User History Feedbacks */}
          <div className="rounded-[12px] bg-white/70 dark:bg-[#202020]/90 border border-black/10 dark:border-white/10 p-5 shadow-sm backdrop-blur-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[#111827] dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-neutral-400" />
                <span>Góp ý gần đây của bạn ({savedFeedbacks.length})</span>
              </h3>
            </div>

            {savedFeedbacks.length === 0 ? (
              <p className="text-xs text-[#777777] dark:text-[#888888] py-4 text-center">
                Chưa có phản hồi nào được lưu trên thiết bị này.
              </p>
            ) : (
              <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                {savedFeedbacks.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-[6px] bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-semibold text-[#111827] dark:text-white truncate">
                        {item.title}
                      </h4>
                      <button
                        type="button"
                        onClick={() => handleDeleteFeedback(item.id)}
                        title="Xóa phản hồi này"
                        className="text-neutral-400 hover:text-rose-500 p-1 cursor-pointer transition-colors"
                      >
                        <FluentDeleteIcon className="w-3.5 h-3.5 text-current" />
                      </button>
                    </div>
                    <p className="text-[11px] text-[#555555] dark:text-[#aaaaaa] line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-1">
                      <span>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</span>
                      <span className="font-medium text-amber-500">★ {item.rating || 5}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
